/**
 * Where the tour's card stands.
 *
 * Pure, so the one rule that matters can be tested: with nothing to point
 * at, or nothing of it on screen, the card is centred. The tour lays a dark
 * that takes every tap over the whole screen, and a card that is nowhere to
 * be seen under it is a phone that can't be used until a rotation or a
 * keyboard's Escape lets it go. A stop's element can fail to turn up for
 * many reasons (a panel a plan doesn't have, a request still out, a page
 * that changed), so the card barely waits for it: after at most 150ms in
 * the dark (DashboardTour's ARRIVE_WAIT_MS) it stands in the middle while
 * the element is looked for, and stays there if it never comes.
 *
 * Coordinates are the screen's, as `getBoundingClientRect` gives them, so
 * "left" here is a measured position rather than a writing direction: the
 * flank with more room wins in either language.
 */

export interface Box {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Place {
  top: number;
  left: number;
}

/** Between the lit element and the card that explains it. */
export const GAP = 12;
/** Keeps the card off the screen's edges. */
export const MARGIN = 16;
/** The widest the card gets. */
const CARD_MAX = 380;

/** The card's width on a screen this wide. */
export function cardWidth(screenWidth: number): number {
  return Math.min(CARD_MAX, screenWidth - MARGIN * 2);
}

/** The tallest the card gets on a screen this tall. Large text can make it
 * taller than a phone; held to this, its words scroll inside it and the
 * whole card still stands on screen, wherever it is placed. */
export function cardMaxHeight(screenHeight: number): number {
  return Math.max(0, screenHeight - MARGIN * 2);
}

/** Whether any of the box is on screen at all. */
export function onScreen(box: Box, screen: Size): boolean {
  return (
    box.width > 0 &&
    box.height > 0 &&
    box.top < screen.height &&
    box.top + box.height > 0 &&
    box.left < screen.width &&
    box.left + box.width > 0
  );
}

export function centred(screen: Size, card: Size): Place {
  return {
    top: Math.max(MARGIN, (screen.height - card.height) / 2),
    left: Math.max(MARGIN, (screen.width - card.width) / 2),
  };
}

/**
 * Below the lit box if it fits, above if not, beside it where a flank is
 * wide enough, and otherwise as low as the screen allows, which covers the
 * least of it. With no box, or none of it on screen, centred.
 */
export function placeCard(screen: Size, card: Size, box: Box | null): Place {
  if (!box || !onScreen(box, screen)) return centred(screen, card);

  const { width, height } = card;
  const vw = screen.width;
  const vh = screen.height;
  const clampX = (x: number) =>
    Math.min(Math.max(MARGIN, x), Math.max(MARGIN, vw - width - MARGIN));
  const clampY = (y: number) =>
    Math.min(Math.max(MARGIN, y), Math.max(MARGIN, vh - height - MARGIN));

  const middleX = clampX(box.left + box.width / 2 - width / 2);
  // The middle of however much of it is on screen: a list running off the
  // bottom must not drag the card off with it.
  const middleY = clampY(
    (Math.max(0, box.top) + Math.min(vh, box.top + box.height)) / 2 - height / 2,
  );

  const below = box.top + box.height + GAP;
  const above = box.top - GAP - height;
  const rightSide = box.left + box.width + GAP;
  const leftSide = box.left - GAP - width;
  const roomRight = vw - rightSide - MARGIN;
  const roomLeft = box.left - GAP - MARGIN;

  if (below + height + MARGIN <= vh) return { top: below, left: middleX };
  if (above >= MARGIN) return { top: above, left: middleX };
  if (Math.max(roomRight, roomLeft) >= width) {
    return { top: middleY, left: roomRight >= roomLeft ? rightSide : leftSide };
  }
  // Nothing fits around it. The page couldn't be scrolled far enough to open
  // a gap, so some overlap is the honest outcome rather than a bug.
  return { top: Math.max(MARGIN, vh - height - MARGIN), left: middleX };
}
