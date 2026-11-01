import { describe, expect, it } from "vitest";
import en from "../../i18n/locales/en/common.json";
import he from "../../i18n/locales/he/common.json";
import type { InfoPageKey, InfoSection } from "./infoCopy";

/**
 * The reading pages' copy, in the shape `InfoSections` draws. `kitCopy`
 * already checks that both languages have the same keys; this checks what
 * keys alone can't: that a section is the same anchor in both, so a link to
 * `/privacy#rights` lands in either language, and that the address is
 * always a link.
 */

const PAGES: InfoPageKey[] = ["contact", "privacy", "terms"];
const LANGUAGES = { en: en.info, he: he.info };

function sections(language: keyof typeof LANGUAGES, page: InfoPageKey) {
  return LANGUAGES[language][page].sections as InfoSection[];
}

function lines(section: InfoSection) {
  return section.blocks.flat();
}

describe.each(PAGES)("the %s page", (page) => {
  it("has the same sections, in the same order, in both languages", () => {
    expect(sections("he", page).map((s) => s.id)).toEqual(sections("en", page).map((s) => s.id));
  });

  it("gives each section a unique anchor a URL can carry", () => {
    const ids = sections("en", page).map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z]+(-[a-z]+)*$/);
  });

  it.each(Object.keys(LANGUAGES) as (keyof typeof LANGUAGES)[])("has a heading and words in every section in %s", (language) => {
    for (const section of sections(language, page)) {
      expect(section.heading.trim(), section.id).not.toBe("");
      expect(section.blocks.length, section.id).toBeGreaterThan(0);
      for (const block of section.blocks) {
        if (Array.isArray(block)) expect(block.length, section.id).toBeGreaterThan(0);
      }
    }
  });

  it("names the address only as a link", () => {
    for (const language of Object.keys(LANGUAGES) as (keyof typeof LANGUAGES)[]) {
      for (const section of sections(language, page)) {
        for (const line of lines(section)) {
          const bare = line.replace(/<email>\{\{email\}\}<\/email>/g, "");
          expect(bare, `${language} ${section.id}`).not.toContain("{{email}}");
          expect(bare, `${language} ${section.id}`).not.toMatch(/@|<\/?email>/);
        }
      }
    }
  });

  it("mentions the address in the same sections in both languages", () => {
    const mentions = (language: keyof typeof LANGUAGES) =>
      sections(language, page).map((s) => lines(s).filter((line) => line.includes("<email>")).length);
    expect(mentions("he")).toEqual(mentions("en"));
  });
});

describe("the reading pages' copy", () => {
  it("has no em dash in either language", () => {
    expect(JSON.stringify(en.info)).not.toContain("—");
    expect(JSON.stringify(he.info)).not.toContain("—");
  });
});
