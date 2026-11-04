"use client";

import React from "react";
import { Check } from "lucide-react";

interface ToastProps {
  message: string | null;
}

export function Toast({ message }: ToastProps) {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
      <div className="bg-[#191F28] text-white px-4 py-3 rounded-2xl flex items-center space-x-2.5 text-[14px] font-medium tds-shadow-toast min-w-[240px] max-w-[90vw] justify-center">
        <span className="w-5 h-5 rounded-full bg-[#32A05B] flex items-center justify-center text-white shrink-0">
          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
        </span>
        <span className="truncate">{message}</span>
      </div>
    </div>
  );
}
