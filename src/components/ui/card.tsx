import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * 토스 디자인 시스템(TDS) 규격 Card
 * - 16px 곡률 (radius-xl), 1px hairline border-grey-200
 * - 평면 우선 (Flat-first) 및 TDS 전용 미세 섀도우
 */
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { pressable?: boolean }
>(({ className, pressable = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "bg-white rounded-[16px] border border-[#E5E8EB] tds-shadow-card text-[#191F28] transition-all duration-150",
      pressable && "tds-pressable hover:border-[#3182F6]/50 active:scale-[0.985] cursor-pointer",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-4 sm:p-5", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-[18px] font-bold leading-snug tracking-tight text-[#191F28]",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-[14px] text-[#6B7684] leading-relaxed", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-4 sm:p-5 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

export { Card, CardHeader, CardTitle, CardDescription, CardContent };
