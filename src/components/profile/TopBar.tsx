"use client";

import React from "react";
import { RotateCcw, QrCode, Share2, Plus, Loader2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { User } from "@/lib/auth";
import Image from "next/image";

interface TopBarProps {
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  isAuthLoading?: boolean;
  onReset: () => void;
  onOpenQr: () => void;
  onCopyPageUrl: () => void;
  onOpenAddLink?: () => void;
  isSyncing?: boolean;
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
}: TopBarProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E5E8EB] transition-colors">
      <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
        {/* 서비스 로고 및 실시간 동기화 상태 */}
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#3182F6]" />
          <span className="text-[17px] font-bold tracking-tight text-[#191F28]">
            MyLink
          </span>
          {isSyncing && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#E8F3FF] text-[#3182F6] animate-pulse">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>동기화 중</span>
            </span>
          )}
        </div>

        {/* 우측 액션 그룹 */}
        <div className="flex items-center space-x-1.5">
          {/* 로그인 상태에 따른 버튼 */}
          {isAuthLoading ? (
            <div className="h-8 w-20 flex items-center justify-center">
              <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
            </div>
          ) : user ? (
            /* 로그인 완료 상태: 사용자 아바타 & 로그아웃 */
            <div className="flex items-center gap-1.5">
              {/* 새 링크 추가 버튼 */}
              {onOpenAddLink && (
                <Button
                  variant="subtle"
                  size="s"
                  onClick={onOpenAddLink}
                  title="새 링크 추가"
                  aria-label="새 링크 추가"
                  className="gap-1 px-2.5 text-[#3182F6] font-semibold text-xs h-8"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>추가</span>
                </Button>
              )}

              {/* 기본 템플릿 초기화 버튼 */}
              <Button
                variant="icon"
                size="icon-m"
                onClick={onReset}
                title="기본 템플릿으로 초기화"
                aria-label="데이터 초기화"
                className="w-8 h-8"
              >
                <RotateCcw className={cn("w-3.5 h-3.5 text-slate-600", isSyncing && "animate-spin text-[#3182F6]")} />
              </Button>

              {/* QR 코드 보기 버튼 */}
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

              {/* 링크 복사 버튼 */}
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

              {/* 프로필 미니 아바타 및 로그아웃 버튼 */}
              <div className="flex items-center pl-1 border-l border-slate-200 gap-1.5">
                <div
                  className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 overflow-hidden relative flex items-center justify-center shrink-0"
                  title={user.displayName || user.email || "사용자"}
                >
                  {user.photoURL ? (
                    <Image
                      src={user.photoURL}
                      alt={user.displayName || "프로필"}
                      width={28}
                      height={28}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <span className="text-[11px] font-bold text-[#3182F6]">
                      {(user.displayName || user.email || "U").slice(0, 1)}
                    </span>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="s"
                  onClick={onLogout}
                  title="로그아웃"
                  aria-label="로그아웃"
                  className="h-8 px-2 text-xs text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5 mr-1" />
                  <span className="hidden sm:inline">로그아웃</span>
                </Button>
              </div>
            </div>
          ) : (
            /* 비로그인 상태: 구글 로그인 버튼 */
            <div className="flex items-center gap-1.5">
              {/* QR 및 공유 버튼은 비로그인 상태에서도 미리보기 가능 */}
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

              {/* 구글 소셜 로그인 버튼 */}
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
