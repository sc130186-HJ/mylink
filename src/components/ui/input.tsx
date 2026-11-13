"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Input as BaseInput } from "@base-ui/react";

/**
 * Base UI Input 기반 TDS 규격 Input
 * - Base UI Input: 접근성 속성(aria-invalid, aria-required, data-focused 등) 자동 처리
 * - 12px 곡률 (radius-m), resting/focus/error 상태별 스타일 적용
 */
export interface InputProps
  extends React.ComponentPropsWithoutRef<typeof BaseInput> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <BaseInput
        ref={ref}
        className={cn(
          "flex h-11 w-full rounded-[12px] bg-[#F9FAFB] px-3.5 py-2 text-[15px] text-[#191F28] placeholder:text-[#B0B8C1]",
          "border border-[#E5E8EB] transition-all duration-150 outline-none",
          "hover:bg-[#F2F4F6] focus:bg-white focus:border-[#3182F6] focus:ring-3 focus:ring-[#3182F6]/15",
          "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-40",
          error && "border-[#F04452] focus:border-[#F04452] focus:ring-[#F04452]/15 bg-[#FFF0F1]",
          className
        )}
        aria-invalid={error}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
