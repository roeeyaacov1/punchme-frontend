import { createContext, useContext, useLayoutEffect } from "react";

/**
 * A page that has moved to Lightbox claims the whole screen for it.
 *
 * Until each page's phase, <html> wears the old scope so the pages still
 * waiting render exactly as they did, and the frame wears Lightbox on its
 * own elements. A page that has moved can't live under the old ground, so
 * while one holding a claim is mounted, `useDashboardTheme` puts
 * `theme-lightbox` on <html> instead of the old pair: the page's ground,
 * its overscroll and its native controls are Lightbox too.
 *
 * In Phase 2 only the shell's own pages hold one: the refusal, the page
 * with no page behind it, and the page that failed. Phases 3 to 7 add their
 * pages one by one; Phase 10 makes Lightbox the default and deletes this
 * with the old scopes.
 */
export const LightboxClaim = createContext<(() => () => void) | null>(null);

/** Holds the claim for as long as the calling page is mounted. Before paint,
 * so the page never shows on the old ground first once React is running. */
export function useLightboxPage(): void {
  const claim = useContext(LightboxClaim);
  useLayoutEffect(() => claim?.(), [claim]);
}
