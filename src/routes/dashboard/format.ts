import { startOfDay } from "./activityFilters";

/**
 * Numbers and days as the counter pages print them. Here rather than in
 * `src/lib`, which the redesign leaves alone.
 */

/** A count in the page's language: "2,500", never "2500". */
export function formatCount(value: number, language?: string): string {
  return new Intl.NumberFormat(language).format(value);
}

/** "Tue, 14 Oct", "יום ג׳, 14 באוק׳". */
export function weekdayDate(ms: number, language?: string): string {
  return new Date(ms).toLocaleDateString(language, { weekday: "short", day: "numeric", month: "short" });
}

/** "14 Oct", "14 באוק׳": an axis label. */
export function shortDate(ms: number, language?: string): string {
  return new Date(ms).toLocaleDateString(language, { day: "numeric", month: "short" });
}

/** "09:30". */
export function timeOfDay(ms: number, language?: string): string {
  return new Date(ms).toLocaleTimeString(language, { hour: "2-digit", minute: "2-digit" });
}

/** Today and yesterday by name, every other day by its weekday and date. */
export function relativeDay(
  day: number,
  language: string | undefined,
  words: { today: string; yesterday: string },
  now = Date.now(),
): string {
  const today = startOfDay(now);
  if (day === today) return words.today;
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (day === yesterday.getTime()) return words.yesterday;
  return weekdayDate(day, language);
}
