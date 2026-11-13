"use client";

import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  LinkCategory,
  LinkItem,
  IconType,
  BadgeVariant,
} from "@/types/profile";
import {
  Mail,
  FolderGit2,
  Link2,
  Sparkles,
  AlertCircle,
  Loader2,
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

interface AddLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: LinkCategory[];
  defaultCategoryId?: string;
  onAddLink: (
    categoryId: string,
    item: Omit<LinkItem, "id">,
  ) => Promise<void> | void;
  isLoading?: boolean;
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

interface AddLinkFormProps {
  categories: LinkCategory[];
  defaultCategoryId?: string;
  onClose: () => void;
  onAddLink: (
    categoryId: string,
    item: Omit<LinkItem, "id">,
  ) => Promise<void> | void;
  isLoading?: boolean;
}

function AddLinkForm({
  categories,
  defaultCategoryId,
  onClose,
  onAddLink,
  isLoading = false,
}: AddLinkFormProps) {
  const initialCategory =
    defaultCategoryId && categories.some((c) => c.id === defaultCategoryId)
      ? defaultCategoryId
      : categories[0]?.id || "";

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(initialCategory);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [url, setUrl] = useState("");
  const [selectedIcon, setSelectedIcon] = useState<IconType>("link");
  const [badgeText, setBadgeText] = useState("");
  const [badgeVariant, setBadgeVariant] = useState<BadgeVariant>("blue");
  const [isCopyAction, setIsCopyAction] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 에러 상태
  const [errors, setErrors] = useState<{
    category?: string;
    title?: string;
    subtitle?: string;
    url?: string;
    badgeText?: string;
  }>({});

  // 포커스 이동을 위한 Refs
  const titleInputRef = useRef<HTMLInputElement>(null);
  const subtitleInputRef = useRef<HTMLInputElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);
  const badgeInputRef = useRef<HTMLInputElement>(null);

  // URL 입력 처리 (아이콘 스마트 감지 포함)
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUrl(val);

    let nextIcon = selectedIcon;
    let nextCopyAction = isCopyAction;

    // 기본 아이콘 상태일 때 URL 기반 자동 감지
    if (
      selectedIcon === "link" ||
      selectedIcon === "github" ||
      selectedIcon === "velog" ||
      selectedIcon === "linkedin" ||
      selectedIcon === "email"
    ) {
      if (val.includes("github.com")) {
        nextIcon = "github";
        setSelectedIcon("github");
      } else if (val.includes("velog.io")) {
        nextIcon = "velog";
        setSelectedIcon("velog");
      } else if (val.includes("linkedin.com")) {
        nextIcon = "linkedin";
        setSelectedIcon("linkedin");
      } else if (val.startsWith("mailto:") || (val.includes("@") && !val.includes("/"))) {
        nextIcon = "email";
        nextCopyAction = true;
        setSelectedIcon("email");
        setIsCopyAction(true);
      }
    }

    // 실시간 에러 검증
    const err = validateUrl(val, nextCopyAction, nextIcon);
    setErrors((prev) => ({ ...prev, url: err }));
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    const err = validateTitle(val);
    setErrors((prev) => ({ ...prev, title: err }));
  };

  const handleSubtitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSubtitle(val);
    const err = validateSubtitle(val);
    setErrors((prev) => ({ ...prev, subtitle: err }));
  };

  const handleBadgeTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setBadgeText(val);
    const err = validateBadgeText(val);
    setErrors((prev) => ({ ...prev, badgeText: err }));
  };

  // 복사 모드 토글 시 URL 재검증
  const handleCopyActionToggle = (checked: boolean) => {
    setIsCopyAction(checked);
    if (url.trim()) {
      const err = validateUrl(url, checked, selectedIcon);
      setErrors((prev) => ({ ...prev, url: err }));
    }
  };

  // 아이콘 선택 시 재검증
  const handleSelectIcon = (icon: IconType) => {
    setSelectedIcon(icon);
    if (url.trim()) {
      const err = validateUrl(url, isCopyAction, icon);
      setErrors((prev) => ({ ...prev, url: err }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isLoading) return;

    const titleError = validateTitle(title);
    const subtitleError = validateSubtitle(subtitle);
    const urlError = validateUrl(url, isCopyAction, selectedIcon);
    const badgeError = validateBadgeText(badgeText);
    const categoryError = !selectedCategoryId ? "카테고리를 선택해 주세요" : undefined;

    const newErrors = {
      category: categoryError,
      title: titleError,
      subtitle: subtitleError,
      url: urlError,
      badgeText: badgeError,
    };

    setErrors(newErrors);

    // 에러 발생 시 첫 번째 에러 입력창으로 포커스 이동
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
    if (categoryError) {
      return;
    }

    // URL 유효성 보정 (http/https 또는 mailto가 없는 웹 링크면 https:// 자동 부착)
    const finalUrl = formatUrl(url, isCopyAction);

    setIsSubmitting(true);
    try {
      await Promise.resolve(
        onAddLink(selectedCategoryId, {
          title: title.trim(),
          subtitle: subtitle.trim() || undefined,
          url: finalUrl,
          icon: selectedIcon,
          badge: badgeText.trim()
            ? {
                text: badgeText.trim(),
                variant: badgeVariant,
              }
            : undefined,
          isCopyAction,
          clickCount: 0,
        })
      );
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  // 아이콘 렌더러
  const renderIconPreview = (type: IconType) => {
    switch (type) {
      case "github":
        return (
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            />
          </svg>
        );
      case "velog":
        return <span className="text-white font-bold text-xs select-none">V</span>;
      case "linkedin":
        return (
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
          </svg>
        );
      case "email":
        return <Mail className="w-4 h-4 text-white" />;
      case "project":
        return <FolderGit2 className="w-4 h-4 text-white" />;
      case "link":
      default:
        return <Link2 className="w-4 h-4 text-white" />;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4" noValidate>
      {/* 1. 카테고리 선택 */}
      <div className="space-y-1.5">
        <label className="text-[13px] font-semibold text-[#4E5968] flex items-center justify-between">
          <span>카테고리 *</span>
        </label>
        <div className="relative">
          <select
            value={selectedCategoryId}
            onChange={(e) => {
              setSelectedCategoryId(e.target.value);
              if (errors.category) {
                setErrors((prev) => ({ ...prev, category: undefined }));
              }
            }}
            className={`w-full h-11 px-3.5 pr-8 rounded-[12px] bg-[#F9FAFB] border text-[14px] text-[#191F28] appearance-none focus:bg-white focus:border-[#3182F6] focus:ring-3 focus:ring-[#3182F6]/15 outline-none cursor-pointer transition-all ${
              errors.category ? "border-[#F04452] bg-[#FFF0F1]" : "border-[#E5E8EB]"
            }`}
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.title}
              </option>
            ))}
          </select>
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#8B95A1]">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {errors.category && (
          <p className="text-[12px] text-[#F04452] flex items-center gap-1 mt-1 font-medium">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errors.category}</span>
          </p>
        )}
      </div>

      {/* 2. 링크 제목 */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[13px] font-semibold text-[#4E5968]">
            링크 제목 *
          </label>
          <span
            className={`text-[11px] tabular-nums font-medium ${
              title.length > MAX_TITLE_LENGTH ? "text-[#F04452]" : "text-[#8B95A1]"
            }`}
          >
            {title.length}/{MAX_TITLE_LENGTH}자
          </span>
        </div>
        <Input
          ref={titleInputRef}
          value={title}
          onChange={handleTitleChange}
          placeholder="예: 모던 포트폴리오 웹"
          error={!!errors.title}
        />
        {errors.title && (
          <p className="text-[12px] text-[#F04452] flex items-center gap-1 mt-1 font-medium">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errors.title}</span>
          </p>
        )}
      </div>

      {/* 3. 보조 설명 (선택) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[13px] font-semibold text-[#4E5968] flex items-center gap-1.5">
            <span>보조 설명</span>
            <span className="text-[11px] text-[#8B95A1] font-normal">선택</span>
          </label>
          <span
            className={`text-[11px] tabular-nums font-medium ${
              subtitle.length > MAX_SUBTITLE_LENGTH ? "text-[#F04452]" : "text-[#8B95A1]"
            }`}
          >
            {subtitle.length}/{MAX_SUBTITLE_LENGTH}자
          </span>
        </div>
        <Input
          ref={subtitleInputRef}
          value={subtitle}
          onChange={handleSubtitleChange}
          placeholder="예: Next.js 16과 Tailwind로 제작"
          error={!!errors.subtitle}
        />
        {errors.subtitle && (
          <p className="text-[12px] text-[#F04452] flex items-center gap-1 mt-1 font-medium">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errors.subtitle}</span>
          </p>
        )}
      </div>

      {/* 4. URL / 값 */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[13px] font-semibold text-[#4E5968]">
            {isCopyAction ? "복사할 값 (이메일 등) *" : "URL 주소 *"}
          </label>
          {!isCopyAction && (
            <span className="text-[11px] text-[#8B95A1]">
              https:// 자동 보정
            </span>
          )}
        </div>
        <Input
          ref={urlInputRef}
          value={url}
          onChange={handleUrlChange}
          placeholder={isCopyAction ? "user@example.com" : "https://github.com/..."}
          error={!!errors.url}
        />
        {errors.url && (
          <p className="text-[12px] text-[#F04452] flex items-center gap-1 mt-1 font-medium">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errors.url}</span>
          </p>
        )}
      </div>

      {/* 5. 아이콘 선택 */}
      <div className="space-y-1.5">
        <label className="text-[13px] font-semibold text-[#4E5968]">
          아이콘 선택
        </label>
        <div className="grid grid-cols-3 gap-2">
          {ICON_OPTIONS.map((item) => {
            const isSelected = selectedIcon === item.type;
            return (
              <button
                key={item.type}
                type="button"
                onClick={() => handleSelectIcon(item.type)}
                className={`flex items-center gap-2 px-2.5 py-2 rounded-[12px] border transition-all text-left cursor-pointer ${
                  isSelected
                    ? "border-[#3182F6] bg-[#E8F3FF] text-[#3182F6] shadow-xs"
                    : "border-[#E5E8EB] bg-[#F9FAFB] hover:bg-[#F2F4F6] text-[#4E5968]"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-[8px] flex items-center justify-center shrink-0 ${item.bg}`}
                >
                  {renderIconPreview(item.type)}
                </div>
                <span className="text-[12px] font-medium truncate">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. 뱃지 설정 (선택) */}
      <div className="p-3 bg-[#F9FAFB] rounded-[16px] border border-[#E5E8EB] space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-semibold text-[#4E5968]">
            강조 뱃지 (선택)
          </span>
          <div className="flex items-center gap-2">
            <span
              className={`text-[11px] tabular-nums font-medium ${
                badgeText.length > MAX_BADGE_LENGTH ? "text-[#F04452]" : "text-[#8B95A1]"
              }`}
            >
              {badgeText.length}/{MAX_BADGE_LENGTH}자
            </span>
            {badgeText.trim() && (
              <Badge
                variant={
                  BADGE_VARIANTS.find((b) => b.variant === badgeVariant)
                    ?.badgeVariant || "neutral"
                }
                shape="rounded"
              >
                {badgeText.trim()}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Input
            ref={badgeInputRef}
            value={badgeText}
            onChange={handleBadgeTextChange}
            placeholder="뱃지 문구 (예: NEW, HOT)"
            className="h-9 text-[13px] bg-white"
            error={!!errors.badgeText}
          />
        </div>
        {errors.badgeText && (
          <p className="text-[12px] text-[#F04452] flex items-center gap-1 font-medium">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errors.badgeText}</span>
          </p>
        )}

        {badgeText.trim() && (
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            <span className="text-[11px] text-[#8B95A1] mr-1">색상:</span>
            {BADGE_VARIANTS.map((b) => (
              <button
                key={b.variant}
                type="button"
                onClick={() => setBadgeVariant(b.variant)}
                className={`px-2 py-0.5 rounded-[8px] text-[11px] font-semibold border transition cursor-pointer ${
                  badgeVariant === b.variant
                    ? "border-[#3182F6] ring-2 ring-[#3182F6]/20 bg-white"
                    : "border-transparent bg-white/70 hover:bg-white text-[#6B7684]"
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 7. 복사 전용 옵션 */}
      <label className="flex items-start gap-2.5 p-3 rounded-[14px] bg-[#F9FAFB] border border-[#E5E8EB] cursor-pointer hover:bg-[#F2F4F6] transition select-none">
        <input
          type="checkbox"
          checked={isCopyAction}
          onChange={(e) => handleCopyActionToggle(e.target.checked)}
          className="mt-0.5 w-4 h-4 rounded text-[#3182F6] focus:ring-[#3182F6] cursor-pointer"
        />
        <div className="flex-1">
          <div className="text-[13px] font-semibold text-[#191F28]">
            클릭 시 클립보드 복사 전용
          </div>
          <p className="text-[11px] text-[#8B95A1] mt-0.5">
            체크하면 새 창으로 이동하지 않고 이메일 주소나 텍스트를 바로 복사해요
          </p>
        </div>
      </label>

      {/* 다이얼로그 액션 버튼 */}
      <DialogFooter className="mt-5 pt-1 flex flex-row gap-2">
        <Button
          type="button"
          variant="secondary"
          size="l"
          disabled={isSubmitting || isLoading}
          onClick={onClose}
          className="flex-1"
        >
          취소
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="l"
          disabled={isSubmitting || isLoading}
          className="flex-1 gap-1.5"
        >
          {isSubmitting || isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>저장 중...</span>
            </>
          ) : (
            "추가하기"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function AddLinkModal({
  isOpen,
  onClose,
  categories,
  defaultCategoryId,
  onAddLink,
  isLoading = false,
}: AddLinkModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isLoading && onClose()}>
      <DialogContent
        showCloseButton={!isLoading}
        className="max-w-[420px] w-full text-left max-h-[90vh] overflow-y-auto p-5 sm:p-6"
      >
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-[20px] font-bold text-[#191F28] flex items-center gap-1.5">
            <Sparkles className="w-5 h-5 text-[#3182F6]" />
            새 링크 추가하기
          </DialogTitle>
          <DialogDescription className="text-[13px] text-[#6B7684]">
            프로필에 보여줄 새로운 링크 정보를 입력해 주세요
          </DialogDescription>
        </DialogHeader>

        {isOpen && (
          <AddLinkForm
            key={defaultCategoryId || "new-link"}
            categories={categories}
            defaultCategoryId={defaultCategoryId}
            onClose={onClose}
            onAddLink={onAddLink}
            isLoading={isLoading}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
