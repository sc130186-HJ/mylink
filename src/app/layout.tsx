import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "신예헌 | MyLink",
  description: "신예헌의 개인 프로필 및 링크 모음 페이지",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
