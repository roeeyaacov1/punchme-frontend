import type { WizardStep } from "./draft";

/**
 * The road the owner walks: four stops, the same from the first screen to
 * the last, signed in or out. Each stop is named by the route it stands on.
 * The map at `/reward` is the first stop, and the business is one of its
 * trays with the others (`business`, `color`, `accent`, `stamp`), so walking
 * the card's parts decides nothing about the road and signing up adds no
 * stops to it.
 */
export const ROAD = ["reward", "account", "wallet", "billing"] as const;
export type RoadStop = (typeof ROAD)[number];

const STOP_OF: Record<WizardStep, RoadStop> = {
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
  /** 1 to 4. */
  stop: number;
  total: number;
  /** The stop this screen belongs to. */
  at: RoadStop;
  /** The stop after it, or null on the last. */
  next: RoadStop | null;
}

/** Where a screen stands on the road. */
export function roadOf(step: WizardStep): RoadPlace {
  const at = STOP_OF[step];
  const index = ROAD.indexOf(at);
  return { stop: index + 1, total: ROAD.length, at, next: ROAD[index + 1] ?? null };
}
