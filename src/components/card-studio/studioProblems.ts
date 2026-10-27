import { ApiError } from "../../api/errors";
import { failureCause } from "../../routes/dashboard/scan/answer";
import { problemKey } from "../../routes/dashboard/problem";
import type { HeldUse } from "./studioDraft";

/**
 * A save or an upload that didn't go through, as one sentence in the page's
 * language: never `err.message`, which is the server's English, and never
 * the sign-in page's fallback.
 */
export interface StudioProblem {
  /** The sentence's key. */
  key: string;
  values?: Record<string, string | number>;
  /** A picture that didn't go, named in the sentence. */
  picture?: HeldUse;
  /** A field the server named: Wallet details opens on it. */
  fieldIndex?: number;
}

/** "design.fields.3.label: String should have at most 60 characters" */
const FIELD = /^design\.fields\.(\d+)\b/;
/** "strip image must be at least 1125x432px; got 900x300" */
const STRIP_SIZE = /got (\d+)x(\d+)/;

/**
 * A PATCH that failed. A design the server refused names its field when it
 * can (`design_constraint` keeps its message); a refusal of the name or the
 * reward can't be placed (the client keeps no `detail` list), and the
 * fields' `maxLength`s keep a typed one from ever getting this far.
 */
export function saveProblem(error: unknown): StudioProblem {
  if (error instanceof ApiError && error.status === 422) {
    const field = error.code === "design_constraint" ? FIELD.exec(error.message) : null;
    if (field) return { key: "studio.problem.field", fieldIndex: Number(field[1]), values: { n: Number(field[1]) + 1 } };
    return { key: "studio.problem.invalid" };
  }
  return { key: problemKey(error) };
}

/** An upload that failed, which stops the save before anything else is sent. */
export function uploadProblem(picture: HeldUse, error: unknown): StudioProblem {
  if (error instanceof ApiError) {
    if (error.status === 422) {
      const size = STRIP_SIZE.exec(error.message);
      if (size) return { key: "studio.problem.small", picture, values: { width: Number(size[1]), height: Number(size[2]) } };
      return { key: "studio.problem.unreadable", picture };
    }
    if (error.status === 503) return { key: "studio.problem.wallet", picture };
  }
  if (failureCause(error) === "offline") return { key: "studio.problem.offline", picture };
  return { key: problemKey(error), picture };
}
