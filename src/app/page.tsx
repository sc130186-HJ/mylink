"use client";

import React, { useState, useEffect, useRef } from "react";
import defaultData from "@/data/mockData.json";
import { ProfileData } from "@/types/profile";
import { TopBar } from "@/components/profile/TopBar";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { CategorySection } from "@/components/profile/CategorySection";
import { QrModal } from "@/components/profile/QrModal";
import { Toast } from "@/components/profile/Toast";
import { AddLinkModal } from "@/components/profile/AddLinkModal";
import { LinkItem } from "@/types/profile";
import { getProfile, saveProfile } from "@/lib/firestore";

const STORAGE_KEY = "mylink_profile_data";
const PROFILE_ID = "default";

export default function Home() {
  const [data, setData] = useState<ProfileData>(defaultData as ProfileData);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isAddLinkOpen, setIsAddLinkOpen] = useState(false);
  const [targetCategoryId, setTargetCategoryId] = useState<string | undefined>(undefined);
  const [currentUrl, setCurrentUrl] = useState("");
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Firestore → LocalStorage 순서로 데이터 초기화
  useEffect(() => {
    const init = async () => {
      setCurrentUrl(window.location.href);

      try {
        // 1) Firestore에서 최신 데이터 조회
        const remote = await getProfile(PROFILE_ID);
        if (remote?.profile && remote?.categories) {
          setData(remote);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(remote));
          return;
        }
      } catch {
        // Firestore 오류 시 로컬 폴백
      }

      try {
        // 2) 로컬 스토리지 폴백
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed?.profile && parsed?.categories) {
            setData(parsed);
            return;
          }
        }
        // 3) 저장된 데이터가 없으면 mockData를 로컬 + Firestore에 저장
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
        await saveProfile(PROFILE_ID, defaultData as ProfileData).catch(() => {});
      } catch {
        // 로컬 스토리지 접근 불가 시 기본 상태 유지
      }
    };

    init();
  }, []);

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
    try {
      const reset = defaultData as ProfileData;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reset));
      setData(reset);
      await saveProfile(PROFILE_ID, reset).catch(() => {});
      showToast("기본 데이터로 초기화되었어요 🔄");
    } catch {
      showToast("데이터 초기화에 실패했어요");
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

  // 새 링크 추가 처리 (Firestore + LocalStorage 반영)
  const handleAddLink = async (categoryId: string, newItem: Omit<LinkItem, "id">) => {
    const newLinkItem: LinkItem = {
      ...newItem,
      id: `link-${Date.now()}`,
    };

    const updatedCategories = data.categories.map((category) => {
      if (category.id === categoryId) {
        return {
          ...category,
          items: [newLinkItem, ...category.items],
        };
      }
      return category;
    });

    const updatedData: ProfileData = {
      ...data,
      categories: updatedCategories,
    };

    setData(updatedData);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
    } catch {
      // 로컬 스토리지 접근 불가 시 에러 방어
    }

    // Firestore에 비동기 저장 (UI 블로킹 없이)
    await saveProfile(PROFILE_ID, updatedData).catch(() => {});

    showToast("새 링크가 추가되었어요 ✨");
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#191F28] flex flex-col justify-between">
      <div>
        {/* 1. 상단 글로벌 네비게이션 바 */}
        <TopBar
          onReset={handleResetData}
          onOpenQr={() => setIsQrOpen(true)}
          onCopyPageUrl={handleCopyPageUrl}
          onOpenAddLink={() => handleOpenAddLink()}
        />

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
