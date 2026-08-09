import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Button, Input } from "../../components/ui";
import {
  CardStudio,
  type CardStudioValue,
} from "../../components/card-studio/CardStudio";
import {
  createCatalogEntry,
  getCatalogEntry,
  patchCatalogEntry,
  previewCatalogDesign,
} from "../../api/catalog";
import { useDebounce } from "../../hooks/useDebounce";
import { ApiError } from "../../api/errors";

const NICHES = ["barber", "cafe", "trainer", "therapist", "other"] as const;

const EMPTY: CardStudioValue = {
  name: "",
  stamps_required: 8,
  reward_description: "",
  background_color: "#4B2E1E",
  foreground_color: "#FFFFFF",
  label_color: "#D2B48C",
  design: {},
};

/** Catalog authoring — the SAME Card Studio designer businesses use, driven
 * by the staff-only stateless preview endpoint (no owned template, no
 * uploads; catalog art ships via design/pattern/glyph, not per-template
 * assets). */
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
  const [lint, setLint] = useState<string[] | undefined>(undefined);
  const [saving, setSaving] = useState(false);
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

  if (!draft) {
    return <p className="text-slate font-mono text-sm">{error ?? t("common.loading")}</p>;
  }

  async function handleSave() {
    setError(null);
    setSaving(true);
    try {
      const payload = { ...draft!, niche, description, is_published: isPublished };
      if (isNew) {
        await createCatalogEntry(payload);
      } else {
        await patchCatalogEntry(catalogId!, payload);
      }
      await queryClient.invalidateQueries({ queryKey: ["admin-catalog"] });
      navigate("/admin/catalog");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("auth.error"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-heading text-navy">
          {isNew ? t("admin.catalog.createTitle") : t("admin.catalog.editTitle")}
        </h1>
        <div className="flex items-center gap-3">
          <Link to="/admin/catalog" className="text-sm text-slate underline hover:no-underline">
            {t("common.back")}
          </Link>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? t("common.loading") : t("common.save")}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium text-navy font-body">
          {t("admin.catalog.nicheLabel")}
          <select
            className="rounded-lg border border-slate/30 bg-white px-2 py-2 text-sm font-body"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
          >
            {NICHES.map((key) => (
              <option key={key} value={key}>
                {t(`onboarding.business.niches.${key}`)}
              </option>
            ))}
          </select>
        </label>
        <div className="flex-1 min-w-[220px]">
          <Input
            label={t("admin.catalog.descriptionLabel")}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <label className="flex items-center gap-2 text-sm font-body text-navy pb-2">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
          />
          {t("admin.catalog.publishedLabel")}
        </label>
      </div>

      {error && <p className="text-sm text-red-600 font-body">{error}</p>}

      <CardStudio
        value={draft}
        onChange={setDraft}
        businessName={draft.design.organization_name || "PunchMe"}
        lint={lint}
      />
    </div>
  );
}
