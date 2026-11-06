import { relatedAccents } from "../../lib/accentPalette";
import { contrastRatio, mixHex, normalizeHex, readableInk, relativeLuminance } from "../../lib/color";
import { MIN_PANEL_CONTRAST, MIN_STAMP_CONTRAST } from "./controls/controlRules";
import { tintDrawn } from "./designOptions";
import type { CardStudioValue } from "./studioDraft";

/**
 * One business colour sets the rest (brief §6.2, with §11's notes): the card
 * is the business colour, and the text, the label, the stamps and the ground
 * behind them follow it, until one is changed by hand. Pure, so it can be
 * tested; the studio's colours tray and the catalog editor draw it, and the
 * wizard can take the same rule.
 *
 * "Follows" is worked out with no stored field: a colour follows when it is
 * what the rule gives for the business colour as it is now. One that differs
 * was set by hand, and a new business colour leaves it where it is.
 */

/** Text on a card clears this, as body text must. */
export const MIN_TEXT_CONTRAST = 4.5;

/** The card's own near-black, as the wallet renderer knocks a glyph out in
 * (`strips.py`, `_glyph_ink`). */
export const NEAR_BLACK = "#202024";

/** The light ground a dark card takes: "שמנת", the cream of the reference
 * bakery card, and one of the six grounds. */
export const CREAM = "#F6E7CB";

/**
 * Below this relative luminance a card is dark. It is where black text falls
 * under 4.5:1 ((0.175 + 0.05) / 0.05 = 4.5), so a dark card is one that
 * takes white text.
 */
export const DARK_LUMINANCE = 0.175;

/** How far toward white a dark card's own ground is mixed, and toward black a
 * light one's. */
const LIGHT_GROUND_MIX = 0.88;
const DARK_GROUND_MIX = 0.12;

function same(a: string | undefined, b: string | undefined): boolean {
  if (!a || !b) return false;
  return (normalizeHex(a) ?? a.toUpperCase()) === (normalizeHex(b) ?? b.toUpperCase());
}

export function isDarkCard(card: string): boolean {
  return relativeLuminance(card) < DARK_LUMINANCE;
}

/** The text: the card's near-black where it clears 4.5:1, then black, then
 * white. White or the near-black alone can't always reach 4.5:1 (a mid grey,
 * `#7a6ff0` or `#d35400` top out near 4.1:1), but between black and white the
 * better never falls under 4.58:1. */
export function textFor(card: string): string {
  if (contrastRatio(NEAR_BLACK, card) >= MIN_TEXT_CONTRAST) return NEAR_BLACK;
  if (contrastRatio("#000000", card) >= MIN_TEXT_CONTRAST) return "#000000";
  return "#FFFFFF";
}

/**
 * The ground behind the stamps, settled first, from the card alone. On a dark
 * card, cream, or the business colour mixed 88% toward white where cream
 * wouldn't show; on a light card, white, or the business colour mixed 12%
 * toward black where white is too close to the card. A ground shows at
 * 1.1:1 against the card; on a dark card it also leaves room for stamps in
 * the business colour at 3:1.
 */
export function groundFor(card: string): string {
  if (isDarkCard(card)) {
    if (contrastRatio(CREAM, card) >= MIN_STAMP_CONTRAST) return CREAM;
    const own = mixHex(card, "#FFFFFF", LIGHT_GROUND_MIX);
    return contrastRatio(own, card) >= MIN_STAMP_CONTRAST ? own : CREAM;
  }
  if (contrastRatio("#FFFFFF", card) >= MIN_PANEL_CONTRAST) return "#FFFFFF";
  return mixHex(card, "#000000", DARK_GROUND_MIX);
}

/**
 * The stamps, settled after the ground and against it when there is one: the
 * business colour when they are tinted (the tint is "in the card's colour")
 * or stand on a ground they clear by 3:1. Otherwise the first accent that
 * clears 3:1 on what they stand on, as the stamp colour picker offers them.
 */
export function stampsFor(card: string, ground: string | null, tinted: boolean): string {
  if (tinted) return normalizeHex(card) ?? card;
  if (ground && contrastRatio(card, ground) >= MIN_STAMP_CONTRAST) return normalizeHex(card) ?? card;
  const on = ground || card;
  return relatedAccents(on)[0] ?? readableInk(on);
}

/** What one business colour sets. `ground` is null on a card with none. */
export interface BrandColours {
  card: string;
  text: string;
  label: string;
  stamps: string;
  ground: string | null;
}

