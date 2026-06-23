import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import en from "@/locales/en.json";
import hi from "@/locales/hi.json";

export type Language = "en" | "hi";

type LocaleData = typeof en;

interface LanguageContextValue {
  language: Language;
  setLanguage: (l: Language) => void;
  /** Inline translation helper — backward-compat with all existing call sites */
  t: (enStr: string, hiStr: string) => string;
  /** Key-based lookup from locale files, e.g. tKey("nav.home") */
  tKey: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  language:    "en",
  setLanguage: () => {},
  t:           (en) => en,
  tKey:        (k)  => k,
});

function detectBrowserLocale(): Language {
  try {
    const nav = navigator.language || navigator.languages?.[0] || "en";
    return nav.toLowerCase().startsWith("hi") ? "hi" : "en";
  } catch {
    return "en";
  }
}

function getInitialLanguage(): Language {
  try {
    const stored = localStorage.getItem("curecheck-lang") as Language | null;
    if (stored === "en" || stored === "hi") return stored;
    // First visit — prefer browser locale
    return detectBrowserLocale();
  } catch {
    return "en";
  }
}

function getNestedValue(obj: Record<string, unknown>, dotKey: string): string | undefined {
  const keys = dotKey.split(".");
  let cur: unknown = obj;
  for (const k of keys) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[k];
  }
  return typeof cur === "string" ? cur : undefined;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  useEffect(() => {
    document.documentElement.lang = language === "hi" ? "hi" : "en";
  }, [language]);

  const setLanguage = useCallback((l: Language) => {
    setLanguageState(l);
    try { localStorage.setItem("curecheck-lang", l); } catch {}

    // Sync to Supabase user metadata (best-effort, non-blocking)
    if (supabase) {
      supabase.auth.getUser().then(({ data }) => {
        if (data.user) {
          supabase!.auth.updateUser({ data: { preferred_language: l } }).catch(() => {});
        }
      }).catch(() => {});
    }
  }, []);

  // On login, restore saved language preference from Supabase user metadata
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.onAuthStateChange((_event, session) => {
      const pref = session?.user?.user_metadata?.preferred_language as Language | undefined;
      if (pref === "en" || pref === "hi") {
        setLanguageState(pref);
        try { localStorage.setItem("curecheck-lang", pref); } catch {}
        document.documentElement.lang = pref === "hi" ? "hi" : "en";
      }
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const t = useCallback((enStr: string, hiStr: string) => {
    return language === "hi" ? hiStr : enStr;
  }, [language]);

  const tKey = useCallback((key: string) => {
    const locale = (language === "hi" ? hi : en) as unknown as Record<string, unknown>;
    return getNestedValue(locale, key) ?? key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, tKey }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
