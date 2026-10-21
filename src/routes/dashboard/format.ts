/**
 * Numbers and days as the counter pages print them. Here rather than in
 * `src/lib`, which the redesign leaves alone.
 */

/** A count in the page's language: "2,500", never "2500". */
export function formatCount(value: number, language?: string): string {
  return new Intl.NumberFormat(language).format(value);
}
