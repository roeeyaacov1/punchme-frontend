import { describe, expect, it } from "vitest";
import { WALLET_WAIT_MS, deviceWallet, walletWait } from "./wallet";

const nav = (userAgent: string, platform = "", maxTouchPoints = 0) => ({ userAgent, platform, maxTouchPoints });

describe("deviceWallet", () => {
  it("names the wallet a phone has", () => {
    expect(deviceWallet(nav("Mozilla/5.0 (Linux; Android 14; Pixel 8) Chrome/126"))).toBe("google");
    expect(deviceWallet(nav("Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X)"))).toBe("apple");
  });

  it("knows an iPad that calls itself a Mac", () => {
    expect(deviceWallet(nav("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)", "MacIntel", 5))).toBe("apple");
  });

  it("says neither for a desktop, or with no navigator at all", () => {
    expect(deviceWallet(nav("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)", "MacIntel", 0))).toBe("other");
    expect(deviceWallet(nav("Mozilla/5.0 (Windows NT 10.0; Win64; x64)", "Win32"))).toBe("other");
    expect(deviceWallet(undefined)).toBe("other");
  });
});

describe("walletWait", () => {
  it("is ready once the link exists, pending or not", () => {
    expect(walletWait({ wallet_pass_url: "https://pass", wallet_issue_pending: true }, 0)).toBe("ready");
    expect(walletWait({ wallet_pass_url: "https://pass", wallet_issue_pending: false }, 0)).toBe("ready");
  });

  it("waits for three minutes, then stops and says so", () => {
    const pending = { wallet_pass_url: null, wallet_issue_pending: true };
    expect(walletWait(pending, 0)).toBe("waiting");
    expect(walletWait(pending, WALLET_WAIT_MS - 1)).toBe("waiting");
    expect(walletWait(pending, WALLET_WAIT_MS)).toBe("slow");
  });

  it("waits for nothing that isn't being issued", () => {
    expect(walletWait({ wallet_pass_url: null, wallet_issue_pending: false }, 0)).toBe("none");
  });
});
