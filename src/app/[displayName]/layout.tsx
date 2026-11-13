import React from "react";

export function generateStaticParams() {
  return [
    { displayName: "신예헌" },
    { displayName: "이지은" },
  ];
}

export default function DisplayNameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
