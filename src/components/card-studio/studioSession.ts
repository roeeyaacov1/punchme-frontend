import { dropDraft, readDraft, writeDraft } from "../messaging/sessionDraft";
import { HELD_ORDER, type CardStudioValue, type HeldPictures, type HeldUse } from "./studioDraft";

/**
 * The studio's draft, kept in this tab as the message editors keep theirs,
 * so leaving the page loses nothing.
 *
 * The edits are one small entry. Each held picture is an entry of its own:
 * a stamp picture is at most 512px, but a strip background is at least
 * 1125×432 and a logo can be anything, and one that doesn't fit the tab's
 * storage is simply not kept. Its entry is cleared before it is written, so
 * an older picture can never come back in its place.
 *
 * The edits keep the card they started from beside them, so on return only
 * the owner's own changes go on top of the card as it is now: a save made
 * elsewhere in between is never undone.
 */
interface KeptEdits {
  base: CardStudioValue;
  value: CardStudioValue;
}

export interface KeptDraft extends KeptEdits {
  held: HeldPictures;
}

const editsKey = (businessId: string, templateId: string) => `${businessId}/design/${templateId}`;
const pictureKey = (businessId: string, templateId: string, use: HeldUse) =>
  `${editsKey(businessId, templateId)}/${use}`;
const uploadedKey = (businessId: string, templateId: string) => `${editsKey(businessId, templateId)}/uploaded-stamp`;
const syncWaitKey = (businessId: string, templateId: string) => `${editsKey(businessId, templateId)}/sync-wait`;

export function keepEdits(businessId: string, templateId: string, edits: KeptEdits): void {
  writeDraft(editsKey(businessId, templateId), edits);
}

export function keepPicture(businessId: string, templateId: string, use: HeldUse, dataUrl: string | undefined): void {
  const key = pictureKey(businessId, templateId, use);
  dropDraft(key);
  if (dataUrl) writeDraft(key, dataUrl);
}

export function readKept(businessId: string, templateId: string): KeptDraft | null {
  const edits = readDraft<KeptEdits>(editsKey(businessId, templateId));
  // Without the card they started from, there is no telling the owner's
  // changes from a save made since.
  if (!edits?.value || !edits.base) return null;
  const held: HeldPictures = {};
  for (const use of HELD_ORDER) {
    const picture = readDraft<string>(pictureKey(businessId, templateId, use));
    if (picture) held[use] = picture;
  }
  return { base: edits.base, value: edits.value, held };
}

export function dropKept(businessId: string, templateId: string): void {
  dropDraft(editsKey(businessId, templateId));
  for (const use of HELD_ORDER) dropDraft(pictureKey(businessId, templateId, use));
}

/** The stamp picture this device sent, kept in the tab, so the stand-in can
 * draw it after a save: the design read names it but doesn't carry it. */
export function keepUploadedStamp(businessId: string, templateId: string, dataUrl: string): void {
  writeDraft(uploadedKey(businessId, templateId), dataUrl);
}

export function readUploadedStamp(businessId: string, templateId: string): string | null {
  return readDraft<string>(uploadedKey(businessId, templateId));
}

/** Where the wallet's sync stood before a save (`sync.synced_at`), kept
 * until it has run since, so the published pictures drawn before the save
 * don't come back on a return to the page. */
export interface SyncWait {
  before: string | null;
}

export function keepSyncWait(businessId: string, templateId: string, before: string | null): void {
  writeDraft(syncWaitKey(businessId, templateId), { before } satisfies SyncWait);
}

export function readSyncWait(businessId: string, templateId: string): SyncWait | null {
  const wait = readDraft<SyncWait>(syncWaitKey(businessId, templateId));
  return wait && "before" in wait ? { before: wait.before ?? null } : null;
}

export function dropSyncWait(businessId: string, templateId: string): void {
  dropDraft(syncWaitKey(businessId, templateId));
}
