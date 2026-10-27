import { describe, expect, it } from "vitest";
import { problemsFor, readLint } from "./lintProblems";

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

describe("readLint", () => {
  it("sets the pictures a save makes aside, saying nothing about them", () => {
    expect(readLint(PENDING)).toEqual({ pending: PENDING, fields: [], other: [] });
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
    expect(readLint(undefined)).toEqual({ pending: [], fields: [], other: [] });
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
