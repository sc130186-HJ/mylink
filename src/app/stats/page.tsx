"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import defaultData from "@/data/mockData.json";
import { ProfileData, LinkItem } from "@/types/profile";
import { TopBar } from "@/components/profile/TopBar";
import { QrModal } from "@/components/profile/QrModal";
import { Toast } from "@/components/profile/Toast";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  LabelList,
} from "recharts";
import {
  Loader2,
  BarChart3,
  Eye,
  Link2,
  Trophy,
  ArrowLeft,
  TrendingUp,
} from "lucide-react";
import { loginWithGoogle, logout, onAuthChange, User } from "@/lib/auth";
import {
  useUserProfileQuery,
  useUserLinksQuery,
  useResetLinksMutation,
} from "@/hooks/useProfileQueries";

const BAR_COLORS = [
  "#3182F6",
  "#20C997",
  "#0A66C2",
  "#F59F00",
  "#F04452",
  "#6B7684",
];

const linkChartConfig = {
  clicks: {
    label: "클릭수",
    color: "#3182F6",
  },
} satisfies ChartConfig;

const categoryChartConfig = {
  clicks: {
    label: "클릭수",
    color: "#20C997",
  },
} satisfies ChartConfig;

export default function StatsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");

  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback((message: string) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(message);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  }, []);

  // 1. Firebase Auth 감지 및 비로그인 시 홈(/)으로 리다이렉트
  useEffect(() => {
    queueMicrotask(() => {
      setCurrentUrl(window.location.origin);
    });

    const unsubscribeAuth = onAuthChange((currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false);
      if (!currentUser) {
        router.replace("/");
      }
    });

    return () => {
      unsubscribeAuth();
    };
  }, [router]);

  const profileQuery = useUserProfileQuery(user);
  const linksQuery = useUserLinksQuery(user?.uid);

  const resetLinksMutation = useResetLinksMutation(user?.uid, {
    onSuccess: () => {
      showToast("통계 데이터를 새로고침했어요 🔄");
    },
    onError: () => {
      showToast("새로고침 중 문제가 발생했어요.");
    },
  });

  // 2. 통계 데이터 계산
  const stats = useMemo(() => {
    const baseMock = defaultData as ProfileData;
    const remoteLinks = linksQuery.data || [];

    const categoryTitleMap = new Map<string, string>();
    baseMock.categories.forEach((cat) => {
      categoryTitleMap.set(cat.id, cat.title);
    });

    const allItems: Array<{
      categoryId: string;
      categoryTitle: string;
      item: LinkItem;
      clicks: number;
    }> = remoteLinks.map(({ categoryId, item }) => ({
      categoryId,
      categoryTitle: categoryTitleMap.get(categoryId) || "주요 채널",
      item,
      clicks: item.clickCount ?? 0,
    }));

    // 모든 링크 클릭수 합산
    const totalClicks = allItems.reduce((sum, entry) => sum + entry.clicks, 0);
    const totalLinks = allItems.length;
    const avgClicks =
      totalLinks > 0 ? Number((totalClicks / totalLinks).toFixed(1)) : 0;

    // 클릭수 내림차순 정렬
    const sortedByClicks = [...allItems].sort((a, b) => b.clicks - a.clicks);
    const topLink = sortedByClicks[0] || null;

    // 링크별 차트 데이터
    const linkChartData =
      sortedByClicks.length > 0
        ? sortedByClicks.map((entry, idx) => ({
            id: entry.item.id,
            name:
              entry.item.title.length > 10
                ? `${entry.item.title.slice(0, 10)}…`
                : entry.item.title,
            fullTitle: entry.item.title,
            category: entry.categoryTitle,
            clicks: entry.clicks,
            fill: BAR_COLORS[idx % BAR_COLORS.length],
          }))
        : [
            {
              id: "empty",
              name: "등록된 링크 없음",
              fullTitle: "등록된 링크 없음",
              category: "-",
              clicks: 0,
              fill: "#E5E8EB",
            },
          ];

    // 카테고리별 클릭 합산 차트 데이터
    const categoryChartData = baseMock.categories.map((cat, idx) => {
      const catClicks = allItems
        .filter((e) => e.categoryId === cat.id)
        .reduce((sum, e) => sum + e.clicks, 0);
      const catCount = allItems.filter((e) => e.categoryId === cat.id).length;
      return {
        categoryId: cat.id,
        name: cat.title,
        clicks: catClicks,
        linkCount: catCount,
        fill: BAR_COLORS[idx % BAR_COLORS.length],
      };
    });

    return {
      totalClicks,
      totalLinks,
      avgClicks,
      topLink,
      sortedByClicks,
      linkChartData,
      categoryChartData,
    };
  }, [linksQuery.data]);

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch {
      showToast("로그인에 실패했어요.");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/");
    } catch {
      showToast("로그아웃에 실패했어요.");
    }
  };

  const handleCopyPageUrl = () => {
    const urlToCopy = currentUrl || window.location.origin;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(urlToCopy);
    }
    showToast("마이링크 주소가 복사되었어요 ✨");
  };

  // 인증 확인 중이거나 비로그인(리다이렉트 대기) 상태일 때 로딩 화면 표시
  if (isAuthLoading || !user) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white rounded-3xl p-8 border border-[#E5E8EB] shadow-xs max-w-xs w-full space-y-3">
          <Loader2 className="w-7 h-7 animate-spin text-[#3182F6] mx-auto" />
          <p className="text-[14px] font-bold text-[#191F28]">
            {isAuthLoading
              ? "로그인 상태를 확인하는 중이에요..."
              : "로그인이 필요한 페이지예요. 홈으로 이동합니다..."}
          </p>
        </div>
      </div>
    );
  }

  const profileName =
    profileQuery.data?.name || user.displayName || "신예헌";
  const isSyncing =
    profileQuery.isLoading ||
    linksQuery.isLoading ||
    resetLinksMutation.isPending;

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#191F28] flex flex-col justify-between relative selection:bg-blue-100">
      <div>
        {/* 1. 상단 글로벌 네비게이션 바 */}
        <TopBar
          user={user}
          onLogin={handleGoogleLogin}
          onLogout={handleLogout}
          isAuthLoading={isAuthLoading}
          onReset={() => resetLinksMutation.mutate()}
          onOpenQr={() => setIsQrOpen(true)}
          onCopyPageUrl={handleCopyPageUrl}
          isSyncing={isSyncing}
          profileName={profileName}
        />

        {/* 2. 메인 통계 컨텐츠 영역 */}
        <main className="max-w-md mx-auto px-4 py-6 space-y-5 animate-in fade-in duration-300">
          {/* 상단 뒤로가기 및 페이지 타이틀 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="p-2 rounded-full bg-white border border-[#E5E8EB] text-[#4E5968] hover:text-[#191F28] hover:bg-[#F2F4F6] transition"
                title="홈으로 돌아가기"
                aria-label="홈으로 돌아가기"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div>
                <h1 className="text-[18px] font-bold text-[#191F28] tracking-tight flex items-center gap-1.5">
                  <BarChart3 className="w-5 h-5 text-[#3182F6]" />
                  <span>클릭 통계 대시보드</span>
                </h1>
                <p className="text-[12px] text-[#8B95A1]">
                  {profileName} 님의 실시간 링크 클릭 분석
                </p>
              </div>
            </div>

            <Badge variant="brand" shape="pill">
              실시간 연동
            </Badge>
          </div>

          {/* 3. 핵심 KPI: 총 클릭수 (모든 링크 합산) 히어로 카드 */}
          <Card className="p-5 bg-gradient-to-br from-[#3182F6] to-[#1B64DA] text-white border-0 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold text-blue-100">
                총 클릭수 (모든 링크 합산)
              </span>
              <span className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
                <Eye className="w-4 h-4 text-white" />
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-[34px] font-extrabold tracking-tight tabular-nums leading-none">
                {stats.totalClicks.toLocaleString()}
              </span>
              <span className="text-[14px] font-semibold text-blue-100">
                회
              </span>
            </div>
            <div className="mt-4 pt-3 border-t border-white/15 grid grid-cols-2 gap-3 text-[12px]">
              <div>
                <span className="text-blue-100 block">등록된 링크 수</span>
                <span className="font-bold text-[15px] tabular-nums">
                  {stats.totalLinks.toLocaleString()}개
                </span>
              </div>
              <div>
                <span className="text-blue-100 block">링크당 평균 클릭</span>
                <span className="font-bold text-[15px] tabular-nums">
                  {stats.avgClicks.toLocaleString()}회
                </span>
              </div>
            </div>
          </Card>

          {/* 4. 최고 인기 링크 요약 카드 */}
          {stats.topLink && (
            <Card className="p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-[12px] bg-[#FFF8E6] text-[#F59F00] flex items-center justify-center shrink-0">
                  <Trophy className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-semibold text-[#8B95A1] block">
                    최다 클릭 링크
                  </span>
                  <p className="text-[14px] font-bold text-[#191F28] truncate">
                    {stats.topLink.item.title}
                  </p>
                </div>
              </div>
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#E8F3FF] text-[#3182F6] text-[13px] font-bold tabular-nums shrink-0">
                <Eye className="w-3.5 h-3.5" />
                <span>{stats.topLink.clicks.toLocaleString()}</span>
              </div>
            </Card>
          )}

          {/* 5. shadcn/ui Chart 1: 링크별 클릭수 막대 차트 */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[15px] font-bold text-[#191F28] flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-[#3182F6]" />
                  <span>링크별 클릭수 비교</span>
                </h2>
                <p className="text-[12px] text-[#8B95A1] mt-0.5">
                  각 링크의 누적 클릭 카운트 분포
                </p>
              </div>
            </div>

            <ChartContainer
              config={linkChartConfig}
              className="h-[220px] w-full aspect-auto"
            >
              <BarChart
                data={stats.linkChartData}
                margin={{ top: 20, right: 12, left: -16, bottom: 4 }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={11}
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                />
                <ChartTooltip
                  cursor={{ fill: "rgba(49, 130, 246, 0.06)" }}
                  content={
                    <ChartTooltipContent
                      labelKey="fullTitle"
                      nameKey="clicks"
                    />
                  }
                />
                <Bar
                  dataKey="clicks"
                  name="클릭수"
                  fill="var(--color-clicks)"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={44}
                >
                  {stats.linkChartData.map((entry) => (
                    <Cell key={entry.id} fill={entry.fill} />
                  ))}
                  <LabelList
                    dataKey="clicks"
                    position="top"
                    className="fill-[#4E5968] text-[11px] font-bold"
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
          </Card>

          {/* 6. shadcn/ui Chart 2: 카테고리별 클릭수 차트 */}
          <Card className="p-5 space-y-4">
            <div>
              <h2 className="text-[15px] font-bold text-[#191F28] flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-[#20C997]" />
                <span>카테고리별 클릭 합계</span>
              </h2>
              <p className="text-[12px] text-[#8B95A1] mt-0.5">
                섹션별 링크 클릭수 합산 비교
              </p>
            </div>

            <ChartContainer
              config={categoryChartConfig}
              className="h-[200px] w-full aspect-auto"
            >
              <BarChart
                data={stats.categoryChartData}
                layout="vertical"
                margin={{ top: 4, right: 28, left: 8, bottom: 4 }}
              >
                <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  width={88}
                  fontSize={11}
                />
                <ChartTooltip
                  cursor={{ fill: "rgba(32, 201, 151, 0.06)" }}
                  content={<ChartTooltipContent />}
                />
                <Bar
                  dataKey="clicks"
                  name="클릭수"
                  fill="var(--color-clicks)"
                  radius={[0, 8, 8, 0]}
                  barSize={22}
                >
                  {stats.categoryChartData.map((entry) => (
                    <Cell key={entry.categoryId} fill={entry.fill} />
                  ))}
                  <LabelList
                    dataKey="clicks"
                    position="right"
                    className="fill-[#4E5968] text-[11px] font-bold"
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
          </Card>

          {/* 7. 전체 링크별 상세 순위 리스트 */}
          <Card className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-bold text-[#191F28] flex items-center gap-1.5">
                <Link2 className="w-4 h-4 text-[#3182F6]" />
                <span>링크별 클릭 순위</span>
              </h2>
              <span className="text-[12px] text-[#8B95A1] tabular-nums">
                총 {stats.totalLinks}개
              </span>
            </div>

            {stats.sortedByClicks.length === 0 ? (
              <div className="py-6 text-center text-[13px] text-[#8B95A1]">
                아직 등록된 링크가 없어요. 홈에서 첫 링크를 추가해 보세요!
              </div>
            ) : (
              <div className="divide-y divide-[#F2F4F6]">
                {stats.sortedByClicks.map((entry, idx) => {
                  const ratio =
                    stats.totalClicks > 0
                      ? Math.round((entry.clicks / stats.totalClicks) * 100)
                      : 0;
                  return (
                    <div
                      key={entry.item.id}
                      className="py-3 first:pt-1 last:pb-1 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center shrink-0 tabular-nums ${
                            idx === 0
                              ? "bg-[#3182F6] text-white"
                              : "bg-[#F2F4F6] text-[#4E5968]"
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="text-[14px] font-semibold text-[#191F28] truncate">
                            {entry.item.title}
                          </p>
                          <p className="text-[11px] text-[#8B95A1] truncate">
                            {entry.categoryTitle} · 비중 {ratio}%
                          </p>
                        </div>
                      </div>

                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#E8F3FF] text-[#3182F6] text-[12px] font-bold tabular-nums shrink-0">
                        <Eye className="w-3.5 h-3.5 shrink-0" />
                        <span>{entry.clicks.toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </main>
      </div>

      {/* 푸터 */}
      <footer className="max-w-md mx-auto px-5 py-8 text-center text-[12px] text-[#8B95A1] space-y-1">
        <p className="font-medium text-[#4E5968]">
          © {new Date().getFullYear()} {profileName}. All rights reserved.
        </p>
        <p className="text-[11px] text-[#B0B8C1]">
          MyLink Analytics · UID: {user.uid.slice(0, 8)}
        </p>
      </footer>

      <QrModal
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        url={currentUrl}
        onCopyUrl={handleCopyPageUrl}
      />

      <Toast message={toastMessage} />
    </div>
  );
}
