import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import he from "./locales/he/common.json";
import en from "./locales/en/common.json";

export const SUPPORTED_LANGS = ["he", "en"] as const;
export type SupportedLang = (typeof SUPPORTED_LANGS)[number];

const RTL_LANGS: SupportedLang[] = ["he"];

function applyDirection(lang: string) {
  const isRtl = RTL_LANGS.includes(lang as SupportedLang);
  document.documentElement.dir = isRtl ? "rtl" : "ltr";
  document.documentElement.lang = lang;
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      he: { common: he },
      en: { common: en },
    },
    ns: ["common"],
    defaultNS: "common",
    fallbackLng: "en",
    supportedLngs: SUPPORTED_LANGS,
    detection: {
      // Default is English regardless of browser/OS locale — only an
      // explicit in-app language switch (cached here) changes it.
      order: ["localStorage"],
      caches: ["localStorage"],
    },
    interpolation: { escapeValue: false },
  });

applyDirection(i18n.resolvedLanguage ?? "en");
i18n.on("languageChanged", applyDirection);

export default i18n;
