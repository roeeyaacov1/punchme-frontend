import { I18nextProvider } from "react-i18next";
import { AbsoluteFill } from "remotion";
import "../../src/index.css";
import "./video.css";
import { I18N, type Lang } from "./i18n";
import { FontGate } from "./pieces";

export const DURATION = 900;

/**
 * The promo: the wall, in the language's direction. The beats come with the
 * punched cut.
 */
export function Promo({ lang }: { lang: Lang }) {
  return (
    <I18nextProvider i18n={I18N[lang]}>
      <AbsoluteFill className="promo theme-lightbox bg-background text-ink" dir={lang === "he" ? "rtl" : "ltr"} lang={lang}>
        <FontGate>{null}</FontGate>
      </AbsoluteFill>
    </I18nextProvider>
  );
}
