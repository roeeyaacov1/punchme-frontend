import type { TFunction } from "i18next";
import { staticFile } from "remotion";
import type { Preset } from "../../src/api/presets";
import type { CardPreviewValue } from "../../src/components/card-studio/CardPreviews";
import { emptyDraft, type Niche } from "../../src/routes/onboarding/draft";
import { lookPreview } from "../../src/routes/onboarding/looks";
import catalog from "../public/looks/catalog.json";
import type { Lang } from "./i18n";

/**
 * The new card looks, as the wallet draws them (`scripts/looks.ts`), made
 * into passes exactly as the wizard makes a look into one (`lookPreview`):
 * the look's own colours and options, the card's words in the video's
 * language, the wallet's picture as the strip.
 */

/** The published styled looks, their pictures served from `public/looks/`. */
export const CATALOG: Preset[] = (catalog as unknown as Preset[]).map((preset) => ({
  ...preset,
  pictures: preset.pictures && { strip: staticFile(preset.pictures.strip), hero: staticFile(preset.pictures.hero) },
}));

/** The look that carries the story. */
export const HERO_ID = "barber-gold-scissors";
export const HERO = CATALOG.find((preset) => preset.id === HERO_ID)!;

const SAMPLE_TRADES = ["barber", "cafe", "trainer"] as const;

/** The landing page's sample name for the look's trade, or, where it has none, "Your business". */
function sampleBusiness(niche: string, t: TFunction): string {
  return (SAMPLE_TRADES as readonly string[]).includes(niche)
    ? t(`landing.templates.items.${niche}.business`)
    : t("video:looks.yourBusiness");
}

/**
 * A look as a pass. `"own"` shows the look's own published picture, at the
 * count it was drawn at; a number shows the hero drawn by the wallet at that
 * count (`public/looks/gold/`).
 */
export function lookPass(preset: Preset, stamps: number | "own", t: TFunction, lang: Lang): CardPreviewValue {
  const draft = { ...emptyDraft(), niche: preset.niche as Niche, name: sampleBusiness(preset.niche, t) };
  const value = lookPreview(preset, draft, CATALOG, lang, t);
  if (!value) throw new Error(`${preset.id} has no pictures`);
  const pass = { ...value, holderName: t("studio.sampleName") };
  if (stamps === "own") return pass;
  if (preset.id !== HERO_ID) throw new Error(`Only ${HERO_ID} is drawn at every count`);
  const at = String(stamps);
  return {
    ...pass,
    currentStamps: stamps,
    stripStates: { [at]: staticFile(`looks/gold/strip-${stamps}.png`) },
    heroStates: { [at]: staticFile(`looks/gold/hero-${stamps}.png`) },
  };
}
