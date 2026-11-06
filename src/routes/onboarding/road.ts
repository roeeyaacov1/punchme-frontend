import type { WizardStep } from "./draft";

/**
 * The road the owner walks: four stops, the same from the first screen to
 * the last, signed in or out. Each stop is named by the route it stands on.
 * The map at `/reward` is the first stop, and the business is one of its
 * trays with the others (`business`, `color`, `accent`, `stamp`), so walking
 * the card's parts decides nothing about the road and signing up adds no
 * stops to it.
 *
 * While the wizard offers the card looks, the road has a fifth stop at its
 * start, the look (`/look`): the trade and the look the card starts from
 * (card looks, brief §7.2). The same five on every screen then.
 */
export const ROAD = ["reward", "account", "wallet", "billing"] as const;
export const LOOKS_ROAD = ["look", ...ROAD] as const;
export type RoadStop = (typeof LOOKS_ROAD)[number];

const STOP_OF: Record<WizardStep, RoadStop> = {
  look: "look",
  business: "reward",
  color: "reward",
  accent: "reward",
  stamp: "reward",
  reward: "reward",
  account: "account",
  wallet: "wallet",
  billing: "billing",
};

export interface RoadPlace {
  /** 1 to 4, or to 5 with the looks. */
  stop: number;
  total: number;
  /** The stop this screen belongs to. */
  at: RoadStop;
  /** The stop after it, or null on the last. */
  next: RoadStop | null;
}

/** Where a screen stands on the road. `looks`: the road starts at the look.
 * Without it the look's address belongs to the map, where it goes. */
export function roadOf(step: WizardStep, looks = false): RoadPlace {
  const road: readonly RoadStop[] = looks ? LOOKS_ROAD : ROAD;
  const stop = STOP_OF[step];
  const at = road.includes(stop) ? stop : "reward";
  const index = road.indexOf(at);
  return { stop: index + 1, total: road.length, at, next: road[index + 1] ?? null };
}
