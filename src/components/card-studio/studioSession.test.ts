import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CardStudioValue } from "./studioDraft";
import { dropKept, keepEdits, keepPicture, readKept } from "./studioSession";

const storage = new Map<string, string>();
const sessionStorageStub = {
  getItem: (key: string) => storage.get(key) ?? null,
  setItem: (key: string, value: string) => void storage.set(key, String(value)),
  removeItem: (key: string) => void storage.delete(key),
  clear: () => storage.clear(),
};

beforeEach(() => {
  vi.stubGlobal("sessionStorage", sessionStorageStub);
  storage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const SAVED: CardStudioValue = {
  name: "כרטיסיית קפה",
  stamps_required: 8,
  reward_description: "קפה חינם",
  background_color: "#4B2E1E",
  foreground_color: "#FFFFFF",
  label_color: "#D2B48C",
  design: {},
};

describe("the draft kept in the tab", () => {
  it("comes back with the card its edits started from", () => {
    const value = { ...SAVED, reward_description: "מאפה חינם" };
    keepEdits("biz", "tpl", { base: SAVED, value, follow: false });
    keepPicture("biz", "tpl", "logo", "data:image/png;base64,AAAA");
    expect(readKept("biz", "tpl")).toEqual({
      base: SAVED,
      value,
      follow: false,
      held: { logo: "data:image/png;base64,AAAA" },
    });
  });

  it("doesn't come back without the card its edits started from", () => {
    storage.set("punchme.draft:biz/design/tpl", JSON.stringify({ value: SAVED, follow: false }));
    expect(readKept("biz", "tpl")).toBeNull();
  });

  it("goes, pictures and all, when dropped", () => {
    keepEdits("biz", "tpl", { base: SAVED, value: SAVED, follow: false });
    keepPicture("biz", "tpl", "logo", "data:image/png;base64,AAAA");
    dropKept("biz", "tpl");
    expect(storage.size).toBe(0);
  });
});
