import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { studioMode } from "../../components/card-studio/designOptions";
import { withoutLook } from "./looks";
import { studioValueOf } from "./studioValue";
import { useOnboardingDraft } from "./useOnboardingDraft";

/**
 * A card from a look where the wallet draws none of the options it has (a
 * server before v0.1.1, `studioMode` "off"): the wallet would refuse the
 * card at its first sync, and refuses every drawing of it. The way on is the
 * studio's, taking them off, which in the wizard makes the card one from
 * before the looks (`withoutLook`).
 *
 * The button goes with the options, so focus goes to the heading of where
 * it stood: the part's tray, the part's tab beside the card, or the map.
 * The road loses its first stop with the look, which draws the screen anew,
 * so the heading is looked up once it is.
 */
export function useLookOff(): { off: boolean; takeOff: () => void } {
  const { t, i18n } = useTranslation();
  const { draft, resolved, update, stickers, templateInput } = useOnboardingDraft();
  const off =
    !!draft.look &&
    studioMode(stickers, studioValueOf(resolved, i18n.resolvedLanguage ?? "en", t, templateInput.name).design) === "off";
  const takeOff = useCallback(() => {
    const from = document.activeElement;
    const place = from instanceof HTMLElement && from !== document.body ? placeOf(from) : null;
    update(withoutLook());
    if (place) requestAnimationFrame(() => headingOf(place)?.focus({ preventScroll: true }));
  }, [update]);
  return { off, takeOff };
}

type Place = "tray" | "tab" | "map";

function placeOf(from: HTMLElement): Place {
  if (from.closest("section[aria-labelledby]")) return "tray";
  if (from.closest('[role="tabpanel"]')) return "tab";
  return "map";
}

function headingOf(place: Place): HTMLElement | null {
  const map = document.querySelector<HTMLElement>("h1[tabindex]");
  if (place === "tray") return document.querySelector<HTMLElement>("section[aria-labelledby] h2[tabindex]") ?? map;
  if (place === "tab") return document.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]') ?? map;
  return map;
}
