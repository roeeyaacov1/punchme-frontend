import { describe, expect, it } from "vitest";
import { adviceShown, problemsFor, readLint } from "./lintProblems";

// The real strings, as apps/wallet/lint.py writes them.
const PENDING = [
  "missing Apple logo image (uploaded or generated at first sync)",
  "missing Google logo image (uploaded or generated at first sync)",
  "missing icon image (uploaded or generated at first sync)",
  "missing Apple strip images for states: 9, 10, 11, 12",
  "missing Google hero images for states: 9, 10, 11, 12",
];
const FIELD = [
  "field meta.custom: missing usage flags (renders on neither wallet)",
  "field meta.custom_2: missing googlePayFieldRenderOptions",
  "field meta.custom: classTemplateInfo never references object.textModulesData['meta-custom'] (renders nowhere on Google)",
  "design.fields.3 has no binding",
];
const OTHER = [
  "googlePaySettings.classTemplateInfo missing (Google renders nothing)",
  "googlePaySettings.classTemplateInfo is not valid JSON",
  "classTemplateInfo references object.textModulesData['meta-hours'] with no matching field",
  "field ?: missing usage flags (renders on neither wallet)",
  "something a later version says",
];

// passbox-api's warnings about the design options, as the backend's
// `_lint_line` writes them (an engine path made a request path).
const ADVICE = [
  "design.art.panel_color: the panel contrasts 1.04:1 with the background, so it won't show",
  "design.logo_text: the logo is 1980x660, a wordmark: the name beside it repeats it and gets little room; upload a square mark or turn logo_text off",
  "design.fields: 2 header fields beside the logo text, the stamps included; the top of a store card fits 1, and more crowd the logo",
];

// The rest of its warnings, in the words its lint.py writes them. They are
// read by their words, so the paths here are only examples.
const WARNINGS = [
  "design.colors.foreground: text contrasts 2.4:1 with the background; below 3:1 it's hard to read",
  "design.colors.label: labels contrast 2.1:1 with the background; below 3:1 they're hard to read",
  "design.art.stamp_color: filled stamps contrast 1.9:1 with the panel; below 3:1 they blend in",
  "name: Google Wallet shows about 20 characters of the program's name; this one has 26, so the phone may cut it off",
  "merchant.name: the name is too long for the generated logo: it would be 9 pt tall; upload a logo or shorten the name",
  "design.images.logo: logo is 600x200; Google Wallet shows the logo in a circle, so one that isn't square is drawn small inside it: upload a square logo",
  "design.fields: 4 secondary and auxiliary fields besides the stamp card's own 1; an Apple store card shows 4 and hides the rest",
  "design.art.wallpaper: the strip base covers the wallpaper",
  "state.stamps: 9 stamps on a 8-stamp card; it shows as a full card",
];
const CONTACT =
  "merchant.contact: the merchant has no contact details for the back of the pass; add a phone, WhatsApp, email, website or address";
/** The second line passbox-api v0.1.1 sends about it, on every card. */
const CONTACT_APPLE =
  "merchant.contact: the back of the pass has no contact details, which Apple asks for (GUIDE §5.1): set the merchant's contact, or build with a Platform";

describe("readLint", () => {
  it("sets the pictures a save makes aside, saying nothing about them", () => {
    expect(readLint(PENDING)).toEqual({ pending: PENDING, fields: [], advice: [], other: [] });
  });

  it("reads the wallet's warnings about the design options as advice, not a problem", () => {
    expect(readLint(ADVICE)).toEqual({ pending: [], fields: [], advice: ADVICE, other: [] });
  });

  it("reads the wallet's other warnings as advice too: a colour, a name, the logo, the fields", () => {
    expect(readLint(WARNINGS)).toEqual({ pending: [], fields: [], advice: WARNINGS, other: [] });
  });

  it("leaves the wallet's missing-contact warning unsaid: there is nowhere to add one", () => {
    expect(readLint([CONTACT, ...ADVICE])).toEqual({ pending: [], fields: [], advice: ADVICE, other: [] });
  });

  it("leaves its second missing-contact line, Apple's, unsaid too: never a problem", () => {
    expect(readLint([CONTACT, CONTACT_APPLE, ...ADVICE])).toEqual({ pending: [], fields: [], advice: ADVICE, other: [] });
  });

  it("says a line once, however many times the server sends it", () => {
    const twice = [...ADVICE, ADVICE[0], OTHER[4], OTHER[4]];
    expect(readLint(twice)).toEqual({ pending: [], fields: [], advice: ADVICE, other: [OTHER[4]] });
  });

  it("keeps a wallet error a problem: a change message without its %@", () => {
    const error =
      "kind.stamps_change_message: a change message must contain %@, where Wallet shows the new value; a translation without it counts too";
    expect(readLint([error]).other).toEqual([error]);
  });

  it("keeps a design option's other words a problem: only the warnings it knows are advice", () => {
    const refusal = "design.art.sticker: unknown sticker 'unicorn'";
    expect(readLint([refusal]).other).toEqual([refusal]);
  });

  it("names a field by its binding, or by its place", () => {
    const reading = readLint(FIELD);
    expect(reading.fields.map((p) => p.binding ?? p.index)).toEqual(["meta.custom", "meta.custom_2", "meta.custom", 3]);
    expect(reading.other).toEqual([]);
  });

  it("keeps anything else, and anything it doesn't know, as one problem to say", () => {
    expect(readLint(OTHER).other).toEqual(OTHER);
  });

  it("reads nothing as nothing", () => {
    expect(readLint(undefined)).toEqual({ pending: [], fields: [], advice: [], other: [] });
  });
});

describe("problemsFor", () => {
  it("finds a field's problems by binding or index", () => {
    const reading = readLint(FIELD);
    expect(problemsFor(reading, "meta.custom", 0)).toHaveLength(2);
    expect(problemsFor(reading, "members.tier.name", 3)).toHaveLength(1);
    expect(problemsFor(reading, "person.displayName", 0)).toHaveLength(0);
  });
});

describe("adviceShown", () => {
  const name = "name: Google Wallet shows about 20 characters of the program's name; this one has 26, so the phone may cut it off";
  const contrast = "design.background_color: the text colour contrasts 2.94:1 with the background";

  it("leaves Google's name line to Names where the options are drawn", () => {
    const reading = readLint([name, contrast]);
    expect(adviceShown(reading, { namesSayGoogle: true })).toEqual([contrast]);
  });

  it("lists every piece of advice otherwise", () => {
    const reading = readLint([name, contrast]);
    expect(adviceShown(reading, { namesSayGoogle: false })).toEqual([name, contrast]);
  });
});
