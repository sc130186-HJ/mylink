import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { QueryProvider } from "@/components/providers/QueryProvider";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#FFFFFF",
};

export const metadata: Metadata = {
  title: "신예헌 | MyLink (마이링크)",
  description: "반갑습니다! 나만의 소셜 링크를 모아두는 신예헌의 마이링크 공간입니다 ✨",
  keywords: ["신예헌", "MyLink", "마이링크", "링크트리", "포트폴리오", "TDS"],
  authors: [{ name: "신예헌" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={cn("h-full bg-[#F9FAFB]", "font-sans", geist.variable)}>
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans antialiased text-[#191F28] bg-[#F9FAFB] selection:bg-[#E8F3FF] selection:text-[#3182F6]">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
