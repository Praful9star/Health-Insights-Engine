import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

type Language = "en" | "hi";

interface LanguageContextValue {
  language: Language;
  setLanguage: (l: Language) => void;
  t: (en: string, hi: string) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  language: "en",
  setLanguage: () => {},
  t: (en) => en,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      return (localStorage.getItem("curecheck-lang") as Language) || "en";
    } catch {
      return "en";
    }
  });

  const setLanguage = (l: Language) => {
    setLanguageState(l);
    try { localStorage.setItem("curecheck-lang", l); } catch {}
  };

  const t = (en: string, hi: string) => language === "hi" ? hi : en;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
