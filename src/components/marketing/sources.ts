/**
 * Citation targets for the proof band.
 *
 * URLs live here rather than in the translation files because they're
 * identical in every language and must not drift apart. Keyed by the `id`
 * on each entry of `landing.proof.stats`.
 *
 * House rule for this page: every printed number carries a visible,
 * clickable source. If a claim can't be linked to one of these, it doesn't
 * go on the page.
 */
export const PROOF_SOURCE_URLS: Record<string, string> = {
  // Regulars generate ~6x more annual revenue. US transaction data covering
  // Jan 2019 – Dec 2025; "regular" = visits at least four times a year.
  square: "https://squareup.com/us/en/press/2026-local-economy-report",

  // "Acquiring a new customer is anywhere from five to 25 times more
  // expensive than retaining an existing one." Amy Gallo, 29 Oct 2014,
  // drawing on Frederick Reichheld's work at Bain. Directionally credible
  // rather than a controlled study — cited to HBR, and phrased as a range.
  hbr: "https://hbr.org/2014/10/the-value-of-keeping-the-right-customers",

  // 58% less likely to join a loyalty program requiring an app download;
  // 79% more likely to join one with no physical card. Harris Poll for
  // Wilbur, 2019. The published write-up never disclosed a sample size,
  // which is why the year is printed on the page.
  harris:
    "https://www.mytotalretail.com/article/survey-consumers-less-likely-to-join-a-loyalty-program-that-collects-personal-data-or-requires-an-app/",
};
