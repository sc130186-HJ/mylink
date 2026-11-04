"use client";

import React from "react";
import { LinkItem, BadgeVariant, IconType } from "@/types/profile";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Copy, Mail, FolderGit2, Link2 } from "lucide-react";

interface LinkCardProps {
  item: LinkItem;
  onToast: (msg: string) => void;
}

// 아이콘 렌더링 헬퍼
function renderIcon(icon: IconType) {
  switch (icon) {
    case "github":
      return (
        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
          />
        </svg>
      );
    case "velog":
      return (
        <span className="text-white font-bold text-base select-none">
          V
        </span>
      );
    case "linkedin":
      return (
        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      );
    case "email":
      return <Mail className="w-5 h-5 text-white" />;
    case "project":
      return <FolderGit2 className="w-5 h-5 text-white" />;
    case "link":
    default:
      return <Link2 className="w-5 h-5 text-white" />;
  }
}

// 아이콘 배경색 헬퍼 (TDS 토큰 매핑)
function getIconBgColor(icon: IconType) {
  switch (icon) {
    case "github":
      return "bg-[#191F28]";
    case "velog":
      return "bg-[#20C997]";
    case "linkedin":
      return "bg-[#0A66C2]";
    case "email":
      return "bg-[#3182F6]";
    case "project":
      return "bg-[#4E5968]";
    case "link":
    default:
      return "bg-[#6B7684]";
  }
}

// TDS 뱃지 variant 변환
function mapBadgeVariant(variant?: BadgeVariant) {
  switch (variant) {
    case "blue":
      return "brand";
    case "green":
      return "success";
    case "red":
      return "danger";
    case "yellow":
      return "warning";
    case "grey":
    default:
      return "neutral";
  }
}

export function LinkCard({ item, onToast }: LinkCardProps) {
  const isCopy = item.isCopyAction;

  const handleClick = (e: React.MouseEvent) => {
    if (isCopy) {
      e.preventDefault();
      const textToCopy = item.url.replace(/^mailto:/, "");
      if (navigator.clipboard) {
        navigator.clipboard.writeText(textToCopy);
      }
      onToast(`${item.title} 값이 복사되었어요 📋`);
    }
  };

  const CardInner = (
    <div className="flex items-center justify-between p-3.5 sm:p-4 group">
      {/* 좌측: 아이콘 + 제목/보조설명 */}
      <div className="flex items-center space-x-3.5 min-w-0 flex-1 pr-2">
        <div
          className={`w-10 h-10 sm:w-11 sm:h-11 rounded-[12px] flex items-center justify-center shrink-0 shadow-xs ${getIconBgColor(
            item.icon
          )}`}
        >
          {renderIcon(item.icon)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[15px] font-bold text-[#191F28] group-hover:text-[#3182F6] transition-colors truncate">
              {item.title}
            </span>

            {/* shadcn/ui Badge 재사용 */}
            {item.badge && (
              <Badge variant={mapBadgeVariant(item.badge.variant)} shape="rounded">
                {item.badge.text}
              </Badge>
            )}
          </div>

          {item.subtitle && (
            <p className="text-[13px] text-[#6B7684] mt-0.5 line-clamp-1">
              {item.subtitle}
            </p>
          )}
        </div>
      </div>

      {/* 우측: 액션 표시 (복사 뱃지 또는 화살표) */}
      <div className="shrink-0 pl-1">
        {isCopy ? (
          <Badge variant="brand" shape="pill" className="gap-1 cursor-pointer">
            <Copy className="w-3 h-3" />
            <span>복사</span>
          </Badge>
        ) : (
          <div className="p-1 text-[#B0B8C1] group-hover:text-[#3182F6] group-hover:translate-x-0.5 transition-all">
            <ChevronRight className="w-5 h-5 stroke-[2.2]" />
          </div>
        )}
      </div>
    </div>
  );

  if (isCopy) {
    return (
      <Card pressable onClick={handleClick} className="w-full">
        {CardInner}
      </Card>
    );
  }

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block w-full text-left"
    >
      <Card pressable>{CardInner}</Card>
    </a>
  );
}
