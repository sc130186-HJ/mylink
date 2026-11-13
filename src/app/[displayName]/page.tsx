"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useParams, useRouter, notFound } from "next/navigation";
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
import { Loader2, Sparkles } from "lucide-react";
import { loginWithGoogle, logout, onAuthChange, User } from "@/lib/auth";
import {
  useUserByDisplayNameQuery,
  useUserProfileQuery,
  useUpdateProfileMutation,
  useUserLinksQuery,
  useAddLinkMutation,
  useUpdateLinkMutation,
  useDeleteLinkMutation,
  useResetLinksMutation,
  useIncrementLinkClickMutation,
} from "@/hooks/useProfileQueries";

export default function UserDisplayNamePage() {
  const params = useParams<{ displayName: string }>();
  const router = useRouter();

  const rawDisplayName = params?.displayName || "";
  const decodedDisplayName = useMemo(() => {
    try {
      return decodeURIComponent(rawDisplayName).trim();
    } catch {
      return rawDisplayName.trim();
    }
  }, [rawDisplayName]);

  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isAddLinkOpen, setIsAddLinkOpen] = useState(false);
  const [targetCategoryId, setTargetCategoryId] = useState<string | undefined>(
    undefined
  );
  const [currentUrl, setCurrentUrl] = useState("");
  const [loadingText, setLoadingText] = useState(
    "링크 목록을 불러오는 중이에요..."
  );
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    categoryId: string;
    item: LinkItem;
  } | null>(null);

  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback((message: string) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(message);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  }, []);

  // 1. Firebase Auth 상태 감지
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

  // 2. displayName으로 유저 검색 (users 컬렉션)
  const userByNameQuery = useUserByDisplayNameQuery(decodedDisplayName);
  const targetUserId = userByNameQuery.data?.userId;
  const isOwner = !!(user && targetUserId && user.uid === targetUserId);

  // 소유자인 경우 본인 프로필 쿼리도 동기화
  const ownerProfileQuery = useUserProfileQuery(isOwner ? user : null);

  // 3. 검색된 userId로 users/{userId}/links 조회 및 실시간 구독
  const linksQuery = useUserLinksQuery(targetUserId, {
    seedIfEmpty: false,
  });

  // 4. 소유자일 때 로컬스토리지 삭제 목록 복원
  useEffect(() => {
    if (!targetUserId) {
      queueMicrotask(() => {
        setDeletedIds(new Set());
      });
      return;
    }
    const userDeletedKey = `mylink_deleted_${targetUserId}`;
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
  }, [targetUserId]);

  // ─────────────────────────────────────────────
  // 소유자 전용 Mutations
  // ─────────────────────────────────────────────
  const updateProfileMutation = useUpdateProfileMutation(targetUserId, {
    onSuccess: () => {
      showToast("프로필이 수정되었어요 ✨");
    },
    onError: (err) => {
      console.error("프로필 저장 오류:", err);
      showToast("프로필 저장에 실패해 이전 상태로 복구되었어요.");
    },
  });

  const addLinkMutation = useAddLinkMutation(targetUserId, {
    onSuccess: () => {
      showToast("새 링크가 추가되었어요 ✨");
    },
    onError: (err) => {
      console.error("Firestore 링크 추가 오류:", err);
      showToast("링크 추가에 실패했어요. 다시 시도해 주세요.");
    },
  });

  const updateLinkMutation = useUpdateLinkMutation(targetUserId, {
    onSuccess: () => {
      showToast("링크가 수정되었어요 ✨");
    },
    onError: (err) => {
      console.error("Firestore 링크 수정 오류:", err);
      showToast("링크 수정에 실패했어요.");
    },
  });

  const deleteLinkMutation = useDeleteLinkMutation(targetUserId, {
    onSuccess: (deletedLinkId) => {
      if (targetUserId) {
        const nextDeleted = new Set(deletedIds);
        nextDeleted.add(deletedLinkId);
        setDeletedIds(nextDeleted);
        try {
          localStorage.setItem(
            `mylink_deleted_${targetUserId}`,
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

  const resetLinksMutation = useResetLinksMutation(targetUserId, {
    onSuccess: () => {
      showToast("링크 목록을 새로고침했어요 🔄");
    },
    onError: () => {
      showToast("새로고침 중 문제가 발생했어요.");
    },
  });

  // 링크 클릭 카운트 증가 (낙관적 업데이트 + Firestore 저장)
  const incrementLinkClickMutation = useIncrementLinkClickMutation(targetUserId);

  const handleLinkClick = useCallback(
    (linkId: string) => {
      if (!targetUserId) return;
      incrementLinkClickMutation.mutate(linkId);
    },
    [targetUserId, incrementLinkClickMutation]
  );

  // ─────────────────────────────────────────────
  // 파생 데이터 조합 (프로필 + users/{userId}/links)
  // ─────────────────────────────────────────────
  const data = useMemo<ProfileData>(() => {
    const baseMock = defaultData as ProfileData;

    const activeProfile: ProfileInfo =
      (isOwner && ownerProfileQuery.data) ||
      userByNameQuery.data?.profile || {
        name: decodedDisplayName,
        role: "크리에이터",
        bio: "",
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
  }, [
    isOwner,
    ownerProfileQuery.data,
    userByNameQuery.data,
    decodedDisplayName,
    linksQuery.data,
    deletedIds,
  ]);

  // ─────────────────────────────────────────────
  // username(displayName)이 없으면 404 페이지 호출
  // ─────────────────────────────────────────────
  if (
    !decodedDisplayName ||
    (userByNameQuery.isFetched &&
      !userByNameQuery.isLoading &&
      !userByNameQuery.data)
  ) {
    notFound();
  }

  // ─────────────────────────────────────────────
  // 이벤트 핸들러
  // ─────────────────────────────────────────────
  const handleGoogleLogin = async () => {
    try {
      const loggedUser = await loginWithGoogle();
      showToast(`${loggedUser.displayName || "사용자"}님, 반갑습니다! ✨`);
    } catch (err: unknown) {
      const authError = err as { code?: string };
      if (authError.code === "auth/popup-closed-by-user") {
        showToast("로그인 창이 닫혔어요.");
      } else {
        console.error("로그인 실패:", err);
        showToast("구글 로그인 중 문제가 발생했어요. 다시 시도해 주세요.");
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      showToast("안전하게 로그아웃되었어요 👋");
    } catch (err) {
      console.error("로그아웃 실패:", err);
      showToast("로그아웃에 실패했어요.");
    }
  };

  const handleCopyPageUrl = () => {
    const urlToCopy = currentUrl || window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(urlToCopy);
    }
    showToast("페이지 주소가 복사되었어요 ✨");
  };

  const handleOpenAddLink = (categoryId?: string) => {
    if (!isOwner) return;
    setTargetCategoryId(categoryId);
    setIsAddLinkOpen(true);
  };

  const handleAddLink = async (
    categoryId: string,
    newItem: Omit<LinkItem, "id">
  ) => {
    if (!isOwner) return;
    setLoadingText("새 링크를 저장하고 목록을 갱신하는 중이에요...");
    await addLinkMutation.mutateAsync({ categoryId, newItem });
  };

  const handleUpdateLink = async (
    linkId: string,
    categoryId: string,
    updatedItem: Omit<LinkItem, "id">
  ) => {
    if (!isOwner) return;
    setLoadingText("링크를 수정하는 중이에요...");
    await updateLinkMutation.mutateAsync({ linkId, categoryId, updatedItem });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget || !isOwner) return;
    await deleteLinkMutation.mutateAsync(deleteTarget.item.id);
  };

  const handleSaveProfile = async (updatedProfile: ProfileInfo) => {
    if (!isOwner) return;
    await updateProfileMutation.mutateAsync(updatedProfile);
    // 표시 이름이 변경된 경우 새 /[displayName] 경로로 이동
    if (updatedProfile.name.trim() !== decodedDisplayName) {
      router.replace(`/${encodeURIComponent(updatedProfile.name.trim())}`);
    }
  };

  const handleResetData = async () => {
    if (!isOwner || !targetUserId) return;
    setLoadingText("링크 목록을 새로고침하는 중이에요...");
    await resetLinksMutation.mutateAsync();
  };

  const isInitialSearching = userByNameQuery.isLoading;
  const totalClickCount = useMemo(() => {
    return data.categories.reduce(
      (sum, cat) =>
        sum +
        cat.items.reduce((catSum, item) => catSum + (item.clickCount ?? 0), 0),
      0
    );
  }, [data.categories]);
  const isLinksLoading = !!targetUserId && linksQuery.isLoading;
  const isUpdating =
    addLinkMutation.isPending ||
    updateLinkMutation.isPending ||
    resetLinksMutation.isPending;

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#191F28] flex flex-col justify-between relative selection:bg-blue-100">
      <div>
        {/* 1. 상단 글로벌 네비게이션 바 */}
        <TopBar
          user={user}
          onLogin={handleGoogleLogin}
          onLogout={handleLogout}
          isAuthLoading={isAuthLoading}
          onReset={isOwner ? handleResetData : undefined}
          onOpenQr={() => setIsQrOpen(true)}
          onCopyPageUrl={handleCopyPageUrl}
          onOpenAddLink={isOwner ? () => handleOpenAddLink() : undefined}
          isSyncing={
            isInitialSearching ||
            isLinksLoading ||
            isUpdating ||
            updateProfileMutation.isPending
          }
          onEditProfile={
            isOwner ? () => setIsEditProfileOpen(true) : undefined
          }
        />

        {/* 1-1. 로딩/동기화 인디케이터 */}
        {(isInitialSearching || isLinksLoading || isUpdating) && (
          <div
            role="status"
            aria-live="polite"
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-white/95 shadow-lg border border-[#E5E8EB] text-[13px] font-semibold text-[#3182F6] backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200"
          >
            <Loader2 className="w-4 h-4 animate-spin text-[#3182F6]" />
            <span>
              {isInitialSearching
                ? `${decodedDisplayName} 님의 프로필을 찾는 중이에요...`
                : isLinksLoading
                ? "링크 목록을 불러오는 중이에요..."
                : loadingText}
            </span>
          </div>
        )}

        {/* 2. 메인 컨텐츠 영역 */}
        <main className="max-w-md mx-auto px-4 py-6 space-y-6">
          {isInitialSearching ? (
            /* 초기 유저 검색 로딩 상태 */
            <div className="bg-white rounded-3xl p-10 border border-slate-100 text-center space-y-3 shadow-xs animate-pulse">
              <div className="w-20 h-20 rounded-full bg-slate-100 mx-auto" />
              <div className="h-5 w-32 bg-slate-100 rounded-full mx-auto" />
              <div className="h-3.5 w-48 bg-slate-100 rounded-full mx-auto" />
            </div>
          ) : targetUserId ? (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* 유저 Firestore 경로(users/{userId}/links) 안내 배너 */}
              <div className="flex items-center justify-between gap-2 text-xs text-slate-500 bg-blue-50/80 border border-blue-100 rounded-2xl py-2 px-3.5">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="truncate font-medium text-slate-700">
                    {data.profile.name} 님의 마이링크
                  </span>
                </div>
                <span
                  className="font-mono text-[10px] bg-white text-blue-600 border border-blue-200 px-2 py-0.5 rounded-full shrink-0"
                  title={`users/${targetUserId}/links`}
                >
                  users/{targetUserId.slice(0, 6)}.../links
                </span>
              </div>

              {/* 유저 프로필 헤더 */}
              <ProfileHeader
                profile={data.profile}
                isOwner={isOwner}
                onEditProfile={
                  isOwner ? () => setIsEditProfileOpen(true) : undefined
                }
                totalClickCount={totalClickCount}
              />

              {/* 카테고리별 링크 목록 (users/{userId}/links) */}
              <div className="space-y-6">
                {data.categories.every((c) => c.items.length === 0) ? (
                  <div className="bg-white rounded-3xl p-8 border border-slate-100 text-center space-y-3 shadow-xs">
                    <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 mx-auto flex items-center justify-center">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-[#191F28]">
                      아직 등록된 링크가 없어요
                    </h3>
                    <p className="text-xs text-[#8B95A1] max-w-xs mx-auto leading-relaxed">
                      {isOwner
                        ? "상단의 [추가] 버튼을 누르거나 아래 버튼으로 첫 번째 링크를 등록해보세요!"
                        : `${data.profile.name} 님이 아직 등록한 링크가 없어요.`}
                    </p>
                    {isOwner && (
                      <button
                        type="button"
                        onClick={() => handleOpenAddLink()}
                        className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#3182F6] hover:bg-[#2272EB] text-white text-xs font-semibold transition active:scale-95 cursor-pointer shadow-sm"
                      >
                        첫 링크 등록하기
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
                          isOwner ? (catId) => handleOpenAddLink(catId) : undefined
                        }
                        onUpdateLink={isOwner ? handleUpdateLink : undefined}
                        onDeleteLinkClick={
                          isOwner
                            ? (catId, item) =>
                                setDeleteTarget({ categoryId: catId, item })
                            : undefined
                        }
                      />
                    ))
                )}
              </div>
            </div>
          ) : null}
        </main>
      </div>

      {/* 3. 푸터 */}
      <footer className="max-w-md mx-auto px-5 py-8 text-center text-[12px] text-[#8B95A1] space-y-1">
        <p className="font-medium text-[#4E5968]">
          © {new Date().getFullYear()} {data.profile.name}. All rights reserved.
        </p>
        <p className="text-[11px] text-[#B0B8C1]">
          {targetUserId
            ? `Firestore · users/${targetUserId.slice(0, 8)}/links`
            : data.footer.poweredBy || "MyLink"}
        </p>
      </footer>

      {/* 4. 소유자 전용 모달 (링크 추가 / 삭제 / 프로필 수정) */}
      {isOwner && targetUserId && (
        <>
          <AddLinkModal
            isOpen={isAddLinkOpen}
            onClose={() => setIsAddLinkOpen(false)}
            categories={data.categories}
            defaultCategoryId={targetCategoryId}
            onAddLink={handleAddLink}
            isLoading={addLinkMutation.isPending}
          />

          <DeleteLinkModal
            isOpen={!!deleteTarget}
            onClose={() =>
              !deleteLinkMutation.isPending && setDeleteTarget(null)
            }
            itemTitle={deleteTarget?.item.title}
            onConfirm={handleConfirmDelete}
            isLoading={deleteLinkMutation.isPending}
          />

          <EditProfileModal
            isOpen={isEditProfileOpen}
            onClose={() => setIsEditProfileOpen(false)}
            currentProfile={data.profile}
            currentUserId={targetUserId}
            onSave={handleSaveProfile}
          />
        </>
      )}

      {/* 5. QR 모달 */}
      <QrModal
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        url={currentUrl}
        onCopyUrl={handleCopyPageUrl}
      />

      {/* 6. 플로팅 토스트 */}
      <Toast message={toastMessage} />
    </div>
  );
}
