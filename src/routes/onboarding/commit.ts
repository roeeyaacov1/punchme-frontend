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

export interface CommitContext {
  draft: OnboardingDraft;
  resolved: ResolvedDraft;
  /** `buildTemplateInput(resolved, …)` — built by the caller so the language
   * and translations are the ones on screen. */
  input: CardTemplateIn;
  /** The picture to upload as stamp_art, when the stamp is an emoji or an
   * image. Null for a glyph. */
  art: { hash: string; dataUrl: string } | null;
  queryClient: QueryClient;
  /** Persist progress into the draft as it happens (business created →
   * template created), so a retry after a lost response resumes rather
   * than duplicates. */
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

async function uploadArt(businessId: string, templateId: string, art: CommitContext["art"]) {
  if (!art) return;
  await uploadTemplateImage(businessId, templateId, "stamp_art", dataUrlToFile(art.dataUrl, "stamp"));
}

export async function commitDraft(ctx: CommitContext): Promise<CommitOutcome> {
  const { draft, resolved, input, art, queryClient, saveCommitted } = ctx;
  const fp = fingerprint(input);
  const artHash = art?.hash ?? null;

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
    await uploadArt(businessId, template.id!, art);
    seedCaches(queryClient, business, template);
    saveCommitted({
      businessId,
      templateId: template.id!,
      fingerprint: fp,
      artHash,
      syncBaseline: template.design_synced_at ?? null,
      errorBaseline: "",
    });
    return { kind: "ready", businessId, templateId: template.id! };
  }

  // The template exists — ours from an earlier pass, or adopted above.
  const unchanged =
    committed !== null &&
    committed.templateId === template.id &&
    committed.fingerprint === fp &&
    committed.artHash === artHash;
  if (unchanged) {
    seedCaches(queryClient, business, template);
    return { kind: "ready", businessId, templateId: template.id! };
  }

  if (business.name !== resolved.name || business.niche !== resolved.niche) {
    business = await patchBusiness(businessId, { name: resolved.name, niche: resolved.niche });
  }
  const patched = await patchTemplate(businessId, template.id!, input);
  if (art && artHash !== committed?.artHash) {
    await uploadArt(businessId, template.id!, art);
  }
  seedCaches(queryClient, business, patched);
  saveCommitted({
    businessId,
    templateId: patched.id!,
    fingerprint: fp,
    artHash,
    // The PATCH queues a fresh sync; whatever timestamp the row carries now
    // is the OLD one, and the wallet step must wait for a newer one.
    syncBaseline: patched.design_synced_at ?? committed?.syncBaseline ?? null,
    errorBaseline: "",
  });
  return { kind: "ready", businessId, templateId: patched.id! };
}
