"use client";

import React, { useState, useEffect } from "react";

interface GuestMessage {
  id: string;
  name: string;
  message: string;
  emoji: string;
  time: string;
}

export default function Home() {
  // 인터랙티브 상태
  const [likes, setLikes] = useState(42);
  const [hasLiked, setHasLiked] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>("");

  // 방명록 상태
  const [guestList, setGuestList] = useState<GuestMessage[]>([
    {
      id: "1",
      name: "김동료",
      message: "디자인 진짜 개성 넘치고 멋져요! 네오 브루탈리즘 감성 제대로네요 🔥",
      emoji: "😎",
      time: "방금 전",
    },
    {
      id: "2",
      name: "이교수님",
      message: "아이디어를 빠르게 현실화하는 모습이 인상적입니다. 응원합니다! 👍",
      emoji: "🎓",
      time: "2시간 전",
    },
    {
      id: "3",
      name: "커피러버",
      message: "코드 보러 왔다가 감탄하고 갑니다! 언제 한번 커피챗해요 ☕",
      emoji: "☕",
      time: "어제",
    },
  ]);
  const [guestName, setGuestName] = useState("");
  const [guestMsg, setGuestMsg] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("🚀");

  // 시간 갱신 (KST 기준)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("ko-KR", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // 토스트 메시지 헬퍼
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // 이메일 복사
  const handleCopyEmail = () => {
    const email = "yeheon.shin@example.com";
    navigator.clipboard.writeText(email);
    setCopied(true);
    showToast("📋 이메일이 클립보드에 복사되었습니다!");
    setTimeout(() => setCopied(false), 2000);
  };

  // 응원 카운터
  const handleLike = () => {
    setLikes((prev) => prev + 1);
    setHasLiked(true);
    showToast("💖 응원해 주셔서 감사합니다!");
  };

  // 방명록 작성
  const handleAddGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !guestMsg.trim()) return;

    const newEntry: GuestMessage = {
      id: Date.now().toString(),
      name: guestName.trim(),
      message: guestMsg.trim(),
      emoji: selectedEmoji,
      time: "방금 전",
    };

    setGuestList([newEntry, ...guestList]);
    setGuestName("");
    setGuestMsg("");
    showToast("✨ 방명록 메시지가 등록되었습니다!");
  };

  // 스택 리스트
  const techSkills = [
    { name: "React 19", category: "Frontend", color: "bg-[#61DAFB]" },
    { name: "Next.js 16", category: "Fullstack", color: "bg-[#FFFFFF]" },
    { name: "TypeScript", category: "Language", color: "bg-[#3178C6] text-white" },
    { name: "Tailwind CSS v4", category: "Styling", color: "bg-[#38BDF8]" },
    { name: "Node.js", category: "Backend", color: "bg-[#68A063] text-white" },
    { name: "PostgreSQL", category: "Database", color: "bg-[#336791] text-white" },
    { name: "Git / GitHub", category: "DevOps", color: "bg-[#F05032] text-white" },
    { name: "Figma", category: "Design", color: "bg-[#A259FF] text-white" },
    { name: "Docker", category: "DevOps", color: "bg-[#2496ED] text-white" },
    { name: "Vibe Coding", category: "Method", color: "bg-[#FFE500]" },
  ];

  // 주요 링크 목록
  const mainLinks = [
    {
      title: "GitHub 저장소",
      desc: "오픈소스 기여 및 진행 중인 사이드 프로젝트 코드",
      url: "https://github.com",
      badge: "CODE",
      bg: "bg-[#FFDE59]",
      hoverBg: "hover:bg-[#FFD214]",
      icon: (
        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
          <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
        </svg>
      ),
    },
    {
      title: "기술 블로그 (Blog)",
      desc: "배운 기술, 아키텍처 고민, 트러블슈팅 경험 기록",
      url: "https://velog.io",
      badge: "READ",
      bg: "bg-[#70D6FF]",
      hoverBg: "hover:bg-[#4AC4F7]",
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      title: "포트폴리오 데모 센터",
      desc: "직접 기획하고 만든 웹 애플리케이션 및 서비스 라이브 데모",
      url: "#projects",
      badge: "LIVE",
      bg: "bg-[#FF70A6]",
      hoverBg: "hover:bg-[#F25591]",
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: "1:1 커피챗 & 협업 문의",
      desc: "프로젝트 협업, 기술 대화, 커피챗 언제든 환영합니다!",
      url: "mailto:yeheon.shin@example.com",
      badge: "CONTACT",
      bg: "bg-[#80FF72]",
      hoverBg: "hover:bg-[#68E85A]",
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
    },
  ];

  // 주요 프로젝트 목록
  const projects = [
    {
      id: "01",
      title: "MyLink Neo",
      category: "Personal Brand",
      desc: "네오 브루탈리즘 감성을 극대화한 반응형 올인원 프로필 & 링크 큐레이션 허브",
      tech: ["Next.js 16", "React 19", "Tailwind v4"],
      badge: "NOW ACTIVE",
      bg: "bg-[#FFFDF0]",
      accent: "bg-[#FFE500]",
    },
    {
      id: "02",
      title: "Vibe-Coding Studio",
      category: "Productivity / AI",
      desc: "아이디어를 직관적으로 코드로 변환하는 AI 페어 프로그래밍 워크스페이스 대시보드",
      tech: ["TypeScript", "Web API", "UI Engine"],
      badge: "IN PROGRESS",
      bg: "bg-[#FFFDF0]",
      accent: "bg-[#70D6FF]",
    },
    {
      id: "03",
      title: "청운 커뮤니티 캠퍼스 맵",
      category: "Campus Life",
      desc: "청운대학교 재학생들을 위한 실시간 정보 공유 및 인터랙티브 캠퍼스 맵",
      tech: ["React", "GeoAPI", "Tailwind"],
      badge: "SIDE PROJECT",
      bg: "bg-[#FFFDF0]",
      accent: "bg-[#FF70A6]",
    },
  ];

  return (
    <div className="min-h-screen neo-grid-bg text-black font-sans selection:bg-[#FFE500] selection:text-black pb-16">
      {/* 1. 상단 티커 / 마키 (Neo-Brutalism Marquee) */}
      <div className="w-full bg-[#FFE500] border-b-[3px] border-black overflow-hidden py-2 font-black tracking-wider text-sm select-none shadow-sm">
        <div className="animate-marquee whitespace-nowrap flex items-center space-x-6">
          <span className="inline-flex items-center">
            ★ SHIN YEHEON ★ FULLSTACK DEVELOPER ★ VIBE-CODING ★ 2026 EDITION ★ ALWAYS BUILDING COOL STUFF ★ REACT & NEXT.JS ★ CHUNGWOON UNIV. ★
          </span>
          <span className="inline-flex items-center">
            ★ SHIN YEHEON ★ FULLSTACK DEVELOPER ★ VIBE-CODING ★ 2026 EDITION ★ ALWAYS BUILDING COOL STUFF ★ REACT & NEXT.JS ★ CHUNGWOON UNIV. ★
          </span>
        </div>
      </div>

      {/* 2. 네비게이션 헤더 */}
      <header className="max-w-6xl mx-auto px-4 pt-6 pb-4">
        <div className="neo-box bg-white p-3 md:p-4 rounded-xl flex flex-wrap items-center justify-between gap-3">
          {/* 로고 */}
          <div className="flex items-center space-x-3">
            <div className="neo-box-sm bg-[#FF70A6] px-3 py-1 font-black text-lg md:text-xl tracking-tighter uppercase transform -rotate-1 hover:rotate-0 transition-transform">
              YEHEON.DEV
            </div>
            <span className="hidden sm:inline-block font-mono text-xs font-bold bg-neutral-100 border-2 border-black px-2 py-0.5 rounded">
              v2.6-NEO
            </span>
          </div>

          {/* 중앙/우측 상태 및 시간 */}
          <div className="flex items-center space-x-2 md:space-x-4 text-xs md:text-sm font-bold">
            {/* 서울 시계 */}
            <div className="hidden md:flex items-center space-x-1.5 bg-[#FFF9A6] border-2 border-black px-3 py-1 rounded shadow-[2px_2px_0px_#000]">
              <span>🕒</span>
              <span className="font-mono">SEOUL {currentTime || "17:00:00"}</span>
            </div>

            {/* 온라인 상태 인디케이터 */}
            <div className="flex items-center space-x-1.5 bg-[#80FF72] border-2 border-black px-3 py-1 rounded shadow-[2px_2px_0px_#000]">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-700"></span>
              </span>
              <span className="uppercase tracking-tight text-[11px] md:text-xs">OPEN FOR WORK</span>
            </div>

            {/* 커피챗 헤더 버튼 */}
            <button
              onClick={handleCopyEmail}
              className="neo-btn bg-[#FF9770] px-3 py-1 font-black rounded text-xs md:text-sm flex items-center space-x-1"
            >
              <span>✉️</span>
              <span className="hidden xs:inline">CONTACT</span>
            </button>
          </div>
        </div>
      </header>

      {/* 토스트 알림 (플로팅) */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className="neo-box bg-[#FFE500] font-black text-black px-5 py-3 rounded-lg flex items-center space-x-2 text-sm md:text-base">
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* 3. 메인 콘텐츠 컨테이너 */}
      <main className="max-w-6xl mx-auto px-4 mt-4 space-y-6 md:space-y-8">
        {/* 그리드 상단: HERO 프로필 카드 & STATS 카드 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* ===================== HERO CARD (7 cols on lg) ===================== */}
          <section className="lg:col-span-7 neo-box bg-[#FFFDF0] p-6 md:p-8 rounded-2xl relative overflow-hidden">
            {/* 장식용 스티커 태그 */}
            <div className="absolute -right-10 -top-6 transform rotate-12 pointer-events-none select-none">
              <div className="bg-[#FF70A6] border-2 border-black text-white font-black text-xs px-12 py-2 shadow-[3px_3px_0px_#000]">
                ★ 100% PASSION ★
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* 아바타 영역 */}
              <div className="relative flex-shrink-0">
                {/* 배경 네오 박스 섀도우 레이어 */}
                <div className="w-28 h-28 md:w-32 md:h-32 neo-box bg-[#70D6FF] rounded-2xl flex items-center justify-center relative transform hover:rotate-3 transition-transform cursor-pointer group">
                  {/* 이니셜 및 아바타 그래픽 */}
                  <span className="text-5xl md:text-6xl font-black text-black select-none tracking-tight">
                    신
                  </span>
                  
                  {/* 아바타 코너 스티커 */}
                  <span className="absolute -bottom-3 -right-2 bg-[#FFE500] border-2 border-black font-black text-[10px] md:text-xs px-2 py-0.5 rounded shadow-[2px_2px_0px_#000] rotate-3">
                    BUILDER 💻
                  </span>
                </div>
              </div>

              {/* 소개 헤더 */}
              <div className="flex-1 text-center sm:text-left space-y-3">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="neo-box-sm bg-[#80FF72] text-[11px] font-black px-2 py-0.5 rounded uppercase">
                    Frontend / Fullstack
                  </span>
                  <span className="neo-box-sm bg-[#FF9770] text-[11px] font-black px-2 py-0.5 rounded uppercase">
                    Chungwoon Univ.
                  </span>
                </div>

                <div className="space-y-1">
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-black flex items-center justify-center sm:justify-start gap-2">
                    신예헌
                    <span className="text-sm md:text-base font-mono font-bold text-neutral-600">
                      / Yeheon Shin
                    </span>
                  </h1>
                  <p className="font-bold text-neutral-800 text-sm md:text-base leading-snug">
                    “아이디어를 코드로 실현하는 크리에이티브 엔지니어”
                  </p>
                </div>

                {/* 자기소개 박스 */}
                <div className="neo-box-sm bg-white p-3.5 rounded-xl text-neutral-800 text-xs md:text-sm leading-relaxed border-2 border-black shadow-[3px_3px_0px_#000]">
                  상상한 아이디어를 빠르게 실체화하고, 사용자에게 명쾌하고 즐거운 경험을 선사하는 개발에 몰입합니다.
                  모던 웹 프론트엔드와 안정적인 백엔드 연동을 아우르며, 끊임없이 배우고 만듭니다.
                </div>
              </div>
            </div>

            {/* 히어로 하단 액션 버튼 그룹 */}
            <div className="mt-6 pt-5 border-t-2 border-black border-dashed flex flex-wrap items-center justify-between gap-3">
              {/* 응원 하트 버튼 */}
              <button
                onClick={handleLike}
                className={
                  "neo-btn px-4 py-2.5 rounded-xl font-black text-xs md:text-sm flex items-center space-x-2 " +
                  (hasLiked ? "bg-[#FF70A6] text-white" : "bg-white text-black hover:bg-[#FFD2E2]")
                }
              >
                <span className="text-base transform active:scale-125 transition-transform">💖</span>
                <span>응원하기</span>
                <span className="bg-black text-white px-2 py-0.5 rounded-full text-xs">{likes}</span>
              </button>

              {/* 이메일 복사 버튼 */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopyEmail}
                  className="neo-btn bg-[#FFE500] hover:bg-[#FFD214] px-4 py-2.5 rounded-xl font-black text-xs md:text-sm flex items-center space-x-2"
                >
                  <span>{copied ? "✅" : "📋"}</span>
                  <span>{copied ? "복사 완료!" : "이메일 주소 복사"}</span>
                </button>
              </div>
            </div>
          </section>

          {/* ===================== LIVE STATS & INFO BENTO (5 cols on lg) ===================== */}
          <section className="lg:col-span-5 flex flex-col gap-6 justify-between">
            
            {/* 스탯 4분할 카드 */}
            <div className="neo-box bg-white p-5 rounded-2xl">
              <div className="flex items-center justify-between mb-4 border-b-2 border-black pb-2">
                <h3 className="font-black text-sm uppercase tracking-wider flex items-center gap-1.5">
                  <span>⚡</span> DEVELOPER STATUS
                </h3>
                <span className="text-[10px] font-mono font-bold bg-[#FFE500] border border-black px-1.5 py-0.5 rounded">
                  REALTIME
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* 1. 위치 */}
                <div className="neo-box-sm bg-[#E8F0FE] p-3 rounded-xl flex flex-col justify-between">
                  <span className="text-xs font-bold text-neutral-500 uppercase">LOCATION</span>
                  <div className="mt-1 font-black text-sm md:text-base flex items-center gap-1">
                    <span>🇰🇷</span> 서울 / 천안
                  </div>
                </div>

                {/* 2. 전공/학습 */}
                <div className="neo-box-sm bg-[#FEF3C7] p-3 rounded-xl flex flex-col justify-between">
                  <span className="text-xs font-bold text-neutral-500 uppercase">EDUCATION</span>
                  <div className="mt-1 font-black text-sm md:text-base">
                    청운대 3학년 🎓
                  </div>
                </div>

                {/* 3. 커피 게이지 */}
                <div className="neo-box-sm bg-[#DCFCE7] p-3 rounded-xl flex flex-col justify-between">
                  <span className="text-xs font-bold text-neutral-500 uppercase">DAILY FUEL</span>
                  <div className="mt-1 font-black text-sm md:text-base">
                    ☕ 2~3 잔 / Day
                  </div>
                </div>

                {/* 4. 주력 모드 */}
                <div className="neo-box-sm bg-[#FCE7F3] p-3 rounded-xl flex flex-col justify-between">
                  <span className="text-xs font-bold text-neutral-500 uppercase">FOCUS</span>
                  <div className="mt-1 font-black text-sm md:text-base text-rose-700">
                    Vibe-Coding 🔥
                  </div>
                </div>
              </div>
            </div>

            {/* 현재 듣고 있는 음악 / 영감 한마디 */}
            <div className="neo-box bg-[#C084FC] p-4 rounded-2xl text-black flex items-center justify-between gap-3">
              <div className="flex items-center space-x-3 overflow-hidden">
                <div className="w-10 h-10 neo-box-sm bg-white rounded-lg flex items-center justify-center text-xl flex-shrink-0 animate-spin-slow">
                  🎵
                </div>
                <div className="overflow-hidden text-left">
                  <p className="text-[10px] font-black uppercase text-black/80 tracking-wider">
                    NOW LISTENING
                  </p>
                  <p className="font-black text-sm truncate">
                    Lofi Beats & Deep Focus Coding Mix
                  </p>
                </div>
              </div>
              <span className="neo-box-sm bg-[#FFE500] font-black text-xs px-2.5 py-1 rounded whitespace-nowrap">
                LIVE
              </span>
            </div>

            {/* 원클릭 모토 배너 */}
            <div className="neo-box bg-[#80FF72] p-4 rounded-2xl text-black flex items-center justify-between">
              <div className="flex items-center space-x-2 font-black text-sm md:text-base">
                <span>💡</span>
                <span>&quot;Make things that people love to use.&quot;</span>
              </div>
              <span className="text-xl">🚀</span>
            </div>

          </section>
        </div>

        {/* ===================== FEATURED LINKS (핵심 링크 허브) ===================== */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-8 bg-black inline-block"></span>
              <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">
                FEATURED LINKS & CHANNELS
              </h2>
            </div>
            <span className="font-mono text-xs font-bold bg-white border-2 border-black px-2 py-1 rounded shadow-[2px_2px_0px_#000]">
              {mainLinks.length} CHANNELS
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            {mainLinks.map((link, idx) => (
              <a
                key={idx}
                href={link.url}
                target={link.url.startsWith("http") ? "_blank" : "_self"}
                rel="noopener noreferrer"
                className={"neo-box " + link.bg + " " + link.hoverBg + " p-5 md:p-6 rounded-2xl block group relative overflow-hidden transition-all duration-150"}
              >
                <div className="flex items-start justify-between">
                  {/* 좌측 아이콘 & 라벨 */}
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 neo-box-sm bg-white rounded-xl flex items-center justify-center flex-shrink-0 group-hover:rotate-6 transition-transform">
                      {link.icon}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-xl md:text-2xl font-black text-black group-hover:underline decoration-2 underline-offset-4">
                          {link.title}
                        </h3>
                        <span className="neo-box-sm bg-white text-[10px] font-black px-2 py-0.5 rounded">
                          {link.badge}
                        </span>
                      </div>
                      <p className="mt-1 text-xs md:text-sm font-bold text-neutral-800 line-clamp-1">
                        {link.desc}
                      </p>
                    </div>
                  </div>

                  {/* 우측 화살표 액션 버튼 */}
                  <div className="w-9 h-9 neo-box-sm bg-white rounded-full flex items-center justify-center font-black text-lg group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">
                    ↗
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* ===================== TECH STACK (스티커 태그 클라우드) ===================== */}
        <section className="neo-box bg-white p-6 md:p-8 rounded-2xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-black pb-3">
            <div className="flex items-center space-x-2">
              <span className="text-xl">🛠️</span>
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight">
                TECH STACK & TOOLBELT
              </h2>
            </div>
            <span className="text-xs font-bold text-neutral-500 font-mono">
              CLICK A TAG TO DISCOVER
            </span>
          </div>

          <div className="flex flex-wrap gap-2.5 md:gap-3 pt-2">
            {techSkills.map((tech, idx) => (
              <button
                key={idx}
                onClick={() => showToast("🛠️ " + tech.name + " 기술에 몰입하고 있습니다!")}
                className={"neo-box-sm " + tech.color + " px-3.5 py-2 rounded-xl font-black text-xs md:text-sm flex items-center space-x-2 transform hover:-translate-y-1 hover:rotate-1 active:translate-y-0.5 transition-all select-none cursor-pointer"}
              >
                <span>{tech.name}</span>
                <span className="text-[10px] opacity-75 font-mono uppercase bg-black/10 px-1.5 py-0.5 rounded">
                  {tech.category}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* ===================== FEATURED PROJECTS ===================== */}
        <section id="projects" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-8 bg-[#FF70A6] inline-block"></span>
              <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">
                FEATURED PROJECTS
              </h2>
            </div>
            <span className="text-xs md:text-sm font-bold bg-[#FFE500] border-2 border-black px-2.5 py-1 rounded shadow-[2px_2px_0px_#000]">
              SHOWCASE 🚀
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {projects.map((proj) => (
              <div
                key={proj.id}
                className="neo-box bg-white p-6 rounded-2xl flex flex-col justify-between group hover:shadow-[8px_8px_0px_#000] transition-all"
              >
                <div>
                  {/* 상단 라벨 & 번호 */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono font-black text-neutral-400 text-lg">
                      #{proj.id}
                    </span>
                    <span className={"neo-box-sm " + proj.accent + " text-[10px] font-black px-2 py-0.5 rounded uppercase"}>
                      {proj.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-black mb-1 group-hover:text-rose-600 transition-colors">
                    {proj.title}
                  </h3>
                  <p className="text-xs font-bold text-neutral-500 mb-3 uppercase tracking-wider">
                    {proj.category}
                  </p>
                  <p className="text-sm font-medium text-neutral-700 leading-relaxed mb-4">
                    {proj.desc}
                  </p>
                </div>

                <div>
                  {/* 기술 태그 */}
                  <div className="flex flex-wrap gap-1.5 pt-3 border-t-2 border-black/10">
                    {proj.tech.map((t, i) => (
                      <span
                        key={i}
                        className="bg-neutral-100 border border-black text-[11px] font-bold px-2 py-0.5 rounded"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* 데모 / 코드 버튼 */}
                  <div className="mt-4 flex items-center gap-2">
                    <button
                      onClick={() => showToast("🚀 \"" + proj.title + "\" 상세 화면으로 이동합니다.")}
                      className="neo-btn flex-1 bg-[#FFE500] py-2 rounded-lg font-black text-xs text-center"
                    >
                      VIEW DEMO ↗
                    </button>
                    <button
                      onClick={() => showToast("📁 \"" + proj.title + "\" 깃허브 코드를 확인합니다.")}
                      className="neo-btn bg-white px-3 py-2 rounded-lg font-black text-xs"
                    >
                      CODE
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ===================== INTERACTIVE GUESTBOOK (방명록 & 응원) ===================== */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* 작성 폼 (5 cols on lg) */}
          <div className="lg:col-span-5 neo-box bg-[#FFDE59] p-6 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-2xl">✍️</span>
                <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight">
                  LEAVE A MESSAGE
                </h3>
              </div>
              <p className="text-xs md:text-sm font-bold text-neutral-800 mb-4">
                방문 흔적이나 응원의 한마디를 남겨주세요!
              </p>

              <form onSubmit={handleAddGuest} className="space-y-3">
                {/* 닉네임 입력 */}
                <div>
                  <label className="block text-xs font-black uppercase mb-1">NAME / NICKNAME</label>
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="닉네임을 입력하세요"
                    required
                    className="w-full neo-box-sm bg-white px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-black rounded-lg"
                  />
                </div>

                {/* 이모지 선택 */}
                <div>
                  <label className="block text-xs font-black uppercase mb-1">PICK AN EMOJI</label>
                  <div className="flex gap-2">
                    {["🚀", "🔥", "💖", "☕", "🎉"].map((emoji) => (
                      <button
                        type="button"
                        key={emoji}
                        onClick={() => setSelectedEmoji(emoji)}
                        className={
                          "neo-box-sm px-3 py-1 text-lg rounded-lg " +
                          (selectedEmoji === emoji ? "bg-[#70D6FF] scale-110" : "bg-white")
                        }
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 메시지 내용 */}
                <div>
                  <label className="block text-xs font-black uppercase mb-1">MESSAGE</label>
                  <textarea
                    value={guestMsg}
                    onChange={(e) => setGuestMsg(e.target.value)}
                    placeholder="따뜻한 한마디나 피드백을 적어주세요!"
                    rows={3}
                    required
                    className="w-full neo-box-sm bg-white p-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-black rounded-lg resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full neo-btn bg-black text-white hover:bg-neutral-800 py-3 rounded-xl font-black text-sm tracking-wide shadow-[3px_3px_0px_#FF70A6] active:shadow-none"
                >
                  MESSAGE POST ✨
                </button>
              </form>
            </div>
          </div>

          {/* 방명록 피드 리스트 (7 cols on lg) */}
          <div className="lg:col-span-7 neo-box bg-white p-6 rounded-2xl flex flex-col">
            <div className="flex items-center justify-between mb-4 border-b-2 border-black pb-2">
              <div className="flex items-center space-x-2">
                <span className="text-xl">💬</span>
                <h3 className="font-black text-lg md:text-xl uppercase tracking-tight">
                  GUESTBOOK FEED
                </h3>
              </div>
              <span className="font-mono text-xs font-bold bg-[#80FF72] border border-black px-2 py-0.5 rounded">
                {guestList.length} NOTES
              </span>
            </div>

            {/* 메시지 리스트 스크롤 */}
            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {guestList.map((item) => (
                <div
                  key={item.id}
                  className="neo-box-sm bg-[#FFFDF0] p-4 rounded-xl flex items-start space-x-3.5"
                >
                  <span className="text-2xl p-2 bg-white neo-box-sm rounded-lg flex-shrink-0">
                    {item.emoji}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-black text-sm text-black">{item.name}</h4>
                      <span className="text-[10px] font-mono text-neutral-500">{item.time}</span>
                    </div>
                    <p className="text-xs md:text-sm text-neutral-800 font-medium leading-relaxed">
                      {item.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </section>

      </main>

      {/* 4. 푸터 */}
      <footer className="max-w-6xl mx-auto px-4 mt-12">
        <div className="neo-box bg-black text-white p-6 md:p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div>
            <h4 className="text-lg md:text-xl font-black uppercase tracking-wider text-[#FFE500]">
              SHIN YEHEON • MYLINK
            </h4>
            <p className="text-xs md:text-sm text-neutral-400 mt-1 font-medium">
              Crafted with Neo-Brutalism Design • Built with Next.js 16 & Tailwind CSS v4
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="neo-btn bg-[#FFE500] text-black font-black text-xs md:text-sm px-4 py-2 rounded-lg"
            >
              TOP ↑
            </button>
            <a
              href="mailto:yeheon.shin@example.com"
              className="neo-btn bg-white text-black font-black text-xs md:text-sm px-4 py-2 rounded-lg"
            >
              EMAIL ME ✉️
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
