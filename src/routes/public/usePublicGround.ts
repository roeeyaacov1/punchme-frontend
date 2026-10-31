import { useEffect, useLayoutEffect } from "react";
import { useTranslation } from "react-i18next";

/** The wall, as the status bar's colour: Lightbox's `--c-background` by day. */
const WALL = "#f6f2eb";

/**
 * While a public page is up, `<html>` stands on Lightbox by day too: the
 * overscroll shows the wall, and a phone in dark mode colours its status
 * bar with the wall instead of `index.html`'s navy. Never night: these
 * pages are reached from a camera or a link, outside the dashboard, and
 * stay light (the guide's D8). `index.html`'s pre-paint script has done
 * the same before React mounts; this keeps it, and takes both away again
 * when the page goes, as `useDashboardTheme` does without its night.
 */
export function usePublicGround() {
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.add("theme-lightbox");
    let meta = document.head.querySelector<HTMLMetaElement>('meta[name="theme-color"][data-public]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "theme-color";
      meta.setAttribute("data-public", "");
      document.head.insertBefore(meta, document.head.querySelector('meta[name="theme-color"]'));
    }
    meta.content = WALL;
    return () => {
      root.classList.remove("theme-lightbox");
      meta?.remove();
    };
  }, []);
}

/** "{name} — PunchMe" for as long as the page is mounted. */
export function useDocumentTitle(name: string) {
  const { t } = useTranslation();
  const title = `${name} — ${t("app.name")}`;
  useEffect(() => {
    const previous = document.title;
    document.title = title;
    return () => {
      document.title = previous;
    };
  }, [title]);
}