/** The rule's colours for a card, with or without a ground, tinted or not. */
export function brandColours(card: string, { ground, tinted }: { ground: boolean; tinted: boolean }): BrandColours {
  const text = textFor(card);
  const groundColour = ground ? groundFor(card) : null;
  return {
    card: normalizeHex(card) ?? card,
    text,
    label: text,
    stamps: stampsFor(card, groundColour, tinted),
    ground: groundColour,
  };
}

/** The four colours the rule can move, as the draft keeps them. */
export interface CardColourSet {
  text: string;
  label: string;
  stamps: string;
  /** "" is no ground. */
  ground: string;
}

export function colourSetOf(value: CardStudioValue): CardColourSet {
  return {
    text: value.foreground_color,
    label: value.label_color,
    stamps: value.design.stamp?.color || value.foreground_color,
    ground: typeof value.design.panel_color === "string" ? value.design.panel_color : "",
  };
}

export type Follower = "text" | "label" | "stamps" | "ground";

/**
 * Which colours still follow the business colour. The text follows when it is
 * the rule's, or the black or white the studio picked automatically before the
 * rule; the label when it is what the text follows with; the stamps when they
 * are the rule's against the ground the card has; the ground when it is the
 * rule's. A card with no ground has no ground to follow.
 */
export function following(value: CardStudioValue): Record<Follower, boolean> {
  const card = value.background_color;
  const set = colourSetOf(value);
  const tinted = value.design.stamp?.tint === true;
  const text = same(set.text, textFor(card)) || same(set.text, readableInk(card));
  return {
    text,
    label: same(set.label, textFor(card)) || same(set.label, set.text),
    stamps: same(set.stamps, stampsFor(card, set.ground || null, tinted)),
    ground: !!set.ground && same(set.ground, groundFor(card)),
  };
}

/**
 * A new business colour, moving every colour that still follows the old one.
 * The ground moves first, and the stamps are then judged against the ground
 * the card will have, whether it moved or was set by hand.
 */
export function withBusinessColour(value: CardStudioValue, hex: string): CardStudioValue {
  const was = following(value);
  const set = colourSetOf(value);
  const tinted = value.design.stamp?.tint === true;
  const ground = set.ground ? (was.ground ? groundFor(hex) : set.ground) : "";
  const text = was.text ? textFor(hex) : set.text;
  const label = was.label ? text : set.label;
  const stamps = was.stamps ? stampsFor(hex, ground || null, tinted) : set.stamps;
  return {
    ...value,
    background_color: normalizeHex(hex) ?? hex,
    foreground_color: text,
    label_color: label,
    design: {
      ...value.design,
      ...(set.ground ? { panel_color: ground } : {}),
      stamp: { ...value.design.stamp, color: stamps },
    },
  };
}

/** One colour back on the rule ("חזרה לצבע של העסק"). The label goes back with
 * the text. */
export function withRuleColour(value: CardStudioValue, which: Exclude<Follower, "label">): CardStudioValue {
  const card = value.background_color;
  const set = colourSetOf(value);
  const tinted = value.design.stamp?.tint === true;
  if (which === "text") {
    const text = textFor(card);
    return { ...value, foreground_color: text, label_color: text };
  }
  if (which === "ground") {
    const ground = groundFor(card);
    return { ...value, design: { ...value.design, panel_color: ground } };
  }
  return {
    ...value,
    design: { ...value.design, stamp: { ...value.design.stamp, color: stampsFor(card, set.ground || null, tinted) } },
  };
}

/**
 * The tint ("בצבע הכרטיס") on or off. On, the stamps take the business colour
 * and stand on their own, the only stamps the wallet tints; a card with no
 * ground gets the rule's, since stamps in the card's own colour on the card
 * itself would all but vanish (Roee, 6 Nov). Off, the tint goes and the
 * ground, the stamp colour and the style stay.
 */
export function withTint(value: CardStudioValue, on: boolean): CardStudioValue {
  const stamp = { ...value.design.stamp, tint: on };
  if (!on) return { ...value, design: { ...value.design, stamp } };
  const card = normalizeHex(value.background_color) ?? value.background_color;
  const hasGround = typeof value.design.panel_color === "string" && !!value.design.panel_color;
  return {
    ...value,
    design: {
      ...value.design,
      ...(hasGround ? {} : { panel_color: groundFor(card) }),
      stamp: { ...stamp, style: "icon", color: card },
    },
  };
}

/** Whether switching the tint on now brings a ground with it, as its line says. */
export function tintBringsGround(value: CardStudioValue): boolean {
  return !tintDrawn(value.design) && !value.design.panel_color;
}

/** True when the stamps' colour is the business colour, as the tint's label
 * says it ("בצבע הכרטיס", or "בצבע החותמות" once changed by hand). */
export function stampsInCardColour(value: CardStudioValue): boolean {
  return same(colourSetOf(value).stamps, value.background_color);
}
