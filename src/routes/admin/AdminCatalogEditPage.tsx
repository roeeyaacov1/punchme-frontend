import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { CardStudio } from "../../components/card-studio/CardStudio";
import { readLint } from "../../components/card-studio/lintProblems";
import {
  changesBetween,
  withRewardOnBack,
  type CardStudioImages,
  type CardStudioValue,
} from "../../components/card-studio/studioDraft";
import { saveProblem } from "../../components/card-studio/studioProblems";
import {
  StudioPanel,
  StudioSelect,
  StudioText,
} from "../../components/card-studio/studio-primitives";
import { focusRing } from "../../components/kit";
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

/**
 * Catalog authoring: the same Card Studio an owner designs in, plus the two
 * things only a catalog entry has — where it belongs in the wizard, and the
 * artwork it hands out.
 *
 * The studio runs against the staff-only stateless preview endpoint, so
 * there is no owned template behind any of this and nothing is provisioned
 * on the wallet provider. What *is* stored is the artwork: uploads land the
 * moment they are picked, against the entry's id, which is why a brand-new
 * template is saved once before the art panel opens. Saving keeps you on the
 * page — authoring a look is a loop of small changes.
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

  const [saved, setSaved] = useState<CardStudioValue | null>(isNew ? EMPTY : null);
  const [draft, setDraft] = useState<CardStudioValue | null>(isNew ? EMPTY : null);
  const [savedShelf, setSavedShelf] = useState<Shelf>({ niche: "cafe", description: "", isPublished: false });
  const [shelf, setShelf] = useState<Shelf>(savedShelf);
  const [follow, setFollow] = useState(false);
  const [art, setArt] = useState<Art>({});
  const [lint, setLint] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
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
        const loadedShelf = {
          niche: entry.niche ?? "cafe",
          description: entry.description ?? "",
          isPublished: entry.is_published ?? false,
        };
        setSaved(value);
        setDraft(value);
        setSavedShelf(loadedShelf);
        setShelf(loadedShelf);
        setArt((entry.art ?? {}) as Art);
      })
      .catch(() => setLoadFailed(true));
  }, [catalogId, isNew]);

  // The same 400ms check as the owner's studio, against the staff preview.
  const debouncedDraft = useDebounce(draft, 400);
  useEffect(() => {
    if (!debouncedDraft) return;
    let cancelled = false;
    previewCatalogDesign({ ...debouncedDraft, name: debouncedDraft.name || "Preview" })
      .then((result) => {
        if (!cancelled) setLint(result.lint);
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
  const changes = (saved && draft ? changesBetween(saved, draft, {}, follow).length : 0) + (shelfChanged ? 1 : 0);

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

  // Uploads are stored against the entry's id, so a template still being
  // typed has nowhere to put one. Null closes the panel and says why.
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

  async function handleSave() {
    if (!draft || !saved || saving) return;
    setProblem(null);
    setSaving(true);
    try {
      const value = withRewardOnBack(draft, saved.reward_description, follow);
      const payload = { ...value, niche: shelf.niche, description: shelf.description, is_published: shelf.isPublished };
      if (isNew) {
        const created = await createCatalogEntry(payload);
        await queryClient.invalidateQueries({ queryKey: ["admin-catalog"] });
        // Onto the entry's own URL rather than back to the list: the id it
        // was just given is what the artwork uploads need.
        navigate(`/admin/catalog/${created.id}`, { replace: true });
        return;
      }
      await patchCatalogEntry(catalogId!, payload);
      await queryClient.invalidateQueries({ queryKey: ["admin-catalog"] });
      setSaved(value);
      setDraft(value);
      setSavedShelf(shelf);
      setFollow(false);
      setJustSaved(true);
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
    setFollow(false);
    setProblem(null);
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

  return (
    <div className={frame}>
      <div className="mx-auto flex max-w-5xl flex-col gap-5">
        <div className="flex flex-col gap-1">
          <Link
            to="/admin/catalog"
            className={cn("inline-flex min-h-11 w-fit items-center gap-1.5 rounded-full text-sm text-ink-muted hover:text-ink", focusRing)}
          >
            {/* Flips with the page: a "back" arrow points back in Hebrew too. */}
            <ArrowLeft size={15} aria-hidden="true" className="rtl:rotate-180" />
            {t("admin.catalog.title")}
          </Link>
          <h1 className="type-title text-ink">
            {isNew ? t("admin.catalog.createTitle") : draft.name || t("admin.catalog.editTitle")}
          </h1>
          {!isNew && (
            <p className="text-sm text-ink-muted" dir="ltr">
              <bdi>{catalogId}</bdi>
            </p>
          )}
        </div>

        <StudioPanel title={t("admin.catalog.shelfTitle")} hint={t("admin.catalog.shelfHint")}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <StudioSelect
              label={t("admin.catalog.nicheLabel")}
              value={shelf.niche}
              onChange={(e) => editShelf({ niche: e.target.value })}
            >
              {NICHES.map((key) => (
                <option key={key} value={key}>
                  {t(`onboarding.business.niches.${key}`)}
                </option>
              ))}
            </StudioSelect>

            <StudioText
              label={t("admin.catalog.descriptionLabel")}
              hint={t("admin.catalog.descriptionHint")}
              value={shelf.description}
              onChange={(e) => editShelf({ description: e.target.value })}
            />
          </div>

          <label className="flex min-h-[44px] items-start gap-3 text-sm text-ink">
            <input
              type="checkbox"
              checked={shelf.isPublished}
              onChange={(e) => editShelf({ isPublished: e.target.checked })}
              className="mt-0.5 h-4 w-4 accent-[rgb(var(--c-primary))]"
            />
            <span>
              <span className="font-medium">{t("admin.catalog.publishedLabel")}</span>
              <span className="block text-xs text-ink-subtle">{t("admin.catalog.publishedHint")}</span>
            </span>
          </label>
        </StudioPanel>

        <CatalogArtPanel
          art={art}
          onUpload={handleUpload}
          onRemove={handleRemoveArt}
          backgroundColor={draft.background_color}
        />

        <CardStudio
          value={draft}
          onChange={edit}
          savedReward={saved.reward_description}
          follow={follow}
          onFollow={() => setFollow(true)}
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
            status: justSaved ? t("studio.savedShort") : undefined,
          }}
          tray={tray}
          onTray={setTray}
          editingField={editingField}
          onEditingField={setEditingField}
        />
      </div>
    </div>
  );
}
