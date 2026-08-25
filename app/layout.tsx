import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
import { PreferencesProvider } from "@/lib/preferences";

export const metadata: Metadata = {
  title: {
    default: "TypeScript for the Vibe Coding Era",
    template: "%s · TypeScript First Principles",
  },
  description: "Learn TypeScript from JavaScript runtime fundamentals and build the judgment needed to review AI-generated code.",
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
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased"><PreferencesProvider><AppShell>{children}</AppShell></PreferencesProvider></body>
    </html>
  );
}
