import type { WizardStep } from "./draft";

/**
 * The road the owner walks: five stops, the same from the first screen to
 * the last, signed in or out. Each stop is named by the route it stands on.
 * The card screen at `/reward` is one stop with its three trays (`color`,
 * `accent`, `stamp`), so a ready-made look decides nothing about the road and
 * signing up adds no stops to it.
 */
export const ROAD = ["business", "reward", "account", "wallet", "billing"] as const;
export type RoadStop = (typeof ROAD)[number];

const STOP_OF: Record<WizardStep, RoadStop> = {
  business: "business",
  color: "reward",
  accent: "reward",
  stamp: "reward",
  reward: "reward",
  account: "account",
  wallet: "wallet",
  billing: "billing",
};

export interface RoadPlace {
  /** 1 to 5. */
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
