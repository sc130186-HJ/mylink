"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * 토스 디자인 시스템(TDS) 규격 Input
 * - 12px 곡률 (radius-m)
 * - resting: 1px border-[#E5E8EB], bg-[#F9FAFB]
 * - focus: 1.5px border-[#3182F6], ring-2 ring-[#3182F6]/15, bg-white
 * - 15px 폰트, text-[#191F28], placeholder-[#B0B8C1]
 */
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-[12px] bg-[#F9FAFB] px-3.5 py-2 text-[15px] text-[#191F28] placeholder:text-[#B0B8C1]",
          "border border-[#E5E8EB] transition-all duration-150 outline-none",
          "hover:bg-[#F2F4F6] focus:bg-white focus:border-[#3182F6] focus:ring-3 focus:ring-[#3182F6]/15",
          "disabled:cursor-not-allowed disabled:opacity-40",
          error && "border-[#F04452] focus:border-[#F04452] focus:ring-[#F04452]/15 bg-[#FFF0F1]",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
