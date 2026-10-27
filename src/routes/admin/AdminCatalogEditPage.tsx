import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { CardStudio, type ExtraTray } from "../../components/card-studio/CardStudio";
import { readLint } from "../../components/card-studio/lintProblems";
import {
  changesBetween,
  nameMissing,
  TEXT_LIMITS,
  type CardStudioImages,
  type CardStudioValue,
} from "../../components/card-studio/studioDraft";
import { saveProblem } from "../../components/card-studio/studioProblems";
import { Checkbox, focusRing, Input, Notice, Select } from "../../components/kit";
import { CatalogArtPanel } from "./CatalogArtPanel";
import {
  createCatalogEntry,
  deleteCatalogImage,
  getCatalogEntry,
  patchCatalogEntry,
  previewCatalogDesign,
  uploadCatalogImage,
  type CatalogArtUse,
} from "../../api/catalog";
import { NICHES } from "../onboarding/draft";
import { useDebounce } from "../../hooks/useDebounce";
import { cn } from "../../lib/cn";

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
 * It sits under `AdminLayout`, which has no theme, so it wraps its own
 * content in Lightbox, by day only: the admin area has no night.
 */
export function AdminCatalogEditPage() {
  const { t } = useTranslation();
  const { catalogId } = useParams<{ catalogId: string }>();
  const isNew = catalogId === "new";
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const heading = useRef<HTMLHeadingElement>(null);

  const [saved, setSaved] = useState<CardStudioValue | null>(isNew ? EMPTY : null);
  const [draft, setDraft] = useState<CardStudioValue | null>(isNew ? EMPTY : null);
  const [savedShelf, setSavedShelf] = useState<Shelf>(NO_SHELF);
  const [shelf, setShelf] = useState<Shelf>(NO_SHELF);
  const [art, setArt] = useState<Art>({});
  const [lint, setLint] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  // A look still being made says it has no name only once Save is pressed.
  const [saveTried, setSaveTried] = useState(false);
  const [tray, setTray] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<number | null>(null);

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
          design: (entry.design ?? {}) as CardStudioValue["design"],
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

  // The same 400ms check as the owner's studio, against the staff preview,
  // and the same rule: an answer for a draft no longer on the page is let go.
  const debouncedDraft = useDebounce(draft, 400);
  const onPage = useRef(draft);
  useEffect(() => {
    onPage.current = draft;
  }, [draft]);
  useEffect(() => {
    if (!debouncedDraft) return;
    let cancelled = false;
    previewCatalogDesign({ ...debouncedDraft, name: debouncedDraft.name || "Preview" })
      .then((result) => {
        if (!cancelled && onPage.current === debouncedDraft) setLint(result.lint);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [debouncedDraft]);

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
        const created = await createCatalogEntry(payload);
        await queryClient.invalidateQueries({ queryKey: ["admin-catalog"] });
        // Onto the look's own URL rather than back to the list: the id it
        // was just given is what its art needs.
        navigate(`/admin/catalog/${created.id}`, { replace: true });
        return;
      }
      await patchCatalogEntry(catalogId!, payload);
      await queryClient.invalidateQueries({ queryKey: ["admin-catalog"] });
      setSaved(value);
      setDraft(value);
      setSavedShelf(shelf);
      setJustSaved(true);
      heading.current?.focus();
    } catch (error) {
      const failed = saveProblem(error);
      setProblem(t(failed.key, failed.values));
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

  const frame = "theme-lightbox -mx-6 -my-8 min-h-full bg-background px-4 pb-8 pt-6 text-ink sm:px-6";

  if (!draft || !saved) {
    return (
      <div className={frame}>
        <p role={loadFailed ? "alert" : undefined} className="type-body text-ink-muted">
          {loadFailed ? t("dashboard.problem.other") : t("common.loading")}
        </p>
      </div>
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
            dir="auto"
            autoComplete="off"
          />
          <Checkbox
            checked={shelf.isPublished}
            onChange={(checked) => editShelf({ isPublished: checked })}
            label={t("admin.catalog.publishedLabel")}
            description={t("admin.catalog.publishedHint")}
          />
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
    <div className={frame}>
      <div className="mx-auto flex max-w-5xl flex-col gap-5">
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
          <h1 ref={heading} tabIndex={-1} className="type-title text-ink outline-none">
            {isNew ? t("admin.catalog.createTitle") : draft.name || t("admin.catalog.editTitle")}
          </h1>
          {!isNew && (
            <p className="text-sm text-ink-muted" dir="ltr">
              <bdi>{catalogId}</bdi>
            </p>
          )}
        </div>

        {justSaved && (
          <Notice tone="ok" lit role="status">
            {t("admin.catalog.saved")}
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
          sayNameMissing={!isNew || saveTried}
        />
      </div>
    </div>
  );
}
