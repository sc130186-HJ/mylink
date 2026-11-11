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
import { Loader2 } from "lucide-react";
import {
  getProfile,
  saveProfile,
  addLink,
  getLinks,
  subscribeLinks,
  FirestoreLinkResult,
} from "@/lib/firestore";

const USER_ID = "anonymous";
const STORAGE_KEY = "mylink_profile_data";
const PROFILE_ID = "default";

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
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Firestore에서 가져온 링크 목록(createdAt 최신순)을 카테고리별로 반영하는 함수
  const applyRemoteLinks = useCallback(
    (remoteLinks: FirestoreLinkResult[], baseData?: ProfileData) => {
      setData((prev) => {
        const source = baseData || prev;
        if (!remoteLinks || remoteLinks.length === 0) {
          return source;
        }

        // 카테고리별로 remoteLinks 분류 (remoteLinks는 createdAt desc 순서 유지)
        const categoryMap = new Map<string, LinkItem[]>();
        const defaultCatId = source.categories[0]?.id || "channels";

        for (const { categoryId, item } of remoteLinks) {
          const targetId = source.categories.some((c) => c.id === categoryId)
            ? categoryId
            : defaultCatId;
          const current = categoryMap.get(targetId) || [];
          current.push(item);
          categoryMap.set(targetId, current);
        }

        const firestoreIds = new Set(remoteLinks.map((r) => r.item.id));

        const typedDefaultCategories = (defaultData as ProfileData).categories;

        const updatedCategories = source.categories.map((cat) => {
          const firestoreItems = categoryMap.get(cat.id) || [];
          // 기본 mock / 기존 아이템 중 Firestore와 중복되지 않는 것들은 뒤에 유지
          const baseItems = (
            typedDefaultCategories.find((c) => c.id === cat.id)?.items || cat.items
          ).filter((item) => !firestoreIds.has(item.id));

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
    [],
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
          applyRemoteLinks(initialLinks);
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

          {/* 카테고리별 링크 목록 섹션들 */}
          <div className="space-y-6">
            {data.categories.map((category) => (
              <CategorySection
                key={category.id}
                category={category}
                onToast={showToast}
                onAddLink={(catId) => handleOpenAddLink(catId)}
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

      {/* 5. 시연용 QR 모달 */}
      <QrModal
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        url={currentUrl}
        onCopyUrl={handleCopyPageUrl}
      />

      {/* 6. TDS 플로팅 토스트 */}
      <Toast message={toastMessage} />
    </div>
  );
}
