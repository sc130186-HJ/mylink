"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { Dialog as BaseDialog } from "@base-ui/react";

/**
 * Base UI Dialog 기반 TDS 규격 Dialog
 * - Base UI Dialog: 접근성(role=dialog, aria-modal, focus trap, Esc 닫기) 자동 처리
 * - 20px 곡률(radius-2xl), 24px inner padding
 * - 0.56 알파 overlay-scrim
 */

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

function Dialog({ open, onOpenChange, children }: DialogProps) {
  return (
    <BaseDialog.Root open={open} onOpenChange={onOpenChange}>
      {children}
    </BaseDialog.Root>
  );
}

const DialogContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { showCloseButton?: boolean }
>(({ className, children, showCloseButton = true, ...props }, ref) => (
  <BaseDialog.Portal>
    {/* Scrim Overlay */}
    <BaseDialog.Backdrop className="fixed inset-0 z-50 bg-black/56 backdrop-blur-xs transition-opacity animate-in fade-in duration-200" />

    {/* Viewport: 중앙 정렬 컨테이너 */}
    <BaseDialog.Viewport className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <BaseDialog.Popup
        ref={ref}
        className={cn(
          "relative w-full max-w-xs bg-white rounded-[20px] p-6 text-center border border-[#E5E8EB] shadow-xl animate-in zoom-in-95 duration-200",
          className
        )}
        {...props}
      >
        {showCloseButton && (
          <BaseDialog.Close
            className="absolute top-4 right-4 p-1.5 rounded-full text-[#8B95A1] hover:text-[#191F28] hover:bg-[#F2F4F6] transition cursor-pointer"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </BaseDialog.Close>
        )}
        {children}
      </BaseDialog.Popup>
    </BaseDialog.Viewport>
  </BaseDialog.Portal>
));
DialogContent.displayName = "DialogContent";

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-1.5", className)} {...props} />
);
DialogHeader.displayName = "DialogHeader";

const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <BaseDialog.Title
    ref={ref}
    className={cn(
      "text-[18px] font-bold text-[#191F28] tracking-tight",
      className
    )}
    {...props}
  />
));
DialogTitle.displayName = "DialogTitle";

const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <BaseDialog.Description
    ref={ref}
    className={cn("text-[14px] text-[#6B7684] leading-relaxed", className)}
    {...props}
  />
));
DialogDescription.displayName = "DialogDescription";

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("mt-4 flex flex-col gap-2", className)} {...props} />
);
DialogFooter.displayName = "DialogFooter";

export {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
};
