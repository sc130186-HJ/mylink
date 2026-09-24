"use client";

import React, { useState } from "react";

interface GuestMessage {
  id: string;
  name: string;
  message: string;
  time: string;
}

export default function Home() {
  // 상태 관리
  const [likes, setLikes] = useState(128);
  const [hasLiked, setHasLiked] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "frontend" | "backend" | "tools">("all");

  // 방명록 상태
  const [guestList, setGuestList] = useState<GuestMessage[]>([
    {
      id: "1",
      name: "김민수",
      message: "화면이 정말 직관적이고 깔끔해요. 토스 느낌 제대로 나네요!",
      time: "방금 전",
    },
    {
      id: "2",
      name: "이지원",
      message: "아이디어를 실제 프로덕트로 풀어내는 속도가 인상적이에요. 응원해요!",
      time: "1시간 전",
    },
    {
      id: "3",
      name: "박준형",
      message: "깃허브 코드도 잘 보았어요. 나중에 기회 되면 커피챗 나눠요.",
      time: "어제",
    },
  ]);
  const [guestName, setGuestName] = useState("");
  const [guestMsg, setGuestMsg] = useState("");

  // 토스트 메시지
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2400);
  };

  // 이메일 복사
  const handleCopyEmail = () => {
    const email = "yeheon.shin@example.com";
    navigator.clipboard.writeText(email);
    setCopied(true);
    showToast("이메일 주소를 복사했어요");
    setTimeout(() => setCopied(false), 2000);
  };

  // 응원 카운터
  const handleLike = () => {
    if (hasLiked) {
      showToast("이미 응원을 전하셨어요. 고마워요!");
      return;
    }
    setLikes((prev) => prev + 1);
    setHasLiked(true);
    showToast("소중한 응원이 전해졌어요");
  };

  // 방명록 등록
  const handleAddGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !guestMsg.trim()) return;

    const newEntry: GuestMessage = {
      id: Date.now().toString(),
      name: guestName.trim(),
      message: guestMsg.trim(),
      time: "방금 전",
    };

    setGuestList([newEntry, ...guestList]);
    setGuestName("");
    setGuestMsg("");
    showToast("방명록 메시지를 남겼어요");
  };

  // 주요 링크 채널 목록
  const linkChannels = [
    {
      title: "GitHub 저장소",
      subtitle: "오픈소스 기여 및 사이드 프로젝트 코드 둘러보기",
      url: "https://github.com",
      badge: "코드",
      icon: (
        <svg className="w-5 h-5 text-[#333D4B]" fill="currentColor" viewBox="0 0 24 24">
          <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
        </svg>
      ),
    },
    {
      title: "기술 블로그",
      subtitle: "새로운 기술을 탐구하고 개발 회고를 작성해요",
      url: "https://velog.io",
      badge: "글",
      icon: (
        <svg className="w-5 h-5 text-[#333D4B]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      title: "프로젝트 쇼케이스",
      subtitle: "실제로 빌드하고 배포한 웹 서비스 모음이에요",
      url: "#projects",
      badge: "데모",
      icon: (
        <svg className="w-5 h-5 text-[#333D4B]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: "커피챗 신청하기",
      subtitle: "언제든 부담 없이 이메일로 편하게 대화해요",
      url: "mailto:yeheon.shin@example.com",
      badge: "대화",
      icon: (
        <svg className="w-5 h-5 text-[#333D4B]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
    },
  ];

  // 기술 스택
  const skills = [
    { name: "React 19", category: "frontend" },
    { name: "Next.js 16", category: "frontend" },
    { name: "TypeScript", category: "frontend" },
    { name: "Tailwind CSS", category: "frontend" },
    { name: "Node.js", category: "backend" },
    { name: "PostgreSQL", category: "backend" },
    { name: "Prisma", category: "backend" },
    { name: "Docker", category: "tools" },
    { name: "Git & GitHub", category: "tools" },
    { name: "Figma", category: "tools" },
  ];

  const filteredSkills =
    activeTab === "all" ? skills : skills.filter((s) => s.category === activeTab);

  // 대표 프로젝트
  const projects = [
    {
      id: "01",
      title: "MyLink",
      category: "프로필 & 링크 플랫폼",
      status: "운영 중",
      statusType: "success",
      desc: "누구나 자신의 개성과 링크를 한곳에서 간편하게 소개할 수 있는 미니멀 프로필 서비스예요.",
      tags: ["Next.js 16", "React 19", "Tailwind CSS"],
    },
    {
      id: "02",
      title: "Vibe-Coding Studio",
      category: "생산성 도구",
      status: "진행 중",
      statusType: "brand",
      desc: "생각한 아이디어를 AI 페어 프로그래밍으로 빠르게 MVP 프로덕트로 구현하는 워크스페이스예요.",
      tags: ["TypeScript", "Next.js", "Web API"],
    },
    {
      id: "03",
      title: "청운 캠퍼스 라이프 맵",
      category: "커뮤니티 서비스",
      status: "출시 완료",
      statusType: "success",
      desc: "대학생들이 캠퍼스 주변 정보와 공지사항을 한눈에 확인할 수 있는 지도 기반 웹앱이에요.",
      tags: ["React", "Location API", "Tailwind"],
    },
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#191F28] pb-24 md:pb-16">
      
      {/* 1. 상단 바 (TDS TopBar - 56pt) */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#E5E8EB]">
        <div className="max-w-3xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-[17px] font-bold tracking-tight text-[#191F28]">
              신예헌
            </span>
            <span className="text-[12px] font-semibold text-[#3182F6] bg-[#E8F3FF] px-2 py-0.5 rounded-full">
              개발자
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyEmail}
              className="tds-pressable h-8 px-3 rounded-xl bg-[#F2F4F6] text-[#4E5968] hover:text-[#191F28] hover:bg-[#E5E8EB] text-[13px] font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <span>{copied ? "복사됨" : "이메일"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* 토스 규격 토스트 (TDS Toast) */}
      {toastMessage && (
        <div className="fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 z-50 animate-fade-in pointer-events-none">
          <div className="bg-[#191F28] text-white px-4 py-3 rounded-2xl flex items-center space-x-2.5 text-[15px] font-medium tds-shadow-toast min-w-[240px] justify-center">
            <span className="w-5 h-5 rounded-full bg-[#32A05B] flex items-center justify-center text-white text-[12px] font-bold">
              ✓
            </span>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* 메인 컨테이너 */}
      <main className="max-w-3xl mx-auto px-4 md:px-6 pt-6 space-y-5">
        
        {/* ===================== HERO CARD (TDS Card Style) ===================== */}
        <section className="bg-white rounded-3xl p-6 md:p-8 border border-[#E5E8EB]/80 tds-shadow-card">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              {/* 활동 상태 뱃지 */}
              <div className="inline-flex items-center space-x-1.5 bg-[#E8F3FF] text-[#3182F6] px-3 py-1 rounded-full text-[13px] font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#3182F6] animate-pulse"></span>
                <span>새로운 프로젝트를 찾고 있어요</span>
              </div>

              {/* 메인 타이틀 */}
              <h1 className="text-2xl md:text-[28px] font-bold text-[#191F28] leading-[1.35] tracking-tight">
                아이디어를 코드로 실현하는 <br />
                개발자 신예헌이에요
              </h1>

              {/* 자기소개 본문 (해요체) */}
              <p className="text-[15px] text-[#4E5968] leading-[1.6] max-w-xl">
                복잡한 요구사항도 사용자가 쉽게 쓸 수 있도록 직관적이고 군더더기 없는 인터페이스로 풀어내는 것을 좋아해요. 프론트엔드부터 웹 서비스 전반을 유기적으로 개발해요.
              </p>
            </div>

            {/* 아바타 (정갈한 원형 아바타) */}
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-[#E8F3FF] text-[#3182F6] flex items-center justify-center text-2xl md:text-3xl font-bold flex-shrink-0 select-none">
              신
            </div>
          </div>

          {/* 버튼 영역: 화면당 단 하나의 Primary CTA 규칙 준수 */}
          <div className="mt-6 pt-5 border-t border-[#E5E8EB] flex flex-wrap items-center gap-3">
            {/* 단 하나의 Primary Blue Button */}
            <button
              onClick={handleCopyEmail}
              className="tds-pressable flex-1 sm:flex-none h-12 px-6 rounded-2xl bg-[#3182F6] hover:bg-[#1B64DA] text-white text-[15px] font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <span>{copied ? "복사 완료" : "이메일 복사하기"}</span>
            </button>

            {/* 응원하기 Secondary Button */}
            <button
              onClick={handleLike}
              className="tds-pressable h-12 px-5 rounded-2xl bg-[#F2F4F6] hover:bg-[#E5E8EB] text-[#333D4B] text-[15px] font-semibold flex items-center gap-2 cursor-pointer"
            >
              <span className={hasLiked ? "text-[#F04452]" : "text-[#8B95A1]"}>♥</span>
              <span>응원하기</span>
              <span className="tabular-nums text-[#6B7684] text-[14px]">{likes}</span>
            </button>
          </div>
        </section>

        {/* ===================== STATUS & QUICK STATS ===================== */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-[#E5E8EB]/80 tds-shadow-card flex flex-col justify-between">
            <span className="text-[13px] text-[#8B95A1] font-medium">활동 지역</span>
            <span className="text-[16px] font-bold text-[#191F28] mt-1">서울 / 천안</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#E5E8EB]/80 tds-shadow-card flex flex-col justify-between">
            <span className="text-[13px] text-[#8B95A1] font-medium">소속</span>
            <span className="text-[16px] font-bold text-[#191F28] mt-1">청운대학교</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#E5E8EB]/80 tds-shadow-card flex flex-col justify-between">
            <span className="text-[13px] text-[#8B95A1] font-medium">주요 분야</span>
            <span className="text-[16px] font-bold text-[#191F28] mt-1">Frontend</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#E5E8EB]/80 tds-shadow-card flex flex-col justify-between">
            <span className="text-[13px] text-[#8B95A1] font-medium">작업 방식</span>
            <span className="text-[16px] font-bold text-[#3182F6] mt-1">Vibe Coding</span>
          </div>
        </section>

        {/* ===================== FEATURED CHANNELS (TDS ListRow) ===================== */}
        <section className="bg-white rounded-3xl p-5 md:p-6 border border-[#E5E8EB]/80 tds-shadow-card">
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-[18px] font-bold text-[#191F28] tracking-tight">
              연결된 채널
            </h2>
            <span className="text-[13px] text-[#8B95A1] font-medium">
              4개 채널
            </span>
          </div>

          <div className="divide-y divide-[#E5E8EB]/60">
            {linkChannels.map((item, idx) => (
              <a
                key={idx}
                href={item.url}
                target={item.url.startsWith("http") ? "_blank" : "_self"}
                rel="noopener noreferrer"
                className="tds-pressable flex items-center justify-between py-3.5 px-2 rounded-2xl hover:bg-[#F9FAFB] transition-colors group"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-[#F2F4F6] flex items-center justify-center flex-shrink-0 group-hover:bg-[#E8F3FF] group-hover:text-[#3182F6] transition-colors">
                    {item.icon}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[16px] font-semibold text-[#191F28]">
                        {item.title}
                      </span>
                      <span className="text-[11px] font-semibold text-[#4E5968] bg-[#F2F4F6] px-1.5 py-0.5 rounded">
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-[13px] text-[#8B95A1] mt-0.5 line-clamp-1">
                      {item.subtitle}
                    </p>
                  </div>
                </div>

                <div className="text-[#B0B8C1] group-hover:text-[#6B7684] group-hover:translate-x-0.5 transition-all text-sm font-semibold pl-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* ===================== TECH STACK (Segmented & Chips) ===================== */}
        <section className="bg-white rounded-3xl p-5 md:p-6 border border-[#E5E8EB]/80 tds-shadow-card space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 px-1">
            <h2 className="text-[18px] font-bold text-[#191F28] tracking-tight">
              사용하는 기술
            </h2>

            {/* TDS Segmented Control */}
            <div className="bg-[#F2F4F6] p-1 rounded-xl flex space-x-1 text-[13px] font-semibold">
              {[
                { key: "all", label: "전체" },
                { key: "frontend", label: "프론트" },
                { key: "backend", label: "백엔드" },
                { key: "tools", label: "도구" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    activeTab === tab.key
                      ? "bg-white text-[#191F28] shadow-sm font-bold"
                      : "text-[#6B7684] hover:text-[#191F28]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* TDS Chips / Pills */}
          <div className="flex flex-wrap gap-2 pt-1 px-1">
            {filteredSkills.map((skill, idx) => (
              <span
                key={idx}
                onClick={() => showToast(`${skill.name} 기술을 주로 다뤄요`)}
                className="tds-pressable inline-flex items-center px-3.5 py-1.5 rounded-full bg-[#F2F4F6] hover:bg-[#E8F3FF] hover:text-[#3182F6] text-[#333D4B] text-[13px] font-medium cursor-pointer transition-colors"
              >
                {skill.name}
              </span>
            ))}
          </div>
        </section>

        {/* ===================== FEATURED PROJECTS ===================== */}
        <section id="projects" className="space-y-3">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-[18px] font-bold text-[#191F28] tracking-tight">
              대표 프로젝트
            </h2>
            <span className="text-[13px] text-[#8B95A1] font-medium">
              3개 프로덕트
            </span>
          </div>

          <div className="space-y-3">
            {projects.map((proj) => (
              <div
                key={proj.id}
                className="bg-white rounded-3xl p-5 md:p-6 border border-[#E5E8EB]/80 tds-shadow-card flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-semibold text-[#8B95A1] uppercase tracking-wider">
                      {proj.category}
                    </span>
                    <span
                      className={`text-[12px] font-semibold px-2.5 py-0.5 rounded-full ${
                        proj.statusType === "success"
                          ? "bg-[#E6F8EE] text-[#32A05B]"
                          : "bg-[#E8F3FF] text-[#3182F6]"
                      }`}
                    >
                      {proj.status}
                    </span>
                  </div>

                  <h3 className="text-[18px] font-bold text-[#191F28]">
                    {proj.title}
                  </h3>

                  <p className="text-[14px] text-[#4E5968] leading-relaxed">
                    {proj.desc}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E5E8EB]/60">
                  <div className="flex flex-wrap gap-1.5">
                    {proj.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="bg-[#F2F4F6] text-[#6B7684] text-[12px] font-medium px-2 py-0.5 rounded-md"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => showToast(`${proj.title} 상세 정보를 준비 중이에요`)}
                      className="tds-pressable h-9 px-3.5 rounded-xl bg-[#F2F4F6] hover:bg-[#E5E8EB] text-[#333D4B] text-[13px] font-semibold cursor-pointer"
                    >
                      둘러보기
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ===================== GUESTBOOK & MESSAGES (TDS Card) ===================== */}
        <section className="bg-white rounded-3xl p-5 md:p-6 border border-[#E5E8EB]/80 tds-shadow-card space-y-5">
          <div>
            <h2 className="text-[18px] font-bold text-[#191F28] tracking-tight">
              응원 메시지를 남길 수 있어요
            </h2>
            <p className="text-[13px] text-[#8B95A1] mt-0.5">
              남겨주신 메시지는 즉시 피드에 전달돼요.
            </p>
          </div>

          {/* 입력 폼 (TDS TextField 규격: 48px height, rounded-xl) */}
          <form onSubmit={handleAddGuest} className="space-y-3">
            <div>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="이름이나 닉네임을 적어주세요"
                required
                className="w-full h-12 px-4 rounded-xl bg-[#F2F4F6] border border-transparent focus:border-[#3182F6] focus:bg-white text-[14px] text-[#191F28] placeholder-[#8B95A1] outline-none transition-colors"
              />
            </div>

            <div>
              <textarea
                value={guestMsg}
                onChange={(e) => setGuestMsg(e.target.value)}
                placeholder="따뜻한 응원이나 피드백을 남겨주세요"
                rows={2}
                required
                className="w-full p-4 rounded-xl bg-[#F2F4F6] border border-transparent focus:border-[#3182F6] focus:bg-white text-[14px] text-[#191F28] placeholder-[#8B95A1] outline-none resize-none transition-colors"
              />
            </div>

            <button
              type="submit"
              className="tds-pressable w-full h-11 rounded-xl bg-[#333D4B] hover:bg-[#191F28] text-white text-[14px] font-semibold cursor-pointer transition-colors"
            >
              메시지 남기기
            </button>
          </form>

          {/* 방명록 피드 리스트 */}
          <div className="pt-2 border-t border-[#E5E8EB]/60 divide-y divide-[#E5E8EB]/50">
            {guestList.map((item) => (
              <div key={item.id} className="py-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-semibold text-[#191F28]">
                    {item.name}
                  </span>
                  <span className="text-[12px] text-[#8B95A1] tabular-nums">
                    {item.time}
                  </span>
                </div>
                <p className="text-[13px] text-[#4E5968] leading-relaxed">
                  {item.message}
                </p>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* 푸터 */}
      <footer className="max-w-3xl mx-auto px-5 mt-10 text-center text-[#8B95A1] text-[13px] space-y-1">
        <p className="font-medium">신예헌 • MyLink</p>
        <p className="text-[12px] text-[#B0B8C1]">
          토스 디자인 시스템(TDS) 가이드라인을 바탕으로 단정하게 제작되었어요.
        </p>
      </footer>

      {/* 모바일 화면용 Bottom CTA 바 (Mobile-first TDS BottomCTA - 56pt) */}
      <div className="fixed bottom-0 left-0 right-0 z-30 md:hidden pointer-events-none">
        <div className="tds-cta-gradient pt-6 pb-4 px-4 pointer-events-auto">
          <button
            onClick={handleCopyEmail}
            className="tds-pressable w-full h-14 rounded-2xl bg-[#3182F6] active:bg-[#1B64DA] text-white text-[16px] font-semibold flex items-center justify-center shadow-md cursor-pointer"
          >
            <span>{copied ? "이메일 복사 완료" : "커피챗 신청하기 (이메일 복사)"}</span>
          </button>
        </div>
      </div>

    </div>
  );
}
