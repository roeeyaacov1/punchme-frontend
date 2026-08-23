// A customer types their name once, at a counter, on a phone keyboard — so
// it arrives as "DANA COHEN", "dana cohen" or "Dana COHEN" about as often as
// it arrives clean. That name is printed on a wallet pass and listed in the
// owner's customer table, so it is cased here, once, rather than patched up
// at every place that shows it: first letter of each part up, the rest down.
//
// Hebrew has no case, so a Hebrew name comes out of this untouched — only
// the trim and the collapsed spacing apply.

/** A run of a name: everything up to the next space or hyphen. */
const PART = /[^\s-]+/g;

/** "DANA BEN-ARI  " -> "Dana Ben-Ari". Hyphenated parts are cased on both
 * sides, the way such a name is actually written. */
export function toNameCase(value: string): string {
  return value.trim().replace(/\s+/g, " ").replace(PART, casePart);
}

function casePart(part: string): string {
  const cased = part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
  // O'Brien, D'Angelo — but only after a single letter. In a transliterated
  // Hebrew name the apostrophe is a geresh in the middle of a word, and
  // "Sa'ar" must not come back as "Sa'Ar".
  return cased.replace(/^(.['’])(.)/u, (_, prefix: string, next: string) =>
    prefix + next.toUpperCase(),
  );
}
