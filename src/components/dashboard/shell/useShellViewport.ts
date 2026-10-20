import { useLayoutEffect } from "react";

const FIT = "viewport-fit";

/**
 * What the dashboard asks of the page around it while it is mounted. Each
 * is put back as it was when the dashboard goes, because the other pages
 * haven't been built for them yet.
 *
 * - `viewport-fit=cover`, so the safe-area insets are real numbers: the bar
 *   can stand clear of the home indicator and the rail clear of the notch.
 *   Not for every page: in landscape their sides would run under the notch,
 *   and the landing calculator's bar under the home indicator, until their
 *   own phases give them insets. The pre-paint script in index.html sets it
 *   on a /dashboard load too, so a cold launch from the home screen doesn't
 *   open letterboxed and then jump.
 * - `overscroll-behavior-y: none`, so pulling past the top of the dashboard
 *   in a browser tab doesn't reload it.
 * - `scroll-behavior: auto`, over the landing page's smooth scroll on
 *   <html>, so a new page opens at its top at once and no scroll the app
 *   makes itself is a glide.
 */
export function useShellViewport() {
  useLayoutEffect(() => {
    const root = document.documentElement;
    const viewport = document.querySelector<HTMLMetaElement>('meta[name="viewport"]');
    if (viewport && !viewport.content.includes(FIT)) {
      viewport.content = `${viewport.content}, ${FIT}=cover`;
    }
    const saved = {
      overscroll: root.style.overscrollBehaviorY,
      scroll: root.style.scrollBehavior,
    };
    root.style.overscrollBehaviorY = "none";
    root.style.scrollBehavior = "auto";

    return () => {
      if (viewport) {
        viewport.content = viewport.content
          .split(",")
          .map((part) => part.trim())
          .filter((part) => !part.startsWith(FIT))
          .join(", ");
      }
      root.style.overscrollBehaviorY = saved.overscroll;
      root.style.scrollBehavior = saved.scroll;
    };
  }, []);
}
