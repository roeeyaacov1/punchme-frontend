import { useEffect, useLayoutEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

/** Theme classes the older scopes put on <html>; the guide moves them aside. */
const OLD_THEMES = ["theme-purple", "theme-raised", "theme-night", "theme-lit"];

export type GuideLanguage = "he" | "en";

export interface GuideView {
  night: boolean;
  setNight: (night: boolean) => void;
  reduced: boolean;
  setReduced: (reduced: boolean) => void;
  language: GuideLanguage;
  setLanguage: (language: GuideLanguage) => void;
  /** Changes whenever what's on screen changes colour or direction, so measurements rerun. */
  version: string;
}

/**
 * The guide's three switches, kept in the URL (`?theme=night&lang=he&
 * motion=reduced`) so any state can be linked, screenshotted or scanned.
 *
 * Lightbox goes on <html> the way the dashboard will wear it, so overscroll,
 * native controls and a dialog's top layer all see it. Whatever older theme
 * classes were there are set aside while the guide is open and put back when
 * it closes. One language at a time, through the app's own language: a
 * nested `dir` can't be trusted, because every `rtl:` rule still matches an
 * English panel inside a Hebrew page.
 */
export function useGuideView(): GuideView {
  const [params, setParams] = useSearchParams();
  const { i18n } = useTranslation();
  const night = params.get("theme") === "night";
  const reduced = params.get("motion") === "reduced";
  const language: GuideLanguage = i18n.resolvedLanguage === "he" ? "he" : "en";
  const asked = params.get("lang");

  useEffect(() => {
    if ((asked === "he" || asked === "en") && asked !== i18n.resolvedLanguage) {
      void i18n.changeLanguage(asked);
    }
  }, [asked, i18n]);

  useLayoutEffect(() => {
    const root = document.documentElement;
    const setAside = OLD_THEMES.filter((name) => root.classList.contains(name));
    root.classList.remove(...setAside);
    root.classList.add("theme-lightbox");
    return () => {
      root.classList.remove("theme-lightbox", "theme-night");
      root.classList.add(...setAside);
    };
  }, []);

  useLayoutEffect(() => {
    document.documentElement.classList.toggle("theme-night", night);
  }, [night]);

  const setParam = (key: string, value: string | null) =>
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        if (value) next.set(key, value);
        else next.delete(key);
        return next;
      },
      { replace: true },
    );

  return {
    night,
    setNight: (on) => setParam("theme", on ? "night" : null),
    reduced,
    setReduced: (on) => setParam("motion", on ? "reduced" : null),
    language,
    setLanguage: (next) => {
      void i18n.changeLanguage(next);
      setParam("lang", next);
    },
    version: `${night ? "night" : "day"}-${language}`,
  };
}
