"use client";

import React, { useState } from "react";
import { ProfileInfo } from "@/types/profile";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface ProfileHeaderProps {
  profile: ProfileInfo;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const [imgError, setImgError] = useState(false);

  // 이니셜 추출 (한글 이름의 마지막 2글자 또는 영문 2글자)
  const initials = profile.name.length > 2 ? profile.name.slice(-2) : profile.name;

  return (
    <section className="flex flex-col items-center text-center pt-2 pb-2">
      {/* 아바타 영역 (shadcn/ui Avatar 재사용) */}
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

      {/* 이름 및 직무 뱃지 (shadcn/ui Badge 재사용) */}
      <div className="mt-4 flex items-center justify-center gap-2">
        <h1 className="text-xl font-bold tracking-tight text-[#191F28]">
          {profile.name}
        </h1>
        <Badge variant="brand" shape="pill">
          {profile.role}
        </Badge>
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
    </section>
  );
}
