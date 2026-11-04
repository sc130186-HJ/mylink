"use client";

import React, { useState, useEffect, useRef } from "react";
import defaultData from "@/data/mockData.json";
import { ProfileData } from "@/types/profile";
import { TopBar } from "@/components/profile/TopBar";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { CategorySection } from "@/components/profile/CategorySection";
import { QrModal } from "@/components/profile/QrModal";
import { Toast } from "@/components/profile/Toast";

const STORAGE_KEY = "mylink_profile_data";

export default function Home() {
  const [data, setData] = useState<ProfileData>(defaultData as ProfileData);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 로컬 스토리지 데이터 동기화 및 현재 URL 설정
  useEffect(() => {
    setCurrentUrl(window.location.href);

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.profile && parsed?.categories) {
          setData(parsed);
          return;
        }
      }
      // 저장된 데이터가 없으면 초기 mockData 저장
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
    } catch {
      // 로컬 스토리지 접근 불가 시 기본 상태 유지
    }
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
  const handleResetData = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
      setData(defaultData as ProfileData);
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

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#191F28] flex flex-col justify-between">
      <div>
        {/* 1. 상단 글로벌 네비게이션 바 */}
        <TopBar
          onReset={handleResetData}
          onOpenQr={() => setIsQrOpen(true)}
          onCopyPageUrl={handleCopyPageUrl}
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

      {/* 4. 시연용 QR 모달 */}
      <QrModal
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        url={currentUrl}
        onCopyUrl={handleCopyPageUrl}
      />

      {/* 5. TDS 플로팅 토스트 */}
      <Toast message={toastMessage} />
    </div>
  );
}
