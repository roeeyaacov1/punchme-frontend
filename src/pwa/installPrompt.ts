/**
 * Holding on to the one chance Chrome gives you.
 *
 * `beforeinstallprompt` fires once, early — often before React has mounted —
 * and if nothing calls `preventDefault()` on it the browser handles the
 * install its own way and the event is gone. There is no way to ask for it
 * again. So it is captured here, at import time from `main.tsx`, and parked
 * until a component is ready to spend it.
 *
 * Safari never fires it at all. That is not a gap to work around: iOS has no
 * programmatic install, and the honest answer there is to show the owner
 * where the Share button is. See `useInstallApp`.
 */

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

let parked: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();

function announce() {
  for (const listener of listeners) listener();
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function canPrompt(): boolean {
  return parked !== null;
}

/**
 * Spends the parked event. Resolves to what the owner chose, or null if
 * there was nothing to spend.
 *
 * The event is dropped either way: a prompt that has been shown once cannot
 * be shown again, and Chrome will hand us a fresh one later if the owner
 * declined and the site still qualifies.
 */
export async function promptInstall(): Promise<
  "accepted" | "dismissed" | null
> {
  const event = parked;
  if (!event) return null;
  parked = null;
  announce();
  await event.prompt();
  const { outcome } = await event.userChoice;
  return outcome;
}

/** Whether the page is running as an installed app rather than in a tab. */
export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const modes = ["standalone", "fullscreen", "minimal-ui"];
  if (modes.some((mode) => window.matchMedia(`(display-mode: ${mode})`).matches)) {
    return true;
  }
  // Safari's own, older flag — still the only signal on iOS.
  return (navigator as { standalone?: boolean }).standalone === true;
}

let installed = isStandalone();

export function isInstalled(): boolean {
  return installed;
}

/** Registered from `main.tsx` before render, so nothing is missed. */
export function watchForInstallPrompt() {
  window.addEventListener("beforeinstallprompt", (event) => {
    // Without this Chrome shows its own mini-infobar and the event is spent.
    event.preventDefault();
    parked = event as BeforeInstallPromptEvent;
    announce();
  });

  window.addEventListener("appinstalled", () => {
    parked = null;
    installed = true;
    announce();
  });
}
