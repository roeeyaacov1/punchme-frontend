import { describe, expect, it } from "vitest";
import { ApiError } from "../../../api/errors";
import type { Member, Team } from "../../../api/team";
import {
  MAX_MEMBERS,
  changeRefusalKey,
  inviteRefusalKey,
  joinedSince,
  looksLikeEmail,
} from "./teamFacts";

function member(id: string | null, joinedAt: string, isOwner = false): Member {
  return {
    id,
    user_id: 1,
    email: `${id ?? "owner"}@example.com`,
    role: isOwner ? "owner" : "staff",
    joined_at: joinedAt,
    is_owner: isOwner,
  };
}

function teamOf(people: number): Team {
  return {
    members: Array.from({ length: people }, (_, i) =>
      member(i === 0 ? null : `m${i}`, "2026-10-01T09:00:00Z", i === 0),
    ),
    invitations: [],
  };
}

describe("looksLikeEmail", () => {
  it("takes an address with something, an @, something, a dot and something", () => {
    expect(looksLikeEmail("dana@example.com")).toBe(true);
    expect(looksLikeEmail("dana@cafe.co.il")).toBe(true);
  });

  it("forgives the spaces a paste brings along", () => {
    expect(looksLikeEmail("  dana@example.com ")).toBe(true);
  });

  it("refuses what makes a link nobody can accept", () => {
    expect(looksLikeEmail("dana@")).toBe(false);
    expect(looksLikeEmail("dana")).toBe(false);
    expect(looksLikeEmail("@example.com")).toBe(false);
    expect(looksLikeEmail("dana@example")).toBe(false);
    expect(looksLikeEmail("dana @example.com")).toBe(false);
    expect(looksLikeEmail("")).toBe(false);
  });
});

describe("inviteRefusalKey", () => {
  it("says the person is on the team already", () => {
    const error = new ApiError(409, "Already a member", "already_a_member");
    expect(inviteRefusalKey(error, teamOf(3))).toBe("team.error.alreadyMember");
  });

  it("tells the two caps apart by the team the page holds", () => {
    const error = new ApiError(409, "This business has reached its team limit", "team_cap_reached");
    expect(inviteRefusalKey(error, teamOf(MAX_MEMBERS))).toBe("team.error.capMembers");
    expect(inviteRefusalKey(error, teamOf(MAX_MEMBERS - 1))).toBe("team.error.capInvitations");
  });

  it("calls a 422 a bad address", () => {
    expect(inviteRefusalKey(new ApiError(422, "Unprocessable"), teamOf(1))).toBe("team.error.badEmail");
  });

  it("never passes on the API's English for anything else", () => {
    expect(inviteRefusalKey(new ApiError(400, "Some English detail"), teamOf(1))).toBe("team.error.generic");
    expect(inviteRefusalKey(new ApiError(500, "Server error"), teamOf(1))).toBe("team.error.generic");
    expect(inviteRefusalKey(new TypeError("Failed to fetch"), undefined)).toBe("team.error.generic");
  });
});

describe("changeRefusalKey", () => {
  it("reads a 404 as a change made on another device", () => {
    expect(changeRefusalKey(new ApiError(404, "Not found"))).toBe("team.error.gone");
  });

  it("says anything else plainly", () => {
    expect(changeRefusalKey(new ApiError(500, "Server error"))).toBe("team.error.generic");
    expect(changeRefusalKey(new TypeError("Failed to fetch"))).toBe("team.error.generic");
  });
});

describe("joinedSince", () => {
  const owner = member(null, "2026-10-20T09:00:00Z", true);
  const early = member("early", "2026-10-01T09:00:00Z");
  const late = member("late", "2026-10-21T09:00:00Z");
  const since = Date.parse("2026-10-10T00:00:00Z");

  it("marks the hires who joined after the last visit", () => {
    expect(joinedSince([owner, early, late], since)).toEqual(new Set(["late"]));
  });

  it("marks nobody when no visit was ever kept", () => {
    expect(joinedSince([owner, early, late], null)).toEqual(new Set());
  });

  it("never marks the owner", () => {
    expect(joinedSince([owner], Date.parse("2026-10-01T00:00:00Z"))).toEqual(new Set());
  });

  it("doesn't mark someone who joined at the moment of the visit", () => {
    expect(joinedSince([late], Date.parse(late.joined_at))).toEqual(new Set());
  });
});
