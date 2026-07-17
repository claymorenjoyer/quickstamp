"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { tr, en, type Translation, type Lang, translations } from "./translations";

type LanguageContextType = {
  lang: Lang;
  t: Translation;
  setLang: (l: Lang) => void;
};

const LanguageContext = createContext<LanguageContextType>({
  lang: "tr",
  t: tr,
  setLang: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("tr");

  useEffect(() => {
    const stored = localStorage.getItem("lang") as Lang | null;
    if (stored && (stored === "tr" || stored === "en")) {
      setLangState(stored);
    } else {
      // Default to Turkish
      setLangState("tr");
    }
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem("lang", l);
    document.cookie = `lang=${l};path=/;max-age=31536000;SameSite=Lax`;
    document.documentElement.lang = l === "tr" ? "tr-TR" : "en";
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang === "tr" ? "tr-TR" : "en";
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, t: translations[lang], setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  return useContext(LanguageContext);
}
