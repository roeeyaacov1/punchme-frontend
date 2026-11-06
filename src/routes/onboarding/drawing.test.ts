import { describe, expect, it } from "vitest";
import type { TFunction } from "i18next";
import { ApiError } from "../../api/errors";
import { emptyDraft, resolveDraft, type OnboardingDraft } from "./draft";
import { drawBody, drawFailure, drawKey } from "./drawing";

const t = ((key: string) => key) as unknown as TFunction;

function lookDraft(over: Partial<OnboardingDraft> = {}): OnboardingDraft {
  return {
    ...emptyDraft(),
    name: "Rothschild Bakery",
    niche: "cafe",
    background: "#B23A1E",
    accent: "#B23A1E",
    foreground: "#FFFFFF",
    label: "#F6E7CB",
    stamp: { kind: "glyph", glyph: "check" },
    pattern: "none",
    stampsRequired: 8,
    reward: "A free croissant",
    updatedAt: 1,
    look: "cafe-bakery-croissants",
    options: { style: "icon", sticker: "croissant", tint: true, wallpaper: "sheaf-of-rice" },
    panel: "#F6E7CB",
    ...over,
  };
}

const bodyOf = (draft: OnboardingDraft, wallet: "apple" | "google" = "apple") =>
  drawBody(resolveDraft(draft, undefined, t), wallet);

describe("what the drawing is asked", () => {
  it("is the card's enumerated values only, at the count the stage shows, for the wallet shown", () => {
    expect(bodyOf(lookDraft())).toEqual({
      background: "#B23A1E",
      foreground: "#FFFFFF",
      label: "#F6E7CB",
      stamp: "#B23A1E",
      panel: "#F6E7CB",
      style: "icon",
      sticker: "croissant",
      glyph: "check",
      tint: true,
      wallpaper: "sheaf-of-rice",
      pattern: "none",
      stamps_required: 8,
      stamps: 4,
      role: "strip@2x",
    });
    expect(bodyOf(lookDraft(), "google")?.role).toBe("hero");
  });

  it("never carries the card's words or its pictures", () => {
    const body = bodyOf(lookDraft({ logo: "logo-hash" }))!;
    const said = JSON.stringify(body);
    expect(said).not.toContain("Rothschild");
    expect(said).not.toContain("A free");
    expect(said).not.toContain("logo-hash");
    // The drawing refuses any key it doesn't know.
    expect(Object.keys(body).sort()).toEqual(
      [
        "background",
        "foreground",
        "label",
        "stamp",
        "panel",
        "style",
        "sticker",
        "glyph",
        "tint",
        "wallpaper",
        "pattern",
        "stamps_required",
        "stamps",
        "role",
      ].sort(),
    );
  });

  it("asks nothing for a card from before the looks, or one whose stamp is a picture", () => {
    expect(bodyOf({ ...lookDraft(), look: undefined, options: undefined })).toBeNull();
    expect(bodyOf(lookDraft({ stamp: { kind: "image", hash: "pic" } }))).toBeNull();
  });

  it("asks for none rather than an empty sticker or wallpaper, or ground", () => {
    const body = bodyOf(lookDraft({ options: { style: "badge" }, panel: null }))!;
    expect(body.sticker).toBeNull();
    expect(body.wallpaper).toBeNull();
    expect(body.panel).toBeNull();
  });

  it("tells two drawings apart by their body alone, whatever its order", () => {
    const body = bodyOf(lookDraft())!;
    const shuffled = Object.fromEntries(Object.entries(body).reverse()) as typeof body;
    expect(drawKey(shuffled)).toBe(drawKey(body));
    expect(drawKey({ ...body, sticker: "cookie" })).not.toBe(drawKey(body));
  });
});

describe("a drawing that didn't come", () => {
  it("is too many in a short time on a 429, and failed otherwise", () => {
    expect(drawFailure(new ApiError(429, "Too many requests."))).toBe("tooMany");
    expect(drawFailure(new ApiError(503, "unavailable"))).toBe("failed");
    expect(drawFailure(new TypeError("Failed to fetch"))).toBe("failed");
  });
});
