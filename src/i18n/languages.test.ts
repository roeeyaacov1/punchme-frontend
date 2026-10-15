import { describe, expect, it } from "vitest";
import { languageFromBrowser } from "./languages";

describe("languageFromBrowser", () => {
  it("opens in Hebrew for a Hebrew browser, with or without a region", () => {
    expect(languageFromBrowser(["he-IL", "he"])).toBe("he");
    expect(languageFromBrowser(["he"])).toBe("he");
  });

  it("opens in English for an English browser, whatever the region", () => {
    expect(languageFromBrowser(["en-US"])).toBe("en");
    expect(languageFromBrowser(["en-GB", "en"])).toBe("en");
  });

  it("follows the browser's order, not the first exact match", () => {
    expect(languageFromBrowser(["en-US", "he"])).toBe("en");
    expect(languageFromBrowser(["he-IL", "en"])).toBe("he");
  });

  it("skips languages the app isn't written in", () => {
    expect(languageFromBrowser(["ru-RU", "en-US"])).toBe("en");
    expect(languageFromBrowser(["ar-IL", "he-IL"])).toBe("he");
  });

  it("falls back to Hebrew when the browser asks for neither", () => {
    expect(languageFromBrowser(["ru-RU", "ar"])).toBe("he");
    expect(languageFromBrowser(["fr"])).toBe("he");
    expect(languageFromBrowser([])).toBe("he");
  });

  it("reads Hebrew's retired code, and ignores case and underscores", () => {
    expect(languageFromBrowser(["iw-IL", "en-US"])).toBe("he");
    expect(languageFromBrowser(["EN-us"])).toBe("en");
    expect(languageFromBrowser(["he_IL"])).toBe("he");
  });
});
