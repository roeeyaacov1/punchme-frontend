import { useCallback, useEffect, useLayoutEffect, useState } from "react";

/**
 * Light or dark, for the dashboard only.
 *
 * The landing page and the wizard are printed things — one ground, chosen and
 * measured — and they stay as they are. The dashboard is the room the owner
 * sits in, and a shop is bright at noon and dark at closing, so this one
 * follows the device and can be overridden.
 *
 * Two scopes, while the redesign moves the dashboard over a phase at a time:
 *
 * - **`<html>` wears Lightbox** for the shell and the pages in front of it
 *   (`lightbox: true`), plus `theme-night` after dark, as index.html's
 *   pre-paint script has it before React mounts. `color-scheme` has to be
 *   there for the native selects, scrollbars and the caret to agree with the
 *   page, and the ground has to be there or a short page shows white under
 *   the iOS bounce. Without `lightbox` it keeps the old pair,
 *   `theme-purple theme-raised`, which nothing asks for now; Phase 10
 *   deletes it. The classes are removed on unmount, which is what keeps the
 *   landing page light after the owner signs out.
 * - **The frame wears Lightbox on its own elements**: the masthead, the bar,
 *   the rails, the sheets, the toasts and the tour each carry `frame`. The
 *   night rule is a compound class, so `theme-night` goes on the same element
 *   as `theme-lightbox`, never on an ancestor. Nothing of the old scope leaks
 *   in, because `.theme-lightbox` sets every variable the kit reads.
 */
export type ThemeMode = "system" | "light" | "dark";

export const THEME_MODES: readonly ThemeMode[] = ["light", "dark", "system"];

const STORAGE_KEY = "punchme.theme";
const DARK_QUERY = "(prefers-color-scheme: dark)";

/** Also read by the pre-paint script in index.html — keep the two in step. */
const THEME_CLASSES = ["theme-purple", "theme-raised"] as const;
const NIGHT_CLASS = "theme-night";
const FRAME_CLASS = "theme-lightbox";

function storedMode(): ThemeMode {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === "light" || raw === "dark" || raw === "system") return raw;
  } catch {
    /* private mode, or storage disabled — fall through to the device */
  }
  return "system";
}

function systemPrefersDark(): boolean {
  return typeof window !== "undefined" && window.matchMedia(DARK_QUERY).matches;
}

/**
 * The frame's ground as a hex colour, read off the scope itself rather than
 * restated here, so the status bar can't drift from the palette: the wall
 * (#f6f2eb) by day and the street (#1f1916) at night.
 */
function groundOf(frame: string): string | null {
  const probe = document.createElement("span");
  probe.className = frame;
  probe.hidden = true;
  document.body.appendChild(probe);
  const channels = getComputedStyle(probe).getPropertyValue("--c-background").trim();
  probe.remove();
  const rgb = channels.split(/\s+/).map(Number);
  if (rgb.length !== 3 || rgb.some((n) => Number.isNaN(n))) return null;
  return `#${rgb.map((n) => n.toString(16).padStart(2, "0")).join("")}`;
}

export interface DashboardTheme {
  mode: ThemeMode;
  /** What the page is actually wearing right now. */
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
  /** The classes the frame's own elements wear: Lightbox, by day or at night. */
  frame: string;
}

/**
 * What <html> wears, each class on or off: one scope, Lightbox or the old
 * pair, with night beside it after dark. Off matters as much as on: the two
 * scopes must never stack, or the old one's ground wins.
 */
export function rootClasses({ lightbox, isDark }: { lightbox: boolean; isDark: boolean }): Record<string, boolean> {
  return {
    [FRAME_CLASS]: lightbox,
    ...Object.fromEntries(THEME_CLASSES.map((name) => [name, !lightbox])),
    [NIGHT_CLASS]: isDark,
  };
}

/**
 * `lightbox`: <html> wears `theme-lightbox` in place of the old pair, with
 * `theme-night` beside it after dark as before. The shell and every page in
 * front of it ask for it.
 */
export function useDashboardTheme({ lightbox = false }: { lightbox?: boolean } = {}): DashboardTheme {
  const [mode, setModeState] = useState<ThemeMode>(storedMode);
  const [prefersDark, setPrefersDark] = useState(systemPrefersDark);

  // Track the device even while the owner is on an explicit choice, so
  // switching back to "system" is instant rather than stale.
  useEffect(() => {
    const media = window.matchMedia(DARK_QUERY);
    const onChange = (e: MediaQueryListEvent) => setPrefersDark(e.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const isDark = mode === "system" ? prefersDark : mode === "dark";
  const frame = isDark ? `${FRAME_CLASS} ${NIGHT_CLASS}` : FRAME_CLASS;

  // Layout, not effect: on a hard load straight to /dashboard this runs
  // before the first paint, so a dark page never flashes white. The script
  // in index.html covers the gap before React mounts at all.
  useLayoutEffect(() => {
    const root = document.documentElement;
    for (const [name, on] of Object.entries(rootClasses({ lightbox, isDark }))) {
      root.classList.toggle(name, on);
    }

    // Installed on a phone, the dashboard owns the status bar behind it, and
    // index.html's `theme-color` metas can only answer to the *system*
    // scheme — they cannot see an explicit choice stored here. So a meta of
    // our own is kept while this is mounted (on a cold load the pre-paint
    // script has put it in already), and is taken away again on unmount so
    // the landing page goes back to following the device.
    //
    // It goes in ahead of index.html's two, not after them: a page's theme
    // colour is the first matching meta, and one of those two always
    // matches. And it follows the frame — the masthead and the bar the
    // status bar sits against — the ground <html> wears too.
    let meta = document.querySelector<HTMLMetaElement>(
      'meta[name="theme-color"][data-dashboard]',
    );
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "theme-color";
      meta.dataset.dashboard = "";
      document.head.insertBefore(
        meta,
        document.head.querySelector('meta[name="theme-color"]'),
      );
    }
    const ground = groundOf(frame);
    if (ground) meta.content = ground;

    return () => {
      root.classList.remove(...THEME_CLASSES, FRAME_CLASS, NIGHT_CLASS);
      meta?.remove();
    };
  }, [isDark, frame, lightbox]);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* the choice still holds for this session */
    }
  }, []);

  return { mode, isDark, setMode, frame };
}
