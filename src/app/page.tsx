"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import defaultData from "@/data/mockData.json";
import { ProfileData, LinkItem, ProfileInfo } from "@/types/profile";
import { TopBar } from "@/components/profile/TopBar";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { CategorySection } from "@/components/profile/CategorySection";
import { QrModal } from "@/components/profile/QrModal";
import { Toast } from "@/components/profile/Toast";
import { AddLinkModal } from "@/components/profile/AddLinkModal";
import { DeleteLinkModal } from "@/components/profile/DeleteLinkModal";
import { EditProfileModal } from "@/components/profile/EditProfileModal";
import { AuthGuide } from "@/components/profile/AuthGuide";
import { Loader2, Sparkles, LogIn } from "lucide-react";
import { loginWithGoogle, logout, onAuthChange, User } from "@/lib/auth";
import {
  useUserProfileQuery,
  useUpdateProfileMutation,
  useUserLinksQuery,
  useAddLinkMutation,
  useUpdateLinkMutation,
  useDeleteLinkMutation,
  useResetLinksMutation,
} from "@/hooks/useProfileQueries";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isAddLinkOpen, setIsAddLinkOpen] = useState(false);
  const [targetCategoryId, setTargetCategoryId] = useState<string | undefined>(undefined);
  const [currentUrl, setCurrentUrl] = useState("");
  const [loadingText, setLoadingText] = useState("내 링크 목록을 불러오는 중이에요...");
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());

  // 프로필 수정 모달 상태
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  // 삭제 확인 모달 대상 링크 상태
  const [deleteTarget, setDeleteTarget] = useState<{
    categoryId: string;
    item: LinkItem;
  } | null>(null);

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

  // 2. 로그인 유저 변경 시 로컬스토리지 삭제 목록 복원
  useEffect(() => {
    if (!user) {
      setDeletedIds(new Set());
      return;
    }
    const userDeletedKey = `mylink_deleted_${user.uid}`;
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
  }, [user]);

  // ─────────────────────────────────────────────
  // TanStack Query: 데이터 조회 (Queries)
  // ─────────────────────────────────────────────
  const profileQuery = useUserProfileQuery(user);
  const linksQuery = useUserLinksQuery(user?.uid);

  // ─────────────────────────────────────────────
  // TanStack Query: 데이터 변경 (Mutations)
  // ─────────────────────────────────────────────

  // 프로필 업데이트 (낙관적 업데이트 적용)
  const updateProfileMutation = useUpdateProfileMutation(user?.uid, {
    onSuccess: () => {
      showToast("프로필이 수정되었어요 ✨");
    },
    onError: (err) => {
      console.error("프로필 저장 오류:", err);
      showToast("프로필 저장에 실패해 이전 상태로 복구되었어요.");
    },
  });

  // 새 링크 추가
  const addLinkMutation = useAddLinkMutation(user?.uid, {
    onSuccess: () => {
      showToast("새 링크가 추가되었어요 ✨");
    },
    onError: (err) => {
      console.error("Firestore 링크 추가 오류:", err);
      showToast("링크 추가에 실패했어요. 다시 시도해 주세요.");
    },
  });

  // 링크 수정
  const updateLinkMutation = useUpdateLinkMutation(user?.uid, {
    onSuccess: () => {
      showToast("링크가 수정되었어요 ✨");
    },
    onError: (err) => {
      console.error("Firestore 링크 수정 오류:", err);
      showToast("링크 수정에 실패했어요.");
    },
  });

  // 링크 삭제
  const deleteLinkMutation = useDeleteLinkMutation(user?.uid, {
    onSuccess: (deletedLinkId) => {
      if (user) {
        const nextDeleted = new Set(deletedIds);
        nextDeleted.add(deletedLinkId);
        setDeletedIds(nextDeleted);
        try {
          localStorage.setItem(
            `mylink_deleted_${user.uid}`,
            JSON.stringify(Array.from(nextDeleted))
          );
        } catch {}
      }
      showToast("링크가 삭제되었어요 🗑️");
      setDeleteTarget(null);
    },
    onError: (err) => {
      console.error("Firestore 링크 삭제 오류:", err);
      showToast("링크 삭제에 실패했어요. 다시 시도해 주세요.");
    },
  });

  // 기본 템플릿 초기화
  const resetLinksMutation = useResetLinksMutation(user?.uid, {
    onSuccess: () => {
      showToast("기본 템플릿 링크로 초기화되었어요 🔄");
    },
    onError: () => {
      showToast("초기화 중 문제가 발생했어요.");
    },
  });

  // ─────────────────────────────────────────────
  // 파생 데이터 조합 (프로필 + 카테고리별 링크)
  // ─────────────────────────────────────────────
  const data = useMemo<ProfileData>(() => {
    const baseMock = defaultData as ProfileData;

    if (!user) {
      return baseMock;
    }

    const activeProfile: ProfileInfo = profileQuery.data || {
      name: user.displayName || "내 링크",
      role: "크리에이터",
      bio: "반갑습니다! 나만의 소셜 링크를 모아두는 공간입니다 ✨",
      avatarUrl: user.photoURL || undefined,
      email: user.email || undefined,
      statusMessage: "온라인 · 환영합니다!",
    };

    const remoteLinks = linksQuery.data || [];
    const validRemote = remoteLinks.filter((r) => !deletedIds.has(r.item.id));

    const categoryMap = new Map<string, LinkItem[]>();
    const defaultCatId = baseMock.categories[0]?.id || "channels";

    for (const { categoryId, item } of validRemote) {
      const targetId = baseMock.categories.some((c) => c.id === categoryId)
        ? categoryId
        : defaultCatId;
      const current = categoryMap.get(targetId) || [];
      current.push(item);
      categoryMap.set(targetId, current);
    }

    const updatedCategories = baseMock.categories.map((cat) => ({
      ...cat,
      items: categoryMap.get(cat.id) || [],
    }));

    return {
      profile: activeProfile,
      categories: updatedCategories,
      footer: baseMock.footer,
    };
  }, [user, profileQuery.data, linksQuery.data, deletedIds]);

  const isLoading =
    !!user && (profileQuery.isLoading || linksQuery.isLoading);
  const isUpdating =
    addLinkMutation.isPending ||
    updateLinkMutation.isPending ||
    resetLinksMutation.isPending;

  // ─────────────────────────────────────────────
  // 이벤트 핸들러
  // ─────────────────────────────────────────────

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

  // 새 링크 추가 처리
  const handleAddLink = async (
    categoryId: string,
    newItem: Omit<LinkItem, "id">
  ) => {
    if (!user) {
      showToast("로그인 후 이용할 수 있어요 🔒");
      return;
    }
    setLoadingText("새 링크를 저장하고 목록을 갱신하는 중이에요...");
    await addLinkMutation.mutateAsync({ categoryId, newItem });
  };

  // 링크 인라인 수정 처리
  const handleUpdateLink = async (
    linkId: string,
    categoryId: string,
    updatedItem: Omit<LinkItem, "id">
  ) => {
    if (!user) {
      showToast("로그인 후 이용할 수 있어요 🔒");
      return;
    }
    setLoadingText("링크를 수정하는 중이에요...");
    await updateLinkMutation.mutateAsync({ linkId, categoryId, updatedItem });
  };

  // 링크 삭제 확인 처리
  const handleConfirmDelete = async () => {
    if (!deleteTarget || !user) return;
    await deleteLinkMutation.mutateAsync(deleteTarget.item.id);
  };

  // 프로필 저장 핸들러 (낙관적 업데이트: mutate 호출 즉시 캐시 갱신 및 모달 닫힘)
  const handleSaveProfile = (updatedProfile: ProfileInfo) => {
    if (!user) return;
    updateProfileMutation.mutate(updatedProfile);
  };

  // 기본 데이터 초기화
  const handleResetData = async () => {
    if (!user) {
      showToast("기본 예시 데이터로 초기화되었어요 🔄");
      return;
    }

    setLoadingText("기본 템플릿으로 초기화하는 중이에요...");
    setDeletedIds(new Set());
    try {
      localStorage.removeItem(`mylink_deleted_${user.uid}`);
    } catch {}

    await resetLinksMutation.mutateAsync();
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
          isSyncing={isLoading || isUpdating || updateProfileMutation.isPending}
        />

        {/* 1-1. 업데이트/동기화 로딩 인디케이터 (상단 플로팅 캡슐) */}
        {(isLoading || isUpdating) && (
          <div
            role="status"
            aria-live="polite"
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-white/95 shadow-lg border border-[#E5E8EB] text-[13px] font-semibold text-[#3182F6] backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200"
          >
            <Loader2 className="w-4 h-4 animate-spin text-[#3182F6]" />
            <span>
              {isLoading ? "내 링크 목록을 불러오는 중이에요..." : loadingText}
            </span>
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
                    {data.profile.name || user.displayName || user.email} 님의 마이링크
                  </span>
                </div>
                <span className="font-mono text-[10px] bg-white text-blue-600 border border-blue-200 px-2 py-0.5 rounded-full shrink-0">
                  users/{user.uid.slice(0, 6)}.../links
                </span>
              </div>

              {/* 개인화된 유저 프로필 헤더 */}
              <ProfileHeader
                profile={data.profile}
                isOwner={true}
                onEditProfile={() => setIsEditProfileOpen(true)}
              />

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
          {user
            ? `Firebase Cloud Synced · UID: ${user.uid.slice(0, 8)}`
            : data.footer.poweredBy || "MyLink"}
        </p>
      </footer>

      {/* 4. 링크 추가 다이얼로그 모달 */}
      <AddLinkModal
        isOpen={isAddLinkOpen}
        onClose={() => setIsAddLinkOpen(false)}
        categories={data.categories}
        defaultCategoryId={targetCategoryId}
        onAddLink={handleAddLink}
        isLoading={addLinkMutation.isPending}
      />

      {/* 5. 링크 삭제 확인 다이얼로그 모달 */}
      <DeleteLinkModal
        isOpen={!!deleteTarget}
        onClose={() => !deleteLinkMutation.isPending && setDeleteTarget(null)}
        itemTitle={deleteTarget?.item.title}
        onConfirm={handleConfirmDelete}
        isLoading={deleteLinkMutation.isPending}
      />

      {/* 6. 시연용 QR 모달 */}
      <QrModal
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        url={currentUrl}
        onCopyUrl={handleCopyPageUrl}
      />

      {/* 7. 프로필 수정 모달 */}
      {user && (
        <EditProfileModal
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
          currentProfile={data.profile}
          currentUserId={user.uid}
          onSave={handleSaveProfile}
        />
      )}

      {/* 8. TDS 플로팅 토스트 */}
      <Toast message={toastMessage} />
    </div>
  );
}
