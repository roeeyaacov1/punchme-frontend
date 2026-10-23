import type { TFunction } from "i18next";
import { describe, expect, it } from "vitest";
import type { AutomationOut, BroadcastOut, DeliveryOut } from "../../../api/messaging";
import { sendOrigin, sendState, sentHistory, type SentFeed, type SentHistory } from "./sentHistory";

function broadcast(id: string, at: string): BroadcastOut {
  return {
    id,
    title: "",
    body: "Hi",
    status: "sent",
    gift_stamps: 0,
    gift_complete_card: false,
    opt_in_only: false,
    template_id: null,
    audience_count: 10,
    sent_count: 10,
    failed_count: 0,
    skipped_count: 0,
    pending_count: 0,
    reached_count: 10,
    created_at: at,
    sent_at: at,
  };
}

function send(id: number, at: string, patch: Partial<DeliveryOut> = {}): DeliveryOut {
  return {
    id,
    automation_id: "rule-1",
    kind: "birthday",
    customer_display_name: "Dana",
    status: "sent",
    skip_reason: "",
    gift_granted: 0,
    title_rendered: "",
    body_rendered: "Hi",
    created_at: at,
    sent_at: at,
    ...patch,
  };
}

function feed<T>(items: T[], more = false, count = items.length): SentFeed<T> {
  return { items, count, more };
}

function ids(history: SentHistory) {
  return history.entries.map((entry) => (entry.type === "broadcast" ? entry.broadcast.id : entry.send.id));
}

const t = ((key: string, options?: { count?: number }) =>
  options?.count === undefined ? key : `${key}:${options.count}`) as unknown as TFunction;

describe("sentHistory", () => {
  it("reads both feeds as one list, newest first", () => {
    const history = sentHistory(
      feed([broadcast("b2", "2026-10-20T10:00:00Z"), broadcast("b1", "2026-10-01T10:00:00Z")]),
      feed([send(3, "2026-10-21T10:00:00Z"), send(2, "2026-10-10T10:00:00Z")]),
    );
    expect(ids(history)).toEqual([3, "b2", 2, "b1"]);
    expect(history.next).toBeNull();
    expect(history.total).toBe(4);
  });

  it("holds back a row that a feed still loading could come above", () => {
    // The sends are loaded down to the 18th; one not loaded yet could be
    // newer than the broadcast of the 1st, so that waits.
    const history = sentHistory(
      feed([broadcast("b2", "2026-10-20T10:00:00Z"), broadcast("b1", "2026-10-01T10:00:00Z")]),
      feed([send(3, "2026-10-21T10:00:00Z"), send(2, "2026-10-18T10:00:00Z")], true, 30),
    );
    expect(ids(history)).toEqual([3, "b2", 2]);
    expect(history.next).toBe("personal");
    expect(history.total).toBe(32);
  });

  it("pages the feed whose oldest loaded row is the newer", () => {
    const history = sentHistory(
      feed([broadcast("b2", "2026-10-20T10:00:00Z")], true, 12),
      feed([send(3, "2026-10-21T10:00:00Z"), send(2, "2026-10-05T10:00:00Z")], true, 30),
    );
    expect(ids(history)).toEqual([3, "b2"]);
    expect(history.next).toBe("broadcasts");
  });

  it("drops a row that a later page repeats", () => {
    const history = sentHistory(
      feed([]),
      feed([send(3, "2026-10-21T10:00:00Z"), send(2, "2026-10-18T10:00:00Z"), send(2, "2026-10-18T10:00:00Z")]),
    );
    expect(ids(history)).toEqual([3, 2]);
  });

  it("keeps to the broadcasts when the API pages broadcast rows in", () => {
    const history = sentHistory(
      feed([broadcast("b1", "2026-10-20T10:00:00Z")]),
      feed([send(9, "2026-10-20T10:00:00Z", { kind: "broadcast" }), send(3, "2026-10-19T10:00:00Z")], true, 400),
    );
    expect(ids(history)).toEqual(["b1"]);
    expect(history.next).toBeNull();
    expect(history.total).toBe(1);
  });
});

describe("sendState", () => {
  it("says a gift with the send", () => {
    expect(sendState(send(1, "2026-10-21T10:00:00Z", { gift_granted: 2 }), t)).toBe("messaging.sends.sentWithGift:2");
  });

  it("says why a send was skipped, or only that it was", () => {
    expect(sendState(send(1, "2026-10-21T10:00:00Z", { status: "skipped", skip_reason: "no_pass" }), t)).toBe(
      "messaging.sends.skipped.no_pass",
    );
    expect(sendState(send(1, "2026-10-21T10:00:00Z", { status: "skipped", skip_reason: "new_reason" }), t)).toBe(
      "messaging.sends.skipped.other",
    );
  });

  it("reads anything not yet settled as on its way", () => {
    expect(sendState(send(1, "2026-10-21T10:00:00Z", { status: "queued", sent_at: null }), t)).toBe(
      "messaging.sends.onTheWay",
    );
  });
});

describe("sendOrigin", () => {
  const rules = [{ id: "rule-1", name: "Happy birthday", kind: "birthday" }] as AutomationOut[];

  it("names the rule as the owner did", () => {
    expect(sendOrigin(send(1, "2026-10-21T10:00:00Z"), rules, t)).toBe("Happy birthday");
  });

  it("falls back to the kind's name once the rule is deleted", () => {
    expect(sendOrigin(send(1, "2026-10-21T10:00:00Z", { automation_id: "gone" }), rules, t)).toBe(
      "messaging.kinds.birthday",
    );
  });

  it("calls a message from Customers personal", () => {
    expect(sendOrigin(send(1, "2026-10-21T10:00:00Z", { kind: "direct", automation_id: "one-off" }), rules, t)).toBe(
      "messaging.kinds.direct",
    );
  });
});
