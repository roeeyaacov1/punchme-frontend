/** The map's trays in the browser's history, so the phone's back gesture
 * closes a tray onto the map and closing never stacks history. Pure: the
 * map applies the moves. */

import type { MapPart } from "./draft";

/** The map at rest, which is also the reward's tray: that one has no address
 * of its own, only its history entry's state. */
export const MAP = "/onboarding/reward";

/** Each part's tray: the colours at `/color` (and `/accent`, opened at the
 * stamp colour), the reward on the map's own address. */
export const TRAY_ROUTE: Record<MapPart, string> = {
  business: "/onboarding/business",
  colours: "/onboarding/color",
  stamp: "/onboarding/stamp",
  reward: MAP,
};

/** What a tray's history entry carries: opened from the map (so closing goes
 * back), and on the map's address, that the reward's tray is the one open. */
export interface TrayState {
  fromCard?: boolean;
  tray?: "reward";
}

export interface Move {
  /** The address the entry on screen takes first, without being shown: the
   * map, under a tray that had none. */
  under?: string;
  to: string;
  replace: boolean;
  state: TrayState;
}

/**
 * How to open `target` from what is on screen: from the map at rest, an
 * entry of its own; from a tray the map opened, that tray's place, so Back
 * still lands on the map. A tray arrived at by its address (a first visit, a
 * reload, the forward guard) has no map under it, so its entry becomes the
 * map's and the next tray goes on top: Back then closes it onto the map
 * instead of leaving the wizard.
 */
export function openMove(open: MapPart | null, fromCard: boolean, target: MapPart): Move {
  const state: TrayState = { fromCard: true, ...(target === "reward" ? { tray: "reward" as const } : {}) };
  const to = TRAY_ROUTE[target];
  if (open === null) return { to, replace: false, state };
  if (fromCard) return { to, replace: true, state };
  return { under: MAP, to, replace: false, state };
}
