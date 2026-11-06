import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Info } from "lucide-react";
import { CardStudio, type ExtraTray } from "../../components/card-studio/CardStudio";
import {
  alreadyAsked,
  drawKey,
  isStyled,
  picturesAt,
  serverAsk,
  studioStickers,
  type DrawnCard,
  type ServerAsk,
} from "../../components/card-studio/designOptions";
import { readLint } from "../../components/card-studio/lintProblems";
import {
  changesBetween,
  fieldName,
  nameMissing,
  ownWordsDir,
  readDesign,
  sampleStart,
  TEXT_LIMITS,
  type CardStudioImages,
  type CardStudioValue,
} from "../../components/card-studio/studioDraft";
import { lookAgainIn, lookPicturesState } from "../../components/card-studio/lookPictures";
import { saveProblem } from "../../components/card-studio/studioProblems";
import { isolate } from "../dashboard/problem";
import { Checkbox, focusRing, Input, Notice, Select } from "../../components/kit";
import { CatalogArtPanel } from "./CatalogArtPanel";
import {
  createCatalogEntry,
  deleteCatalogImage,
  getCatalogEntry,
  getCatalogStickers,
  patchCatalogEntry,
  previewCatalogDesign,
  uploadCatalogImage,
  type CatalogArtUse,
} from "../../api/catalog";
import { getPresets } from "../../api/presets";
import { NICHES, type Niche } from "../onboarding/draft";
import { drawnLooks, lookName } from "../onboarding/looks";
import { useDebounce } from "../../hooks/useDebounce";
import { cn } from "../../lib/cn";
import { useDocumentTitle } from "../public/useDocumentTitle";
import { liveWizard } from "./shelf";

const EMPTY: CardStudioValue = {
  name: "",
  stamps_required: 8,
  reward_description: "",
  background_color: "#4B2E1E",
  foreground_color: "#FFFFFF",
  label_color: "#D2B48C",
  design: {},
};

type Art = Partial<Record<CatalogArtUse, string>>;

interface Shelf {
  niche: string;
  description: string;
  isPublished: boolean;
}

const NO_SHELF: Shelf = { niche: "cafe", description: "", isPublished: false };

/**
 * Catalog authoring: the same card studio an owner designs in, plus the two
 * things only a catalog look has, as two more trays: its shelf (where it sits
 * in the wizard, and whether owners see it yet) and its art.
 *
 * The studio runs against the staff-only stateless preview endpoint, so
 * there is no owned template behind it and nothing is provisioned on the
 * wallet provider. What *is* stored at once is the art, against the look's
 * id, which is why a brand-new look is saved once before its art opens.
 * Saving keeps you on the page: authoring a look is a loop of small changes.
 *
 * It sits under `AdminLayout`, which wears Lightbox by day, so the page
 * itself is only its column.
 *
 * Each look is its own editor: the route stays mounted from one id to the
 * next, so the page is keyed by it, and a new look reached from an existing
 * one starts empty rather than on that look's draft.
 */
export function AdminCatalogEditPage() {
  const { catalogId } = useParams<{ catalogId: string }>();
  return <CatalogEditor key={catalogId} catalogId={catalogId} />;
}

/** What a look's first save hands to the editor of its own URL, and what a
 * trade's "New look for this trade" hands to a new one. */
interface Arrival {
  created?: boolean;
  niche?: string;
}

