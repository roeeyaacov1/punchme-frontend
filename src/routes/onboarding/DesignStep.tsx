import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../../components/ui";
import {
  CardStudio,
  type CardStudioValue,
} from "../../components/card-studio/CardStudio";
import { patchTemplate, type Business, type CardTemplate } from "../../api/businesses";
import {
  designImageUrls,
  getTemplateDesign,
  uploadTemplateImage,
  type DesignOut,
  type ImageUse,
} from "../../api/designs";
import { ApiError } from "../../api/errors";

interface DesignStepProps {
  business: Business;
  template: CardTemplate;
  onSaved: (template: CardTemplate) => void;
  onBack: () => void;
}

/** Onboarding wrapper around the Card Studio designer (simple mode —
 * Advanced is trimmed to colors and labels; the wallet plumbing lives in
 * the dashboard's Design page). The template already exists (BusinessStep
 * created it from the niche preset), so uploads and saves target the real
 * thing. */
export function DesignStep({ business, template, onSaved, onBack }: DesignStepProps) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<CardStudioValue | null>(null);
  const [images, setImages] = useState<{ logo?: string; stamp_art?: string; strip_base?: string }>(
    {},
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getTemplateDesign(business.id!, template.id!)
      .then((design: DesignOut) => {
        setDraft({
          name: template.name,
          stamps_required: template.stamps_required,
          reward_description: template.reward_description,
          background_color: template.background_color ?? "#FFFFFF",
          foreground_color: template.foreground_color ?? "#000000",
          label_color: template.label_color ?? "#000000",
          design: design.design,
        });
        setImages(designImageUrls(design));
      })
      .catch(() => setError(t("auth.error")));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [business.id, template.id]);

  async function handleUpload(use: ImageUse, file: File) {
    const uploaded = await uploadTemplateImage(business.id!, template.id!, use, file);
    const design = await getTemplateDesign(business.id!, template.id!);
    setImages((current) => ({
      ...designImageUrls(design),
      ...(use === "stamp_art" ? { stamp_art: uploaded.url } : {}),
      ...(use !== "stamp_art" ? { stamp_art: current.stamp_art } : {}),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft) return;
    setError(null);
    setIsSubmitting(true);
    try {
      const updated = await patchTemplate(business.id!, template.id!, draft);
      onSaved(updated);
    } catch (err) {
      setError(err instanceof ApiError && err.status === 422 ? err.message : t("auth.error"));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!draft) {
    return <p className="text-slate font-mono text-sm">{t("common.loading")}</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 w-full max-w-5xl">
      <h1 className="text-2xl text-navy">{t("onboarding.design.title")}</h1>

      <CardStudio
        value={draft}
        onChange={setDraft}
        businessName={business.name}
        images={images}
        onUpload={handleUpload}
        simpleOnly
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <Button type="button" variant="secondary" onClick={onBack}>
          {t("common.back")}
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {t("common.next")}
        </Button>
      </div>
    </form>
  );
}
