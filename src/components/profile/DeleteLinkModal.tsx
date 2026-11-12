"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";

interface DeleteLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemTitle?: string;
  onConfirm: () => Promise<void> | void;
  isLoading?: boolean;
}

export function DeleteLinkModal({
  isOpen,
  onClose,
  itemTitle,
  onConfirm,
  isLoading = false,
}: DeleteLinkModalProps) {
  const handleConfirm = async () => {
    if (isLoading) return;
    await onConfirm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isLoading && !open && onClose()}>
      <DialogContent showCloseButton={!isLoading} className="max-w-[340px] p-6 text-center">
        {/* 상단 경고/휴지통 아이콘 */}
        <div className="w-12 h-12 rounded-full bg-[#FEECE8] text-[#F04452] flex items-center justify-center mx-auto mb-3 shadow-xs">
          <Trash2 className="w-6 h-6 stroke-[2.2]" />
        </div>

        {/* 제목 */}
        <DialogHeader className="space-y-1 mb-2">
          <DialogTitle className="text-[18px] font-bold text-[#191F28] tracking-tight">
            정말 삭제하시겠습니까?
          </DialogTitle>
        </DialogHeader>

        {/* 링크 이름 표시 */}
        {itemTitle && (
          <div className="my-2.5 px-3 py-2 bg-[#F2F4F6] rounded-[12px] text-[14px] font-semibold text-[#333D4B] break-keep truncate">
            {itemTitle}
          </div>
        )}

        {/* 경고 : "이 작업은 되돌릴 수 없습니다" (빨간색) */}
        <p className="text-[13px] font-medium text-[#F04452] mb-6 flex items-center justify-center gap-1">
          <AlertTriangle className="w-4 h-4 shrink-0 text-[#F04452]" />
          <span>이 작업은 되돌릴 수 없습니다</span>
        </p>

        {/* 버튼 : [취소] [삭제하기] */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="m"
            className="flex-1 rounded-[12px] font-semibold text-[14px]"
            onClick={onClose}
            disabled={isLoading}
          >
            취소
          </Button>
          <Button
            type="button"
            variant="danger"
            size="m"
            className="flex-1 rounded-[12px] font-semibold text-[14px]"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
                <span>삭제 중...</span>
              </>
            ) : (
              "삭제하기"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
