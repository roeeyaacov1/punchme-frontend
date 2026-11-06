/**
 * A published catalog look's pictures, as the wizard shows them (brief §6.10,
 * backend PR #20 item 1): Apple's strip and Google's hero, drawn once by a
 * task after the look is published or saved, and served on its entry in
 * `GET /api/presets`. Pure, so it can be tested.
 */

/** How often the shelf looks again while the pictures are being drawn, and
 * for how long after a save. */
export const LOOK_PICTURES_POLL_MS = 5_000;
export const LOOK_PICTURES_WAIT_MS = 120_000;

export interface LookPictures {
  strip: string;
  hero: string;
}

/** Where the look's pictures stand on its shelf. */
export type LookPicturesState =
  /** Not on owners' shelves yet: nothing is drawn. */
  | { kind: "unpublished" }
  /** A plain look: the wizard draws it in its own colours. */
  | { kind: "plain" }
  | { kind: "drawn"; pictures: LookPictures }
  /** Published since the last save, the task still to finish. */
  | { kind: "drawing" }
  /** Two minutes on, and still none: the wizard leaves it out. */
  | { kind: "failed" };

export function lookPicturesState({
  published,
  styled,
  pictures,
  savedAt,
  now,
}: {
  /** As saved: a look still being made isn't on any shelf. */
  published: boolean;
  /** As saved: the server draws the look itself. */
  styled: boolean;
  pictures: LookPictures | null | undefined;
  /** When the look was last saved in this editor, or opened. */
  savedAt: number;
  now: number;
}): LookPicturesState {
  if (!published) return { kind: "unpublished" };
  if (!styled) return { kind: "plain" };
  if (pictures?.strip || pictures?.hero) return { kind: "drawn", pictures: pictures as LookPictures };
  return now - savedAt < LOOK_PICTURES_WAIT_MS ? { kind: "drawing" } : { kind: "failed" };
}

/** Whether to look for them again: only while they are being drawn. */
export function lookAgainIn(state: LookPicturesState): number | false {
  return state.kind === "drawing" ? LOOK_PICTURES_POLL_MS : false;
}
