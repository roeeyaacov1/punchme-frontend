import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Wallet } from "lucide-react";
import { CardStudio } from "../../components/card-studio/CardStudio";
import { readLint } from "../../components/card-studio/lintProblems";
import {
  changesBetween,
  fieldName,
  fieldsOver,
  followField,
  HELD_ORDER,
  MAX_FIELDS,
  nameMissing,
  readDesign,
  rebaseEdits,
  sameCard,
  withoutSent,
  type CardStudioValue,
  type HeldPictures,
  type HeldUse,
} from "../../components/card-studio/studioDraft";
import {
  ART_USES,
  artOnCard,
  bothLandedSince,
  laterSync,
  newerRead,
  publishedArt,
  READ_LIMIT_MS,
  settleWithin,
  syncMovedPast,
  type ArtCopies,
  type ArtSent,
  type ArtUse,
  type ReadStamp,
} from "../../components/card-studio/studioReads";
import { saveProblem, uploadProblem, type StudioProblem } from "../../components/card-studio/studioProblems";
import {
  dropKept,
  dropSyncWait,
  keepEdits,
  keepPicture,
  keepSyncWait,
  keepUploaded,
  notKeptNow,
  readKept,
  readSyncWait,
  readUploaded,
  type SyncWait,
} from "../../components/card-studio/studioSession";
import { ReadProblem } from "../../components/dashboard/ReadProblem";
import { isolate } from "./problem";
import { Button, LinkButton, Notice, Skeleton, useToast } from "../../components/kit";
import { useBusiness } from "../../business/useBusiness";
import { listTemplates, patchTemplate, type CardTemplate } from "../../api/businesses";
import {
  designImageUrls,
  getTemplateDesign,
  previewTemplateDesign,
  uploadTemplateImage,
  type DesignOut,
} from "../../api/designs";
import { previewCard, type EnrollOut } from "../../api/loyalty";
import { useDebounce } from "../../hooks/useDebounce";
import { useWalletPass } from "../../hooks/useWalletPass";
import { dataUrlToFile } from "../../lib/stampArt";
import { useLightboxPage } from "../../theme/lightboxPage";

function toStudioValue(template: CardTemplate, design: DesignOut): CardStudioValue {
  return {
    name: template.name,
    stamps_required: template.stamps_required,
    reward_description: template.reward_description,
    background_color: template.background_color ?? "#FFFFFF",
    foreground_color: template.foreground_color ?? "#000000",
    label_color: template.label_color ?? "#000000",
    // The effective design (defaults filled in), so Wallet details shows
    // the card's real fields, not an empty doc; fields that share a binding
    // are mended here, so the next Save mends the card.
    design: readDesign(design.design),
  };
}

const isArt = (use: HeldUse): use is ArtUse => (ART_USES as readonly string[]).includes(use);

interface Failure {
  problem: StudioProblem;
  /** A picture had already gone to customers' cards when it failed. */
  partial: boolean;
}

/**
 * The owner's card studio, on Lightbox. It reads the template and its design,
 * holds the draft (and the pictures chosen for it) until Save, checks the
 * draft with the server 400ms after each edit, and on Save sends the held
 * pictures, then the PATCH, then reads the design once more. The draft is
 * kept in the tab, so leaving the page loses nothing, and closing the tab
 * with changes asks first.
 */
