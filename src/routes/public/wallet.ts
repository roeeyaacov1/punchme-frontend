/** Which wallet this phone has: Google on Android, Apple on an iPhone or an
 * iPad, and neither on a desktop, which can't be told apart. */
export type DeviceWallet = "apple" | "google" | "other";

type NavigatorLike = Pick<Navigator, "userAgent" | "platform" | "maxTouchPoints">;

export function deviceWallet(
  nav: NavigatorLike | undefined = typeof navigator === "undefined" ? undefined : navigator,
): DeviceWallet {
  if (!nav) return "other";
  if (/android/i.test(nav.userAgent)) return "google";
  if (/iphone|ipad|ipod/i.test(nav.userAgent)) return "apple";
  // iPadOS 13+ claims to be a Mac. A Mac with a touchscreen is an iPad.
  if (nav.platform === "MacIntel" && typeof nav.maxTouchPoints === "number" && nav.maxTouchPoints > 1) {
    return "apple";
  }
  return "other";
}

/** How long a pass still being issued is waited for, a check every 3 s,
 * before the page stops and says it is taking longer than usual. */
export const WALLET_WAIT_MS = 3 * 60 * 1000;
export const WALLET_CHECK_MS = 3000;

/**
 * Where the add-to-wallet button stands:
 * - `ready`: the link exists;
 * - `waiting`: the pass is being issued and the three minutes aren't up;
 * - `slow`: still being issued after three minutes, so the checks stop;
 * - `none`: no link and nothing being issued (the code works anyway).
 */
export type WalletWait = "ready" | "waiting" | "slow" | "none";

export function walletWait(
  card: { wallet_pass_url: string | null; wallet_issue_pending: boolean },
  waitedMs: number,
): WalletWait {
  if (card.wallet_pass_url) return "ready";
  if (!card.wallet_issue_pending) return "none";
  return waitedMs < WALLET_WAIT_MS ? "waiting" : "slow";
}
