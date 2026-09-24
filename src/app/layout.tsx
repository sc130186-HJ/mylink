import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#FFE500",
};

export const metadata: Metadata = {
  title: "신예헌 (Shin Yeheon) | Neo-Brutalism Profile & Links",
  description: "아이디어를 코드로 실현하는 개발자 신예헌의 Neo-Brutalism 포트폴리오 및 올인원 링크 허브",
  keywords: ["신예헌", "MyLink", "포트폴리오", "Neo-Brutalism", "Fullstack Developer", "청운대학교"],
  authors: [{ name: "신예헌" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full scroll-smooth">
      <body className="min-h-full flex flex-col font-sans antialiased text-black">
        {children}
      </body>
    </html>
  );
}
