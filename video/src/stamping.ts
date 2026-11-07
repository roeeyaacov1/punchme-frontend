import { beatStart } from "./timeline.ts";

/**
 * The hero card's run of ten stamps, on the track's grid from the stamps
 * beat's start: four on eighth notes, then six on sixteenths, so the run
 * speeds up into the drop. Each rounded to its frame.
 */
const RUN = [37.5, 45, 52.5, 60, 63.75, 67.5, 71.25, 75, 78.75, 82.5];

export const HERO_STAMPS = RUN.map((at) => Math.round(beatStart("stamps") + at));
