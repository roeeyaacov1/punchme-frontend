import { describe, expect, it } from "vitest";
import {
  GAP,
  MARGIN,
  cardMaxHeight,
  cardWidth,
  centred,
  onScreen,
  placeCard,
  type Box,
} from "./placement";

const phone = { width: 375, height: 812 };
const card = { width: cardWidth(phone.width), height: 220 };

describe("placeCard", () => {
  it("centres the card when there is nothing to point at", () => {
    // A stop whose element never turned up: the panel a plan doesn't have, a
    // request still out. The card must still be on screen, in the middle.
    expect(placeCard(phone, card, null)).toEqual(centred(phone, card));
    expect(placeCard(phone, card, null)).toEqual({ top: 296, left: 16 });
  });

  it("centres the card when none of the element is on screen", () => {
    const belowTheFold: Box = { top: 900, left: 16, width: 343, height: 120 };
    const aboveTheTop: Box = { top: -300, left: 16, width: 343, height: 120 };
    const offToTheSide: Box = { top: 200, left: 400, width: 100, height: 100 };
    for (const box of [belowTheFold, aboveTheTop, offToTheSide]) {
      expect(placeCard(phone, card, box)).toEqual(centred(phone, card));
    }
  });

  it("centres the card for an element that measures nothing", () => {
    const hidden: Box = { top: 200, left: 16, width: 0, height: 0 };
    expect(placeCard(phone, card, hidden)).toEqual(centred(phone, card));
  });

  it("puts the card under the element when it fits there", () => {
    const box: Box = { top: 100, left: 16, width: 343, height: 200 };
    expect(placeCard(phone, card, box)).toEqual({ top: 100 + 200 + GAP, left: MARGIN });
  });

  it("puts the card over the element when there's no room under it", () => {
    // The phone bar's Scan button, at the foot of the screen.
    const box: Box = { top: 720, left: 150, width: 76, height: 80 };
    expect(placeCard(phone, card, box).top).toBe(720 - GAP - card.height);
  });

  it("puts the card beside a tall element on a wide screen", () => {
    const desk = { width: 1280, height: 860 };
    const wide = { width: cardWidth(desk.width), height: 220 };
    const rail: Box = { top: 0, left: 0, width: 272, height: 860 };
    const place = placeCard(desk, wide, rail);
    expect(place.left).toBe(272 + GAP);
  });

  it("never puts the card past the screen's edges", () => {
    const boxes: Box[] = [
      { top: 10, left: 0, width: 375, height: 790 },
      { top: 400, left: 300, width: 70, height: 60 },
      { top: 0, left: 0, width: 40, height: 40 },
    ];
    for (const box of boxes) {
      const { top, left } = placeCard(phone, card, box);
      expect(top).toBeGreaterThanOrEqual(MARGIN);
      expect(top + card.height).toBeLessThanOrEqual(phone.height - MARGIN);
      expect(left).toBeGreaterThanOrEqual(MARGIN);
      expect(left + card.width).toBeLessThanOrEqual(phone.width - MARGIN);
    }
  });

  it("keeps a card held to the screen's height whole on screen", () => {
    // 200% text makes the card taller than a phone, and than some desks.
    // Held to cardMaxHeight it stands between the margins wherever the
    // element is, so its top (Skip) and its foot (Back, Next) are on screen.
    const small = { width: 320, height: 568 };
    const desk = { width: 1280, height: 900 };
    const cases: [typeof small, Box | null][] = [
      [small, null],
      [small, { top: 100, left: 16, width: 288, height: 200 }],
      [small, { top: 480, left: 122, width: 76, height: 80 }],
      [small, { top: 10, left: 0, width: 320, height: 1400 }],
      [desk, { top: 0, left: 0, width: 272, height: 900 }],
      [desk, { top: 300, left: 500, width: 280, height: 200 }],
    ];
    for (const [screen, box] of cases) {
      const tall = { width: cardWidth(screen.width), height: cardMaxHeight(screen.height) };
      const { top, left } = placeCard(screen, tall, box);
      expect(top).toBe(MARGIN);
      expect(top + tall.height).toBe(screen.height - MARGIN);
      expect(left).toBeGreaterThanOrEqual(MARGIN);
      expect(left + tall.width).toBeLessThanOrEqual(screen.width - MARGIN);
    }
  });
});

describe("onScreen", () => {
  it("counts an element that is only partly on screen", () => {
    // A roster longer than any phone still has its top in view.
    expect(onScreen({ top: 500, left: 0, width: 375, height: 2000 }, phone)).toBe(true);
    expect(onScreen({ top: -100, left: 0, width: 375, height: 150 }, phone)).toBe(true);
  });
});
