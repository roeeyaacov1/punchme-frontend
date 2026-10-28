import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "./tokenStore";

const insecure = () => new DOMException("The operation is insecure.", "SecurityError");
let saved: PropertyDescriptor | undefined;

beforeEach(() => {
  saved = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
});

afterEach(() => {
  vi.unstubAllGlobals();
  if (saved) Object.defineProperty(globalThis, "localStorage", saved);
  else delete (globalThis as { localStorage?: Storage }).localStorage;
});

// Safari with every cookie blocked, or a QR reader's web view with storage
// switched off: touching localStorage at all throws, or each call does.
const BLOCKED: [string, () => void][] = [
  [
    "storage that can't be touched",
    () =>
      Object.defineProperty(globalThis, "localStorage", {
        configurable: true,
        get() {
          throw insecure();
        },
      }),
  ],
  [
    "storage whose every call throws",
    () =>
      vi.stubGlobal("localStorage", {
        getItem: () => {
          throw insecure();
        },
        setItem: () => {
          throw insecure();
        },
        removeItem: () => {
          throw insecure();
        },
      }),
  ],
];

describe.each(BLOCKED)("the token store, with %s", (_, block) => {
  it("reads no session rather than throwing", () => {
    block();
    expect(getRefreshToken()).toBeNull();
  });

  it("signs in for this tab and signs out again without throwing", () => {
    block();
    expect(() => setTokens({ access: "this-tab-only", refresh: "kept-nowhere" })).not.toThrow();
    expect(getAccessToken()).toBe("this-tab-only");
    expect(() => clearTokens()).not.toThrow();
    expect(getAccessToken()).toBeNull();
  });
});
