"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Search, X } from "lucide-react";
import { searchItems } from "@/lib/course";
import { searchItemsEn } from "@/lib/course-en";
import { usePreferences } from "@/lib/preferences";

type SearchDialogProps = {
  open: boolean;
  onClose: () => void;
};

function normalize(value: string) {
  return value.toLocaleLowerCase().replace(/[\s_./-]+/g, " ").trim();
}

export function SearchDialog({ open, onClose }: SearchDialogProps) {
  const [query, setQuery] = useState("");
  const { locale } = usePreferences();
  const activeItems = locale === "en" ? searchItemsEn : searchItems;
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => inputRef.current?.focus());
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, open]);

  const results = useMemo(() => {
    const normalized = normalize(query);
    if (!normalized) return activeItems.slice(0, 8);
    const tokens = normalized.split(" ");
    return activeItems
      .map((item) => {
        const title = normalize(item.title);
        const haystack = normalize(`${item.title} ${item.description} ${item.keywords}`);
        const score = tokens.reduce((total, token) => {
          if (title === token) return total + 12;
          if (title.includes(token)) return total + 6;
          if (haystack.includes(token)) return total + 2;
          return total - 20;
        }, 0);
        return { item, score };
      })
      .filter(({ score }) => score >= 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(({ item }) => item);
  }, [activeItems, query]);

  if (!open) return null;

  return (
    <div className="search-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="search-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={locale === "en" ? "Search lessons" : "搜索课程"}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="search-input-row">
          <Search size={20} aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={locale === "en" ? "Search concepts, errors, or code…" : "搜索概念、错误码或代码符号…"}
            aria-label={locale === "en" ? "Search course content" : "搜索课程内容"}
          />
          <button className="icon-button" type="button" onClick={onClose} aria-label={locale === "en" ? "Close search" : "关闭搜索"}>
            <X size={19} />
          </button>
        </div>
        <div className="search-results" aria-live="polite">
          {results.length ? (
            results.map((item) => (
              <Link key={item.id} href={item.href} className="search-result" onClick={onClose}>
                <span className="search-result-kind">{item.kind}</span>
                <span>
                  <strong>{item.title}</strong>
                  <small>{item.description}</small>
                </span>
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
            ))
          ) : (
            <div className="empty-search">{locale === "en" ? "No matches. Try “unknown”, “cancel”, or “SSE”." : "没有匹配结果。试试 “unknown”“取消” 或 “SSE”。"}</div>
          )}
        </div>
        <footer className="search-footer">
          <span><kbd>↑</kbd><kbd>↓</kbd> {locale === "en" ? "Navigate" : "浏览"}</span>
          <span><kbd>Esc</kbd> {locale === "en" ? "Close" : "关闭"}</span>
        </footer>
      </section>
    </div>
  );
}
