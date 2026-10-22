import { failureCause, type FailureCause } from "./scan/answer";

/**
 * What a counter page says when a read or a change didn't go through: one
 * sentence per cause, in the page's language, ending in what to do. Never
 * the server's own sentence, which is English and written for developers.
 * Scan's answers say "scan again" in their own words (`CAUSE_KEYS`).
 */
const PROBLEM_KEYS: Record<FailureCause, string> = {
  offline: "dashboard.problem.offline",
  server: "dashboard.problem.server",
  busy: "dashboard.problem.busy",
  refused: "dashboard.problem.refused",
  other: "dashboard.problem.other",
};

export function problemKey(error: unknown): string {
  return PROBLEM_KEYS[failureCause(error)];
}

/**
 * A name set inside a sentence that is only a string, such as a toast's:
 * first-strong isolated, the way `<bdi>` isolates one in markup, so
 * "Bartholomew Fitzgerald-Montgomery III" keeps its order inside Hebrew
 * and a Hebrew name keeps its own inside English.
 */
export function isolate(text: string): string {
  return `⁨${text}⁩`;
}
