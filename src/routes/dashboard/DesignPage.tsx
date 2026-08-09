import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "../../components/ui";
import {
  CardStudio,
  type CardStudioValue,
} from "../../components/card-studio/CardStudio";
import { WalletAddButtons } from "../../components/wallet-actions/WalletAddButtons";
import { useBusiness } from "../../business/useBusiness";
import { listTemplates, patchTemplate, type CardTemplate } from "../../api/businesses";
import {
  designImageUrls,
  getTemplateDesign,
  previewTemplateDesign,
  uploadTemplateImage,
  type DesignOut,
  type ImageUse,
} from "../../api/designs";
import { previewCard, type EnrollOut } from "../../api/loyalty";
import { useDebounce } from "../../hooks/useDebounce";
import { useWalletPass } from "../../hooks/useWalletPass";

function toStudioValue(template: CardTemplate, design: DesignOut): CardStudioValue {
  return {
    name: template.name,
    stamps_required: template.stamps_required,
    reward_description: template.reward_description,
    background_color: template.background_color ?? "#FFFFFF",
    foreground_color: template.foreground_color ?? "#000000",
    label_color: template.label_color ?? "#000000",
    // The EFFECTIVE design (defaults filled in) so the fields editor shows
    // the real state, not an empty doc.
    design: design.design,
  };
}

/** The owner's Card Studio: edit the live template with a two-platform
 * preview, save (pushes to installed passes via the async design sync),
 * and re-add the owner's own preview pass. */
export function DesignPage() {
  const { t } = useTranslation();
  const { business } = useBusiness();
  const queryClient = useQueryClient();

  const { data: templates } = useQuery({
    queryKey: ["templates", business?.id],
    queryFn: () => listTemplates(business!.id!),
    enabled: !!business?.id,
  });
  const template = templates?.[0];

  const designQuery = useQuery({
    queryKey: ["design", template?.id],
    queryFn: () => getTemplateDesign(business!.id!, template!.id!),
    enabled: !!business?.id && !!template?.id,
  });

  const [draft, setDraft] = useState<CardStudioValue | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [lint, setLint] = useState<string[] | undefined>(undefined);
  const [ownerCard, setOwnerCard] = useState<EnrollOut | null>(null);
  const [artUrls, setArtUrls] = useState<Partial<Record<ImageUse, string>>>({});

  // Seed the draft once per loaded template (not on every refetch — that
  // would clobber unsaved edits).
  const seededFor = useRef<string | null>(null);
  useEffect(() => {
    if (template && designQuery.data && seededFor.current !== template.id) {
      seededFor.current = template.id!;
      setDraft(toStudioValue(template, designQuery.data));
      setLint(designQuery.data.lint);
    }
  }, [template, designQuery.data]);

  // Debounced server-side validation + lint while editing — the stateless
  // preview endpoint applies the draft in memory and returns fresh lint.
  const debouncedDraft = useDebounce(dirty ? draft : null, 400);
  useEffect(() => {
    if (!debouncedDraft || !business?.id || !template?.id) return;
    let cancelled = false;
    previewTemplateDesign(business.id, template.id, debouncedDraft)
      .then((result) => {
        if (!cancelled) setLint(result.lint);
      })
      .catch(() => {
        /* validation errors surface on save; keep the last lint */
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedDraft, business?.id, template?.id]);

  useEffect(() => {
    if (business?.id && template?.id) {
      previewCard(business.id, template.id).then(setOwnerCard).catch(() => {});
    }
  }, [business?.id, template?.id]);

  // The owner's pass is issued asynchronously — poll until its URL lands.
  const ownerPass = useWalletPass(ownerCard);

  if (!business || !template || !draft) {
    return <p className="text-slate font-mono text-sm">{t("common.loading")}</p>;
  }

  async function handleSave() {
    setSaveError(null);
    setSaving(true);
    setSaved(false);
    try {
      await patchTemplate(business!.id!, template!.id!, draft!);
      setDirty(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      await queryClient.invalidateQueries({ queryKey: ["templates", business!.id] });
      await designQuery.refetch();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : t("auth.error"));
    } finally {
      setSaving(false);
    }
  }

  async function handleUpload(use: ImageUse, file: File) {
    const uploaded = await uploadTemplateImage(business!.id!, template!.id!, use, file);
    if (use === "stamp_art" || use === "stamped_art" || use === "unstamped_art") {
      // Art is stored on the template row and echoed back as a data URL.
      setArtUrls((current) => ({ ...current, [use]: uploaded.url }));
    }
    const fresh = await designQuery.refetch();
    if (fresh.data) setLint(fresh.data.lint);
  }

  const urls = { ...designImageUrls(designQuery.data), ...artUrls };
  const syncError = designQuery.data?.sync?.error;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-heading text-navy">{t("studio.title")}</h1>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="text-sm text-emerald-700 font-body">{t("studio.saved")}</span>
          )}
          <WalletAddButtons
            passUrl={ownerPass.passUrl}
            pending={ownerPass.pending}
            slow={ownerPass.slow}
            onRetry={ownerPass.retry}
          />

          <Button onClick={handleSave} disabled={saving || !dirty}>
            {saving ? t("common.loading") : t("studio.save")}
          </Button>
        </div>
      </div>

      <p className="text-sm text-slate font-body max-w-2xl">{t("studio.subtitle")}</p>

      {syncError && (
        <p className="text-sm text-red-700 bg-red-50 rounded-lg px-3 py-2 font-body">
          {t("studio.syncError")}
        </p>
      )}
      {saveError && <p className="text-sm text-red-600 font-body">{saveError}</p>}

      <CardStudio
        value={draft}
        onChange={(value) => {
          setDraft(value);
          setDirty(true);
        }}
        businessName={business.name}
        images={urls}
        onUpload={handleUpload}
        lint={lint}
      />
    </div>
  );
}
