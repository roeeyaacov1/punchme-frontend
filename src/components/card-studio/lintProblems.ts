/**
 * The server's check (`DesignOut.lint`, apps/wallet/lint.py), read by kind
 * rather than printed: its strings are developer English, and one kind of
 * them isn't a problem at all.
 *
 * - **Pictures not made yet:** the logos, the icon, and the strip and hero
 *   for each stamp state. The save's own sync makes them, so before a save
 *   they say nothing, and on a card with no edits they mean the last sync
 *   hasn't finished, which the sync notice already covers.
 * - **A field the layout can't place:** named on its row in Wallet details.
 * - **The wallet's advice:** passbox-api's warnings, which never stop a save
 *   or an update, so they are said quietly and never as a problem. Its
 *   warning that a pass has no contact details isn't said at all.
 * - **Anything else**, including whatever a later version adds: said once,
 *   plainly, with the server's own words folded under it.
 *
 * It reads the English by pattern, so a reworded message falls through to
 * "anything else", which is the safe side to fall on.
 */

export interface FieldProblem {
  /** The field's binding, which the server uses as its name. */
  binding?: string;
  /** Its place in `design.fields`, when the server names it by index. */
  index?: number;
  /** The server's words. */
  text: string;
}

export interface LintReading {
  pending: string[];
  fields: FieldProblem[];
  /** The wallet's advice on the card's look (passbox-api's warnings): the
   * card saves and its passes update all the same. */
  advice: string[];
  other: string[];
}

const PENDING = [
  /^missing (Apple logo|Google logo|icon) image\b/,
  /^missing (Apple strip|Google hero) images for states:/,
];

/** passbox-api's warnings, each only ever a warning (its `lint.py`). The
 * backend hands them over without their level (`_lint_line`), so they are
 * known by their words, and a passbox error stays a problem, such as a change
 * message without its `%@`. The warnings cover:
 * - a panel too close to the card's colour;
 * - the name beside a wide logo;
 * - more header or row fields than a store card shows;
 * - a colour that contrasts too little;
 * - a name or label past what Google Wallet shows;
 * - a name the generated logo can't set;
 * - a logo Google draws small in its circle;
 * - an option that draws nothing;
 * - more stamps than the card holds. */
const ADVICE = [
  /^design\.art\.panel_color: /,
  /^design\.logo_text: /,
  /^design\.fields: \d+ header fields\b/,
  /\ban Apple store card shows \d+ and hides the rest\b/,
  /\bcontrasts? \d+(?:\.\d+)?:1 with\b/,
  /\bGoogle Wallet shows about \d+ characters of\b/,
  /\bthe generated logo\b/,
  /\bGoogle Wallet shows the logo in a circle\b/,
  /\b(?:shows|applies) only (?:on|to) icon-style stamps\b/,
  /\bhas nothing to tint\b/,
  /\bcomes before the sticker, so it never shows\b/,
  /\bcovers the wallpaper\b/,
  /\bit shows as a full card\b/,
];

/** passbox-api's warning that a pass has no contact details for its back.
 * A platform's contact stands in, so passes still go out, and the studio has
 * nowhere to add one yet. It would be advice an owner couldn't follow, so it
 * isn't said. */
const UNSAID = [/\bno contact details for the back of the pass\b/];

/** "field meta.custom: missing usage flags", "field X: classTemplateInfo never references …" */
const NAMED_FIELD = /^field ([^:\s]+): /;
/** "design.fields.3 has no binding" */
const INDEXED_FIELD = /^design\.fields\.(\d+)\b/;

export function readLint(lint: readonly string[] | undefined): LintReading {
  const reading: LintReading = { pending: [], fields: [], advice: [], other: [] };
  for (const text of lint ?? []) {
    if (PENDING.some((pattern) => pattern.test(text))) {
      reading.pending.push(text);
      continue;
    }
    if (UNSAID.some((pattern) => pattern.test(text))) continue;
    if (ADVICE.some((pattern) => pattern.test(text))) {
      reading.advice.push(text);
      continue;
    }
    const named = NAMED_FIELD.exec(text);
    if (named && named[1] !== "?") {
      reading.fields.push({ binding: named[1], text });
      continue;
    }
    const indexed = INDEXED_FIELD.exec(text);
    if (indexed) {
      reading.fields.push({ index: Number(indexed[1]), text });
      continue;
    }
    reading.other.push(text);
  }
  return reading;
}

/** The problems that belong to one field of the card, by binding or index. */
export function problemsFor(reading: LintReading, binding: string, index: number): FieldProblem[] {
  return reading.fields.filter((problem) => problem.binding === binding || problem.index === index);
}
