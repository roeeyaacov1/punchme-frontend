/**
 * The one address PunchMe answers at, for card holders and owners alike. It
 * forwards to the team's inbox (tested 31 Oct 2026). The copy names it as
 * `<email>{{email}}</email>`, so every mention is a link and the address
 * lives here only.
 */
export const SUPPORT_EMAIL = "support@punchmeapp.com";

/** The three reading pages, each with its copy under `info.<page>`. */
export type InfoPageKey = "contact" | "privacy" | "terms";

/**
 * A paragraph is a string and a list is an array of them, so the copy keeps
 * its shape in both languages without a key per line.
 */
export type InfoBlock = string | string[];

/** A section as the copy holds it. `id` is its anchor, the same in both languages. */
export interface InfoSection {
  id: string;
  heading: string;
  blocks: InfoBlock[];
}
