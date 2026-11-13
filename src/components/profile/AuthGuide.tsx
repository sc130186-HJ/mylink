"use client";

import React from "react";
import { Sparkles, ShieldCheck, Share2, ArrowRight } from "lucide-react";

interface AuthGuideProps {
  onLogin: () => void;
  isLoggingIn?: boolean;
}

function GoogleIcon({ className = "w-5 h-5" }: { className?: string }) {
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

export function AuthGuide({ onLogin, isLoggingIn = false }: AuthGuideProps) {
  return (
    <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 text-center space-y-5 my-2">
      {/* 그래픽 뱃지 */}
      <div className="mx-auto w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner">
        <Sparkles className="w-7 h-7 text-[#3182F6]" />
      </div>

      {/* 헤드라인 문구 */}
      <div className="space-y-2">
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-[#3182F6] border border-blue-100">
          Google 계정 연동
        </span>
        <h2 className="text-xl font-bold tracking-tight text-[#191F28]">
          로그인하고 나만의 링크를 관리하세요
        </h2>
        <p className="text-[13px] text-[#4E5968] leading-relaxed max-w-xs mx-auto">
          로그인하시면 <span className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded text-blue-600 font-semibold">users/&#123;uid&#125;/links</span> 경로에
          나만의 링크가 안전하게 개인화되어 실시간 동기화됩니다.
        </p>
      </div>

      {/* 주요 기능 특징 목록 */}
      <div className="grid grid-cols-1 gap-2.5 text-left py-1">
        <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#F9FAFB] border border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-blue-100/70 text-[#3182F6] flex items-center justify-center shrink-0 mt-0.5">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#191F28]">개인별 독립된 클라우드 저장소</h3>
            <p className="text-[11px] text-[#8B95A1] mt-0.5">
              구글 UID 기반으로 안전하게 암호화 및 분리된 데이터베이스 제공
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#F9FAFB] border border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-emerald-100/70 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
            <Share2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#191F28]">원클릭 링크 추가 & 실시간 갱신</h3>
            <p className="text-[11px] text-[#8B95A1] mt-0.5">
              SNS, 블로그, 포트폴리오 링크를 언제든 손쉽게 추가하고 수정하세요
            </p>
          </div>
        </div>
      </div>

      {/* Google 로그인 CTA 버튼 */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onLogin}
          disabled={isLoggingIn}
          className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-2xl bg-[#3182F6] hover:bg-[#2272EB] active:scale-[0.99] text-white font-semibold text-sm shadow-md transition duration-200 cursor-pointer disabled:opacity-60"
        >
          <div className="p-1 rounded-full bg-white flex items-center justify-center">
            <GoogleIcon className="w-4 h-4" />
          </div>
          <span>Google 계정으로 시작하기</span>
          <ArrowRight className="w-4 h-4 ml-1 opacity-80" />
        </button>
        <p className="text-[11px] text-[#8B95A1] mt-2.5">
          별도 회원가입 없이 기존 구글 계정으로 3초 만에 시작할 수 있어요.
        </p>
      </div>
    </section>
  );
}