function CatalogEditor({ catalogId }: { catalogId: string | undefined }) {
  const { t } = useTranslation();
  const isNew = catalogId === "new";
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const heading = useRef<HTMLHeadingElement>(null);
  const arrival = location.state as Arrival | null;
  // Just made by the editor before this one: say it's saved, once.
  const [created] = useState(() => !!arrival?.created);
  // A new look opened from a trade's panel starts in that trade, rather
  // than as a café without saying so.
  const [start] = useState<Shelf>(() =>
    isNew && arrival?.niche && (NICHES as readonly string[]).includes(arrival.niche)
      ? { ...NO_SHELF, niche: arrival.niche }
      : NO_SHELF,
  );

  const [saved, setSaved] = useState<CardStudioValue | null>(isNew ? EMPTY : null);
  const [draft, setDraft] = useState<CardStudioValue | null>(isNew ? EMPTY : null);
  const [savedShelf, setSavedShelf] = useState<Shelf>(start);
  const [shelf, setShelf] = useState<Shelf>(start);
  const [art, setArt] = useState<Art>({});
  const [lint, setLint] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(created);

  // Off the history entry, so a reload doesn't say it again.
  useEffect(() => {
    if (created) navigate(location.pathname, { replace: true, state: null });
    // Once, as the editor opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [loadFailed, setLoadFailed] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  // A look still being made says it has no name only once Save is pressed.
  const [saveTried, setSaveTried] = useState(false);
  const [tray, setTray] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<number | null>(null);
  const [nameFocus, setNameFocus] = useState(0);

  useEffect(() => {
    if (isNew || !catalogId) return;
    getCatalogEntry(catalogId)
      .then((entry) => {
        const value: CardStudioValue = {
          name: entry.name,
          stamps_required: entry.stamps_required,
          reward_description: entry.reward_description,
          background_color: entry.background_color ?? "#FFFFFF",
          foreground_color: entry.foreground_color ?? "#000000",
          label_color: entry.label_color ?? "#000000",
          design: readDesign((entry.design ?? {}) as CardStudioValue["design"]),
        };
        const loaded = {
          niche: entry.niche ?? "cafe",
          description: entry.description ?? "",
          isPublished: entry.is_published ?? false,
        };
        setSaved(value);
        setDraft(value);
        setSavedShelf(loaded);
        setShelf(loaded);
        setArt((entry.art ?? {}) as Art);
      })
      .catch(() => setLoadFailed(true));
  }, [catalogId, isNew]);

  // A look just made lands on its title, where the saved notice is, never
  // on <body>.
  const loaded = !!draft;
  useEffect(() => {
    if (created && loaded) heading.current?.focus();
  }, [created, loaded]);

  // The same 400ms check as the owner's studio, against the staff preview,
  // and the same rules: a look the studio can't draw itself (`isStyled`)
  // gets the server's picture at the count shown, without the look's own
  // pictures, and an answer for a draft no longer on the page is let go.
  const [sample, setSample] = useState<number | null>(null);
  const [drawn, setDrawn] = useState<DrawnCard | null>(null);
  const pictures = useMemo(() => [drawn], [drawn]);
  const shownSample = sample ?? (draft ? sampleStart(draft.stamps_required) : 0);
  const ask = useMemo(
    () => (draft ? serverAsk({ value: draft, sample: shownSample, changed: true, pictures }) : null),
    [draft, shownSample, pictures],
  );
  const debouncedAsk = useDebounce(ask, 400);
  const onPage = useRef(draft);
  useEffect(() => {
    onPage.current = draft;
  }, [draft]);
  const asked = useRef<ServerAsk | null>(null);
  useEffect(() => {
    if (!debouncedAsk) return;
    if (alreadyAsked(asked.current, debouncedAsk)) return;
    asked.current = debouncedAsk;
    let cancelled = false;
    let settled = false;
    const { value, state, images } = debouncedAsk;
    previewCatalogDesign({ ...value, name: value.name || "Preview", stamp_state: state ?? null, images })
      .then((result) => {
        if (cancelled || onPage.current !== value) return;
        setLint(result.lint);
        if (images && state !== undefined) setDrawn({ key: drawKey(value, state), ...picturesAt(result.images, state) });
      })
      .catch(() => {
        if (asked.current === debouncedAsk) asked.current = null;
        if (!cancelled && images && state !== undefined && onPage.current === value) {
          setDrawn({ key: drawKey(value, state) });
        }
      })
      .finally(() => {
        settled = true;
      });
    return () => {
      cancelled = true;
      if (!settled && asked.current === debouncedAsk) asked.current = null;
    };
  }, [debouncedAsk]);

  const stickersQuery = useQuery({
    queryKey: ["stickers"],
    queryFn: getCatalogStickers,
    staleTime: Infinity,
    retry: 1,
  });

  // A published look's pictures, as the wizard shows them (backend PR #20,
  // item 1): drawn by a task after each save, so looked for again every 5s
  // for up to two minutes until they come.
  const [savedAt, setSavedAt] = useState(() => Date.now());
  const styledSaved = !!saved && isStyled(saved.design);
  const shelfState = (presets: Awaited<ReturnType<typeof getPresets>> | undefined, at: number) =>
    lookPicturesState({
      published: savedShelf.isPublished,
      styled: styledSaved,
      pictures: presets?.find((preset) => preset.id === catalogId)?.pictures,
      savedAt,
      now: at,
    });
  const picturesQuery = useQuery({
    queryKey: ["presets", savedShelf.niche],
    queryFn: () => getPresets(savedShelf.niche),
    enabled: !isNew && savedShelf.isPublished && styledSaved,
    refetchInterval: (query) => lookAgainIn(shelfState(query.state.data, query.state.dataUpdatedAt)),
  });
  const lookPictures = shelfState(picturesQuery.data, picturesQuery.dataUpdatedAt || savedAt);

  // The look as owners meet it, from the two reads above: the name they
  // read and its place on the looks screen, where it is drawn and the
  // wizard opens there. Anything else says its trade and whether it is
  // published.
  const savedNiche = ((NICHES as readonly string[]).includes(savedShelf.niche) ? savedShelf.niche : "other") as Niche;
  const drawnInTrade = drawnLooks(savedNiche, picturesQuery.data);
  const itself = drawnInTrade.find((preset) => preset.id === catalogId);
  const ownersName = itself ? lookName(itself, drawnInTrade, t) : null;
  const onLooksScreen =
    !!itself &&
    liveWizard(stickersQuery.isError ? null : (stickersQuery.data?.available ?? false), picturesQuery.data ?? []) ===
      "looks";
  const trade = t(`onboarding.business.niches.${savedNiche}`);
  const standing = !savedShelf.isPublished
    ? t("admin.catalog.head.draft", { trade })
    : onLooksScreen && itself
      ? t("admin.catalog.head.placed", { trade, n: drawnInTrade.indexOf(itself) + 1, total: drawnInTrade.length })
      : t("admin.catalog.head.published", { trade });
  const title = isNew ? t("admin.catalog.createTitle") : (ownersName ?? (draft?.name || t("admin.catalog.editTitle")));
  useDocumentTitle(title);

  const shelfChanged =
    shelf.niche !== savedShelf.niche ||
    shelf.description !== savedShelf.description ||
    shelf.isPublished !== savedShelf.isPublished;
  const changes = (saved && draft ? changesBetween(saved, draft).length : 0) + (shelfChanged ? 1 : 0);

  const edit = useCallback((next: CardStudioValue) => {
    setDraft(next);
    setProblem(null);
    setJustSaved(false);
  }, []);

  const editShelf = (patch: Partial<Shelf>) => {
    setShelf((current) => ({ ...current, ...patch }));
    setProblem(null);
    setJustSaved(false);
  };

  // Pictures are stored against the look's id, so one still being typed for
  // the first time has nowhere to put them: null, and the tray says why.
  const handleUpload = isNew
    ? null
    : async (use: CatalogArtUse, file: File) => {
        const uploaded = await uploadCatalogImage(catalogId!, use, file);
        setArt((current) => ({ ...current, [use]: uploaded.url }));
        await queryClient.invalidateQueries({ queryKey: ["admin-catalog"] });
      };

  async function handleRemoveArt(use: CatalogArtUse) {
    await deleteCatalogImage(catalogId!, use);
    setArt((current) => {
      const next = { ...current };
      delete next[use];
      return next;
    });
    await queryClient.invalidateQueries({ queryKey: ["admin-catalog"] });
  }

  // A description saved before the field held its limit can be longer.
  const descriptionTooLong = shelf.description.length > TEXT_LIMITS.catalogDescription;

  async function handleSave() {
    if (!draft || !saved || saving) return;
    setSaveTried(true);
    // The limits typing can't hold: said in their fields, and nothing is sent.
    if (nameMissing(draft)) {
      setProblem(t("studio.problem.noName"));
      setTray("names");
      setNameFocus((count) => count + 1);
      return;
    }
    if (descriptionTooLong) {
      setProblem(
        t("admin.catalog.descriptionTooLong", {
          max: TEXT_LIMITS.catalogDescription,
          length: shelf.description.length,
        }),
      );
      setTray("shelf");
      return;
    }
    setProblem(null);
    setSaving(true);
    try {
      const value = draft;
      const payload = { ...value, niche: shelf.niche, description: shelf.description, is_published: shelf.isPublished };
      if (isNew) {
        const made = await createCatalogEntry(payload);
        await queryClient.invalidateQueries({ queryKey: ["admin-catalog"] });
        // Onto the look's own URL rather than back to the list: the id it
        // was just given is what its art needs. Its editor reads it afresh.
        const state: Arrival = { created: true };
        navigate(`/admin/catalog/${made.id}`, { replace: true, state });
        return;
      }
      await patchCatalogEntry(catalogId!, payload);
      await queryClient.invalidateQueries({ queryKey: ["admin-catalog"] });
      setSaved(value);
      setDraft(value);
      setSavedShelf(shelf);
      setJustSaved(true);
      setSavedAt(Date.now());
      await queryClient.invalidateQueries({ queryKey: ["presets"] });
      heading.current?.focus();
    } catch (error) {
      const failed = saveProblem(error);
      // A field the server refused is named as Wallet details names it.
      const field = failed.fieldIndex !== undefined ? draft.design.fields?.[failed.fieldIndex] : undefined;
      const key = failed.fieldIndex !== undefined && !field ? "studio.problem.invalid" : failed.key;
      setProblem(t(key, { ...failed.values, name: field ? isolate(fieldName(field, t)) : "" }));
      if (failed.fieldIndex !== undefined) {
        setTray("wallet");
        setEditingField(failed.fieldIndex);
      }
    } finally {
      setSaving(false);
    }
  }

  function discard() {
    if (!saved) return;
    setDraft(saved);
    setShelf(savedShelf);
    setProblem(null);
    setEditingField(null);
    // The bar goes with the changes: focus to the title, never to <body>.
    heading.current?.focus();
  }

  if (!draft || !saved) {
    return (
      <p role={loadFailed ? "alert" : undefined} className="type-body pt-4 text-ink-muted">
        {loadFailed ? t("dashboard.problem.other") : t("common.loading")}
      </p>
    );
  }

  const images: CardStudioImages = art;
  const extraTrays: ExtraTray[] = [
    {
      id: "shelf",
      label: t("admin.catalog.chips.shelf"),
      body: (
        <div className="flex flex-col gap-5">
          <p className="text-sm leading-snug text-ink-muted">{t("admin.catalog.shelfHint")}</p>
          <Select
            label={t("admin.catalog.nicheLabel")}
            value={shelf.niche}
            onChange={(event) => editShelf({ niche: event.target.value })}
          >
            {NICHES.map((key) => (
              <option key={key} value={key}>
                {t(`onboarding.business.niches.${key}`)}
              </option>
            ))}
          </Select>
          <Input
            label={t("admin.catalog.descriptionLabel")}
            hint={t("admin.catalog.descriptionHint")}
            value={shelf.description}
            onChange={(event) => editShelf({ description: event.target.value })}
            maxLength={TEXT_LIMITS.catalogDescription}
            error={
              descriptionTooLong
                ? t("admin.catalog.descriptionTooLong", {
                    max: TEXT_LIMITS.catalogDescription,
                    length: shelf.description.length,
                  })
                : undefined
            }
            dir={ownWordsDir(shelf.description)}
            autoComplete="off"
          />
          <Checkbox
            checked={shelf.isPublished}
            onChange={(checked) => editShelf({ isPublished: checked })}
            label={t("admin.catalog.publishedLabel")}
            description={t("admin.catalog.publishedHint")}
          />
          {lookPictures.kind !== "plain" && (
            <div className="flex flex-col gap-2">
              <p className="type-label text-ink">{t("admin.catalog.pictures.title")}</p>
              {lookPictures.kind === "drawn" ? (
                <div className="flex flex-col gap-3">
                  {([
                    ["strip", "studio.preview.apple"],
                    ["hero", "studio.preview.google"],
                  ] as const).map(([role, wallet]) => (
                    <figure key={role} className="flex flex-col gap-1">
                      <img
                        src={lookPictures.pictures[role]}
                        alt={t("admin.catalog.pictures.alt", { wallet: t(wallet) })}
                        className="w-full rounded-field ring-1 ring-inset ring-border"
                      />
                      <figcaption className="text-sm text-ink-muted">{t(wallet)}</figcaption>
                    </figure>
                  ))}
                </div>
              ) : (
                <p role="status" className="text-sm leading-snug text-ink-muted">
                  {t(`admin.catalog.pictures.${lookPictures.kind}`)}
                </p>
              )}
            </div>
          )}
        </div>
      ),
    },
    {
      id: "art",
      label: t("admin.catalog.chips.art"),
      part: "stamps",
      body: (
        <CatalogArtPanel
          art={art}
          onUpload={handleUpload}
          onRemove={handleRemoveArt}
          backgroundColor={draft.background_color}
        />
      ),
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 pt-2">
        <div className="flex flex-col gap-1">
          <Link
            to="/admin/catalog"
            className={cn(
              "inline-flex min-h-11 w-fit items-center gap-1.5 rounded-full text-sm text-ink-muted hover-fine:text-ink",
              focusRing,
            )}
          >
            {/* Flips with the page: a "back" arrow points back in Hebrew too. */}
            <ArrowLeft size={15} aria-hidden="true" className="rtl:rotate-180" />
            {t("admin.catalog.title")}
          </Link>
          {/* Names are isolated, so an English one keeps its order inside a
              Hebrew page and the line stays on the page's side. */}
          <h1 ref={heading} tabIndex={-1} className="type-title text-ink outline-none [overflow-wrap:anywhere]">
            <bdi>{title}</bdi>
          </h1>
          {!isNew && (
            <div className="flex flex-col gap-0.5">
              {/* The name staff typed, under the one owners read. */}
              {ownersName && draft.name && (
                <p className="type-body text-ink-muted [overflow-wrap:anywhere]">
                  <bdi>{draft.name}</bdi>
                </p>
              )}
              <p className="text-sm text-ink-muted">{standing}</p>
              {/* On its side of the page; only the id itself runs left to right. */}
              <p className="text-sm text-ink-muted [overflow-wrap:anywhere]">
                <bdi dir="ltr">{catalogId}</bdi>
              </p>
            </div>
          )}
        </div>

        {justSaved && (
          <Notice tone="ok" lit role="status">
            {/* A look no owner sees yet goes to nobody: it says so. */}
            {t(savedShelf.isPublished ? "admin.catalog.saved" : "admin.catalog.savedHidden")}
          </Notice>
        )}

        <CardStudio
          value={draft}
          onChange={edit}
          saved={saved}
          businessName={draft.design.organization_name || "PunchMe"}
          niche={shelf.niche}
          images={images}
          stampPicture={{ url: art.stamp_art ?? null, inUse: !!art.stamp_art }}
          lint={readLint(lint)}
          unsaved={changes > 0}
          bar={{
            changes,
            saving,
            onSave: () => void handleSave(),
            onDiscard: discard,
            problem,
            sentence: t("admin.catalog.changes", { count: changes }),
          }}
          tray={tray}
          onTray={setTray}
          editingField={editingField}
          onEditingField={setEditingField}
          extraTrays={extraTrays}
          // Staff author looks with the check on each stamp; owners only meet
          // it on a card that has it (brief §5, §6.10).
          markAlways
          sayNameMissing={!isNew || saveTried}
          focusName={nameFocus}
          stickers={studioStickers(stickersQuery)}
          pictures={pictures}
          onRedraw={() => {
            asked.current = null;
            setDrawn(null);
          }}
          onSample={setSample}
          notices={
            isStyled(draft.design) && Object.keys(art).length > 0 ? (
              <p className="flex items-start gap-1.5 text-sm leading-snug text-ink-muted">
                <Info aria-hidden className="mt-px size-4 shrink-0" />
                <span>{t("admin.catalog.drawnWithoutArt")}</span>
              </p>
            ) : undefined
          }
        />
    </div>
  );
}
