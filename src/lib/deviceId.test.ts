import { describe, expect, it } from "vitest";
import { DEVICE_ID_KEY, getDeviceId } from "./deviceId";

function fakeStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    data,
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value);
    },
  };
}

describe("getDeviceId", () => {
  it("mints an id on first use and keeps it", () => {
    const storage = fakeStorage();

    const first = getDeviceId(storage);
    const second = getDeviceId(storage);

    expect(first).toMatch(/^[0-9a-f]{32}$/);
    expect(second).toBe(first);
    expect(storage.data.get(DEVICE_ID_KEY)).toBe(first);
  });

  it("replaces a stored value that is not the shape it minted", () => {
    const storage = fakeStorage({ [DEVICE_ID_KEY]: "not an id" });

    expect(getDeviceId(storage)).toMatch(/^[0-9a-f]{32}$/);
  });

  it("answers null where there is no storage — a chat app's browser", () => {
    expect(getDeviceId(null)).toBeNull();
    expect(getDeviceId(undefined)).toBeNull();
  });

  it("answers null rather than throwing when storage refuses", () => {
    const refusing = {
      getItem: () => {
        throw new Error("SecurityError");
      },
      setItem: () => {
        throw new Error("QuotaExceededError");
      },
    };

    expect(getDeviceId(refusing)).toBeNull();
  });

  it("answers null when a write silently does not stick", () => {
    const forgetful = { getItem: () => null, setItem: () => {} };

    expect(getDeviceId(forgetful)).toBeNull();
  });
});
