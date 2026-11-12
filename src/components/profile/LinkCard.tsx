"use client";

import React, { useState, useRef } from "react";
import { LinkItem, BadgeVariant, IconType } from "@/types/profile";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronRight,
  Copy,
  Mail,
  FolderGit2,
  Link2,
  Pencil,
  Trash2,
  X,
  AlertCircle,
  Loader2,
  Check,
} from "lucide-react";
import {
  MAX_TITLE_LENGTH,
  MAX_SUBTITLE_LENGTH,
  MAX_BADGE_LENGTH,
  validateTitle,
  validateSubtitle,
  validateUrl,
  validateBadgeText,
  formatUrl,
} from "@/lib/validation";

interface LinkCardProps {
  item: LinkItem;
  onToast: (msg: string) => void;
  onUpdate?: (
    linkId: string,
    updatedItem: Omit<LinkItem, "id">,
  ) => Promise<void> | void;
  onDeleteClick?: (item: LinkItem) => void;
}

// 아이콘 프리셋 정의
const ICON_OPTIONS: { type: IconType; label: string; bg: string }[] = [
  { type: "github", label: "GitHub", bg: "bg-[#191F28]" },
  { type: "velog", label: "Velog", bg: "bg-[#20C997]" },
  { type: "project", label: "프로젝트", bg: "bg-[#4E5968]" },
  { type: "linkedin", label: "LinkedIn", bg: "bg-[#0A66C2]" },
  { type: "email", label: "이메일", bg: "bg-[#3182F6]" },
  { type: "link", label: "기본 링크", bg: "bg-[#6B7684]" },
];

// 뱃지 색상 옵션
const BADGE_VARIANTS: {
  variant: BadgeVariant;
  label: string;
  badgeVariant: "brand" | "success" | "danger" | "warning" | "neutral";
}[] = [
  { variant: "blue", label: "블루", badgeVariant: "brand" },
  { variant: "green", label: "그린", badgeVariant: "success" },
  { variant: "yellow", label: "옐로우", badgeVariant: "warning" },
  { variant: "red", label: "레드", badgeVariant: "danger" },
  { variant: "grey", label: "그레이", badgeVariant: "neutral" },
];

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

