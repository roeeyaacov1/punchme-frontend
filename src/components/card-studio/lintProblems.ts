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
  other: string[];
}

const PENDING = [
  /^missing (Apple logo|Google logo|icon) image\b/,
  /^missing (Apple strip|Google hero) images for states:/,
];

/** "field meta.custom: missing usage flags", "field X: classTemplateInfo never references …" */
const NAMED_FIELD = /^field ([^:\s]+): /;
/** "design.fields.3 has no binding" */
const INDEXED_FIELD = /^design\.fields\.(\d+)\b/;

export function readLint(lint: readonly string[] | undefined): LintReading {
  const reading: LintReading = { pending: [], fields: [], other: [] };
  for (const text of lint ?? []) {
    if (PENDING.some((pattern) => pattern.test(text))) {
      reading.pending.push(text);
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
