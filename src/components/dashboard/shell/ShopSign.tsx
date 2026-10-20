import { useReducedMotion } from "../../kit";
import { cn } from "../../../lib/cn";
import { initialOf } from "./personName";

/** Whether the sign shows the shop as live, not yet live, or isn't drawn yet. */
export type SignState = "loading" | "lit" | "unlit";

/**
 * The shop's sign: the owner's own card at the size of a thumbnail, 36 by
 * 24, in the card's real colours, with the initial set the way the pass sets
 * the name. Lightbox's own picture, "Pro switches the sign on", in the
 * product.
 *
 * - **Lit** on Pro, at full strength, and nothing else is said.
 * - **Unlit** on Free, at half strength, beside "Not live yet".
 * - **Loading**: the wall with a hairline while the templates load, never a
 *   stand-in colour.
 *
 * `switchOn` is the day of activation. The sign is drawn unlit and stays so
 * for a 400ms beat, so the owner sees it dark first, then catches like a
 * tube over 600ms: two strikes, and a warm-up to full (`sign-catch`). With
 * reduced motion, the same beat and a 150ms fade. Both start when the sign
 * itself is drawn, so the moment never plays out under the loading wall.
 *
 * Decoration: the words beside it carry the state and the light only
 * repeats it, so it is hidden from screen readers.
 */
export function ShopSign({
  name,
  background,
  foreground,
  state,
  switchOn = false,
  className,
}: {
  name: string;
  background?: string | null;
  foreground?: string | null;
  state: SignState;
  switchOn?: boolean;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const base = "inline-flex h-6 w-9 shrink-0 items-center justify-center rounded-md";
  // Keyed apart, so the sign arrives as a new element at its own strength
  // instead of fading there from the placeholder's.
  if (state === "loading") {
    return (
      <span key="wall" aria-hidden className={cn(base, "border border-border bg-background", className)} />
    );
  }
  const lit = state === "lit";
  return (
    <span
      key="sign"
      aria-hidden
      className={cn(
        base,
        // A hairline of the rim (black by day, white at night) keeps a white
        // card visible on the wall and a near-black one on the street.
        "font-heading text-[0.9375rem] font-medium leading-none ring-1 ring-inset ring-rim/10",
        lit ? "opacity-100" : "opacity-50",
        switchOn && lit && (reduced ? "animate-sign-on" : "animate-sign-catch"),
        className,
      )}
      style={{ backgroundColor: background ?? undefined, color: foreground ?? undefined }}
    >
      {initialOf(name)}
    </span>
  );
}
