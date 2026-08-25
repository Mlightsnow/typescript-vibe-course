"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Locale = "en" | "zh";
export type Theme = "light" | "dark";

type Preferences = {
  locale: Locale;
  theme: Theme;
  setLocale(locale: Locale): void;
  toggleTheme(): void;
};

const PreferencesContext = createContext<Preferences | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const savedLocale = window.localStorage.getItem("course-locale");
    const savedTheme = window.localStorage.getItem("course-theme");
    const frame = window.requestAnimationFrame(() => {
      if (savedLocale === "zh" || savedLocale === "en") setLocaleState(savedLocale);
      if (savedTheme === "dark" || savedTheme === "light") setTheme(savedTheme);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
    document.documentElement.dataset.theme = theme;
  }, [locale, theme]);

  const value = useMemo<Preferences>(() => ({
    locale,
    theme,
    setLocale(nextLocale) {
      setLocaleState(nextLocale);
      window.localStorage.setItem("course-locale", nextLocale);
    },
    toggleTheme() {
      setTheme((current) => {
        const next = current === "light" ? "dark" : "light";
        window.localStorage.setItem("course-theme", next);
        return next;
      });
    },
  }), [locale, theme]);

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const value = useContext(PreferencesContext);
  if (!value) throw new Error("usePreferences must be used inside PreferencesProvider");
  return value;
}
