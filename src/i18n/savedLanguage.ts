import { SUPPORTED_LANGS, type SupportedLang } from "./languages";

/** Where the language is kept between visits: the key i18next's own
 * detector kept it under, so a language saved before still counts, and the
 * one `index.html` reads to pick the manifest's language. */
const LANGUAGE_KEY = "i18nextLng";

interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

/**
 * The language this browser saved last time, when it is one the app is
 * written in.
 *
 * Read straight from storage. i18next's own localStorage lookup reads only
 * after a test write succeeds, and a phone whose storage is full refuses
 * that write, so the saved language was skipped and the page opened in the
 * browser's. Full storage still reads; only storage that can't be read at
 * all, or that holds no language of ours, leaves it to the browser's.
 */
export function savedLanguage(storage: StorageLike | null | undefined): SupportedLang | undefined {
  try {
    const saved = storage?.getItem(LANGUAGE_KEY);
    return SUPPORTED_LANGS.find((lang) => lang === saved);
  } catch {
    return undefined;
  }
}

/** Keeps the language for the next visit, when storage takes it. It never
 * throws, because i18next calls it partway through a switch: full or
 * blocked storage refuses quietly, the page switches anyway, and the
 * language saved before stays saved. */
export function saveLanguage(storage: StorageLike | null | undefined, lang: string): void {
  try {
    storage?.setItem(LANGUAGE_KEY, lang);
  } catch {
    // Refused: the switch lasts until the page closes.
  }
}
