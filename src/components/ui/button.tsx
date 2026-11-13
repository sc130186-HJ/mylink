"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Button as BaseButton } from "@base-ui/react";

/**
 * Base UI Button 기반 TDS 규격 Button
 * - 4단 스케일: XL(56px/r16), L(48px/r14), M(40px/r12), S(32px/r10)
 * - Base UI Button: 접근성 속성(aria-disabled, role, data-disabled) 자동 처리
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center font-medium select-none whitespace-nowrap transition-all duration-150 outline-none cursor-pointer data-[disabled]:opacity-30 data-[disabled]:pointer-events-none active:scale-[0.985]",
  {
    variants: {
      variant: {
        primary:
          "bg-[#3182F6] text-white hover:bg-[#1B64DA] active:bg-[#1B64DA] shadow-xs",
        secondary:
          "bg-[#F2F4F6] text-[#191F28] hover:bg-[#E5E8EB] active:bg-[#E5E8EB]",
        danger:
          "bg-[#F04452] text-white hover:bg-[#F04452]/90 active:bg-[#F04452]/90",
        ghost:
          "bg-transparent text-[#3182F6] hover:bg-black/[0.04] active:bg-black/[0.06]",
        subtle:
          "bg-[#E8F3FF] text-[#3182F6] hover:bg-[#d6eaff] active:bg-[#d6eaff]",
        icon:
          "bg-transparent text-[#6B7684] hover:text-[#191F28] hover:bg-[#F2F4F6]",
      },
      size: {
        xl: "h-14 px-6 rounded-[16px] text-[17px] font-bold leading-tight gap-2.5",
        l: "h-12 px-5 rounded-[14px] text-[17px] font-bold leading-tight gap-2",
        m: "h-10 px-4 rounded-[12px] text-[15px] font-semibold leading-tight gap-1.5",
        s: "h-8 px-3 rounded-[10px] text-[13px] font-semibold leading-tight gap-1",
        "icon-m": "w-10 h-10 p-0 rounded-[12px] flex items-center justify-center",
        "icon-s": "w-8 h-8 p-0 rounded-[10px] flex items-center justify-center",
      },
    },
    defaultVariants: {
      variant: "secondary",
      size: "m",
    },
  }
);

export interface ButtonProps
  extends React.ComponentPropsWithoutRef<typeof BaseButton>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <BaseButton
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
