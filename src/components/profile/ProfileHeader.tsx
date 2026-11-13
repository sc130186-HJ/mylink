"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ProfileInfo } from "@/types/profile";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Pencil, ExternalLink, Eye } from "lucide-react";

interface ProfileHeaderProps {
  profile: ProfileInfo;
  /** 프로필 소유자(로그인 유저)인지 여부 — true 일 때만 편집 버튼 노출 */
  isOwner?: boolean;
  /** 편집 버튼 클릭 콜백 */
  onEditProfile?: () => void;
  /** 내 페이지로 바로가기 버튼 노출 여부 */
  showMyPageButton?: boolean;
  /** 클릭(조회) 수 (0이어도 아이콘과 숫자만 표시) */
  totalClickCount?: number;
}

export function ProfileHeader({
  profile,
  isOwner = false,
  onEditProfile,
  showMyPageButton = false,
  totalClickCount = 0,
}: ProfileHeaderProps) {
  const [imgError, setImgError] = useState(false);

  // 이니셜 추출 (한글 이름의 마지막 2글자 또는 영문 2글자)
  const initials = profile.name.length > 2 ? profile.name.slice(-2) : profile.name;
  const trimmedName = profile.name.trim();

  return (
    <section className="flex flex-col items-center text-center pt-2 pb-2">
      {/* 아바타 영역 (shadcn/ui Avatar 재사용) */}
      <div className="relative inline-block">
        <Avatar size="xl" online={true}>
          {profile.avatarUrl && !imgError ? (
            <AvatarImage
              src={profile.avatarUrl}
              alt={profile.name}
              onError={() => setImgError(true)}
            />
          ) : (
            <AvatarFallback>{initials}</AvatarFallback>
          )}
        </Avatar>

        {/* 편집 버튼 — 소유자일 때만 아바타 우하단에 오버레이 */}
        {isOwner && onEditProfile && (
          <button
            type="button"
            onClick={onEditProfile}
            aria-label="프로필 수정"
            title="프로필 수정"
            className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-white border-2 border-[#E5E8EB] shadow-md flex items-center justify-center hover:bg-[#E8F3FF] hover:border-[#3182F6] transition-all active:scale-95 cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5 text-[#3182F6]" />
          </button>
        )}
      </div>

      {/* 이름 및 직무 뱃지 + 조회수(아이콘+숫자만 표시, 0이어도 표시) */}
      <div className="mt-4 flex items-center justify-center gap-2 flex-wrap">
        <h1 className="text-xl font-bold tracking-tight text-[#191F28]">
          {profile.name}
        </h1>
        <Badge variant="brand" shape="pill">
          {profile.role}
        </Badge>
        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E8F3FF] text-[#3182F6] text-[12px] font-bold tabular-nums border border-blue-200">
          <Eye className="w-3.5 h-3.5 text-[#3182F6] shrink-0" />
          <span>{(totalClickCount ?? 0).toLocaleString()}</span>
        </div>
      </div>

      {/* 상태 메시지 또는 이메일 태그 */}
      {profile.statusMessage ? (
        <div className="mt-2.5 inline-flex items-center px-3 py-1 rounded-full text-[12px] font-medium bg-[#F2F4F6] text-[#4E5968] max-w-[90%] truncate">
          <span>{profile.statusMessage}</span>
        </div>
      ) : profile.email ? (
        <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>{profile.email}</span>
        </div>
      ) : null}

      {/* 한 줄 소개글 (Bio - 개행 지원) */}
      <p className="mt-3 text-[14px] text-[#4E5968] max-w-xs leading-relaxed whitespace-pre-line">
        {profile.bio}
      </p>

      {/* 내 페이지로 바로가기 버튼 */}
      {showMyPageButton && trimmedName && (
        <div className="mt-3.5">
          <Link
            href={`/${encodeURIComponent(trimmedName)}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#E8F3FF] hover:bg-[#d6e8ff] text-[#3182F6] text-[12px] font-semibold transition-all active:scale-95 shadow-2xs"
          >
            <span>내 페이지로 바로가기</span>
            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
          </Link>
        </div>
      )}
    </section>
  );
}
