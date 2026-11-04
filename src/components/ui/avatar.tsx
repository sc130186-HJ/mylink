"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "s" | "m" | "l" | "xl";
  online?: boolean;
}

const sizeClasses = {
  s: "w-8 h-8 text-[12px]",
  m: "w-11 h-11 text-[15px]",
  l: "w-16 h-16 text-[20px]",
  xl: "w-20 h-20 text-[24px]",
};

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, size = "m", online, children, ...props }, ref) => {
    return (
      <div
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
      </div>
    );
  }
);
Avatar.displayName = "Avatar";

const AvatarImage = React.forwardRef<
  HTMLImageElement,
  React.ImgHTMLAttributes<HTMLImageElement>
>(({ className, ...props }, ref) => (
  <img
    ref={ref}
    className={cn("w-full h-full object-cover", className)}
    {...props}
  />
));
AvatarImage.displayName = "AvatarImage";

const AvatarFallback = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
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
