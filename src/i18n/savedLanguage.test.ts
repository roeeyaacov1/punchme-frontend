import { describe, expect, it } from "vitest";
import { saveLanguage, savedLanguage } from "./savedLanguage";

function storage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    data,
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value);
    },
  };
}

/** A phone whose storage is full: what is there still reads, but every
 * write is refused, a test key's included. */
function fullStorage(initial: Record<string, string> = {}) {
  return {
    ...storage(initial),
    setItem: () => {
      throw new DOMException("quota", "QuotaExceededError");
    },
  };
}

/** Storage the browser won't let the page use at all. */
const blocked = {
  getItem: () => {
    throw new DOMException("denied", "SecurityError");
  },
  setItem: () => {
    throw new DOMException("denied", "SecurityError");
  },
};

describe("savedLanguage", () => {
  it("reads the language saved last time", () => {
    expect(savedLanguage(storage({ i18nextLng: "he" }))).toBe("he");
    expect(savedLanguage(storage({ i18nextLng: "en" }))).toBe("en");
  });

  it("reads it from full storage too", () => {
    expect(savedLanguage(fullStorage({ i18nextLng: "he" }))).toBe("he");
    expect(savedLanguage(fullStorage({ i18nextLng: "en" }))).toBe("en");
  });

  it("says nothing when no language was saved, so the browser's decides", () => {
    expect(savedLanguage(storage())).toBeUndefined();
    expect(savedLanguage(fullStorage())).toBeUndefined();
  });

  it("ignores a saved value the app isn't written in", () => {
    expect(savedLanguage(storage({ i18nextLng: "fr" }))).toBeUndefined();
    // i18next's own mode, which shows keys instead of copy.
    expect(savedLanguage(storage({ i18nextLng: "cimode" }))).toBeUndefined();
  });

  it("says nothing, rather than throwing, when storage can't be read", () => {
    expect(savedLanguage(blocked)).toBeUndefined();
    expect(savedLanguage(null)).toBeUndefined();
  });
});

describe("saveLanguage", () => {
  it("keeps a switch for the next visit", () => {
    const kept = storage({ i18nextLng: "he" });
    saveLanguage(kept, "en");
    expect(kept.data.get("i18nextLng")).toBe("en");
  });

  it("fails quietly when storage is full, and the language saved before stays", () => {
    const full = fullStorage({ i18nextLng: "he" });
    expect(() => saveLanguage(full, "en")).not.toThrow();
    expect(full.data.get("i18nextLng")).toBe("he");
  });

  it("fails quietly where storage is blocked or missing", () => {
    expect(() => saveLanguage(blocked, "en")).not.toThrow();
    expect(() => saveLanguage(null, "en")).not.toThrow();
  });
});
