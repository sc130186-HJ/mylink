"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";

interface QrModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  onCopyUrl: () => void;
}

export function QrModal({ isOpen, onClose, url, onCopyUrl }: QrModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent showCloseButton={true}>
        <DialogHeader>
          <DialogTitle>모바일로 바로 보기</DialogTitle>
          <DialogDescription>
            스마트폰 카메라로 QR 코드를 스캔하세요
          </DialogDescription>
        </DialogHeader>

        {/* QR 코드 박스 */}
        <div className="w-44 h-44 mx-auto bg-white p-3.5 rounded-[16px] border border-[#E5E8EB] tds-shadow-card mt-3 flex items-center justify-center">
          <svg className="w-full h-full text-[#191F28]" viewBox="0 0 100 100" fill="currentColor">
            {/* 3개의 위치 파인더 */}
            <rect x="5" y="5" width="26" height="26" rx="5" fill="#3182F6" />
            <rect x="9" y="9" width="18" height="18" rx="3" fill="white" />
            <rect x="13" y="13" width="10" height="10" rx="2" fill="#3182F6" />

            <rect x="69" y="5" width="26" height="26" rx="5" fill="#3182F6" />
            <rect x="73" y="9" width="18" height="18" rx="3" fill="white" />
            <rect x="77" y="13" width="10" height="10" rx="2" fill="#3182F6" />

            <rect x="5" y="69" width="26" height="26" rx="5" fill="#3182F6" />
            <rect x="9" y="73" width="18" height="18" rx="3" fill="white" />
            <rect x="13" y="77" width="10" height="10" rx="2" fill="#3182F6" />

            {/* QR 매트릭스 도트 모의 패턴 */}
            <rect x="36" y="8" width="6" height="6" rx="1" />
            <rect x="46" y="8" width="6" height="14" rx="1" />
            <rect x="56" y="14" width="8" height="6" rx="1" />
            <rect x="36" y="22" width="12" height="6" rx="1" />
            <rect x="8" y="36" width="6" height="12" rx="1" />
            <rect x="18" y="44" width="8" height="8" rx="1" />
            <rect x="34" y="36" width="8" height="8" rx="1" fill="#3182F6" />
            <rect x="46" y="36" width="16" height="6" rx="1" />
            <rect x="66" y="36" width="6" height="14" rx="1" />
            <rect x="78" y="44" width="14" height="6" rx="1" />
            <rect x="34" y="50" width="14" height="6" rx="1" />
            <rect x="52" y="48" width="8" height="14" rx="1" />
            <rect x="68" y="56" width="8" height="8" rx="1" />
            <rect x="82" y="56" width="10" height="6" rx="1" />
            <rect x="36" y="68" width="8" height="14" rx="1" />
            <rect x="48" y="68" width="12" height="6" rx="1" />
            <rect x="66" y="72" width="6" height="12" rx="1" />
            <rect x="78" y="68" width="14" height="8" rx="1" />
            <rect x="48" y="80" width="8" height="12" rx="1" />
            <rect x="62" y="86" width="12" height="6" rx="1" />
            <rect x="80" y="82" width="12" height="10" rx="1" />
          </svg>
        </div>

        {/* URL 표시 및 복사 버튼 */}
        <div className="mt-3.5 w-full flex items-center justify-between gap-2 px-3 py-2 bg-[#F2F4F6] rounded-[12px] text-left">
          <span className="text-[12px] font-mono text-[#4E5968] truncate flex-1">
            {url || "mylink.app/@jieun"}
          </span>
          <button
            onClick={onCopyUrl}
            className="text-[11px] font-semibold text-[#3182F6] hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>복사</span>
          </button>
        </div>

        {/* shadcn/ui Button 재사용 */}
        <DialogFooter>
          <Button
            variant="secondary"
            size="l"
            onClick={onClose}
            className="w-full"
          >
            닫기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
