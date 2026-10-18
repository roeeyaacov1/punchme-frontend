import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";
import { useReducedMotion } from "./motion";

/**
 * - `panel`: the everyday panel. Lit by day; unlit at night, when it loses
 *   its highlight and its drop and only its edge is left.
 * - `lit`: keeps its light at night — the QR code, a message preview.
 * - `band`: the dashboard's one loud surface (today's violet brief band),
 *   #fff4e6 to #ffe9d4 under ink, the brightest thing on the street.
 * - `field`: the landing page's light, brightest at the centre and warm at
 *   the edges.
 * - `punched`, `full`, `refusal`, `failed`: the light a scan answers in. A
 *   refusal answers on the plain light, its amber kept to its words and icon.
 */
export type Light = "panel" | "lit" | "band" | "field" | "punched" | "full" | "refusal" | "failed";

/** 24px for the dashboard, 32px for the landing's tall cards, 40px for its hero. */
export type PanelRadius = "panel" | "card" | "hero";

const LIGHTS: Record<Light, string> = {
  panel: "border border-border bg-surface shadow-panel",
  // Everything below wears .theme-lit: its ground is lit in both themes, so
  // the ink on it has to be the day ink.
  lit: "theme-lit border border-border bg-surface shadow-panel",
  band: "theme-lit lit-band",
  field: "theme-lit lit-field",
  punched: "theme-lit bg-answer-punched",
  full: "theme-lit bg-answer-full",
  refusal: "theme-lit bg-light",
  failed: "theme-lit bg-answer-failed",
};

const RADII: Record<PanelRadius, string> = {
  panel: "rounded-panel",
  card: "rounded-card",
  hero: "rounded-hero",
};

export interface LitPanelProps extends HTMLAttributes<HTMLElement> {
  light?: Light;
  radius?: PanelRadius;
  as?: "div" | "section" | "article" | "aside" | "li";
  /**
   * Lights on as it appears: the light fades up over 240ms while the panel
   * rises 8px at most. With reduced motion, the light at full strength in
   * 150ms and no travel. Give it a new `key` to play it again.
   */
  arrive?: boolean;
  /**
   * The scan's answer settling as it appears, from scale 1.04 in 180ms;
   * with reduced motion, a 150ms fade. A new `key` for each answer.
   */
  snap?: boolean;
}

/**
 * A lightbox on the wall: white acrylic with light behind it. Depth is
 * light, not shadow: a highlight inside the top edge and a soft warm drop by
 * day, nothing but its own edge at night.
 */
export function LitPanel({
  light = "panel",
  radius = "panel",
  as: Tag = "div",
  arrive,
  snap,
  className,
  ...props
}: LitPanelProps) {
  const reduced = useReducedMotion();
  let motion: string | undefined;
  if (snap) motion = reduced ? "animate-gentle-in" : "animate-snap-settle";
  else if (arrive) motion = reduced ? "animate-gentle-in" : "animate-lights-on";
  return <Tag className={cn(LIGHTS[light], RADII[radius], "text-ink", motion, className)} {...props} />;
}
