import { describe, expect, it } from "vitest";
import type { ReferralGrant, ReferralRule } from "../../../api/referrals";
import {
  countSentenceKey,
  decisionEffects,
  giftRulesOn,
  giftsOf,
  grantsHorizon,
  monthGifts,
  monthStart,
  personOf,
  prefixJoiner,
  sentenceStart,
  walkReached,
} from "./referralFacts";

const NOW = new Date(2026, 9, 22, 12, 0);
const day = (d: number, month = 10) => new Date(2026, month - 1, d, 9, 0).toISOString();

let seq = 0;
function grant(patch: Partial<ReferralGrant> = {}): ReferralGrant {
  seq += 1;
  return {
    id: `g${seq}`,
    referral_id: "r1",
    event: "friend_first_stamp",
    recipient: "referrer",
    recipient_card_id: "c1",
    recipient_display_name: "Dana",
    gift_stamps: 1,
    gift_complete_card: false,
    stamps_granted: 1,
    message_sent: true,
    title_rendered: "",
    body_rendered: "",
    status: "granted",
    skip_reason: "",
    failure_reason: "",
    attempts: 1,
    granted_at: day(20),
    revoked_at: null,
    created_at: day(20),
    ...patch,
  };
}

function rule(event: ReferralRule["event"], recipient: ReferralRule["recipient"], patch: Partial<ReferralRule> = {}): ReferralRule {
  return { event, recipient, enabled: true, gift_stamps: 1, gift_complete_card: false, title: "", body: "", saved: true, ...patch };
}

describe("the gifts' horizon", () => {
  it("reaches the start of the month, or the oldest referral on screen if that is older", () => {
    expect(grantsHorizon([], NOW)).toBe(monthStart(NOW));
    expect(grantsHorizon([{ created_at: day(15) }], NOW)).toBe(monthStart(NOW));
    expect(grantsHorizon([{ created_at: day(15) }, { created_at: day(3, 8) }], NOW)).toBe(Date.parse(day(3, 8)));
  });

  it("stops at a page that reaches past it, or an empty one", () => {
    const horizon = monthStart(NOW);
    expect(walkReached([{ created_at: day(20) }, { created_at: day(2) }], horizon)).toBe(false);
    expect(walkReached([{ created_at: day(20) }, { created_at: day(28, 9) }], horizon)).toBe(true);
    expect(walkReached([], horizon)).toBe(true);
  });
});

describe("monthGifts", () => {
  it("adds the stamps and the full cards granted this month, and nothing else", () => {
    const gifts = monthGifts(
      [
        grant({ stamps_granted: 2 }),
        grant({ gift_complete_card: true, stamps_granted: 9 }),
        grant({ status: "skipped", skip_reason: "cap_reached", granted_at: null }),
        grant({ granted_at: day(28, 9), created_at: day(28, 9) }),
        grant({ status: "pending", granted_at: null }),
      ],
      NOW,
    );
    expect(gifts).toEqual({ stamps: 2, cards: 1 });
  });
});

describe("giftsOf", () => {
  it("lists a referral's own gifts in the order they came, and leaves scans out", () => {
    const later = grant({ created_at: day(21) });
    const earlier = grant({ created_at: day(19), event: "friend_joined", recipient: "friend" });
    const other = grant({ referral_id: "r2" });
    const scan = grant({ event: "scanned" });
    expect(giftsOf("r1", [later, other, scan, earlier]).map((g) => g.id)).toEqual([earlier.id, later.id]);
  });
});

describe("what the rules that are on give", () => {
  it("lists the gift rules in the order things happen to a friend", () => {
    const rules = [
      rule("friend_completed_card", "referrer", { gift_complete_card: true, gift_stamps: 0 }),
      rule("scanned", "referrer", { gift_stamps: 0, body: "Someone scanned" }),
      rule("friend_joined", "friend", { enabled: false }),
      rule("friend_first_stamp", "referrer"),
    ];
    expect(giftRulesOn(rules).map((r) => r.event)).toEqual(["friend_first_stamp", "friend_completed_card"]);
  });

  it("says what counting does: a welcome gift now, a member's gift later", () => {
    expect(decisionEffects([rule("friend_joined", "friend"), rule("friend_first_stamp", "referrer")])).toEqual({
      welcome: true,
      memberGift: "firstStamp",
    });
    expect(decisionEffects([rule("friend_joined", "friend", { gift_stamps: 0, body: "Hi" })])).toEqual({
      welcome: false,
      memberGift: null,
    });
  });

  it("says when the member's gift comes: the first stamp, else the first full card", () => {
    const card = rule("friend_completed_card", "referrer", { gift_complete_card: true, gift_stamps: 0 });
    expect(decisionEffects([card]).memberGift).toBe("firstCard");
    expect(decisionEffects([card, rule("friend_first_stamp", "referrer")]).memberGift).toBe("firstStamp");
    expect(countSentenceKey({ welcome: false, memberGift: "firstCard" })).toBe("referrals.decision.countMemberCard");
    expect(countSentenceKey({ welcome: true, memberGift: "firstStamp" })).toBe("referrals.decision.countBoth");
    expect(countSentenceKey({ welcome: true, memberGift: null })).toBe("referrals.decision.countWelcome");
    expect(countSentenceKey({ welcome: false, memberGift: null })).toBe("referrals.decision.countPlain");
  });
});

describe("prefixJoiner", () => {
  it("hyphens a Hebrew prefix onto another script only", () => {
    expect(prefixJoiner("Emma Brown", "he")).toBe("-");
    expect(prefixJoiner("Александра", "he")).toBe("-");
    expect(prefixJoiner("נועה כהן", "he")).toBe("");
    expect(prefixJoiner("Emma Brown", "en")).toBe("");
  });
});

describe("sentenceStart", () => {
  it("capitalises a name said in words, never a real one", () => {
    expect(sentenceStart({ kind: "noName" }, "a customer with no name")).toBe("A customer with no name");
    expect(sentenceStart({ kind: "name", name: "da Silva" }, "da Silva")).toBe("da Silva");
  });
});

describe("personOf", () => {
  it("tells a customer with no name from one whose card was removed", () => {
    expect(personOf("  Noa Cohen ", "c1")).toEqual({ kind: "name", name: "Noa Cohen" });
    expect(personOf("", "c1")).toEqual({ kind: "noName" });
    expect(personOf("", null)).toEqual({ kind: "removed" });
  });
});
