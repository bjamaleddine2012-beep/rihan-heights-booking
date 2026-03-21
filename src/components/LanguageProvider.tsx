"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { Locale, TranslationKey } from "@/lib/i18n";
import { t as translate } from "@/lib/i18n";

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
  dir: "ltr" | "rtl";
}

const LanguageContext = createContext<LanguageContextType>({
  locale: "en",
  setLocale: () => {},
  t: (key) => key,
  dir: "ltr",
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const saved = localStorage.getItem("lang") as Locale | null;
    if (saved === "ar" || saved === "en") {
      setLocaleState(saved);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem("lang", l);
  }, []);

  const t = useCallback((key: TranslationKey) => translate(locale, key), [locale]);
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

/** Language toggle button */
export function LanguageToggle() {
  const { locale, setLocale } = useLanguage();

  return (
    <button
      onClick={() => setLocale(locale === "en" ? "ar" : "en")}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-white/10 text-[var(--text-muted)] hover:bg-white/5 hover:text-white transition-all"
      title={locale === "en" ? "التبديل إلى العربية" : "Switch to English"}
    >
      <span className="text-base">{locale === "en" ? "🇦🇪" : "🇬🇧"}</span>
      {locale === "en" ? "عربي" : "EN"}
    </button>
  );
}
