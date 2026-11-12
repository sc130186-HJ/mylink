"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import defaultData from "@/data/mockData.json";
import { ProfileData, LinkItem } from "@/types/profile";
import { TopBar } from "@/components/profile/TopBar";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { CategorySection } from "@/components/profile/CategorySection";
import { QrModal } from "@/components/profile/QrModal";
import { Toast } from "@/components/profile/Toast";
import { AddLinkModal } from "@/components/profile/AddLinkModal";
import { DeleteLinkModal } from "@/components/profile/DeleteLinkModal";
import { Loader2 } from "lucide-react";
import {
  getProfile,
  saveProfile,
  addLink,
  updateLink,
  deleteLink,
  getLinks,
  subscribeLinks,
  FirestoreLinkResult,
} from "@/lib/firestore";

const USER_ID = "anonymous";
const STORAGE_KEY = "mylink_profile_data";
const PROFILE_ID = "default";
const DELETED_IDS_KEY = "mylink_deleted_link_ids";

export default function Home() {
  const [data, setData] = useState<ProfileData>(defaultData as ProfileData);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isAddLinkOpen, setIsAddLinkOpen] = useState(false);
  const [targetCategoryId, setTargetCategoryId] = useState<string | undefined>(undefined);
  const [currentUrl, setCurrentUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
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

  // 삭제된 아이콘/링크 ID 목록 로컬스토리지 초기화
  useEffect(() => {
    try {
      const savedDeleted = localStorage.getItem(DELETED_IDS_KEY);
      if (savedDeleted) {
        const parsed = JSON.parse(savedDeleted);
        if (Array.isArray(parsed)) {
          setDeletedIds(new Set(parsed));
        }
      }
    } catch {
      // 로컬 스토리지 읽기 에러 방어
    }
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

        const firestoreIds = new Set(validRemote.map((r) => r.item.id));
        const typedDefaultCategories = (defaultData as ProfileData).categories;

        const updatedCategories = source.categories.map((cat) => {
          const firestoreItems = categoryMap.get(cat.id) || [];
          // 기본 mock / 기존 아이템 중 삭제되지 않았고 Firestore와 중복되지 않는 것들은 뒤에 유지
          const baseItems = (
            typedDefaultCategories.find((c) => c.id === cat.id)?.items || cat.items
          ).filter(
            (item) => !firestoreIds.has(item.id) && !activeDeletedIds.has(item.id),
          );

          return {
            ...cat,
            items: [...firestoreItems, ...baseItems],
          };
        });

        const updatedData: ProfileData = {
          ...source,
          categories: updatedCategories,
        };

        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
        } catch {
          // 로컬 스토리지 에러 방어
        }

        return updatedData;
      });
    },
    [deletedIds],
  );

  // 1. 페이지 로드 시 Firestore(user/anonymous/links)에서 링크 불러오기 & 실시간 구독
  useEffect(() => {
    queueMicrotask(() => {
      setCurrentUrl(window.location.href);
    });

    // 1-1) 프로필 메타데이터 초기화 (Firestore profiles 또는 localStorage)
    const initProfile = async () => {
      setLoadingText("링크 목록을 불러오는 중이에요...");
      setIsLoading(true);

      let loadedDeletedIds = new Set<string>();
      try {
        const savedDeleted = localStorage.getItem(DELETED_IDS_KEY);
        if (savedDeleted) {
          const parsed = JSON.parse(savedDeleted);
          if (Array.isArray(parsed)) {
            loadedDeletedIds = new Set(parsed);
            setDeletedIds(loadedDeletedIds);
          }
        }
      } catch {}

      try {
        const remote = await getProfile(PROFILE_ID);
        if (remote?.profile && remote?.categories) {
          setData(remote);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(remote));
        } else {
          const saved = localStorage.getItem(STORAGE_KEY);
          if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed?.profile && parsed?.categories) {
              setData(parsed);
            }
          }
        }
      } catch {
        // 폴백 기본 데이터 유지
      }

      // 1-2) 단발성 Firestore 링크 즉시 조회 (createdAt 기준 최신순 정렬)
      try {
        const initialLinks = await getLinks(USER_ID);
        if (initialLinks.length > 0) {
          applyRemoteLinks(initialLinks, undefined, loadedDeletedIds);
        }
      } catch (err) {
        console.error("초기 링크 로드 오류:", err);
      } finally {
        setIsLoading(false);
      }
    };

    initProfile();

    // 1-3) Firestore 경로 user/anonymous/links 실시간 구독 (생성/변경 시 즉시 갱신)
    const unsubscribe = subscribeLinks(USER_ID, (latestLinks) => {
      if (latestLinks.length > 0) {
        applyRemoteLinks(latestLinks);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [applyRemoteLinks]);

  // 토스트 메시지 띄우기 (2.4초 자동 소멸 - PRD 규격)
  const showToast = (message: string) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(message);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  };

  // 기본 데이터 초기화
  const handleResetData = async () => {
    setLoadingText("기본 데이터로 초기화하는 중이에요...");
    setIsUpdating(true);
    try {
      const reset = defaultData as ProfileData;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reset));
      localStorage.removeItem(DELETED_IDS_KEY);
      setDeletedIds(new Set());
      setData(reset);
      await saveProfile(PROFILE_ID, reset).catch(() => {});
      showToast("기본 데이터로 초기화되었어요 🔄");
    } catch {
      showToast("데이터 초기화에 실패했어요");
    } finally {
      setIsUpdating(false);
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
    setTargetCategoryId(categoryId);
    setIsAddLinkOpen(true);
  };

  // 2. 새 링크 추가 처리 (user/anonymous/links 저장 및 목록 최신순 즉시 갱신)
  const handleAddLink = async (categoryId: string, newItem: Omit<LinkItem, "id">) => {
    setLoadingText("새 링크를 저장하고 목록을 갱신하는 중이에요...");
    setIsUpdating(true);
    try {
      // 1) Firestore user/anonymous/links 경로에 추가 (createdAt: serverTimestamp)
      await addLink(USER_ID, categoryId, newItem);

      // 2) 최신 목록 조회 후 즉시 목록 갱신
      const updatedList = await getLinks(USER_ID);
      applyRemoteLinks(updatedList);

      showToast("새 링크가 추가되었어요 ✨");
    } catch (err) {
      console.error("Firestore 링크 추가 오류:", err);
      // Firestore 네트워크/저장 오류 시 로컬 상태에 직접 추가 폴백
      const fallbackItem: LinkItem = {
        ...newItem,
        id: `link-${Date.now()}`,
      };

      setData((prev) => {
        const updatedCategories = prev.categories.map((category) => {
          if (category.id === categoryId) {
            return {
              ...category,
              items: [fallbackItem, ...category.items],
            };
          }
          return category;
        });

        const updatedData = { ...prev, categories: updatedCategories };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
        } catch {}
        return updatedData;
      });

      showToast("새 링크가 추가되었어요 ✨");
    } finally {
      setIsUpdating(false);
    }
  };

  // 3. 링크 인라인 수정 처리 (Firestore user/anonymous/links/{linkId} 업데이트)
  const handleUpdateLink = async (
    linkId: string,
    categoryId: string,
    updatedItem: Omit<LinkItem, "id">,
  ) => {
    setLoadingText("링크를 수정하는 중이에요...");
    setIsUpdating(true);
    try {
      // 1) Firestore user/anonymous/links/{linkId} 경로에 수정 반영 (merge: true)
      await updateLink(USER_ID, linkId, categoryId, updatedItem);

      // 2) 최신 링크 목록 재조회 및 즉시 반영
      const updatedList = await getLinks(USER_ID);
      applyRemoteLinks(updatedList);

      // 3) 로컬 상태 즉각 동기화 (mock 데이터 및 빠른 반응성 보장)
      setData((prev) => {
        const nextCategories = prev.categories.map((cat) => {
          const hasItem = cat.items.some((it) => it.id === linkId);
          if (hasItem) {
            return {
              ...cat,
              items: cat.items.map((it) =>
                it.id === linkId ? { ...updatedItem, id: linkId } : it,
              ),
            };
          }
          return cat;
        });
        const nextData = { ...prev, categories: nextCategories };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(nextData));
        } catch {}
        return nextData;
      });

      showToast("링크가 수정되었어요 ✨");
    } catch (err) {
      console.error("Firestore 링크 수정 오류:", err);
      // 네트워크 등 실패 시 로컬 상태라도 업데이트
      setData((prev) => {
        const nextCategories = prev.categories.map((cat) => ({
          ...cat,
          items: cat.items.map((it) =>
            it.id === linkId ? { ...updatedItem, id: linkId } : it,
          ),
        }));
        const nextData = { ...prev, categories: nextCategories };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(nextData));
        } catch {}
        return nextData;
      });
      showToast("링크가 수정되었어요 ✨");
    } finally {
      setIsUpdating(false);
    }
  };

  // 4. 링크 삭제 확인 처리 (Firestore user/anonymous/links/{linkId} 삭제)
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    const { item } = deleteTarget;
    setIsDeleting(true);

    try {
      // 1) Firestore user/anonymous/links/{linkId} 문서 삭제
      await deleteLink(USER_ID, item.id);

      // 2) 삭제된 ID 기록 (mock 데이터 복구 방지 및 지속성 유지)
      const nextDeleted = new Set(deletedIds);
      nextDeleted.add(item.id);
      setDeletedIds(nextDeleted);
      try {
        localStorage.setItem(
          DELETED_IDS_KEY,
          JSON.stringify(Array.from(nextDeleted)),
        );
      } catch {}

      // 3) 최신 Firestore 목록 조회 및 로컬 상태에서 즉시 제거
      const updatedList = await getLinks(USER_ID);
      applyRemoteLinks(updatedList, undefined, nextDeleted);

      setData((prev) => {
        const nextCategories = prev.categories.map((cat) => ({
          ...cat,
          items: cat.items.filter((it) => it.id !== item.id),
        }));
        const nextData = { ...prev, categories: nextCategories };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(nextData));
        } catch {}
        return nextData;
      });

      showToast("링크가 삭제되었어요 🗑️");
      setDeleteTarget(null);
    } catch (err) {
      console.error("Firestore 링크 삭제 오류:", err);
      showToast("링크 삭제에 실패했어요. 다시 시도해 주세요.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#191F28] flex flex-col justify-between relative">
      <div>
        {/* 1. 상단 글로벌 네비게이션 바 */}
        <TopBar
          onReset={handleResetData}
          onOpenQr={() => setIsQrOpen(true)}
          onCopyPageUrl={handleCopyPageUrl}
          onOpenAddLink={() => handleOpenAddLink()}
          isSyncing={isLoading || isUpdating}
        />

        {/* 1-1. 업데이트/갱신 로딩 인디케이터 (상단 플로팅 캡슐) */}
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
        <main className="max-w-md mx-auto px-5 py-6 space-y-6">
          {/* 프로필 헤더 */}
          <ProfileHeader profile={data.profile} />

          {/* 카테고리별 링크 목록 섹션들 (수정 및 삭제 버튼 연동) */}
          <div className="space-y-6">
            {data.categories.map((category) => (
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
            ))}
          </div>
        </main>
      </div>

      {/* 3. 푸터 */}
      <footer className="max-w-md mx-auto px-5 py-8 text-center text-[12px] text-[#8B95A1] space-y-1">
        <p className="font-medium text-[#4E5968]">{data.footer.copyright}</p>
        {data.footer.poweredBy && (
          <p className="text-[11px] text-[#B0B8C1]">{data.footer.poweredBy}</p>
        )}
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
