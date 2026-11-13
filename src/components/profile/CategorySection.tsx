"use client";

import React from "react";
import { LinkCategory, LinkItem } from "@/types/profile";
import { LinkCard } from "./LinkCard";
import { Plus } from "lucide-react";

interface CategorySectionProps {
  category: LinkCategory;
  onToast: (msg: string) => void;
  onLinkClick?: (linkId: string) => void;
  onAddLink?: (categoryId: string) => void;
  onUpdateLink?: (
    linkId: string,
    categoryId: string,
    item: Omit<LinkItem, "id">,
  ) => Promise<void> | void;
  onDeleteLinkClick?: (categoryId: string, item: LinkItem) => void;
}

export function CategorySection({
  category,
  onToast,
  onLinkClick,
  onAddLink,
  onUpdateLink,
  onDeleteLinkClick,
}: CategorySectionProps) {
  return (
    <section className="space-y-2.5">
      {/* 카테고리 헤더 */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <h2 className="text-[14px] font-bold text-[#4E5968] tracking-tight">
            {category.title}
          </h2>
          <span className="text-[12px] font-medium text-[#8B95A1] tabular-nums">
            {category.items.length}개
          </span>
        </div>

        {onAddLink && (
          <button
            type="button"
            onClick={() => onAddLink(category.id)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[10px] text-[12px] font-semibold text-[#3182F6] hover:bg-[#E8F3FF] active:bg-[#d6eaff] transition cursor-pointer"
            title={`${category.title}에 링크 추가`}
            aria-label={`${category.title}에 링크 추가`}
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>추가</span>
          </button>
        )}
      </div>

      {category.description && (
        <p className="text-[12px] text-[#8B95A1] px-1 -mt-1">
          {category.description}
        </p>
      )}

      {/* 카드 리스트 */}
      <div className="space-y-2.5">
        {category.items.length > 0 ? (
          category.items.map((item) => (
            <LinkCard
              key={item.id}
              item={item}
              onToast={onToast}
              onLinkClick={onLinkClick}
              onUpdate={
                onUpdateLink
                  ? (linkId, updatedItem) =>
                      onUpdateLink(linkId, category.id, updatedItem)
                  : undefined
              }
              onDeleteClick={
                onDeleteLinkClick
                  ? (clickedItem) => onDeleteLinkClick(category.id, clickedItem)
                  : undefined
              }
            />
          ))
        ) : (
          <div className="py-6 px-4 text-center rounded-[16px] border border-dashed border-[#E5E8EB] bg-white/50">
            <p className="text-[13px] text-[#8B95A1]">
              아직 등록된 링크가 없어요
            </p>
            {onAddLink && (
              <button
                type="button"
                onClick={() => onAddLink(category.id)}
                className="mt-2 text-[12px] font-semibold text-[#3182F6] hover:underline cursor-pointer"
              >
                첫 번째 링크 추가하기
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
