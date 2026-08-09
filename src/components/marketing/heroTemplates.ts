import type { DesignDoc } from "../../api/designs";

/**
 * The cards shown in the landing hero.
 *
 * These are a snapshot of three real presets served by `GET /api/presets`
 * — the same ones onboarding builds a business's first template from — so
 * what a visitor sees in the hero is what they actually get in the studio.
 * Verified against the live endpoint; ids are kept so they can be traced:
 *
 *   barber-classic   #1F2937  10 stamps
 *   cafe-classic     #4B2E1E   8 stamps
 *   trainer-classic  #065F46  10 stamps
 *
 * Snapshotted rather than fetched on purpose. The hero is the first thing
 * that paints, and hanging it off a network round-trip would mean an empty
 * frame whenever the API is slow, plus a visible swap when it lands. The
 * presets are static seed data on the backend and change rarely; if they
 * ever do, update this file. (`landing.templates.*` carries the copy.)
 *
 * Two deliberate departures from the raw preset rows:
 *
 * 1. The presets ship Hebrew field labels and `default_language: "HE"`,
 *    which is right for the product and wrong for an English landing page.
 *    Labels here come from i18n instead, so the card reads in whatever
 *    language the page is in.
 * 2. The presets set no stamp glyph or pattern, so every real preset starts
 *    on a generic tick. The hero picks the glyph and pattern each trade
 *    would obviously choose — it's showing the studio's range, not
 *    pretending these are defaults.
 */
export interface HeroTemplate {
  /** Preset id on the backend, for traceability. */
  id: string;
  /** i18n key suffix under `landing.templates`. */
  key: "barber" | "cafe" | "trainer";
  backgroundColor: string;
  foregroundColor: string;
  labelColor: string;
  stampsRequired: number;
  /** Part-filled, so the card looks used rather than boxed-fresh. */
  currentStamps: number;
  glyph: string;
  pattern: NonNullable<DesignDoc["pattern"]>;
  /** Filled-stamp colour. Every card uses brand gold rather than its own
   * label colour: the backgrounds vary by trade, so the stamps are what
   * hold the set together, and gold reads as PunchMe on all three. */
  stampColor: string;
  /** Drives the glow behind the card so the staging follows the artwork. */
  glow: string;
}

export const HERO_TEMPLATES: HeroTemplate[] = [
  {
    id: "barber-classic",
    key: "barber",
    backgroundColor: "#1F2937",
    foregroundColor: "#FFFFFF",
    labelColor: "#9CA3AF",
    stampsRequired: 10,
    currentStamps: 7,
    glyph: "scissors",
    pattern: "stripes",
    stampColor: "#C88A11",
    glow: "rgba(200,138,17,0.30)",
  },
  {
    id: "cafe-classic",
    key: "cafe",
    backgroundColor: "#4B2E1E",
    foregroundColor: "#FFFFFF",
    labelColor: "#D2B48C",
    stampsRequired: 8,
    currentStamps: 5,
    glyph: "coffee",
    pattern: "dots",
    stampColor: "#C88A11",
    glow: "rgba(210,180,140,0.32)",
  },
  {
    id: "trainer-classic",
    key: "trainer",
    backgroundColor: "#065F46",
    foregroundColor: "#FFFFFF",
    labelColor: "#A7F3D0",
    stampsRequired: 10,
    currentStamps: 6,
    glyph: "dumbbell",
    pattern: "waves",
    stampColor: "#C88A11",
    glow: "rgba(200,138,17,0.26)",
  },
];

/** Build the design doc the preview renderer expects, with labels in the
 * active language. Mirrors the shape the presets use. */
export function heroDesignDoc(
  template: HeroTemplate,
  labels: { name: string; points: string },
): DesignDoc {
  return {
    fields: [
      {
        binding: "person.displayName",
        label: labels.name,
        section: "SECONDARY_FIELDS",
        alignment: "LEFT",
      },
      {
        binding: "members.member.points",
        label: labels.points,
        section: "SECONDARY_FIELDS",
        alignment: "RIGHT",
        default_value: "0",
      },
    ],
    barcode: { format: "QR", payload: "${pid}" },
    stamp: { glyph: template.glyph, color: template.stampColor },
    pattern: template.pattern,
  };
}
