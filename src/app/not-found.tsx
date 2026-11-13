"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { UserX, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function NotFound() {
  const pathname = usePathname();
  const router = useRouter();

  const rawSegment = pathname ? pathname.replace(/^\//, "").split("/")[0] : "";
  let requestedUsername = rawSegment;
  try {
    requestedUsername = decodeURIComponent(rawSegment);
  } catch {
    requestedUsername = rawSegment;
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#191F28] flex flex-col justify-between selection:bg-[#E8F3FF]">
      {/* 상단 심플 헤더 */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E5E8EB]">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#3182F6]" />
            <span className="text-[17px] font-bold tracking-tight text-[#191F28]">
              MyLink
            </span>
          </Link>
          <Link
            href="/"
            className="text-xs font-semibold text-[#3182F6] hover:underline"
          >
            홈으로 이동
          </Link>
        </div>
      </header>

      {/* 중앙 404 안내 카드 */}
      <main className="max-w-md w-full mx-auto px-4 py-12 flex-1 flex items-center justify-center">
        <div className="w-full bg-white rounded-[24px] border border-[#E5E8EB] p-8 text-center shadow-[0_4px_20px_rgba(25,31,40,0.04)] space-y-5 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-[#FFF0F1] text-[#F04452] mx-auto flex items-center justify-center">
            <UserX className="w-8 h-8 stroke-[2]" />
          </div>

          <div className="space-y-2">
            <Badge variant="danger" shape="pill" className="mx-auto">
              404 Not Found
            </Badge>
            <h1 className="text-[22px] font-bold tracking-tight text-[#191F28] pt-1">
              찾으시는 사용자의 페이지가 없어요
            </h1>
            {requestedUsername ? (
              <p className="text-[14px] text-[#4E5968] leading-relaxed">
                <span className="font-semibold text-[#191F28]">
                  &ldquo;{requestedUsername}&rdquo;
                </span>{" "}
                이름으로 등록된 사용자를 찾을 수 없어요.
                <br />
                표시 이름(displayName)이 정확한지 다시 확인해 주세요.
              </p>
            ) : (
              <p className="text-[14px] text-[#4E5968] leading-relaxed">
                요청하신 페이지가 존재하지 않거나 주소가 변경되었어요.
              </p>
            )}
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
            <Button
              type="button"
              variant="secondary"
              size="l"
              onClick={() => router.back()}
              className="flex-1 gap-1.5 font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>이전 페이지</span>
            </Button>
            <Link href="/" className="flex-1">
              <Button
                type="button"
                variant="primary"
                size="l"
                className="w-full gap-1.5 font-semibold"
              >
                <Home className="w-4 h-4" />
                <span>홈으로 돌아가기</span>
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* 하단 푸터 */}
      <footer className="max-w-md mx-auto px-5 py-8 text-center text-[12px] text-[#8B95A1]">
        <p>MyLink · 나만의 모든 링크를 한곳에</p>
      </footer>
    </div>
  );
}
