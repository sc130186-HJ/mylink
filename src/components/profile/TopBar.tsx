"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  RotateCcw,
  QrCode,
  Share2,
  Plus,
  Loader2,
  LogOut,
  User as UserIcon,
  ExternalLink,
  ChevronDown,
  Home,
  Pencil,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { User } from "@/lib/auth";
import { useUserProfileQuery } from "@/hooks/useProfileQueries";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface TopBarProps {
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  isAuthLoading?: boolean;
  onReset?: () => void;
  onOpenQr: () => void;
  onCopyPageUrl: () => void;
  onOpenAddLink?: () => void;
  isSyncing?: boolean;
  /** 현재 로그인한 사용자의 표시 이름 (미전달 시 useUserProfileQuery 또는 user.displayName 사용) */
  profileName?: string;
  /** 프로필 수정 모달 열기 핸들러 */
  onEditProfile?: () => void;
}

function GoogleIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

export function TopBar({
  user,
  onLogin,
  onLogout,
  isAuthLoading = false,
  onReset,
  onOpenQr,
  onCopyPageUrl,
  onOpenAddLink,
  isSyncing = false,
  profileName,
  onEditProfile,
}: TopBarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // 로그인한 유저의 프로필 정보를 구독하여 최신 displayName(profile.name) 확보
  const { data: myProfile } = useUserProfileQuery(user);

  const resolvedDisplayName = (
    profileName ||
    myProfile?.name ||
    user?.displayName ||
    (user ? "내 링크" : "")
  ).trim();

  const personalPageHref = resolvedDisplayName
    ? `/${encodeURIComponent(resolvedDisplayName)}`
    : "/";

  const isOnPersonalPage =
    !!resolvedDisplayName &&
    (pathname === personalPageHref ||
      decodeURIComponent(pathname || "") === `/${resolvedDisplayName}`);
  const isOnStatsPage = pathname === "/stats";

  // 바깥 영역 클릭 또는 ESC 키 입력 시 프로필 드롭다운 닫기
  useEffect(() => {
    if (!isDropdownOpen) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDropdownOpen]);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E5E8EB] transition-colors">
      <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between gap-2">
        {/* 좌측: 서비스 로고 (절대 줄어들거나 가려지지 않도록 shrink-0 고정) */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Link
            href="/"
            className="flex items-center space-x-1.5 hover:opacity-80 transition-opacity shrink-0"
            title="마이링크 홈으로 이동"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#3182F6] shrink-0" />
            <span className="text-[17px] font-bold tracking-tight text-[#191F28] whitespace-nowrap">
              MyLink
            </span>
          </Link>

          {isSyncing && (
            <Loader2
              className="w-3.5 h-3.5 animate-spin text-[#3182F6] shrink-0"
              aria-label="동기화 중"
            />
          )}
        </div>

        {/* 우측 액션 그룹 */}
        <div className="flex items-center gap-1 shrink-0">
          {isAuthLoading ? (
            <div className="h-8 w-20 flex items-center justify-center">
              <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
            </div>
          ) : user ? (
            /* 로그인 완료 상태: 핵심 액션만 깔끔하게 배치하여 로고 가림 방지 */
            <div className="flex items-center gap-1">
              {/* 1. 내 페이지 바로가기 버튼 */}
              {resolvedDisplayName && (
                <Link
                  href={personalPageHref}
                  title={`${resolvedDisplayName} 님의 내 페이지로 바로가기 (/${resolvedDisplayName})`}
                  aria-label="내 페이지로 바로가기"
                  className={cn(
                    "inline-flex items-center justify-center h-7.5 px-2 rounded-[9px] text-[11px] font-semibold transition-all active:scale-[0.98] shrink-0 whitespace-nowrap",
                    isOnPersonalPage
                      ? "bg-[#3182F6] text-white shadow-2xs"
                      : "bg-[#F2F4F6] text-[#333D4B] hover:bg-[#E8F3FF] hover:text-[#3182F6]"
                  )}
                >
                  <span>내 페이지</span>
                </Link>
              )}

              {/* 2. 통계 페이지 (/stats) 바로가기 버튼 */}
              <Link
                href="/stats"
                title="클릭 통계 페이지 (/stats)"
                aria-label="클릭 통계 페이지"
                className={cn(
                  "inline-flex items-center justify-center gap-1 h-7.5 px-2 rounded-[9px] text-[11px] font-semibold transition-all active:scale-[0.98] shrink-0 whitespace-nowrap",
                  isOnStatsPage
                    ? "bg-[#3182F6] text-white shadow-2xs"
                    : "bg-[#F2F4F6] text-[#333D4B] hover:bg-[#E8F3FF] hover:text-[#3182F6]"
                )}
              >
                <BarChart3 className="w-3 h-3 shrink-0" />
                <span>통계</span>
              </Link>

              {/* 3. 새 링크 추가 버튼 */}
              {onOpenAddLink && (
                <Button
                  variant="subtle"
                  size="s"
                  onClick={onOpenAddLink}
                  title="새 링크 추가"
                  aria-label="새 링크 추가"
                  className="gap-0.5 px-2 text-[#3182F6] font-semibold text-[11px] h-7.5 rounded-[9px] shrink-0 whitespace-nowrap"
                >
                  <Plus className="w-3 h-3 stroke-[2.5]" />
                  <span>추가</span>
                </Button>
              )}

              {/* 4. QR 코드 보기 버튼 */}
              <Button
                variant="icon"
                size="icon-m"
                onClick={onOpenQr}
                title="QR 코드 보기"
                aria-label="QR 코드 보기"
                className="w-7.5 h-7.5 shrink-0"
              >
                <QrCode className="w-3.5 h-3.5 text-slate-600" />
              </Button>

              {/* 5. 링크 복사 버튼 */}
              <Button
                variant="icon"
                size="icon-m"
                onClick={onCopyPageUrl}
                title="페이지 링크 복사"
                aria-label="페이지 링크 복사"
                className="w-7.5 h-7.5 shrink-0"
              >
                <Share2 className="w-3.5 h-3.5 text-slate-600" />
              </Button>

              {/* 프로필 드롭다운 영역 */}
              <div
                ref={dropdownRef}
                className="relative pl-1 border-l border-slate-200 ml-0.5"
              >
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                  aria-expanded={isDropdownOpen}
                  aria-haspopup="menu"
                  aria-label="프로필 메뉴 열기"
                  title="프로필 메뉴"
                  className="flex items-center gap-1 p-1 rounded-full hover:bg-[#F2F4F6] active:scale-95 transition cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 overflow-hidden relative flex items-center justify-center shrink-0">
                    {myProfile?.avatarUrl || user.photoURL ? (
                      <Image
                        src={(myProfile?.avatarUrl || user.photoURL)!}
                        alt={resolvedDisplayName || "프로필"}
                        width={28}
                        height={28}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <span className="text-[11px] font-bold text-[#3182F6]">
                        {(resolvedDisplayName || user.email || "U").slice(0, 1)}
                      </span>
                    )}
                  </div>
                  <ChevronDown
                    className={cn(
                      "w-3.5 h-3.5 text-[#6B7684] transition-transform duration-150",
                      isDropdownOpen && "rotate-180 text-[#191F28]"
                    )}
                  />
                </button>

                {/* 프로필 드롭다운 메뉴 */}
                {isDropdownOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-60 rounded-[18px] bg-white border border-[#E5E8EB] shadow-[0_12px_32px_rgba(25,31,40,0.12),0_2px_6px_rgba(25,31,40,0.06)] py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                  >
                    {/* 상단 유저 정보 요약 */}
                    <div className="px-4 py-2.5 border-b border-[#F2F4F6]">
                      <p className="text-[14px] font-bold text-[#191F28] truncate">
                        {resolvedDisplayName || "사용자"}
                      </p>
                      {user.email && (
                        <p className="text-[11px] text-[#8B95A1] truncate mt-0.5">
                          {user.email}
                        </p>
                      )}
                      {resolvedDisplayName && (
                        <span className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#E8F3FF] text-[#3182F6] max-w-full truncate">
                          /{resolvedDisplayName}
                        </span>
                      )}
                    </div>

                    {/* 메뉴 리스트 */}
                    <div className="py-1 px-1.5 space-y-0.5">
                      {/* 1. 개인별 페이지 이동 (/[displayName]) */}
                      {resolvedDisplayName && (
                        <Link
                          href={personalPageHref}
                          role="menuitem"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center justify-between w-full px-3 py-2.5 rounded-[12px] text-[13px] font-semibold text-[#191F28] hover:bg-[#E8F3FF] hover:text-[#3182F6] transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <UserIcon className="w-4 h-4 text-[#3182F6] shrink-0" />
                            <div className="min-w-0 text-left">
                              <p className="truncate">내 페이지로 바로가기</p>
                              <p className="text-[11px] font-normal text-[#8B95A1] truncate">
                                /{resolvedDisplayName}
                              </p>
                            </div>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-[#8B95A1] shrink-0" />
                        </Link>
                      )}

                      {/* 2. 메인 홈으로 이동 */}
                      <Link
                        href="/"
                        role="menuitem"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-2.5 w-full px-3 py-2 rounded-[12px] text-[13px] font-medium text-[#4E5968] hover:bg-[#F2F4F6] hover:text-[#191F28] transition-colors"
                      >
                        <Home className="w-4 h-4 text-[#6B7684] shrink-0" />
                        <span>메인 홈 (관리)</span>
                      </Link>

                      {/* 3. 통계 대시보드 (/stats) */}
                      <Link
                        href="/stats"
                        role="menuitem"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-2.5 w-full px-3 py-2 rounded-[12px] text-[13px] font-medium text-[#4E5968] hover:bg-[#F2F4F6] hover:text-[#191F28] transition-colors"
                      >
                        <BarChart3 className="w-4 h-4 text-[#6B7684] shrink-0" />
                        <span>클릭 통계 (/stats)</span>
                      </Link>

                      {/* 4. 프로필 수정 (핸들러가 있을 때) */}
                      {onEditProfile && (
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            setIsDropdownOpen(false);
                            onEditProfile();
                          }}
                          className="flex items-center gap-2.5 w-full px-3 py-2 rounded-[12px] text-[13px] font-medium text-[#4E5968] hover:bg-[#F2F4F6] hover:text-[#191F28] transition-colors cursor-pointer text-left"
                        >
                          <Pencil className="w-4 h-4 text-[#6B7684] shrink-0" />
                          <span>프로필 수정</span>
                        </button>
                      )}

                      {/* 5. 링크 목록 새로고침 */}
                      {onReset && (
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            setIsDropdownOpen(false);
                            onReset();
                          }}
                          className="flex items-center gap-2.5 w-full px-3 py-2 rounded-[12px] text-[13px] font-medium text-[#4E5968] hover:bg-[#F2F4F6] hover:text-[#191F28] transition-colors cursor-pointer text-left"
                        >
                          <RotateCcw
                            className={cn(
                              "w-4 h-4 text-[#6B7684] shrink-0",
                              isSyncing && "animate-spin text-[#3182F6]"
                            )}
                          />
                          <span>링크 목록 새로고침</span>
                        </button>
                      )}
                    </div>

                    {/* 하단 로그아웃 */}
                    <div className="pt-1 mt-1 px-1.5 border-t border-[#F2F4F6]">
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          onLogout();
                        }}
                        className="flex items-center gap-2.5 w-full px-3 py-2 rounded-[12px] text-[13px] font-semibold text-[#F04452] hover:bg-[#FFF0F1] transition-colors cursor-pointer text-left"
                      >
                        <LogOut className="w-4 h-4 shrink-0" />
                        <span>로그아웃</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* 비로그인 상태: 공유 버튼 & 구글 로그인 버튼 */
            <div className="flex items-center gap-1.5">
              <Button
                variant="icon"
                size="icon-m"
                onClick={onOpenQr}
                title="QR 코드 보기"
                aria-label="QR 코드 보기"
                className="w-8 h-8"
              >
                <QrCode className="w-3.5 h-3.5 text-slate-600" />
              </Button>

              <Button
                variant="icon"
                size="icon-m"
                onClick={onCopyPageUrl}
                title="페이지 링크 복사"
                aria-label="페이지 링크 복사"
                className="w-8 h-8"
              >
                <Share2 className="w-3.5 h-3.5 text-slate-600" />
              </Button>

              <button
                type="button"
                onClick={onLogin}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 active:scale-95 text-xs font-semibold text-slate-700 shadow-xs transition duration-150 cursor-pointer"
                title="Google 계정으로 로그인"
              >
                <GoogleIcon className="w-4 h-4 shrink-0" />
                <span>Google 로그인</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
