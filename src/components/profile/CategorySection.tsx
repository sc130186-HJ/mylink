"use client";

import React from "react";
import { LinkCategory } from "@/types/profile";
import { LinkCard } from "./LinkCard";

interface CategorySectionProps {
  category: LinkCategory;
  onToast: (msg: string) => void;
}

export function CategorySection({ category, onToast }: CategorySectionProps) {
  return (
    <section className="space-y-2.5">
      {/* 카테고리 헤더 */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-[14px] font-bold text-[#4E5968] tracking-tight">
            {category.title}
          </h2>
          {category.description && (
            <p className="text-[12px] text-[#8B95A1] mt-0.5">
              {category.description}
            </p>
          )}
        </div>
        <span className="text-[12px] font-medium text-[#8B95A1] tabular-nums shrink-0 ml-2">
          {category.items.length}개
        </span>
      </div>

      {/* 카드 리스트 */}
      <div className="space-y-2.5">
        {category.items.map((item) => (
          <LinkCard key={item.id} item={item} onToast={onToast} />
        ))}
      </div>
    </section>
  );
}
