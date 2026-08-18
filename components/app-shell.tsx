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
  Search,
  X,
} from "lucide-react";
import { lessons } from "@/lib/course";
import { useCourseProgress } from "@/lib/progress";
import { SearchDialog } from "@/components/search-dialog";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const { progress } = useCourseProgress();

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

  const percent = Math.round((progress.completedLessons.length / lessons.length) * 100);

  return (
    <div className="app-shell">
      <header className="topbar">
        <button
          className="mobile-menu-button"
          type="button"
          onClick={() => setNavOpen((value) => !value)}
          aria-label={navOpen ? "关闭课程导航" : "打开课程导航"}
        >
          {navOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <Link href="/" className="brand" aria-label="返回课程首页" onClick={() => setNavOpen(false)}>
          <span className="brand-mark">TS</span>
          <span className="brand-copy">
            <strong>TypeScript · First Principles</strong>
            <small>为 Vibe Coding 建立判断力</small>
          </span>
        </Link>
        <button className="search-trigger" type="button" onClick={openSearch}>
          <Search size={17} aria-hidden="true" />
          <span>搜索课程</span>
          <kbd>⌘ K</kbd>
        </button>
        <div className="top-progress" aria-label={`课程完成度 ${percent}%`}>
          <span>{percent}%</span>
          <div className="progress-track"><i style={{ width: `${percent}%` }} /></div>
        </div>
      </header>

      <aside className={`course-nav ${navOpen ? "is-open" : ""}`}>
        <nav aria-label="课程章节">
          <p className="nav-label">第一阶段 · 运行时</p>
          {lessons.map((lesson) => {
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

          <p className="nav-label nav-label-spaced">工具</p>
          <Link href="/roadmap" onClick={() => setNavOpen(false)} className={`utility-nav-item ${pathname === "/roadmap" ? "is-active" : ""}`}>
            <BookOpen size={17} /> 课程地图
          </Link>
          <Link href="/playground" onClick={() => setNavOpen(false)} className={`utility-nav-item ${pathname === "/playground" ? "is-active" : ""}`}>
            <Code2 size={17} /> Playground
          </Link>
          <Link href="/project" onClick={() => setNavOpen(false)} className={`utility-nav-item ${pathname === "/project" ? "is-active" : ""}`}>
            <Command size={17} /> CodePilot P0
          </Link>
        </nav>
        <div className="nav-principle">
          <span>本阶段原则</span>
          <strong>先预测运行时，再相信类型。</strong>
        </div>
      </aside>

      <div className="page-stage">{children}</div>
      {navOpen && <button className="nav-scrim" aria-label="关闭导航" onClick={() => setNavOpen(false)} />}
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