export function LinkCard({
  item,
  onToast,
  onUpdate,
  onDeleteClick,
}: LinkCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 수정용 인라인 폼 상태
  const [editTitle, setEditTitle] = useState(item.title);
  const [editSubtitle, setEditSubtitle] = useState(item.subtitle || "");
  const [editUrl, setEditUrl] = useState(item.url);
  const [editIcon, setEditIcon] = useState<IconType>(item.icon || "link");
  const [editBadgeText, setEditBadgeText] = useState(item.badge?.text || "");
  const [editBadgeVariant, setEditBadgeVariant] = useState<BadgeVariant>(
    item.badge?.variant || "blue",
  );
  const [editIsCopyAction, setEditIsCopyAction] = useState(!!item.isCopyAction);

  // 인라인 수정 에러 상태
  const [errors, setErrors] = useState<{
    title?: string;
    subtitle?: string;
    url?: string;
    badgeText?: string;
  }>({});

  const titleInputRef = useRef<HTMLInputElement>(null);
  const subtitleInputRef = useRef<HTMLInputElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);
  const badgeInputRef = useRef<HTMLInputElement>(null);

  // 인라인 편집 시작 시 초기화
  const handleStartEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditTitle(item.title);
    setEditSubtitle(item.subtitle || "");
    setEditUrl(item.url);
    setEditIcon(item.icon || "link");
    setEditBadgeText(item.badge?.text || "");
    setEditBadgeVariant(item.badge?.variant || "blue");
    setEditIsCopyAction(!!item.isCopyAction);
    setErrors({});
    setIsEditing(true);
  };

  // 인라인 편집 취소
  const handleCancelEdit = () => {
    setIsEditing(false);
    setErrors({});
  };

  // 인라인 입력 변경 핸들러
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEditTitle(val);
    const err = validateTitle(val);
    setErrors((prev) => ({ ...prev, title: err }));
  };

  const handleSubtitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEditSubtitle(val);
    const err = validateSubtitle(val);
    setErrors((prev) => ({ ...prev, subtitle: err }));
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEditUrl(val);

    let nextIcon = editIcon;
    let nextCopy = editIsCopyAction;

    // URL 스마트 아이콘 감지
    if (
      editIcon === "link" ||
      editIcon === "github" ||
      editIcon === "velog" ||
      editIcon === "linkedin" ||
      editIcon === "email"
    ) {
      if (val.includes("github.com")) {
        nextIcon = "github";
        setEditIcon("github");
      } else if (val.includes("velog.io")) {
        nextIcon = "velog";
        setEditIcon("velog");
      } else if (val.includes("linkedin.com")) {
        nextIcon = "linkedin";
        setEditIcon("linkedin");
      } else if (val.startsWith("mailto:") || (val.includes("@") && !val.includes("/"))) {
        nextIcon = "email";
        nextCopy = true;
        setEditIcon("email");
        setEditIsCopyAction(true);
      }
    }

    const err = validateUrl(val, nextCopy, nextIcon);
    setErrors((prev) => ({ ...prev, url: err }));
  };

  const handleBadgeTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEditBadgeText(val);
    const err = validateBadgeText(val);
    setErrors((prev) => ({ ...prev, badgeText: err }));
  };

  const handleCopyActionToggle = (checked: boolean) => {
    setEditIsCopyAction(checked);
    if (editUrl.trim()) {
      const err = validateUrl(editUrl, checked, editIcon);
      setErrors((prev) => ({ ...prev, url: err }));
    }
  };

  const handleSelectIcon = (icon: IconType) => {
    setEditIcon(icon);
    if (editUrl.trim()) {
      const err = validateUrl(editUrl, editIsCopyAction, icon);
      setErrors((prev) => ({ ...prev, url: err }));
    }
  };

  // 인라인 수정 저장 (추가와 동일한 입력 검증 적용)
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !onUpdate) return;

    const titleError = validateTitle(editTitle);
    const subtitleError = validateSubtitle(editSubtitle);
    const urlError = validateUrl(editUrl, editIsCopyAction, editIcon);
    const badgeError = validateBadgeText(editBadgeText);

    const newErrors = {
      title: titleError,
      subtitle: subtitleError,
      url: urlError,
      badgeText: badgeError,
    };
    setErrors(newErrors);

    if (titleError) {
      titleInputRef.current?.focus();
      return;
    }
    if (subtitleError) {
      subtitleInputRef.current?.focus();
      return;
    }
    if (urlError) {
      urlInputRef.current?.focus();
      return;
    }
    if (badgeError) {
      badgeInputRef.current?.focus();
      return;
    }

    const finalUrl = formatUrl(editUrl, editIsCopyAction);

    setIsSubmitting(true);
    try {
      await onUpdate(item.id, {
        title: editTitle.trim(),
        subtitle: editSubtitle.trim() || undefined,
        url: finalUrl,
        icon: editIcon,
        badge: editBadgeText.trim()
          ? { text: editBadgeText.trim(), variant: editBadgeVariant }
          : undefined,
        isCopyAction: editIsCopyAction || undefined,
      });
      setIsEditing(false);
    } catch {
      onToast("링크 수정에 실패했어요. 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────
  // 1. 인라인 편집 모드 UI
  // ─────────────────────────────────────────────
  if (isEditing) {
    return (
      <Card className="w-full p-4 sm:p-5 border-[#3182F6] bg-white ring-2 ring-[#3182F6]/10 animate-in fade-in duration-200">
        <form onSubmit={handleSaveEdit} className="space-y-4">
          {/* 인라인 헤더 */}
          <div className="flex items-center justify-between pb-2 border-b border-[#F2F4F6]">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#3182F6]" />
              <h3 className="text-[14px] font-bold text-[#191F28]">링크 수정</h3>
            </div>
            <button
              type="button"
              onClick={handleCancelEdit}
              className="p-1 rounded-full text-[#8B95A1] hover:text-[#191F28] hover:bg-[#F2F4F6] transition cursor-pointer"
              aria-label="수정 취소"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 제목 입력 필드 */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[13px] font-medium text-[#4E5968]">
              <label htmlFor={`edit-title-${item.id}`}>
                제목 <span className="text-[#F04452]">*</span>
              </label>
              <span
                className={`text-[11px] tabular-nums ${
                  editTitle.length > MAX_TITLE_LENGTH ? "text-[#F04452] font-bold" : "text-[#8B95A1]"
                }`}
              >
                {editTitle.length}/{MAX_TITLE_LENGTH}자
              </span>
            </div>
            <Input
              id={`edit-title-${item.id}`}
              ref={titleInputRef}
              value={editTitle}
              onChange={handleTitleChange}
              placeholder="예: GitHub 프로필, 포트폴리오 사이트"
              error={!!errors.title}
              className="h-9.5 text-[14px]"
            />
            {errors.title && (
              <p className="text-[12px] font-medium text-[#F04452] flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.title}</span>
              </p>
            )}
          </div>

          {/* URL / 값 입력 필드 */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[13px] font-medium text-[#4E5968]">
              <label htmlFor={`edit-url-${item.id}`}>
                {editIsCopyAction ? "복사할 값" : "웹 주소 (URL)"}{" "}
                <span className="text-[#F04452]">*</span>
              </label>
            </div>
            <Input
              id={`edit-url-${item.id}`}
              ref={urlInputRef}
              value={editUrl}
              onChange={handleUrlChange}
              placeholder={
                editIsCopyAction ? "예: contact@example.com" : "예: https://github.com/myid"
              }
              error={!!errors.url}
              className="h-9.5 text-[14px]"
            />
            {errors.url && (
              <p className="text-[12px] font-medium text-[#F04452] flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.url}</span>
              </p>
            )}
          </div>

          {/* 보조 설명 입력 필드 */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[13px] font-medium text-[#4E5968]">
              <label htmlFor={`edit-subtitle-${item.id}`}>보조 설명 (선택)</label>
              <span
                className={`text-[11px] tabular-nums ${
                  editSubtitle.length > MAX_SUBTITLE_LENGTH
                    ? "text-[#F04452] font-bold"
                    : "text-[#8B95A1]"
                }`}
              >
                {editSubtitle.length}/{MAX_SUBTITLE_LENGTH}자
              </span>
            </div>
            <Input
              id={`edit-subtitle-${item.id}`}
              ref={subtitleInputRef}
              value={editSubtitle}
              onChange={handleSubtitleChange}
              placeholder="예: 최신 프로젝트 소스코드 및 커밋 기록"
              error={!!errors.subtitle}
              className="h-9.5 text-[14px]"
            />
            {errors.subtitle && (
              <p className="text-[12px] font-medium text-[#F04452] flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.subtitle}</span>
              </p>
            )}
          </div>

          {/* 아이콘 선택 */}
          <div className="space-y-1.5">
            <span className="text-[13px] font-medium text-[#4E5968]">아이콘</span>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              {ICON_OPTIONS.map((opt) => {
                const isSelected = editIcon === opt.type;
                return (
                  <button
                    key={opt.type}
                    type="button"
                    onClick={() => handleSelectIcon(opt.type)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-[10px] border transition cursor-pointer text-center ${
                      isSelected
                        ? "border-[#3182F6] bg-[#E8F3FF] ring-1 ring-[#3182F6]"
                        : "border-[#E5E8EB] bg-[#F9FAFB] hover:bg-[#F2F4F6]"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-[8px] flex items-center justify-center shrink-0 shadow-2xs ${opt.bg}`}
                    >
                      {renderIcon(opt.type)}
                    </div>
                    <span
                      className={`text-[11px] font-medium truncate w-full ${
                        isSelected ? "text-[#3182F6] font-bold" : "text-[#4E5968]"
                      }`}
                    >
                      {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 뱃지 설정 */}
          <div className="space-y-2 pt-1 border-t border-[#F2F4F6]">
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[13px] font-medium text-[#4E5968]">
                <label htmlFor={`edit-badge-${item.id}`}>뱃지 문구 (선택)</label>
                <span
                  className={`text-[11px] tabular-nums ${
                    editBadgeText.length > MAX_BADGE_LENGTH
                      ? "text-[#F04452] font-bold"
                      : "text-[#8B95A1]"
                  }`}
                >
                  {editBadgeText.length}/{MAX_BADGE_LENGTH}자
                </span>
              </div>
              <Input
                id={`edit-badge-${item.id}`}
                ref={badgeInputRef}
                value={editBadgeText}
                onChange={handleBadgeTextChange}
                placeholder="예: NEW, 추천, 인기"
                error={!!errors.badgeText}
                className="h-9.5 text-[14px]"
              />
              {errors.badgeText && (
                <p className="text-[12px] font-medium text-[#F04452] flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.badgeText}</span>
                </p>
              )}
            </div>

            {/* 뱃지 색상 선택 */}
            {editBadgeText.trim() && (
              <div className="space-y-1">
                <span className="text-[12px] font-medium text-[#4E5968]">뱃지 색상</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {BADGE_VARIANTS.map((b) => {
                    const isSelected = editBadgeVariant === b.variant;
                    return (
                      <button
                        key={b.variant}
                        type="button"
                        onClick={() => setEditBadgeVariant(b.variant)}
                        className={`px-2 py-1 rounded-[8px] text-[12px] font-medium border transition cursor-pointer flex items-center gap-1 ${
                          isSelected
                            ? "border-[#3182F6] bg-[#E8F3FF] text-[#3182F6] font-bold"
                            : "border-[#E5E8EB] bg-white text-[#4E5968] hover:bg-[#F2F4F6]"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        <span>{b.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 복사 동작 토글 체크박스 */}
          <div className="pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={editIsCopyAction}
                onChange={(e) => handleCopyActionToggle(e.target.checked)}
                className="w-4 h-4 rounded text-[#3182F6] focus:ring-[#3182F6] border-[#D1D6DB]"
              />
              <span className="text-[13px] text-[#4E5968] font-medium">
                클릭 시 새 창 열기 대신 클립보드에 복사
              </span>
            </label>
          </div>

          {/* 인라인 저장/취소 버튼 */}
          <div className="flex items-center gap-2 pt-2 border-t border-[#F2F4F6]">
            <Button
              type="button"
              variant="secondary"
              size="s"
              onClick={handleCancelEdit}
              disabled={isSubmitting}
              className="flex-1 font-semibold"
            >
              취소
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="s"
              disabled={isSubmitting}
              className="flex-1 font-semibold"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                  <span>저장 중...</span>
                </>
              ) : (
                "저장하기"
              )}
            </Button>
          </div>
        </form>
      </Card>
    );
  }

  // ─────────────────────────────────────────────
  // 2. 일반 카드 뷰 모드 UI (수정/삭제 버튼 항상 표시)
  // ─────────────────────────────────────────────
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
            item.icon,
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

      {/* 우측: 수정/삭제 버튼 (항상 표시!) + 액션 표시 */}
      <div className="shrink-0 flex items-center gap-1">
        {/* 수정 버튼 (항상 표시) */}
        {onUpdate && (
          <button
            type="button"
            onClick={handleStartEdit}
            className="p-1.5 rounded-[8px] text-[#8B95A1] hover:text-[#3182F6] hover:bg-[#F2F4F6] active:bg-[#E5E8EB] transition cursor-pointer"
            title="수정"
            aria-label={`${item.title} 수정`}
          >
            <Pencil className="w-4 h-4 stroke-[2]" />
          </button>
        )}

        {/* 삭제 버튼 (항상 표시) */}
        {onDeleteClick && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDeleteClick(item);
            }}
            className="p-1.5 rounded-[8px] text-[#8B95A1] hover:text-[#F04452] hover:bg-[#FEECE8] active:bg-[#fcd9d3] transition cursor-pointer"
            title="삭제"
            aria-label={`${item.title} 삭제`}
          >
            <Trash2 className="w-4 h-4 stroke-[2]" />
          </button>
        )}

        {/* 복사 뱃지 또는 바로가기 화살표 */}
        <div className="pl-0.5">
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
