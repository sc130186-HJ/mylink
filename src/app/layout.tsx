import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#FFFFFF",
};

export const metadata: Metadata = {
  title: "신예헌 | 개발자 프로필",
  description: "아이디어를 코드로 실현하는 개발자 신예헌의 프로필이에요.",
  keywords: ["신예헌", "MyLink", "개발자 프로필", "TDS", "프론트엔드", "풀스택"],
  authors: [{ name: "신예헌" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full bg-[#F9FAFB]">
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
