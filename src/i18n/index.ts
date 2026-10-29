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
import { saveLanguage, savedLanguage } from "./savedLanguage";

export { SUPPORTED_LANGS, type SupportedLang };

const RTL_LANGS: SupportedLang[] = ["he"];

function applyDirection(lang: string) {
  const isRtl = RTL_LANGS.includes(lang as SupportedLang);
  document.documentElement.dir = isRtl ? "rtl" : "ltr";
  document.documentElement.lang = lang;
}

/** This browser's localStorage, or null where even reaching for it throws
 * (storage blocked). */
function browserStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

// The language saved last time, read and kept by `savedLanguage.ts` rather
// than the detector's own "localStorage" lookup (savedLanguage.ts says why).
const detector = new LanguageDetector();
detector.addDetector({
  name: "savedLanguage",
  lookup: () => savedLanguage(browserStorage()),
  cacheUserLanguage: (lng) => saveLanguage(browserStorage(), lng),
});
// The browser's languages, read by `languageFromBrowser` rather than the
// detector's own "navigator" lookup (languages.ts says why). It always
// names a language the app is written in.
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
      // The language this browser had last time wins: it is kept in
      // localStorage, so a switch with the toggle sticks, and it is read
      // back even when the phone's storage is full. A first visit opens in
      // the browser's language, and in Hebrew when the browser asks for
      // neither (decision D11).
      order: ["savedLanguage", "browserOrHebrew"],
      caches: ["savedLanguage"],
    },
    interpolation: { escapeValue: false },
  });

applyDirection(i18n.resolvedLanguage ?? "he");
i18n.on("languageChanged", applyDirection);

export default i18n;