export function DesignPage() {
  useLightboxPage();
  const { t } = useTranslation();
  const toast = useToast();
  const { business } = useBusiness();
  const queryClient = useQueryClient();
  const heading = useRef<HTMLHeadingElement>(null);
  const businessId = business?.id ?? undefined;

  const templatesQuery = useQuery({
    queryKey: ["templates", businessId],
    queryFn: () => listTemplates(businessId!),
    enabled: !!businessId,
  });
  const template = templatesQuery.data?.[0];
  const templateId = template?.id ?? undefined;

  const designQuery = useQuery({
    queryKey: ["design", templateId],
    queryFn: () => getTemplateDesign(businessId!, templateId!),
    enabled: !!businessId && !!templateId,
  });

  const [saved, setSaved] = useState<CardStudioValue | null>(null);
  const [draft, setDraft] = useState<CardStudioValue | null>(null);
  const [held, setHeld] = useState<HeldPictures>({});
  const [kept, setKept] = useState(false);
  const [lint, setLint] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [failure, setFailure] = useState<Failure | null>(null);
  const [tray, setTray] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<number | null>(null);
  const [uploaded, setUploaded] = useState<ArtCopies>({});
  const [artSent, setArtSent] = useState<ArtSent>({});
  const [ownerCard, setOwnerCard] = useState<EnrollOut | null>(null);
  const [syncWait, setSyncWait] = useState<SyncWait | null>(null);
  const [nameFocus, setNameFocus] = useState(0);

  // The card the studio stands on (`saved`), and the reads it came from.
  const baseline = useRef<{ value: CardStudioValue; at: ReadStamp } | null>(null);
  const templatesAt = templatesQuery.dataUpdatedAt;
  const designAt = designQuery.dataUpdatedAt;

  // Seed the draft once per template. A draft kept in the tab from an
  // earlier visit comes back as the owner's own changes on the card as it is
  // now. After that, a read made since (the refetch behind a cached card, or
  // a save made elsewhere) becomes the card the studio stands on, with the
  // owner's edits on top, so Save never sends back an older card.
  const seededFor = useRef<string | null>(null);
  useEffect(() => {
    if (!businessId || !template?.id || !designQuery.data) return;
    const fresh = toStudioValue(template, designQuery.data);
    const at = { templates: templatesAt, design: designAt };
    if (seededFor.current !== template.id) {
      seededFor.current = template.id;
      baseline.current = { value: fresh, at };
      setSaved(fresh);
      setLint(designQuery.data.lint);
      setUploaded(readUploaded(businessId, template.id));
      setSyncWait(readSyncWait(businessId, template.id));
      const keptDraft = readKept(businessId, template.id);
      const value = keptDraft ? rebaseEdits(keptDraft.base, keptDraft.value, fresh) : fresh;
      if (keptDraft && changesBetween(fresh, value, keptDraft.held).length > 0) {
        setDraft(value);
        setHeld(keptDraft.held);
        setKept(true);
      } else {
        if (keptDraft) dropKept(businessId, template.id);
        setDraft(fresh);
      }
      return;
    }
    // A save reads the card again itself, and starts from what it read. A
    // field open in its editor stays open on that field, wherever it is now.
    const was = baseline.current;
    if (saving || !was || !newerRead(was.at, at)) return;
    baseline.current = { value: fresh, at };
    if (sameCard(was.value, fresh)) return;
    const next = draft ? rebaseEdits(was.value, draft, fresh) : fresh;
    setSaved(fresh);
    setDraft(next);
    setEditingField((open) => followField(draft?.design.fields, next.design.fields, open));
    setLint(designQuery.data.lint);
  }, [businessId, template, designQuery.data, templatesAt, designAt, saving, draft]);

  const changes = saved && draft ? changesBetween(saved, draft, held) : [];
  const changed = changes.length > 0;

  // Kept in the tab while there are changes: the edits as one entry, each
  // picture as its own, written only when it changes. Edits brought back to
  // the saved card drop it, so a reload can't bring back a change undone,
  // and the next change is a draft of its own, not the one that came back.
  useEffect(() => {
    if (!businessId || !templateId || !draft || seededFor.current !== templateId) return;
    if (changed && saved) {
      keepEdits(businessId, templateId, { base: saved, value: draft });
      return;
    }
    dropKept(businessId, templateId);
    setKept(false);
  }, [businessId, templateId, saved, draft, changed]);

  // A picture that doesn't fit the tab's storage, even brought down to what
  // the renderer keeps, is said at its tile: it won't come back on a return.
  // Save takes a picture out of the tab as it sends it, so one no longer
  // held is never said, whatever the tab had.
  const keptPictures = useRef<HeldPictures>({});
  const [notKept, setNotKept] = useState<HeldUse[]>([]);
  useEffect(() => {
    if (!businessId || !templateId) return;
    const written = new Map<HeldUse, boolean>();
    for (const use of HELD_ORDER) {
      if (keptPictures.current[use] !== held[use]) written.set(use, keepPicture(businessId, templateId, use, held[use]));
    }
    keptPictures.current = held;
    setNotKept((current) => {
      const next = notKeptNow(current, written, held);
      return next.length === current.length && next.every((use, i) => use === current[i]) ? current : next;
    });
  }, [businessId, templateId, held]);

  // After a save, the wallet's sync redraws the strip pictures on its own
  // time, so a read made meanwhile still carries the ones drawn before it.
  // Until the sync has run since, the stand-in (which is the saved card)
  // stays; a later read brings the published pictures back.
  const syncedAt = designQuery.data?.sync.synced_at ?? null;
  const waitingForSync = !!syncWait && !syncMovedPast(syncWait.before, syncedAt);
  useEffect(() => {
    if (!syncWait || !businessId || !templateId || !syncMovedPast(syncWait.before, syncedAt)) return;
    setSyncWait(null);
    dropSyncWait(businessId, templateId);
  }, [syncWait, syncedAt, businessId, templateId]);

  // Closing the tab or the app with changes asks first. Leaving the page
  // doesn't: the draft is kept in the tab.
  useEffect(() => {
    if (!changed) return;
    const ask = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", ask);
    return () => window.removeEventListener("beforeunload", ask);
  }, [changed]);

  // The server's check, 400ms after each edit: the stateless preview applies
  // the draft in memory and answers with its lint. A failure keeps the last.
  // An answer for a draft no longer on the page (one a discard or a save has
  // replaced, while the debounce still held it) is let go.
  const debouncedDraft = useDebounce(changed ? draft : null, 400);
  const onPage = useRef(draft);
  useEffect(() => {
    onPage.current = draft;
  }, [draft]);
  useEffect(() => {
    if (!debouncedDraft || !businessId || !templateId) return;
    let cancelled = false;
    previewTemplateDesign(businessId, templateId, debouncedDraft)
      .then((result) => {
        if (!cancelled && onPage.current === debouncedDraft) setLint(result.lint);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [debouncedDraft, businessId, templateId]);
  // Its latest answer, for a save that starts again from what it sent: one
  // can land while the save runs.
  const latestLint = useRef(lint);
  useEffect(() => {
    latestLint.current = lint;
  }, [lint]);

  // The owner's own pass, issued asynchronously: polled until its URL lands.
  useEffect(() => {
    if (businessId && templateId) previewCard(businessId, templateId).then(setOwnerCard).catch(() => {});
  }, [businessId, templateId]);
  const pass = useWalletPass(ownerCard);

  const edit = useCallback((next: CardStudioValue) => {
    setDraft(next);
    setFailure(null);
  }, []);

  const hold = useCallback((use: HeldUse, dataUrl: string | null) => {
    setFailure(null);
    setHeld((current) => {
      if (!dataUrl && !current[use]) return current;
      const next = { ...current };
      if (dataUrl) next[use] = dataUrl;
      else delete next[use];
      return next;
    });
  }, []);

  /** Start again from a card, read at `at` (by default, the reads the
   * studio already stands on). */
  function reseed(fresh: CardStudioValue, freshLint: string[], at = baseline.current?.at) {
    if (at) baseline.current = { value: fresh, at };
    setSaved(fresh);
    setDraft(fresh);
    setHeld({});
    setKept(false);
    setLint(freshLint);
    setEditingField(null);
    if (businessId && templateId) dropKept(businessId, templateId);
  }

  function discard() {
    if (!saved) return;
    setFailure(null);
    reseed(saved, designQuery.data?.lint ?? lint);
    // The bar goes with the changes: focus to the title, never to <body>.
    heading.current?.focus();
  }

  /** Read the card again, as the page loads it: the template list and the
   * design. The card they make, if both landed since they were asked for;
   * neither call throws, and a read that failed, one made offline, or one
   * still out when the limit passes keeps the time of the one before. */
  async function readCard(): Promise<{ value: CardStudioValue; lint: string[]; at: ReadStamp } | null> {
    const asked = Date.now();
    const reads = Promise.all([
      queryClient.invalidateQueries({ queryKey: ["templates", businessId] }),
      queryClient.refetchQueries({ queryKey: ["design", templateId], exact: true }),
    ]);
    await settleWithin(reads, READ_LIMIT_MS);
    const templatesRead = queryClient.getQueryState<CardTemplate[]>(["templates", businessId]);
    const designRead = queryClient.getQueryState<DesignOut>(["design", templateId]);
    const freshTemplate = templatesRead?.data?.[0];
    const at = { templates: templatesRead?.dataUpdatedAt ?? 0, design: designRead?.dataUpdatedAt ?? 0 };
    if (!freshTemplate || !designRead?.data || !bothLandedSince(asked, at)) return null;
    return { value: toStudioValue(freshTemplate, designRead.data), lint: designRead.data.lint, at };
  }

  async function save() {
    if (!businessId || !templateId || !draft || !saved || saving) return;
    // The one limit typing can't hold: said in Names, and nothing is sent.
    if (nameMissing(draft)) {
      setFailure({ problem: { key: "studio.problem.noName" }, partial: false });
      setTray("names");
      setNameFocus((count) => count + 1);
      return;
    }
    // Fields added elsewhere can take the card past the most the API takes:
    // said in Wallet details, and nothing is sent.
    const tooMany = (value: CardStudioValue, partial: boolean) => {
      const over = fieldsOver(value);
      if (over === 0) return false;
      const values = { count: over, total: over + MAX_FIELDS, max: MAX_FIELDS };
      setFailure({ problem: { key: "studio.problem.over", values }, partial });
      setTray("wallet");
      setEditingField(null);
      return true;
    };
    if (tooMany(draft, false)) return;
    setFailure(null);
    setSaving(true);
    // The pictures that reached the server: each stays held, drawn where it
    // was, until the save is over.
    const sent: [HeldUse, string][] = [];
    // Anything that reaches the server is drawn into the passes by the next
    // sync: until it has run, the published pictures are from before. The
    // design read can be from before an earlier save in this visit, whose
    // sync has run since, so a save that gets as far as the PATCH takes the
    // later of it and the PATCH's own answer.
    let syncBefore = designQuery.data?.sync.synced_at ?? null;
    const waitForSync = () => {
      setSyncWait({ before: syncBefore });
      keepSyncWait(businessId, templateId, syncBefore);
    };
    // A save that stops after a picture went: that picture is on customers'
    // cards, so wait for its sync, and read the design again, once, so the
    // studio knows which pictures are there. The save isn't over until the
    // read settles: the pictures that went are held until then, and a second
    // press meanwhile would send them again.
    const stopPartWay = async () => {
      if (sent.length === 0) return;
      waitForSync();
      await settleWithin(queryClient.refetchQueries({ queryKey: ["design", templateId], exact: true }), READ_LIMIT_MS);
      setHeld((current) => sent.reduce((rest, [use, dataUrl]) => withoutSent(rest, use, dataUrl), current));
    };
    // The held pictures first, so one that is refused stops the save before
    // anything else reaches customers' cards.
    for (const use of HELD_ORDER) {
      const dataUrl = held[use];
      if (!dataUrl) continue;
      try {
        const answer = await uploadTemplateImage(businessId, templateId, use, dataUrlToFile(dataUrl, use));
        sent.push([use, dataUrl]);
        if (isArt(use)) {
          // The upload echoes the art back; the design read only names it.
          const copy = answer.url || dataUrl;
          keepUploaded(businessId, templateId, use, copy);
          setUploaded((current) => ({ ...current, [use]: copy }));
          setArtSent((current) => ({ ...current, [use]: Date.now() }));
        }
        // Off the tab's copy at once, even if the page was left meanwhile,
        // so a picture that reached customers' cards is never sent twice.
        if (keptPictures.current[use] === dataUrl) {
          keepPicture(businessId, templateId, use, undefined);
          keptPictures.current = withoutSent(keptPictures.current, use, dataUrl);
        }
      } catch (error) {
        setFailure({ problem: uploadProblem(use, error), partial: sent.length > 0 });
        await stopPartWay();
        setSaving(false);
        return;
      }
    }

    // Save sends every field, so the card is read again first, after the
    // pictures, and the owner's edits go on it: a save made elsewhere since
    // the studio last read the card is never sent back undone. The studio
    // stands on it from here, so what is sent is what the owner sees, the
    // back's words included. If the read doesn't land, the edits go as they
    // are, on the card last read.
    let sentValue = draft;
    const now = await readCard();
    if (now) {
      const onNow = rebaseEdits(saved, draft, now.value);
      sentValue = onNow;
      baseline.current = { value: now.value, at: now.at };
      setSaved(now.value);
      setDraft(sentValue);
      setEditingField((open) => followField(draft.design.fields, onNow.design.fields, open));
      if (tooMany(sentValue, sent.length > 0)) {
        await stopPartWay();
        setSaving(false);
        return;
      }
    }
    try {
      const answer = await patchTemplate(businessId, templateId, sentValue);
      syncBefore = laterSync(syncBefore, answer.design_synced_at);
    } catch (error) {
      const problem = saveProblem(error);
      setFailure({ problem, partial: sent.length > 0 });
      if (problem.fieldIndex !== undefined) {
        setTray("wallet");
        setEditingField(problem.fieldIndex);
      }
      await stopPartWay();
      setSaving(false);
      return;
    }
    waitForSync();
    // Saved: the tab's copy goes now, not after the re-read, in case the
    // page is left meanwhile.
    dropKept(businessId, templateId);

    // Read once more, after the last write, and start again from it. If
    // either read didn't land in time, the studio starts from what was sent,
    // stamped newer than both, and the next good pair of reads takes over.
    const after = await readCard();
    if (after) reseed(after.value, after.lint, after.at);
    else reseed(sentValue, latestLint.current, { templates: Date.now(), design: Date.now() });
    setSaving(false);
    toast.show({ tone: "ok", title: t("studio.saved") });
    heading.current?.focus();
  }

  const title = (
    <h1 ref={heading} tabIndex={-1} className="type-title text-ink outline-none">
      {t("studio.title")}
    </h1>
  );

  // Only a card that never loaded: a later read that fails keeps the card
  // the studio already has, and the next good one takes over.
  const templatesFailed = templatesQuery.isError && !templatesQuery.data;
  const readFailed = templatesFailed || (designQuery.isError && !designQuery.data);
  if (readFailed) {
    const failed = templatesFailed ? templatesQuery : designQuery;
    return (
      <div className="flex flex-col gap-5">
        {title}
        <ReadProblem
          title={t("studio.readProblem")}
          error={failed.error}
          paused={failed.isPaused}
          onRetry={() => void failed.refetch()}
        />
      </div>
    );
  }

  if (!business || !template || !draft || !saved || !designQuery.data) {
    return (
      <div className="flex flex-col gap-5">
        {title}
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-11 w-56 rounded-full" />
          <div data-tour="design-studio" className="flex w-full justify-center">
            <Skeleton className="h-[29rem] w-[340px] max-w-full rounded-glass" />
          </div>
        </div>
      </div>
    );
  }

  const design = designQuery.data;
  const reading = readLint(lint);
  const sync = design.sync;
  // Art just sent is on the card until a read says otherwise, even when the
  // re-read after the save failed.
  const assets = artOnCard(design.assets, designAt, artSent);
  const savedPicture = assets.includes("stamp_art");
  const art = publishedArt(assets, uploaded);
  const pictureName = failure?.problem.picture ? t(`studio.pictures.${failure.problem.picture}`) : "";
  // A field the server refused is named as Wallet details names it.
  const failedField =
    failure?.problem.fieldIndex !== undefined ? draft.design.fields?.[failure.problem.fieldIndex] : undefined;
  const failedKey = failure?.problem.fieldIndex !== undefined && !failedField ? "studio.problem.invalid" : failure?.problem.key;

  const problem = failure && failedKey && (
    <>
      {failure.partial && `${t("studio.problem.partial")} `}
      {failure.problem.picture && failedKey.startsWith("dashboard.") && `${t("studio.problem.notSent", { picture: pictureName })} `}
      {t(failedKey, {
        ...failure.problem.values,
        picture: pictureName,
        name: failedField ? isolate(fieldName(failedField, t)) : "",
      })}
    </>
  );

  const notices = (sync.error || reading.other.length > 0) && (
    <div className="flex flex-col gap-3">
      {sync.error && <Notice tone="warn">{t("studio.sync.failed")}</Notice>}
      {reading.other.length > 0 && (
        <Notice tone="warn">
          <p>{t("studio.check.other")}</p>
          <details className="mt-2">
            <summary className="w-fit cursor-pointer text-sm text-ink-muted underline underline-offset-[3px]">
              {t("studio.check.details")}
            </summary>
            <ul lang="en" dir="ltr" className="mt-2 list-disc ps-5 text-start text-sm text-ink-muted">
              {reading.other.map((text) => (
                <li key={text}>{text}</li>
              ))}
            </ul>
          </details>
        </Notice>
      )}
    </div>
  );

  const foot = (
    <div className="flex min-h-11 flex-col items-center justify-center gap-2 text-center">
      {pass.passUrl ? (
        <LinkButton href={pass.passUrl} variant="ink" icon={<Wallet aria-hidden />} className="max-w-full">
          <span className="whitespace-normal">{t("wallet.addToWallet")}</span>
        </LinkButton>
      ) : pass.slow ? (
        <>
          <p className="type-body text-ink-muted">{t("wallet.pendingSlow")}</p>
          <Button variant="quiet" onClick={pass.retry}>
            {t("wallet.retry")}
          </Button>
        </>
      ) : pass.pending ? (
        <p className="type-body text-ink-muted">{t("wallet.pending")}</p>
      ) : null}
    </div>
  );

  return (
    <div className="flex flex-col gap-5">
      {title}
      <CardStudio
        value={draft}
        onChange={edit}
        saved={saved}
        businessName={business.name}
        niche={business.niche}
        images={{ ...designImageUrls(design), ...art }}
        assets={assets}
        notKept={notKept}
        held={held}
        onHold={hold}
        stampPicture={{ url: held.stamp_art ?? art.stamp_art ?? null, inUse: !!held.stamp_art || savedPicture }}
        pictureLocked={savedPicture ? t("studio.picture.locked") : undefined}
        pictureNote={t("studio.picture.stays")}
        lint={reading}
        unsaved={changed || waitingForSync}
        bar={{
          changes: changes.length,
          saving,
          onSave: () => void save(),
          onDiscard: discard,
          problem,
          kept,
          fieldProblems: reading.fields.length,
          onFieldProblems: () => {
            setEditingField(null);
            setTray("wallet");
          },
          stale: sync.stale,
        }}
        notices={notices || undefined}
        foot={foot}
        tray={tray}
        onTray={setTray}
        editingField={editingField}
        onEditingField={setEditingField}
        focusName={nameFocus}
      />
    </div>
  );
}
