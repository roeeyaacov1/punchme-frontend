import type { TFunction } from "i18next";
import type { CardPreviewValue } from "../card-studio/CardPreviews";
import type { StandeeArt } from "../dashboard/Standee";
import { HERO_TEMPLATES, heroDesignDoc, type HeroTemplate } from "./heroTemplates";

/**
 * The page's one sample card, in each trade: the pass a customer holds, the
 * sign on the counter and the scan's answer all read from here, so the
 * counter, How it works, After they leave and the price always show the
 * same card. Its name is the trade itself ("Barbershop", "מספרה"), never an
 * invented business, and its holder is the studio's own sample name, in the
 * page's language.
 */
export type TradeKey = HeroTemplate["key"];

export const TRADES: readonly TradeKey[] = HERO_TEMPLATES.map((template) => template.key);

export function tradeTemplate(key: TradeKey): HeroTemplate {
  return HERO_TEMPLATES.find((template) => template.key === key) ?? HERO_TEMPLATES[0];
}

/** One stamp after the snapshot's part-filled card: the visit the counter shows. */
export function landedStamps(template: HeroTemplate): number {
  return Math.min(template.stampsRequired, template.currentStamps + 1);
}

/** The pass as `AppleCardPreview` and `GoogleCardPreview` take it, `stamps` in. */
export function samplePass(template: HeroTemplate, t: TFunction, stamps: number): CardPreviewValue {
  return {
    businessName: t(`landing.templates.items.${template.key}.business`),
    stampsRequired: template.stampsRequired,
    currentStamps: stamps,
    rewardDescription: t(`landing.templates.items.${template.key}.reward`),
    backgroundColor: template.backgroundColor,
    foregroundColor: template.foregroundColor,
    labelColor: template.labelColor,
    design: heroDesignDoc(template, {
      name: t("landing.templates.nameLabel"),
      points: t("landing.templates.pointsLabel"),
    }),
    holderName: t("studio.sampleName"),
  };
}

/**
 * The sign as the standee prints it. A live code leads to this page, never
 * to a join page that doesn't exist; `active: false` is the standee's own
 * sign before activation, its code slot empty and saying so.
 */
export function sampleSign(template: HeroTemplate, t: TFunction, active: boolean): StandeeArt {
  return {
    businessName: t(`landing.templates.items.${template.key}.business`),
    reward: t(`landing.templates.items.${template.key}.reward`),
    stampsRequired: template.stampsRequired,
    background: template.backgroundColor,
    foreground: template.foregroundColor,
    label: template.labelColor,
    glyph: template.glyph,
    enrollUrl: `${window.location.origin}/`,
    active,
  };
}
