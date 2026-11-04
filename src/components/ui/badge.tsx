import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * 토스 디자인 시스템(TDS) 규격 Badge
 * - 22px 높이, 6px radius 또는 full pill
 * - 시맨틱 washed 배경과 페어링 (brand, neutral, success, danger, warning)
 */
const badgeVariants = cva(
  "inline-flex items-center justify-center text-[11px] font-semibold tracking-tight border select-none transition-colors",
  {
    variants: {
      variant: {
        brand: "bg-[#E8F3FF] text-[#3182F6] border-[#d2e7ff]",
        neutral: "bg-[#F2F4F6] text-[#4E5968] border-[#E5E8EB]",
        success: "bg-[#E6F8EE] text-[#32A05B] border-[#c2f0d5]",
        danger: "bg-[#FEECEE] text-[#F04452] border-[#fad1d5]",
        warning: "bg-[#FFF8E6] text-[#D97706] border-[#fae4b2]",
      },
      shape: {
        rounded: "h-[22px] px-1.5 rounded-[6px]",
        pill: "h-[22px] px-2 rounded-full",
      },
    },
    defaultVariants: {
      variant: "neutral",
      shape: "rounded",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, shape, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, shape }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
