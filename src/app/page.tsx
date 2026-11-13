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
import { Loader2, Sparkles, LogIn, ExternalLink } from "lucide-react";
import Link from "next/link";
import { loginWithGoogle, logout, onAuthChange, User } from "@/lib/auth";
import {
  DEFAULT_OWNER_UID,
  useUserProfileQuery,
  useUpdateProfileMutation,
  useUserLinksQuery,
  useAddLinkMutation,
  useUpdateLinkMutation,
  useDeleteLinkMutation,
  useResetLinksMutation,
  useIncrementLinkClickMutation,
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
      queueMicrotask(() => {
        setDeletedIds(new Set());
      });
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
    queueMicrotask(() => {
      setDeletedIds(activeDeleted);
    });
  }, [user]);

  // ─────────────────────────────────────────────
  // TanStack Query: 데이터 조회 (Queries)
  // ─────────────────────────────────────────────
  const activeUid = user?.uid || DEFAULT_OWNER_UID;
  const profileQuery = useUserProfileQuery(user);
  const linksQuery = useUserLinksQuery(activeUid);

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

  // 링크 목록 새로고침
  const resetLinksMutation = useResetLinksMutation(user?.uid, {
    onSuccess: () => {
      showToast("링크 목록을 새로고침했어요 🔄");
    },
    onError: () => {
      showToast("새로고침 중 문제가 발생했어요.");
    },
  });

  // 링크 클릭 카운트 증가 (낙관적 업데이트 + Firestore 저장)
  const incrementLinkClickMutation = useIncrementLinkClickMutation(activeUid);

  const handleLinkClick = useCallback(
    (linkId: string) => {
      incrementLinkClickMutation.mutate(linkId);
    },
    [incrementLinkClickMutation]
  );

  // ─────────────────────────────────────────────
  // 파생 데이터 조합 (프로필 + 카테고리별 링크)
  // ─────────────────────────────────────────────
  const data = useMemo<ProfileData>(() => {
    const baseMock = defaultData as ProfileData;

    const activeProfile: ProfileInfo = profileQuery.data || {
      name: user?.displayName || "신예헌",
      role: "크리에이터",
      bio: "반갑습니다! 나만의 소셜 링크를 모아두는 공간입니다 ✨",
      avatarUrl: user?.photoURL || undefined,
      email: user?.email || undefined,
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
      footer: {
        ...baseMock.footer,
        copyright: `© ${new Date().getFullYear()} ${activeProfile.name}. All rights reserved.`,
      },
    };
  }, [user, profileQuery.data, linksQuery.data, deletedIds]);

  const isLoading = profileQuery.isLoading || linksQuery.isLoading;
  const totalClickCount = useMemo(() => {
    return data.categories.reduce(
      (sum, cat) =>
        sum +
        cat.items.reduce((catSum, item) => catSum + (item.clickCount ?? 0), 0),
      0
    );
  }, [data.categories]);
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

  // 링크 목록 새로고침
  const handleResetData = async () => {
    if (!user) {
      return;
    }

    setLoadingText("링크 목록을 새로고침하는 중이에요...");
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
          profileName={user ? data.profile.name : undefined}
          onEditProfile={user ? () => setIsEditProfileOpen(true) : undefined}
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
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* 유저 Firestore 경로 및 개인화 뱃지 */}
            <div className="flex items-center justify-between gap-2 text-xs text-slate-500 bg-blue-50/80 border border-blue-100 rounded-2xl py-2 px-3.5">
              <div className="flex items-center gap-1.5 truncate">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                <span className="truncate font-medium text-slate-700">
                  {data.profile.name || user?.displayName || "신예헌"} 님의 마이링크
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="font-mono text-[10px] bg-white text-blue-600 border border-blue-200 px-2 py-0.5 rounded-full">
                  users/{activeUid.slice(0, 6)}.../links
                </span>
                {data.profile.name && (
                  <Link
                    href={`/${encodeURIComponent(data.profile.name.trim())}`}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#3182F6] bg-white border border-blue-200 hover:bg-[#E8F3FF] px-2 py-0.5 rounded-full transition-colors"
                    title="내 개인 페이지로 이동"
                  >
                    <span>내 페이지</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </Link>
                )}
              </div>
            </div>

            {/* 개인화된 유저 프로필 헤더 */}
            <ProfileHeader
              profile={data.profile}
              isOwner={!!user}
              onEditProfile={user ? () => setIsEditProfileOpen(true) : undefined}
              showMyPageButton={!!user}
              totalClickCount={totalClickCount}
            />

            {/* 카테고리별 개인 링크 목록 섹션들 (로그인 시 수정, 삭제, 추가 지원) */}
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
                    {user
                      ? "상단의 [추가] 버튼을 누르거나 아래 버튼으로 내 GitHub, 블로그, SNS 링크를 등록해보세요!"
                      : `${data.profile.name} 님이 아직 등록한 링크가 없어요. 본인이시라면 우측 상단 Google 로그인 후 링크를 추가해보세요!`}
                  </p>
                  {user ? (
                    <button
                      type="button"
                      onClick={() => handleOpenAddLink()}
                      className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#3182F6] hover:bg-[#2272EB] text-white text-xs font-semibold transition active:scale-95 cursor-pointer shadow-sm"
                    >
                      첫 링크 등록하기
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={isLoggingIn}
                      onClick={handleGoogleLogin}
                      className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#3182F6] hover:bg-[#2272EB] text-white text-xs font-semibold transition active:scale-95 cursor-pointer shadow-sm"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Google 로그인하고 링크 관리하기</span>
                    </button>
                  )}
                </div>
              ) : (
                data.categories
                  .filter((category) => category.items.length > 0)
                  .map((category) => (
                    <CategorySection
                      key={category.id}
                      category={category}
                      onToast={showToast}
                      onLinkClick={handleLinkClick}
                      onAddLink={
                        user ? (catId) => handleOpenAddLink(catId) : undefined
                      }
                      onUpdateLink={user ? handleUpdateLink : undefined}
                      onDeleteLinkClick={
                        user
                          ? (catId, item) =>
                              setDeleteTarget({ categoryId: catId, item })
                          : undefined
                      }
                    />
                  ))
              )}
            </div>
          </div>
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
