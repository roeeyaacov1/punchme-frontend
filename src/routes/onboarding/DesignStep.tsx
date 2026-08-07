import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, ColorField, Input } from "../../components/ui";
import { WalletCardPreview } from "../../components/wallet-card/WalletCardPreview";
import { patchTemplate, type Business, type CardTemplate } from "../../api/businesses";
import { uploadLogo } from "../../lib/cloudinaryUpload";

interface DesignStepProps {
  business: Business;
  template: CardTemplate;
  onSaved: (template: CardTemplate) => void;
  onBack: () => void;
}

export function DesignStep({ business, template, onSaved, onBack }: DesignStepProps) {
  const { t } = useTranslation();
  const [name, setName] = useState(template.name);
  const [stampsRequired, setStampsRequired] = useState(template.stamps_required);
  const [rewardDescription, setRewardDescription] = useState(template.reward_description);
  const [backgroundColor, setBackgroundColor] = useState(template.background_color);
  const [foregroundColor, setForegroundColor] = useState(template.foreground_color);
  const [labelColor, setLabelColor] = useState(template.label_color);
  const [logoUrl, setLogoUrl] = useState(template.logo_url ?? "");
  const [logoError, setLogoError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogoFile(file: File) {
    setLogoError(null);
    setIsUploading(true);
    try {
      const url = await uploadLogo(file);
      setLogoUrl(url);
    } catch {
      // Covers both "Cloudinary isn't configured" and real upload failures —
      // either way the paste-URL field below is the fallback.
      setLogoError(t("onboarding.design.logoUploadError"));
    } finally {
      setIsUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const updated = await patchTemplate(business.id!, template.id!, {
        name,
        stamps_required: stampsRequired,
        reward_description: rewardDescription,
        background_color: backgroundColor,
        foreground_color: foregroundColor,
        label_color: labelColor,
        logo_url: logoUrl,
      });
      onSaved(updated);
    } catch {
      setError(t("auth.error"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-10 w-full max-w-3xl items-start justify-center">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full max-w-sm">
        <h1 className="text-2xl text-navy">{t("onboarding.design.title")}</h1>

        <Input
          label={t("onboarding.design.templateNameLabel")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input
          label={t("onboarding.design.stampsRequiredLabel")}
          type="number"
          min={1}
          max={50}
          value={stampsRequired}
          onChange={(e) => setStampsRequired(Number(e.target.value))}
          required
        />
        <Input
          label={t("onboarding.design.rewardLabel")}
          value={rewardDescription}
          onChange={(e) => setRewardDescription(e.target.value)}
          required
        />

        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-navy font-body">
            {t("onboarding.design.colorsTitle")}
          </p>
          <ColorField
            label={t("onboarding.design.backgroundColorLabel")}
            value={backgroundColor}
            onChange={setBackgroundColor}
          />
          <ColorField
            label={t("onboarding.design.foregroundColorLabel")}
            value={foregroundColor}
            onChange={setForegroundColor}
          />
          <ColorField
            label={t("onboarding.design.labelColorLabel")}
            value={labelColor}
            onChange={setLabelColor}
          />
        </div>

        <div className="flex flex-col gap-1.5 text-start">
          <label className="text-sm font-medium text-navy font-body">
            {t("onboarding.design.logoLabel")}
          </label>
          <input
            type="file"
            accept="image/*"
            disabled={isUploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleLogoFile(file);
            }}
            className="text-sm font-body text-slate"
          />
          <Input
            label={t("onboarding.design.logoUrlLabel")}
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            dir="ltr"
            error={logoError ?? undefined}
          />
        </div>

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

      <div className="flex justify-center w-full lg:w-auto lg:sticky lg:top-10">
        <WalletCardPreview
          businessName={business.name}
          stampsRequired={stampsRequired || 1}
          rewardDescription={rewardDescription}
          backgroundColor={backgroundColor}
          foregroundColor={foregroundColor}
          labelColor={labelColor}
          logoUrl={logoUrl || undefined}
        />
      </div>
    </div>
  );
}
