/** The languages the app is written in. Kept apart from `index.ts`, which
 * starts i18next and touches the document as it loads, so the rule below
 * can be tested on its own. */
export const SUPPORTED_LANGS = ["he", "en"] as const;
export type SupportedLang = (typeof SUPPORTED_LANGS)[number];

function isSupported(lang: string): lang is SupportedLang {
  return (SUPPORTED_LANGS as readonly string[]).includes(lang);
}

/**
 * The language a first visit opens in: the first of the browser's
 * languages the app is written in, and Hebrew when it asks for neither
 * (decision D11 in docs/redesign/guide.md).
 *
 * Tags match on their language part ("he-IL" is Hebrew, "en-GB" English),
 * in the browser's order. That is why this exists instead of the
 * detector's own navigator lookup: i18next looks for an exact match
 * across the whole list before it tries language parts, so it would open
 * ["en-US", "he"] in Hebrew. "iw" is Hebrew's retired code, which some
 * older Android browsers still send.
 */
export function languageFromBrowser(tags: readonly string[]): SupportedLang {
  for (const tag of tags) {
    const part = tag.trim().toLowerCase().split(/[-_]/)[0];
    const lang = part === "iw" ? "he" : part;
    if (isSupported(lang)) return lang;
  }
  return "he";
}
