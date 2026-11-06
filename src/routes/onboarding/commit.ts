/** Turning the draft into a real Business + CardTemplate, once the owner has
 * an account. Written to be re-run safely: every step first looks at what
 * already exists, because the two hard facts about the API are that one
 * owner gets exactly one Business (a second POST is a 500, not a 409) and
 * that a lost response is indistinguishable from a failure. */

import type { QueryClient } from "@tanstack/react-query";
import {
  createBusiness,
  createTemplate,
  getMyBusiness,
  listTemplates,
  patchBusiness,
  patchTemplate,
  type Business,
  type CardTemplate,
  type CardTemplateIn,
} from "../../api/businesses";
import { uploadTemplateImage } from "../../api/designs";
import { ApiError } from "../../api/errors";
import { dataUrlToFile } from "../../lib/stampArt";
import { fingerprint, type CommittedRecord, type OnboardingDraft, type ResolvedDraft } from "./draft";
import { PictureNotTaken } from "./problems";

/** A picture kept on the device, by its hash. */
interface KeptPicture {
  hash: string;
  dataUrl: string;
}

export interface CommitContext {
  draft: OnboardingDraft;
  resolved: ResolvedDraft;
  /** `buildTemplateInput(resolved, …)` — built by the caller so the language
   * and translations are the ones on screen. */
  input: CardTemplateIn;
  /** The picture to upload as stamp_art, when the stamp is a picture. Null
   * for a glyph. */
  art: KeptPicture | null;
  /** The logo to upload as `logo`, when a card from a look has one on this
   * device (card looks, brief §7.5). */
  logo?: KeptPicture | null;
  queryClient: QueryClient;
  /** Persist progress into the draft as it happens (business created →
   * template created → each picture uploaded), so a retry after a lost
   * response or a failed upload resumes rather than duplicates. */
  saveCommitted: (record: CommittedRecord) => void;
  /** A returning owner who already had a card chose to replace its design. */
  replaceExisting?: boolean;
}

export type CommitOutcome =
  | { kind: "ready"; businessId: string; templateId: string }
  /** The account already owns a card the wizard did not make. Ask before
   * touching it. */
  | { kind: "existing-card"; business: Business; template: CardTemplate };

async function getMyBusinessOrNull(): Promise<Business | null> {
  try {
    return await getMyBusiness();
  } catch (err) {
    // Only "you have no business yet" means none. A network error must not,
    // or the next line would create a duplicate.
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

function seedCaches(queryClient: QueryClient, business: Business, template: CardTemplate) {
  queryClient.setQueryData(["business", "me"], business);
  queryClient.setQueryData(["templates", business.id], [template]);
  void queryClient.invalidateQueries({ queryKey: ["design", template.id] });
}

/** One picture uploaded, its failure said as that picture's. */
async function upload(businessId: string, templateId: string, use: "logo" | "stamp_art", picture: KeptPicture) {
  try {
    await uploadTemplateImage(businessId, templateId, use, dataUrlToFile(picture.dataUrl, use === "logo" ? "logo" : "stamp"));
  } catch (err) {
    throw new PictureNotTaken(use, err);
  }
}

/**
 * The card's pictures that this save hasn't uploaded yet: the logo, then
 * the stamp's picture, each once. The record is kept after each, so a retry
 * uploads only what is left.
 */
async function uploadPictures(
  record: CommittedRecord,
  { art, logo }: Pick<CommitContext, "art" | "logo">,
  saveCommitted: CommitContext["saveCommitted"],
): Promise<CommittedRecord> {
  let kept = record;
  if (logo && logo.hash !== (kept.logoHash ?? null)) {
    await upload(kept.businessId, kept.templateId!, "logo", logo);
    kept = { ...kept, logoHash: logo.hash };
    saveCommitted(kept);
  }
  if (art && art.hash !== kept.artHash) {
    await upload(kept.businessId, kept.templateId!, "stamp_art", art);
    kept = { ...kept, artHash: art.hash };
    saveCommitted(kept);
  }
  return kept;
}

export async function commitDraft(ctx: CommitContext): Promise<CommitOutcome> {
  const { draft, resolved, input, art, queryClient, saveCommitted } = ctx;
  const logo = ctx.logo ?? null;
  const fp = fingerprint(input);
  const artHash = art?.hash ?? null;
  const logoHash = logo?.hash ?? null;

  let business = await getMyBusinessOrNull();

  if (!business) {
    try {
      business = await createBusiness({
        name: resolved.name,
        niche: resolved.niche,
        phone: resolved.phone,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
    } catch (err) {
      // The request may have landed and only the response been lost.
      const again = await getMyBusinessOrNull();
      if (!again) throw err;
      business = again;
    }
    saveCommitted({
      businessId: business.id!,
      templateId: null,
      fingerprint: "",
      artHash: null,
      syncBaseline: null,
      errorBaseline: "",
    });
  }

  const businessId = business.id!;
  const templates = await listTemplates(businessId);
  const committed = draft.committed;
  let template = committed?.templateId
    ? templates.find((candidate) => candidate.id === committed.templateId)
    : undefined;

  if (!template && templates.length > 0) {
    // A card this wizard did not create. Never overwrite it silently.
    if (!ctx.replaceExisting) {
      return { kind: "existing-card", business, template: templates[0] };
    }
    template = templates[0];
  }

  if (!template) {
    template = await createTemplate(businessId, input);
    // The card exists before its pictures do: kept now, so a retry after a
    // picture that didn't go uploads only the pictures, onto this card.
    const created: CommittedRecord = {
      businessId,
      templateId: template.id!,
      fingerprint: fp,
      artHash: null,
      ...(logo ? { logoHash: null } : {}),
      syncBaseline: template.design_synced_at ?? null,
      errorBaseline: "",
    };
    saveCommitted(created);
    await uploadPictures(created, { art, logo }, saveCommitted);
    seedCaches(queryClient, business, template);
    return { kind: "ready", businessId, templateId: template.id! };
  }

  // The template exists — ours from an earlier pass, or adopted above.
  const sameCard = committed !== null && committed.templateId === template.id && committed.fingerprint === fp;
  const unchanged = sameCard && committed.artHash === artHash && (committed.logoHash ?? null) === logoHash;
  if (unchanged) {
    seedCaches(queryClient, business, template);
    return { kind: "ready", businessId, templateId: template.id! };
  }

  if (business.name !== resolved.name || business.niche !== resolved.niche) {
    business = await patchBusiness(businessId, { name: resolved.name, niche: resolved.niche });
  }
  // Only the pictures left to upload: the card itself is as it was saved.
  const patched = sameCard ? template : await patchTemplate(businessId, template.id!, input);
  const record: CommittedRecord = {
    businessId,
    templateId: patched.id!,
    fingerprint: fp,
    // A picture is the same one once its hash is; a stamp that is no longer
    // a picture has none to keep.
    artHash: art && committed?.artHash === art.hash ? art.hash : null,
    ...(logo || committed?.logoHash ? { logoHash: logo && committed?.logoHash === logo.hash ? logo.hash : null } : {}),
    // The PATCH queues a fresh sync; whatever timestamp the row carries now
    // is the OLD one, and the wallet step must wait for a newer one.
    syncBaseline: sameCard
      ? (committed?.syncBaseline ?? null)
      : (patched.design_synced_at ?? committed?.syncBaseline ?? null),
    errorBaseline: "",
  };
  saveCommitted(record);
  await uploadPictures(record, { art, logo }, saveCommitted);
  seedCaches(queryClient, business, patched);
  return { kind: "ready", businessId, templateId: patched.id! };
}
