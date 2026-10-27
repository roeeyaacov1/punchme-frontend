import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CardStudioValue } from "./studioDraft";
import {
  dropKept,
  dropSyncWait,
  keepEdits,
  keepPicture,
  keepSyncWait,
  keepUploaded,
  readKept,
  readSyncWait,
  readUploaded,
} from "./studioSession";

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
    keepEdits("biz", "tpl", { base: SAVED, value });
    keepPicture("biz", "tpl", "logo", "data:image/png;base64,AAAA");
    expect(readKept("biz", "tpl")).toEqual({
      base: SAVED,
      value,
      held: { logo: "data:image/png;base64,AAAA" },
    });
  });

  it("doesn't come back without the card its edits started from", () => {
    storage.set("punchme.draft:biz/design/tpl", JSON.stringify({ value: SAVED }));
    expect(readKept("biz", "tpl")).toBeNull();
  });

  it("keeps where the sync stood before a save, a card that never synced too", () => {
    expect(readSyncWait("biz", "tpl")).toBeNull();
    keepSyncWait("biz", "tpl", null);
    expect(readSyncWait("biz", "tpl")).toEqual({ before: null });
    keepSyncWait("biz", "tpl", "2026-10-27T10:00:00Z");
    expect(readSyncWait("biz", "tpl")).toEqual({ before: "2026-10-27T10:00:00Z" });
    dropSyncWait("biz", "tpl");
    expect(readSyncWait("biz", "tpl")).toBeNull();
  });

  it("keeps this device's copy of each art picture it sent, past a dropped draft", () => {
    keepUploaded("biz", "tpl", "stamp_art", "data:stamp");
    keepUploaded("biz", "tpl", "stamped_art", "data:full");
    dropKept("biz", "tpl");
    expect(readUploaded("biz", "tpl")).toEqual({ stamp_art: "data:stamp", stamped_art: "data:full" });
  });

  it("says whether a picture was kept, and keeps no older one in its place", () => {
    expect(keepPicture("biz", "tpl", "logo", "data:small")).toBe(true);
    // The tab's storage is full: nothing more fits.
    vi.stubGlobal("sessionStorage", {
      ...sessionStorageStub,
      setItem: () => {
        throw new DOMException("quota", "QuotaExceededError");
      },
    });
    expect(keepPicture("biz", "tpl", "logo", "data:a-photo")).toBe(false);
    expect(readKept("biz", "tpl")).toBeNull();
    expect(storage.has("punchme.draft:biz/design/tpl/logo")).toBe(false);
  });

  it("goes, pictures and all, when dropped", () => {
    keepEdits("biz", "tpl", { base: SAVED, value: SAVED });
    keepPicture("biz", "tpl", "logo", "data:image/png;base64,AAAA");
    dropKept("biz", "tpl");
    expect(storage.size).toBe(0);
  });
});
