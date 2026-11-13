"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import defaultData from "@/data/mockData.json";
import { ProfileData, LinkItem, ProfileInfo } from "@/types/profile";
import { TopBar } from "@/components/profile/TopBar";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { CategorySection } from "@/components/profile/CategorySection";
import { QrModal } from "@/components/profile/QrModal";
import { Toast } from "@/components/profile/Toast";
import { AddLinkModal } from "@/components/profile/AddLinkModal";
import { DeleteLinkModal } from "@/components/profile/DeleteLinkModal";
import { AuthGuide } from "@/components/profile/AuthGuide";
import { Loader2, Sparkles, LogIn } from "lucide-react";
import {
  getUserProfile,
  saveUserProfile,
  addLink,
  updateLink,
  deleteLink,
  getLinks,
  subscribeLinks,
  initUserDefaultLinks,
  FirestoreLinkResult,
} from "@/lib/firestore";
import { loginWithGoogle, logout, onAuthChange, User } from "@/lib/auth";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [data, setData] = useState<ProfileData>(defaultData as ProfileData);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isAddLinkOpen, setIsAddLinkOpen] = useState(false);
  const [targetCategoryId, setTargetCategoryId] = useState<string | undefined>(undefined);
  const [currentUrl, setCurrentUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [loadingText, setLoadingText] = useState("링크 목록을 불러오는 중이에요...");
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());

  // 삭제 확인 모달 대상 링크 상태
  const [deleteTarget, setDeleteTarget] = useState<{
    categoryId: string;
    item: LinkItem;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 토스트 메시지 표시 (2.4초 자동 소멸)
  const showToast = useCallback((message: string) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(message);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  }, []);

  // 1. Firebase Auth 상태 변화 감지 리스너
  useEffect(() => {
    queueMicrotask(() => {
      setCurrentUrl(window.location.href);
    });

    const unsubscribeAuth = onAuthChange((currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false);
    });

    return () => {
      unsubscribeAuth();
    };
  }, []);

  // Firestore에서 가져온 링크 목록(createdAt 최신순)을 카테고리별로 반영하는 함수
  const applyRemoteLinks = useCallback(
    (
      remoteLinks: FirestoreLinkResult[],
      baseData?: ProfileData,
      currentDeletedIds?: Set<string>,
    ) => {
      setData((prev) => {
        const source = baseData || prev;
        const activeDeletedIds = currentDeletedIds || deletedIds;

        // 삭제된 아이템 제외 필터링
        const validRemote = (remoteLinks || []).filter(
          (r) => !activeDeletedIds.has(r.item.id),
        );

        // 카테고리별로 remoteLinks 분류 (remoteLinks는 createdAt desc 순서 유지)
        const categoryMap = new Map<string, LinkItem[]>();
        const defaultCatId = source.categories[0]?.id || "channels";

        for (const { categoryId, item } of validRemote) {
          const targetId = source.categories.some((c) => c.id === categoryId)
            ? categoryId
            : defaultCatId;
          const current = categoryMap.get(targetId) || [];
          current.push(item);
          categoryMap.set(targetId, current);
        }

        const updatedCategories = source.categories.map((cat) => {
          const firestoreItems = categoryMap.get(cat.id) || [];
          return {
            ...cat,
            items: firestoreItems,
          };
        });

        return {
          ...source,
          categories: updatedCategories,
        };
      });
    },
    [deletedIds],
  );

  // 2. 로그인 유저에 따른 Firestore (users/{user.uid} 및 users/{user.uid}/links) 개인화 동기화
  useEffect(() => {
    if (isAuthLoading) return;

    if (!user) {
      return;
    }

    const uid = user.uid;
    const userStorageKey = `mylink_profile_${uid}`;
    const userDeletedKey = `mylink_deleted_${uid}`;

    let unsubscribeLinks: (() => void) | null = null;

    const initUserData = async () => {
      setLoadingText("내 링크 목록을 불러오는 중이에요...");
      setIsLoading(true);

      // 로컬스토리지에서 유저별 삭제 목록 복원
      let activeDeleted = new Set<string>();
      try {
        const savedDeleted = localStorage.getItem(userDeletedKey);
        if (savedDeleted) {
          const parsed = JSON.parse(savedDeleted);
          if (Array.isArray(parsed)) {
            activeDeleted = new Set(parsed);
          }
        }
      } catch {}
      setDeletedIds(activeDeleted);

      try {
        // 2-1) users/{user.uid} 프로필 정보 로드 또는 신규 프로필 생성
        const remoteProfile = await getUserProfile(uid);

        let currentProfile: ProfileInfo;
        if (remoteProfile) {
          currentProfile = {
            ...remoteProfile,
            avatarUrl: remoteProfile.avatarUrl || user.photoURL || undefined,
            name: remoteProfile.name || user.displayName || "내 링크",
            email: user.email || remoteProfile.email,
          };
        } else {
          currentProfile = {
            name: user.displayName || "내 링크",
            role: "크리에이터",
            bio: "반갑습니다! 나만의 소셜 링크를 모아두는 공간입니다 ✨",
            avatarUrl: user.photoURL || undefined,
            email: user.email || undefined,
            statusMessage: "온라인 · 환영합니다!",
          };
          await saveUserProfile(uid, currentProfile, {
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
          }).catch((err) => console.warn("프로필 초기 저장 실패:", err));
        }

        // 2-2) users/{user.uid}/links 링크 목록 조회
        const initialLinks = await getLinks(uid);

        const initialCategories = (defaultData as ProfileData).categories.map((c) => ({
          ...c,
          items: [],
        }));

        if (initialLinks.length === 0) {
          // 신규 유저 첫 가입 시: 기본 템플릿 링크들을 users/{uid}/links에 생성하여 채워줌
          setLoadingText("나만의 맞춤 링크 템플릿을 생성하는 중이에요...");
          await initUserDefaultLinks(uid, (defaultData as ProfileData).categories);
          const seededLinks = await getLinks(uid);
          setData({
            profile: currentProfile,
            categories: (defaultData as ProfileData).categories,
            footer: (defaultData as ProfileData).footer,
          });
          applyRemoteLinks(seededLinks, {
            profile: currentProfile,
            categories: (defaultData as ProfileData).categories,
            footer: (defaultData as ProfileData).footer,
          }, activeDeleted);
        } else {
          const baseData: ProfileData = {
            profile: currentProfile,
            categories: initialCategories,
            footer: (defaultData as ProfileData).footer,
          };
          setData(baseData);
          applyRemoteLinks(initialLinks, baseData, activeDeleted);
        }

        try {
          localStorage.setItem(userStorageKey, JSON.stringify(currentProfile));
        } catch {}
      } catch (err) {
        console.error("유저 데이터 로드 오류:", err);
      } finally {
        setIsLoading(false);
      }

      // 2-3) users/{user.uid}/links 경로 실시간 리스너 연결
      unsubscribeLinks = subscribeLinks(uid, (latestLinks) => {
        applyRemoteLinks(latestLinks);
      });
    };

    initUserData();

    return () => {
      if (unsubscribeLinks) {
        unsubscribeLinks();
      }
    };
  }, [user, isAuthLoading, applyRemoteLinks]);

  // 구글 소셜 로그인 실행
  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const loggedUser = await loginWithGoogle();
      showToast(`${loggedUser.displayName || "사용자"}님, 반갑습니다! ✨`);
    } catch (err: unknown) {
      const authError = err as { code?: string; message?: string };
      if (authError.code === "auth/popup-closed-by-user") {
        showToast("로그인 창이 닫혔어요.");
      } else {
        console.error("로그인 실패:", err);
        showToast("구글 로그인 중 문제가 발생했어요. 다시 시도해 주세요.");
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  // 로그아웃 실행
  const handleLogout = async () => {
    try {
      await logout();
      setData(defaultData as ProfileData);
      showToast("안전하게 로그아웃되었어요 👋");
    } catch (err) {
      console.error("로그아웃 실패:", err);
      showToast("로그아웃에 실패했어요.");
    }
  };

  // 대표 페이지 URL 클립보드 복사
  const handleCopyPageUrl = () => {
    const urlToCopy = currentUrl || window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(urlToCopy);
    }
    showToast("마이링크 주소가 복사되었어요 ✨");
  };

  // 링크 추가 모달 열기
  const handleOpenAddLink = (categoryId?: string) => {
    if (!user) {
      showToast("링크를 추가하려면 먼저 구글 로그인이 필요해요 🔒");
      return;
    }
    setTargetCategoryId(categoryId);
    setIsAddLinkOpen(true);
  };

  // 3. 새 링크 추가 처리 (users/{user.uid}/links 에 저장)
  const handleAddLink = async (categoryId: string, newItem: Omit<LinkItem, "id">) => {
    if (!user) {
      showToast("로그인 후 이용할 수 있어요 🔒");
      return;
    }

    setLoadingText("새 링크를 저장하고 목록을 갱신하는 중이에요...");
    setIsUpdating(true);
    try {
      // Firestore users/{user.uid}/links 경로에 추가
      await addLink(user.uid, categoryId, newItem);
      const updatedList = await getLinks(user.uid);
      applyRemoteLinks(updatedList);
      showToast("새 링크가 추가되었어요 ✨");
    } catch (err) {
      console.error("Firestore 링크 추가 오류:", err);
      showToast("링크 추가에 실패했어요. 다시 시도해 주세요.");
    } finally {
      setIsUpdating(false);
    }
  };

  // 4. 링크 인라인 수정 처리 (users/{user.uid}/links/{linkId} 업데이트)
  const handleUpdateLink = async (
    linkId: string,
    categoryId: string,
    updatedItem: Omit<LinkItem, "id">,
  ) => {
    if (!user) {
      showToast("로그인 후 이용할 수 있어요 🔒");
      return;
    }

    setLoadingText("링크를 수정하는 중이에요...");
    setIsUpdating(true);
    try {
      await updateLink(user.uid, linkId, categoryId, updatedItem);
      const updatedList = await getLinks(user.uid);
      applyRemoteLinks(updatedList);
      showToast("링크가 수정되었어요 ✨");
    } catch (err) {
      console.error("Firestore 링크 수정 오류:", err);
      showToast("링크 수정에 실패했어요.");
    } finally {
      setIsUpdating(false);
    }
  };

  // 5. 링크 삭제 확인 처리 (users/{user.uid}/links/{linkId} 삭제)
  const handleConfirmDelete = async () => {
    if (!deleteTarget || !user) return;

    const { item } = deleteTarget;
    setIsDeleting(true);

    try {
      await deleteLink(user.uid, item.id);

      const nextDeleted = new Set(deletedIds);
      nextDeleted.add(item.id);
      setDeletedIds(nextDeleted);

      try {
        localStorage.setItem(
          `mylink_deleted_${user.uid}`,
          JSON.stringify(Array.from(nextDeleted)),
        );
      } catch {}

      const updatedList = await getLinks(user.uid);
      applyRemoteLinks(updatedList, undefined, nextDeleted);

      showToast("링크가 삭제되었어요 🗑️");
      setDeleteTarget(null);
    } catch (err) {
      console.error("Firestore 링크 삭제 오류:", err);
      showToast("링크 삭제에 실패했어요. 다시 시도해 주세요.");
    } finally {
      setIsDeleting(false);
    }
  };

  // 기본 데이터 초기화
  const handleResetData = async () => {
    if (!user) {
      setData(defaultData as ProfileData);
      showToast("기본 예시 데이터로 초기화되었어요 🔄");
      return;
    }

    setLoadingText("기본 템플릿으로 초기화하는 중이에요...");
    setIsUpdating(true);
    try {
      // 기존 삭제 기록 클리어
      setDeletedIds(new Set());
      try {
        localStorage.removeItem(`mylink_deleted_${user.uid}`);
      } catch {}

      // 기본 템플릿 다시 시딩
      await initUserDefaultLinks(user.uid, (defaultData as ProfileData).categories);
      const updatedList = await getLinks(user.uid);
      applyRemoteLinks(updatedList, undefined, new Set());
      showToast("기본 템플릿 링크로 초기화되었어요 🔄");
    } catch {
      showToast("초기화 중 문제가 발생했어요.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#191F28] flex flex-col justify-between relative selection:bg-blue-100">
      <div>
        {/* 1. 상단 글로벌 네비게이션 바 (구글 로그인/로그아웃 탑재) */}
        <TopBar
          user={user}
          onLogin={handleGoogleLogin}
          onLogout={handleLogout}
          isAuthLoading={isAuthLoading}
          onReset={handleResetData}
          onOpenQr={() => setIsQrOpen(true)}
          onCopyPageUrl={handleCopyPageUrl}
          onOpenAddLink={user ? () => handleOpenAddLink() : undefined}
          isSyncing={isLoading || isUpdating}
        />

        {/* 1-1. 업데이트/동기화 로딩 인디케이터 (상단 플로팅 캡슐) */}
        {(isLoading || isUpdating) && (
          <div
            role="status"
            aria-live="polite"
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-white/95 shadow-lg border border-[#E5E8EB] text-[13px] font-semibold text-[#3182F6] backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200"
          >
            <Loader2 className="w-4 h-4 animate-spin text-[#3182F6]" />
            <span>{loadingText}</span>
          </div>
        )}

        {/* 2. 메인 컨텐츠 영역 (모바일 최적화 뷰포트 max-w-md) */}
        <main className="max-w-md mx-auto px-4 py-6 space-y-6">
          {/* A. 로그인 여부에 따른 분기 화면 */}
          {!user ? (
            /* 비로그인 상태 화면: 설명 문구 및 로그인 유도 배너 */
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* 상단 설명 안내 컴포넌트 */}
              <AuthGuide onLogin={handleGoogleLogin} isLoggingIn={isLoggingIn} />

              {/* 둘러보기 안내 배너 */}
              <div className="flex items-center justify-between px-2 pt-2 text-xs font-semibold text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                  미리보기 화면 (로그인 후 내 링크로 변경)
                </span>
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="text-blue-600 hover:underline flex items-center gap-1"
                >
                  <LogIn className="w-3 h-3" />
                  로그인하기
                </button>
              </div>

              {/* 샘플 프로필 미리보기 */}
              <div className="opacity-75 pointer-events-none select-none filter blur-[0.3px] transition-all">
                <ProfileHeader profile={data.profile} />
                <div className="space-y-6 mt-4">
                  {data.categories.map((category) => (
                    <CategorySection
                      key={category.id}
                      category={category}
                      onToast={showToast}
                      onAddLink={() => handleOpenAddLink()}
                      onUpdateLink={handleUpdateLink}
                      onDeleteLinkClick={() => {}}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* B. 로그인 완료 상태: Firestore(users/{user.uid}/links) 개인화 화면 */
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* 유저 Firestore 경로 및 개인화 뱃지 */}
              <div className="flex items-center justify-between px-2 text-xs text-slate-500 bg-blue-50/80 border border-blue-100 rounded-2xl py-2 px-3.5">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                  <span className="truncate font-medium text-slate-700">
                    {user.displayName || user.email} 님의 마이링크
                  </span>
                </div>
                <span className="font-mono text-[10px] bg-white text-blue-600 border border-blue-200 px-2 py-0.5 rounded-full shrink-0">
                  users/{user.uid.slice(0, 6)}.../links
                </span>
              </div>

              {/* 개인화된 유저 프로필 헤더 */}
              <ProfileHeader profile={data.profile} />

              {/* 카테고리별 개인 링크 목록 섹션들 (수정, 삭제, 추가 지원) */}
              <div className="space-y-6">
                {data.categories.every((c) => c.items.length === 0) ? (
                  /* 등록된 링크가 없을 때 Empty State 안내 */
                  <div className="bg-white rounded-3xl p-8 border border-slate-100 text-center space-y-3 shadow-xs">
                    <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 mx-auto flex items-center justify-center">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-[#191F28]">
                      아직 등록된 링크가 없어요
                    </h3>
                    <p className="text-xs text-[#8B95A1] max-w-xs mx-auto leading-relaxed">
                      상단의 [추가] 버튼을 누르거나 아래 버튼으로 내 GitHub, 블로그, SNS 링크를 등록해보세요!
                    </p>
                    <button
                      type="button"
                      onClick={() => handleOpenAddLink()}
                      className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#3182F6] hover:bg-[#2272EB] text-white text-xs font-semibold transition active:scale-95 cursor-pointer shadow-sm"
                    >
                      첫 링크 등록하기
                    </button>
                  </div>
                ) : (
                  data.categories.map((category) => (
                    <CategorySection
                      key={category.id}
                      category={category}
                      onToast={showToast}
                      onAddLink={(catId) => handleOpenAddLink(catId)}
                      onUpdateLink={handleUpdateLink}
                      onDeleteLinkClick={(catId, item) =>
                        setDeleteTarget({ categoryId: catId, item })
                      }
                    />
                  ))
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* 3. 푸터 */}
      <footer className="max-w-md mx-auto px-5 py-8 text-center text-[12px] text-[#8B95A1] space-y-1">
        <p className="font-medium text-[#4E5968]">{data.footer.copyright}</p>
        <p className="text-[11px] text-[#B0B8C1]">
          {user ? `Firebase Cloud Synced · UID: ${user.uid.slice(0, 8)}` : (data.footer.poweredBy || "MyLink")}
        </p>
      </footer>

      {/* 4. 링크 추가 다이얼로그 모달 */}
      <AddLinkModal
        isOpen={isAddLinkOpen}
        onClose={() => setIsAddLinkOpen(false)}
        categories={data.categories}
        defaultCategoryId={targetCategoryId}
        onAddLink={handleAddLink}
        isLoading={isUpdating}
      />

      {/* 5. 링크 삭제 확인 다이얼로그 모달 */}
      <DeleteLinkModal
        isOpen={!!deleteTarget}
        onClose={() => !isDeleting && setDeleteTarget(null)}
        itemTitle={deleteTarget?.item.title}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />

      {/* 6. 시연용 QR 모달 */}
      <QrModal
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        url={currentUrl}
        onCopyUrl={handleCopyPageUrl}
      />

      {/* 7. TDS 플로팅 토스트 */}
      <Toast message={toastMessage} />
    </div>
  );
}
