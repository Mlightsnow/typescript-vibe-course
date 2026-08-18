import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/app-shell";

export const metadata: Metadata = {
  title: {
    default: "Vibe Coding 时代的 TypeScript",
    template: "%s · TypeScript First Principles",
  },
  description: "从 JavaScript 运行时出发，建立审查 AI 代码与开发可靠 TypeScript 后端的能力。",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased"><AppShell>{children}</AppShell></body>
    </html>
  );
}
