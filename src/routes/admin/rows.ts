import type { Reason, ShelfRow } from "./shelf";

/** Where a reason's words are: two are said elsewhere already, the same way. */
export function reasonKey(reason: Reason): string {
  if (reason === "draft") return "admin.catalog.draft";
  if (reason === "drawing") return "admin.catalog.pictures.drawing";
  return `admin.catalog.reasons.${reason}`;
}

/** What the page has to say on a row after its last action. */
export type RowNote =
  | { kind: "moved"; n: number }
  | { kind: "unpublished" }
  | { kind: "failed"; message: string };

/** The name a row goes by: the one owners read, or staff's where owners never meet it. */
export function rowName(row: ShelfRow): string {
  return row.ownersName ?? row.staffName ?? "";
}
