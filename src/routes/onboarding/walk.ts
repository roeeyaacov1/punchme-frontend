/** The walk on the map: the card's four parts (the business, colours, the
 * stamp, the reward), opened in a guided order the owner is free to leave.
 * Each part's Next opens the next one not yet opened, and Save appears once
 * all four have been. Everything here is read from the draft's `seen` and
 * its fields, so a refresh, a Back or a typed address finds the walk where
 * the owner left it. Pure: the screens own the effects. */

import { firstIncompleteStep, MAP_PARTS, NAME_MAX, type DraftStep, type MapPart, type OnboardingDraft } from "./draft";

export function seenOf(draft: Pick<OnboardingDraft, "seen">): MapPart[] {
  return draft.seen ?? [];
}

/** The first part after `after` (from the start without one), wrapping
 * round, that hasn't been opened and isn't `after` itself; null when every
 * other part has been opened. */
export function nextUnseen(seen: readonly MapPart[], after?: MapPart): MapPart | null {
  const from = after ? MAP_PARTS.indexOf(after) + 1 : 0;
  for (let i = 0; i < MAP_PARTS.length; i++) {
    const part = MAP_PARTS[(from + i) % MAP_PARTS.length];
    if (part !== after && !seen.includes(part)) return part;
  }
  return null;
}

export function walkDone(seen: readonly MapPart[]): boolean {
  return MAP_PARTS.every((part) => seen.includes(part));
}

const ADDRESS: Record<MapPart, DraftStep> = {
  business: "business",
  colours: "color",
  stamp: "stamp",
  reward: "reward",
};

/** The address that shows a part: its tray's, or the map itself for the
 * reward, whose tray opens from the sentence. */
export function addressOf(part: MapPart): DraftStep {
  return ADDRESS[part];
}

/** The tray an address opens. The reward's tray is history state on
 * `/reward`, not an address, so `/reward` (the map at rest) opens none. */
export function partAtAddress(step: string | undefined): MapPart | null {
  if (step === "business") return "business";
  if (step === "color" || step === "accent") return "colours";
  if (step === "stamp") return "stamp";
  return null;
}

/** What the business still needs before the walk can leave it: a name, one
 * the API takes (the field holds it to 120 characters, but a draft made
 * before it did can carry a longer one), and a trade. */
export function businessMissing(draft: Pick<OnboardingDraft, "name" | "niche">): "name" | "long" | "trade" | null {
  const name = draft.name.trim();
  if (!name) return "name";
  if (name.length > NAME_MAX) return "long";
  if (!draft.niche) return "trade";
  return null;
}

/** Where `/onboarding` sends the owner. A card that isn't whole, or whose
 * picture is lost, goes to the field that needs them; otherwise the first
 * part not yet opened, and once the walk is done, the map at rest, where
 * Save is: a last look at the card before the account, never the account
 * itself. */
export function whereToStart(draft: OnboardingDraft, hasArt?: (hash: string) => boolean): DraftStep {
  const first = firstIncompleteStep(draft, hasArt);
  if (first === "business" || first === "color" || first === "accent" || first === "stamp") return first;
  const unseen = nextUnseen(seenOf(draft));
  return unseen ? addressOf(unseen) : "reward";
}
