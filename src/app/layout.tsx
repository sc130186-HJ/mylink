import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#FFFFFF",
};

export const metadata: Metadata = {
  title: "이지은 | MyLink (마이링크)",
  description: "사용자 경험과 깔끔한 인터랙션에 진심인 프론트엔드 개발자 이지은의 링크 모음이에요.",
  keywords: ["이지은", "MyLink", "마이링크", "링크트리", "프론트엔드", "포트폴리오", "TDS"],
  authors: [{ name: "이지은" }],
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
        {children}
      </body>
    </html>
  );
}
