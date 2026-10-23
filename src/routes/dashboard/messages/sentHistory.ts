import type { TFunction } from "i18next";
import type { AutomationOut, BroadcastOut, DeliveryOut } from "../../../api/messaging";
import { ruleName } from "./rules";

/**
 * Sent reads two histories as one: the broadcasts, and the personal sends
 * (a rule's, or a message to one customer from Customers). Each comes from
 * its own call, newest first and paged on its own.
 */

export type SentEntry =
  | { type: "broadcast"; at: number; broadcast: BroadcastOut }
  | { type: "personal"; at: number; send: DeliveryOut };

export interface SentFeed<T> {
  items: T[];
  /** Everything the API holds, loaded or not. */
  count: number;
  /** Another page to load. */
  more: boolean;
}

export interface SentHistory {
  /** Newest first, as far down as both feeds are known. */
  entries: SentEntry[];
  /** The feed whose next page takes the list further; null once both are read. */
  next: "broadcasts" | "personal" | null;
  /** Everything both feeds hold. */
  total: number;
}

/** Each row once: a send written while the owner pages pushes a row from
 * one page onto the next. */
function once<T extends { id: string | number }>(items: T[]): T[] {
  const seen = new Set<string | number>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

/**
 * The two feeds as one list. Each comes in the API's order, by
 * `created_at`, so while a feed has more to load its oldest loaded row is
 * a horizon: whatever it hasn't loaded is older still, and nothing from
 * the other feed below that line can be placed yet. The list stops at the
 * higher horizon, and that feed is the one to page.
 *
 * An API from before `exclude_kind` ignores it and pages every broadcast's
 * rows in with the rest; then Sent holds the broadcasts alone, as it did.
 */
export function sentHistory(broadcasts: SentFeed<BroadcastOut>, personal: SentFeed<DeliveryOut>): SentHistory {
  const unfiltered = personal.items.some((send) => send.kind === "broadcast");
  const feeds = [
    {
      name: "broadcasts" as const,
      entries: once(broadcasts.items).map(
        (broadcast): SentEntry => ({ type: "broadcast", at: Date.parse(broadcast.created_at), broadcast }),
      ),
      count: broadcasts.count,
      more: broadcasts.more,
    },
    {
      name: "personal" as const,
      entries: unfiltered
        ? []
        : once(personal.items).map((send): SentEntry => ({ type: "personal", at: Date.parse(send.created_at), send })),
      count: unfiltered ? 0 : personal.count,
      more: !unfiltered && personal.more,
    },
  ];

  let horizon = -Infinity;
  let next: SentHistory["next"] = null;
  for (const feed of feeds) {
    if (!feed.more) continue;
    const oldest = feed.entries.length > 0 ? feed.entries[feed.entries.length - 1].at : Infinity;
    if (oldest > horizon) {
      horizon = oldest;
      next = feed.name;
    }
  }
  const entries = feeds
    .flatMap((feed) => feed.entries)
    .filter((entry) => entry.at >= horizon)
    .sort((a, b) => b.at - a.at);
  return { entries, next, total: feeds.reduce((sum, feed) => sum + feed.count, 0) };
}

const SKIP_REASONS = ["no_pass", "void", "card_gone", "stale", "gift_unavailable", "paused", "downgraded", "unsupported"];

/** What became of one send: sent (and its gift), didn't go out, skipped and why, or on its way. */
export function sendState(send: DeliveryOut, t: TFunction): string {
  if (send.status === "sent") {
    return send.gift_granted > 0
      ? t("messaging.sends.sentWithGift", { count: send.gift_granted })
      : t("messaging.sends.sent");
  }
  if (send.status === "failed") return t("messaging.sends.failed");
  if (send.status === "skipped") {
    const reason = SKIP_REASONS.includes(send.skip_reason) ? send.skip_reason : "other";
    return t(`messaging.sends.skipped.${reason}`);
  }
  return t("messaging.sends.onTheWay");
}

/** Where a personal send came from: its rule, by the name the owner gave
 * it (or its kind's, once the rule is deleted), or a message to one
 * customer. */
export function sendOrigin(send: DeliveryOut, rules: AutomationOut[], t: TFunction): string {
  if (send.kind === "direct") return t("messaging.kinds.direct");
  const rule = rules.find((item) => item.id === send.automation_id);
  return ruleName(rule ?? { name: "", kind: send.kind }, t);
}
