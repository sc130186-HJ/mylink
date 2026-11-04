"use client";

import React from "react";
import { RotateCcw, QrCode, Share2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TopBarProps {
  onReset: () => void;
  onOpenQr: () => void;
  onCopyPageUrl: () => void;
  onOpenAddLink?: () => void;
}

export function TopBar({
  onReset,
  onOpenQr,
  onCopyPageUrl,
  onOpenAddLink,
}: TopBarProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#E5E8EB]">
      <div className="max-w-md mx-auto px-5 h-14 flex items-center justify-between">
        {/* 서비스 로고 */}
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#3182F6]" />
          <span className="text-[18px] font-bold tracking-tight text-[#191F28]">
            MyLink
          </span>
        </div>

        {/* 유틸리티 액션 그룹 (shadcn/ui Button 재사용) */}
        <div className="flex items-center space-x-1.5">
          {/* 새 링크 추가 버튼 */}
          {onOpenAddLink && (
            <Button
              variant="subtle"
              size="s"
              onClick={onOpenAddLink}
              title="새 링크 추가"
              aria-label="새 링크 추가"
              className="gap-1 px-2.5 text-[#3182F6]"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden xs:inline">추가</span>
            </Button>
          )}

          {/* 데이터 초기화 버튼 */}
          <Button
            variant="icon"
            size="icon-m"
            onClick={onReset}
            title="기본 데이터 초기화"
            aria-label="데이터 초기화"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>

          {/* QR 코드 보기 버튼 */}
          <Button
            variant="icon"
            size="icon-m"
            onClick={onOpenQr}
            title="QR 코드 보기"
            aria-label="QR 코드 보기"
          >
            <QrCode className="w-4 h-4" />
          </Button>

          {/* 링크 복사 버튼 */}
          <Button
            variant="icon"
            size="icon-m"
            onClick={onCopyPageUrl}
            title="페이지 링크 복사"
            aria-label="페이지 링크 복사"
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
