import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import * as RU from "@/content";
import * as EN from "@/content.en";

/**
 * Лёгкая двуязычность без i18n-библиотеки: RU — канон (content.ts),
 * EN — зеркало той же структуры (content.en.ts). Выбор живёт в
 * localStorage("asys-lang"), дефолт — русский (рынок КР).
 */

export type Lang = "ru" | "en";

/** Пара переводов для строк, живущих прямо в данных (каталог модулей и т.п.) */
export type L = { ru: string; en: string };

const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({
  lang: "ru",
  setLang: () => {},
});

const read = (): Lang => {
  try {
    const v = localStorage.getItem("asys-lang");
    if (v === "en" || v === "ru") return v;
  } catch {
    /* private mode */
  }
  return "ru";
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(read);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem("asys-lang", l);
    } catch {
      /* private mode */
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>;
};

export const useLang = () => {
  const { lang, setLang } = useContext(LangContext);
  // t("рус", "eng") — для одиночных строк в компонентах
  const t = useCallback((ru: string, en: string) => (lang === "ru" ? ru : en), [lang]);
  // l({ru, en}) — для строк, лежащих в данных
  const l = useCallback((s: L) => s[lang], [lang]);
  return { lang, setLang, t, l };
};

/** Весь копирайт лендинга на активном языке (структура = content.ts) */
export const useContent = () => {
  const { lang } = useContext(LangContext);
  return lang === "ru" ? RU : EN;
};
