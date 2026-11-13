"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Avatar as BaseAvatar } from "@base-ui/react";

/**
 * Base UI Avatar 기반 TDS 규격 Avatar
 * - Base UI Avatar: 이미지 로드 실패 시 Fallback 자동 전환 처리
 * - 4단 사이즈: s(32px), m(44px), l(64px), xl(80px)
 */

interface AvatarRootProps extends React.ComponentPropsWithoutRef<typeof BaseAvatar.Root> {
  size?: "s" | "m" | "l" | "xl";
  online?: boolean;
}

const sizeClasses = {
  s: "w-8 h-8 text-[12px]",
  m: "w-11 h-11 text-[15px]",
  l: "w-16 h-16 text-[20px]",
  xl: "w-20 h-20 text-[24px]",
};

const Avatar = React.forwardRef<HTMLSpanElement, AvatarRootProps>(
  ({ className, size = "m", online, children, ...props }, ref) => {
    return (
      <BaseAvatar.Root
        ref={ref}
        className={cn(
          "relative inline-flex shrink-0 rounded-full select-none",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        <div className="relative w-full h-full rounded-full overflow-hidden flex items-center justify-center border-2 border-white shadow-xs">
          {children}
        </div>
        {online && (
          <span
            className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#32A05B] border-2 border-white rounded-full shadow-xs"
            aria-label="온라인"
          />
        )}
      </BaseAvatar.Root>
    );
  }
);
Avatar.displayName = "Avatar";

const AvatarImage = React.forwardRef<
  HTMLImageElement,
  React.ComponentPropsWithoutRef<typeof BaseAvatar.Image>
>(({ className, alt = "프로필 이미지", ...props }, ref) => (
  <BaseAvatar.Image
    ref={ref}
    alt={alt}
    className={cn("w-full h-full object-cover", className)}
    {...props}
  />
));
AvatarImage.displayName = "AvatarImage";

const AvatarFallback = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<typeof BaseAvatar.Fallback>
>(({ className, ...props }, ref) => (
  <BaseAvatar.Fallback
    ref={ref}
    className={cn(
      "w-full h-full bg-[#E8F3FF] text-[#3182F6] font-bold flex items-center justify-center",
      className
    )}
    {...props}
  />
));
AvatarFallback.displayName = "AvatarFallback";

export { Avatar, AvatarImage, AvatarFallback };
