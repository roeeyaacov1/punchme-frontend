import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import {
  CardStudio,
  type CardStudioImages,
  type CardStudioValue,
} from "../../components/card-studio/CardStudio";
import {
  StudioPanel,
  StudioSelect,
  StudioText,
} from "../../components/card-studio/studio-primitives";
import { ctaClasses, focusRing } from "../../components/marketing/primitives";
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
import { ApiError } from "../../api/errors";
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
 * page — authoring a look is a loop of small changes, and the old
 * save-and-leave meant coming back through the list for every one of them.
 */
export function AdminCatalogEditPage() {
  const { t } = useTranslation();
  const { catalogId } = useParams<{ catalogId: string }>();
  const isNew = catalogId === "new";
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [draft, setDraft] = useState<CardStudioValue | null>(isNew ? EMPTY : null);
  const [niche, setNiche] = useState<string>("cafe");
  const [description, setDescription] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [art, setArt] = useState<Art>({});
  const [lint, setLint] = useState<string[] | undefined>(undefined);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isNew || !catalogId) return;
    getCatalogEntry(catalogId)
      .then((entry) => {
        setDraft({
          name: entry.name,
          stamps_required: entry.stamps_required,
          reward_description: entry.reward_description,
          background_color: entry.background_color ?? "#FFFFFF",
          foreground_color: entry.foreground_color ?? "#000000",
          label_color: entry.label_color ?? "#000000",
          design: (entry.design ?? {}) as CardStudioValue["design"],
        });
        setNiche(entry.niche ?? "cafe");
        setDescription(entry.description ?? "");
        setIsPublished(entry.is_published ?? false);
        setArt((entry.art ?? {}) as Art);
        setDirty(false);
      })
      .catch(() => setError(t("auth.error")));
  }, [catalogId, isNew, t]);

  // Same debounced lint loop as the owner studio, against the staff
  // preview endpoint.
  const debouncedDraft = useDebounce(draft, 400);
  useEffect(() => {
    if (!debouncedDraft) return;
    let cancelled = false;
    previewCatalogDesign({
      ...debouncedDraft,
      name: debouncedDraft.name || "Preview",
    })
      .then((result) => {
        if (!cancelled) setLint(result.lint);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [debouncedDraft]);

  const edit = useCallback((apply: () => void) => {
    apply();
    setDirty(true);
    setSaved(false);
  }, []);

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
    setError(null);
    setSaving(true);
    try {
      const payload = { ...draft!, niche, description, is_published: isPublished };
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
      setDirty(false);
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("auth.error"));
    } finally {
      setSaving(false);
    }
  }

  if (!draft) {
    return <p className="font-mono text-sm text-ink-muted">{error ?? t("common.loading")}</p>;
  }

  const images: CardStudioImages = art;

  return (
    <div className="flex flex-col gap-4 sm:gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            to="/admin/catalog"
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg text-sm text-ink-muted hover:text-ink",
              focusRing,
            )}
          >
            {/* Flips with the page: `rtl:rotate-180` is what keeps a "back"
                arrow pointing back in Hebrew. */}
            <ArrowLeft size={15} aria-hidden="true" className="rtl:rotate-180" />
            {t("admin.catalog.title")}
          </Link>
          <h1 className="mt-1 t-h3 text-ink">
            {isNew ? t("admin.catalog.createTitle") : draft.name || t("admin.catalog.editTitle")}
          </h1>
          {!isNew && (
            <p className="mt-1 font-mono text-xs text-ink-subtle" dir="ltr">
              {catalogId}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {saved && !dirty && (
            <span className="rounded-full bg-ok-bg px-3 py-1 text-sm font-medium text-ok">
              {t("studio.saved")}
            </span>
          )}
          {dirty && (
            <span className="rounded-full bg-warn-bg px-3 py-1 text-sm font-medium text-warn">
              {t("admin.catalog.unsaved")}
            </span>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || (!dirty && !isNew)}
            className={ctaClasses("primary", "sm")}
          >
            {saving ? t("common.loading") : t("common.save")}
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" dir="auto" className="rounded-xl bg-danger-bg px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}

      {/* What only a catalog entry has: where it sits in the wizard, and the
          pictures it hands out. Both above the studio, because they are the
          two things this page adds over the owner's — and both full width,
          because a two-column row of a three-field panel beside a
          four-slot one is mostly empty page. */}
      <StudioPanel title={t("admin.catalog.shelfTitle")} hint={t("admin.catalog.shelfHint")}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <StudioSelect
            label={t("admin.catalog.nicheLabel")}
            value={niche}
            onChange={(e) => edit(() => setNiche(e.target.value))}
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
            value={description}
            onChange={(e) => edit(() => setDescription(e.target.value))}
          />
        </div>

        <label className="flex min-h-[44px] items-start gap-3 text-sm text-ink">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => edit(() => setIsPublished(e.target.checked))}
            className="mt-0.5 h-4 w-4 accent-[rgb(var(--c-primary))]"
          />
          <span>
            <span className="font-medium">{t("admin.catalog.publishedLabel")}</span>
            <span className="block text-xs text-ink-subtle">
              {t("admin.catalog.publishedHint")}
            </span>
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
        onChange={(next) => edit(() => setDraft(next))}
        businessName={draft.design.organization_name || "PunchMe"}
        images={images}
        lint={lint}
      />
    </div>
  );
}
