import { useCallback, useEffect, useState } from "react";
import {
  canPrompt,
  isInstalled,
  promptInstall,
  subscribe,
} from "./installPrompt";

/**
 * Whether to offer the owner a home-screen icon, and how.
 *
 * The two platforms are not two flavours of the same thing. Chrome hands the
 * page a real install prompt and one tap does it. Safari has no such API and
 * never will have had one by the time this ships — on iOS the owner does it
 * by hand from the Share sheet, so all the app can do is say where the
 * button is. Pretending otherwise (a button that "installs" by opening
 * instructions) is the kind of thing that makes someone distrust the next
 * button too.
 */

const DISMISSED_KEY = "punchme.installDismissed";

export type InstallRoute =
  /** Chrome and friends: a real prompt is waiting to be spent. */
  | "prompt"
  /** iOS: reachable, but only through the Share sheet, by hand. */
  | "ios"
  /** Already on the home screen, or a browser that cannot install at all. */
  | "none";

function isIos(): boolean {
  if (typeof navigator === "undefined") return false;
  if (/iphone|ipad|ipod/i.test(navigator.userAgent)) return true;
  // iPadOS 13+ claims to be a Mac. A Mac with a touchscreen is an iPad.
  return (
    navigator.platform === "MacIntel" &&
    typeof navigator.maxTouchPoints === "number" &&
    navigator.maxTouchPoints > 1
  );
}

function wasDismissed(): boolean {
  try {
    return localStorage.getItem(DISMISSED_KEY) === "1";
  } catch {
    return false;
  }
}

export interface InstallApp {
  /** Which of the two paths applies, if either. */
  route: InstallRoute;
  /** Running from the home screen already — nothing to offer. */
  installed: boolean;
  /** The owner has said no; keep it out of the way but still findable. */
  dismissed: boolean;
  /** Chrome only. Resolves once the owner has answered the browser. */
  install: () => Promise<"accepted" | "dismissed" | null>;
  dismiss: () => void;
  /** Undo a dismissal — the entry in the account menu never disappears. */
  restore: () => void;
}

export function useInstallApp(): InstallApp {
  const [, force] = useState(0);
  const [dismissed, setDismissed] = useState(wasDismissed);

  // The prompt can arrive well after mount (Chrome waits for a bit of
  // engagement), and `appinstalled` can arrive at any time.
  useEffect(() => subscribe(() => force((n) => n + 1)), []);

  const installed = isInstalled();
  const route: InstallRoute = installed
    ? "none"
    : canPrompt()
      ? "prompt"
      : isIos()
        ? "ios"
        : "none";

  const install = useCallback(async () => {
    const outcome = await promptInstall();
    if (outcome === "accepted") {
      try {
        localStorage.removeItem(DISMISSED_KEY);
      } catch {
        /* nothing to clean up */
      }
    }
    return outcome;
  }, []);

  const dismiss = useCallback(() => {
    try {
      localStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      /* the choice still holds for this session */
    }
    setDismissed(true);
  }, []);

  const restore = useCallback(() => {
    try {
      localStorage.removeItem(DISMISSED_KEY);
    } catch {
      /* nothing to clean up */
    }
    setDismissed(false);
  }, []);

  return { route, installed, dismissed, install, dismiss, restore };
}
