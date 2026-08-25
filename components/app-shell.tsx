"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Check,
  ChevronRight,
  Code2,
  Command,
  Menu,
  Languages,
  Moon,
  Search,
  Sun,
  X,
} from "lucide-react";
import { lessons } from "@/lib/course";
import { useCourseProgress } from "@/lib/progress";
import { SearchDialog } from "@/components/search-dialog";
import { lessonsEn } from "@/lib/course-en";
import { usePreferences } from "@/lib/preferences";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const { progress } = useCourseProgress();
  const { locale, setLocale, theme, toggleTheme } = usePreferences();
  const activeLessons = locale === "en" ? lessonsEn : lessons;

  const openSearch = useCallback(() => setSearchOpen(true), []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA";
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        openSearch();
      } else if (!typing && event.key === "/") {
        event.preventDefault();
        openSearch();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openSearch]);

  const percent = Math.round((progress.completedLessons.length / activeLessons.length) * 100);

  return (
    <div className="app-shell">
      <header className="topbar">
        <button
          className="mobile-menu-button"
          type="button"
          onClick={() => setNavOpen((value) => !value)}
          aria-label={navOpen ? (locale === "en" ? "Close course navigation" : "关闭课程导航") : (locale === "en" ? "Open course navigation" : "打开课程导航")}
        >
          {navOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <Link href="/" className="brand" aria-label="返回课程首页" onClick={() => setNavOpen(false)}>
          <span className="brand-mark">TS</span>
          <span className="brand-copy">
            <strong>TypeScript · First Principles</strong>
            <small>{locale === "en" ? "Build judgment for vibe coding" : "为 Vibe Coding 建立判断力"}</small>
          </span>
        </Link>
        <button className="search-trigger" type="button" onClick={openSearch}>
          <Search size={17} aria-hidden="true" />
          <span>{locale === "en" ? "Search lessons" : "搜索课程"}</span>
          <kbd>⌘ K</kbd>
        </button>
        <div className="top-actions">
          <button className="preference-button" type="button" onClick={() => setLocale(locale === "en" ? "zh" : "en")} aria-label={locale === "en" ? "切换到中文" : "Switch to English"}>
            <Languages size={16} /><span>{locale === "en" ? "中文" : "EN"}</span>
          </button>
          <button className="preference-button icon-only" type="button" onClick={toggleTheme} aria-label={theme === "light" ? "Use dark theme" : "Use light theme"}>
            {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          <div className="top-progress" aria-label={`${locale === "en" ? "Course progress" : "课程完成度"} ${percent}%`}>
          <span>{percent}%</span>
          <div className="progress-track"><i style={{ width: `${percent}%` }} /></div>
          </div>
        </div>
      </header>

      <aside className={`course-nav ${navOpen ? "is-open" : ""}`}>
        <nav aria-label="课程章节">
          <p className="nav-label">{locale === "en" ? "PHASE 01 · RUNTIME" : "第一阶段 · 运行时"}</p>
          {activeLessons.map((lesson) => {
            const active = pathname === `/lesson/${lesson.slug}`;
            const done = progress.completedLessons.includes(lesson.id);
            return (
              <Link
                key={lesson.id}
                href={`/lesson/${lesson.slug}`}
                className={`lesson-nav-item ${active ? "is-active" : ""}`}
                onClick={() => setNavOpen(false)}
              >
                <span className={`lesson-state ${done ? "is-done" : ""}`}>
                  {done ? <Check size={13} strokeWidth={3} /> : lesson.order + 1}
                </span>
                <span>
                  <small>{lesson.id} · {lesson.durationMinutes}m</small>
                  <strong>{lesson.title}</strong>
                </span>
                <ChevronRight size={15} aria-hidden="true" />
              </Link>
            );
          })}

          <p className="nav-label nav-label-spaced">{locale === "en" ? "TOOLS" : "工具"}</p>
          <Link href="/roadmap" onClick={() => setNavOpen(false)} className={`utility-nav-item ${pathname === "/roadmap" ? "is-active" : ""}`}>
            <BookOpen size={17} /> {locale === "en" ? "Roadmap" : "课程地图"}
          </Link>
          <Link href="/playground" onClick={() => setNavOpen(false)} className={`utility-nav-item ${pathname === "/playground" ? "is-active" : ""}`}>
            <Code2 size={17} /> Playground
          </Link>
          <Link href="/project" onClick={() => setNavOpen(false)} className={`utility-nav-item ${pathname === "/project" ? "is-active" : ""}`}>
            <Command size={17} /> CodePilot P0
          </Link>
        </nav>
        <div className="nav-principle">
          <span>{locale === "en" ? "PHASE PRINCIPLE" : "本阶段原则"}</span>
          <strong>{locale === "en" ? "Predict the runtime before trusting the types." : "先预测运行时，再相信类型。"}</strong>
        </div>
      </aside>

      <div className="page-stage">{children}</div>
      {navOpen && <button className="nav-scrim" aria-label="关闭导航" onClick={() => setNavOpen(false)} />}
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
