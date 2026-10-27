import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Wallet } from "lucide-react";
import { CardStudio } from "../../components/card-studio/CardStudio";
import { readLint } from "../../components/card-studio/lintProblems";
import {
  changesBetween,
  HELD_ORDER,
  withRewardOnBack,
  type CardStudioValue,
  type HeldPictures,
  type HeldUse,
} from "../../components/card-studio/studioDraft";
import { saveProblem, uploadProblem, type StudioProblem } from "../../components/card-studio/studioProblems";
import {
  dropKept,
  keepEdits,
  keepPicture,
  keepUploadedStamp,
  readKept,
  readUploadedStamp,
} from "../../components/card-studio/studioSession";
import { ReadProblem } from "../../components/dashboard/ReadProblem";
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
    // the card's real fields, not an empty doc.
    design: design.design,
  };
}

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
  const [follow, setFollow] = useState(false);
  const [kept, setKept] = useState(false);
  const [lint, setLint] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [failure, setFailure] = useState<Failure | null>(null);
  const [tray, setTray] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<number | null>(null);
  const [uploadedStamp, setUploadedStamp] = useState<string | null>(null);
  const [ownerCard, setOwnerCard] = useState<EnrollOut | null>(null);

  // Seed the draft once per template, so a refetch never overwrites an edit.
  // A draft kept in the tab from an earlier visit comes back in its place.
  const seededFor = useRef<string | null>(null);
  useEffect(() => {
    if (!businessId || !template?.id || !designQuery.data || seededFor.current === template.id) return;
    seededFor.current = template.id;
    const fresh = toStudioValue(template, designQuery.data);
    setSaved(fresh);
    setLint(designQuery.data.lint);
    setUploadedStamp(readUploadedStamp(businessId, template.id));
    const keptDraft = readKept(businessId, template.id);
    if (keptDraft && changesBetween(fresh, keptDraft.value, keptDraft.held, keptDraft.follow).length > 0) {
      setDraft(keptDraft.value);
      setHeld(keptDraft.held);
      setFollow(keptDraft.follow);
      setKept(true);
    } else {
      if (keptDraft) dropKept(businessId, template.id);
      setDraft(fresh);
    }
  }, [businessId, template, designQuery.data]);

  const changes = saved && draft ? changesBetween(saved, draft, held, follow) : [];
  const changed = changes.length > 0;

  // Kept in the tab while there are changes: the edits as one entry, each
  // picture as its own, written only when it changes.
  useEffect(() => {
    if (!businessId || !templateId || !draft || seededFor.current !== templateId) return;
    if (changed) keepEdits(businessId, templateId, { value: draft, follow });
  }, [businessId, templateId, draft, follow, changed]);

  const keptPictures = useRef<HeldPictures>({});
  useEffect(() => {
    if (!businessId || !templateId) return;
    for (const use of HELD_ORDER) {
      if (keptPictures.current[use] !== held[use]) keepPicture(businessId, templateId, use, held[use]);
    }
    keptPictures.current = held;
  }, [businessId, templateId, held]);

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
  const debouncedDraft = useDebounce(changed ? draft : null, 400);
  useEffect(() => {
    if (!debouncedDraft || !businessId || !templateId) return;
    let cancelled = false;
    previewTemplateDesign(businessId, templateId, debouncedDraft)
      .then((result) => {
        if (!cancelled) setLint(result.lint);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [debouncedDraft, businessId, templateId]);

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

  function reseed(fresh: CardStudioValue, freshLint: string[]) {
    setSaved(fresh);
    setDraft(fresh);
    setHeld({});
    setFollow(false);
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

  async function save() {
    if (!businessId || !templateId || !draft || !saved || saving) return;
    setFailure(null);
    setSaving(true);
    let sent = false;
    // The held pictures first, so one that is refused stops the save before
    // anything else reaches customers' cards.
    for (const use of HELD_ORDER) {
      const dataUrl = held[use];
      if (!dataUrl) continue;
      try {
        const uploaded = await uploadTemplateImage(businessId, templateId, use, dataUrlToFile(dataUrl, use));
        sent = true;
        if (use === "stamp_art") {
          const url = uploaded.url || dataUrl;
          keepUploadedStamp(businessId, templateId, url);
          setUploadedStamp(url);
        }
        hold(use, null);
      } catch (error) {
        setFailure({ problem: uploadProblem(use, error), partial: sent });
        setSaving(false);
        return;
      }
    }

    const sentValue = withRewardOnBack(draft, saved.reward_description, follow);
    try {
      await patchTemplate(businessId, templateId, sentValue);
    } catch (error) {
      const problem = saveProblem(error);
      setFailure({ problem, partial: sent });
      if (problem.fieldIndex !== undefined) {
        setTray("wallet");
        setEditingField(problem.fieldIndex);
      }
      setSaving(false);
      return;
    }

    // Read once more, after the last write, and start again from it.
    await queryClient.invalidateQueries({ queryKey: ["templates", businessId] });
    const fresh = await designQuery.refetch();
    const freshTemplate = queryClient.getQueryData<CardTemplate[]>(["templates", businessId])?.[0];
    if (fresh.data && freshTemplate) reseed(toStudioValue(freshTemplate, fresh.data), fresh.data.lint);
    else reseed(sentValue, lint);
    setSaving(false);
    toast.show({ tone: "ok", title: t("studio.saved") });
    heading.current?.focus();
  }

  const title = (
    <h1 ref={heading} tabIndex={-1} className="type-title text-ink outline-none">
      {t("studio.title")}
    </h1>
  );

  const readFailed = templatesQuery.isError || designQuery.isError;
  if (readFailed) {
    const failed = templatesQuery.isError ? templatesQuery : designQuery;
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
  const savedPicture = design.assets.includes("stamp_art");
  const pictureName = failure?.problem.picture ? t(`studio.pictures.${failure.problem.picture}`) : "";

  const problem = failure && (
    <>
      {failure.partial && `${t("studio.problem.partial")} `}
      {failure.problem.picture && failure.problem.key.startsWith("dashboard.") && `${t("studio.problem.notSent", { picture: pictureName })} `}
      {t(failure.problem.key, { ...failure.problem.values, picture: pictureName })}
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
        savedReward={saved.reward_description}
        follow={follow}
        onFollow={() => {
          setFollow(true);
          setFailure(null);
        }}
        businessName={business.name}
        niche={business.niche}
        images={designImageUrls(design)}
        held={held}
        onHold={hold}
        stampPicture={{ url: held.stamp_art ?? uploadedStamp, inUse: !!held.stamp_art || savedPicture }}
        pictureLocked={savedPicture ? t("studio.picture.locked") : undefined}
        pictureNote={t("studio.picture.stays")}
        lint={reading}
        unsaved={changed}
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
      />
    </div>
  );
}
