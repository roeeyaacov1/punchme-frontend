import { useCallback, useEffect, useLayoutEffect, useState } from "react";

/**
 * Light or dark, for the dashboard only.
 *
 * The landing page and the wizard are printed things — one ground, chosen and
 * measured — and they stay as they are. The dashboard is the room the owner
 * sits in, and a shop is bright at noon and dark at closing, so this one
 * follows the device and can be overridden.
 *
 * The classes go on <html>: `color-scheme` has to be there for the native
 * selects, scrollbars and the caret to agree with the page, and the ground
 * has to be there or a short page shows white under the iOS bounce. They are
 * removed on unmount, which is what keeps the landing page light after the
 * owner signs out.
 */
export type ThemeMode = "system" | "light" | "dark";

export const THEME_MODES: readonly ThemeMode[] = ["light", "dark", "system"];

const STORAGE_KEY = "punchme.theme";
const DARK_QUERY = "(prefers-color-scheme: dark)";

/** Also read by the pre-paint script in index.html — keep the two in step. */
const THEME_CLASSES = ["theme-purple", "theme-raised"] as const;
const NIGHT_CLASS = "theme-night";

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

export interface DashboardTheme {
  mode: ThemeMode;
  /** What the page is actually wearing right now. */
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
}

export function useDashboardTheme(): DashboardTheme {
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

  // Layout, not effect: on a hard load straight to /dashboard this runs
  // before the first paint, so a dark page never flashes white. The script
  // in index.html covers the gap before React mounts at all.
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.add(...THEME_CLASSES);
    root.classList.toggle(NIGHT_CLASS, isDark);

    // Installed on a phone, the dashboard owns the status bar behind it, and
    // index.html's `theme-color` metas can only answer to the *system*
    // scheme — they cannot see an explicit choice stored here. So a meta of
    // our own is appended last (later wins) while this is mounted, and taken
    // away again on unmount so the landing page goes back to following the
    // device. The colour is read off the ground that was just applied rather
    // than restated, so it cannot drift from the palette.
    let meta = document.querySelector<HTMLMetaElement>(
      'meta[name="theme-color"][data-dashboard]',
    );
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "theme-color";
      meta.dataset.dashboard = "";
      document.head.appendChild(meta);
    }
    const ground = getComputedStyle(root).getPropertyValue("--c-background").trim();
    if (ground) meta.content = `rgb(${ground})`;

    return () => {
      root.classList.remove(...THEME_CLASSES, NIGHT_CLASS);
      meta?.remove();
    };
  }, [isDark]);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* the choice still holds for this session */
    }
  }, []);

  return { mode, isDark, setMode };
}
