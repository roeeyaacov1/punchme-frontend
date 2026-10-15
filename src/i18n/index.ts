import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import he from "./locales/he/common.json";
import en from "./locales/en/common.json";
import {
  SUPPORTED_LANGS,
  languageFromBrowser,
  type SupportedLang,
} from "./languages";

export { SUPPORTED_LANGS, type SupportedLang };

const RTL_LANGS: SupportedLang[] = ["he"];

function applyDirection(lang: string) {
  const isRtl = RTL_LANGS.includes(lang as SupportedLang);
  document.documentElement.dir = isRtl ? "rtl" : "ltr";
  document.documentElement.lang = lang;
}

// The browser's languages, read by `languageFromBrowser` rather than the
// detector's own "navigator" lookup (languages.ts says why). It always
// names a language the app is written in.
const detector = new LanguageDetector();
detector.addDetector({
  name: "browserOrHebrew",
  lookup: () =>
    languageFromBrowser(
      navigator.languages?.length ? navigator.languages : [navigator.language],
    ),
});

i18n
  .use(detector)
  .use(initReactI18next)
  .init({
    resources: {
      he: { common: he },
      en: { common: en },
    },
    ns: ["common"],
    defaultNS: "common",
    // Only the fallback for a key one language lacks, as before. The
    // detector always lands on a supported language, so this no longer
    // decides which language a visit opens in.
    fallbackLng: "en",
    supportedLngs: SUPPORTED_LANGS,
    detection: {
      // The language this browser had last time wins: the detector keeps
      // it in localStorage, so a switch with the toggle sticks. A first
      // visit opens in the browser's language, and in Hebrew when the
      // browser asks for neither (decision D11).
      order: ["localStorage", "browserOrHebrew"],
      caches: ["localStorage"],
    },
    interpolation: { escapeValue: false },
  });

applyDirection(i18n.resolvedLanguage ?? "he");
i18n.on("languageChanged", applyDirection);

export default i18n;
