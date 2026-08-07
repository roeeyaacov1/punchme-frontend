import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Input } from "../../components/ui";
import { getPresets, type Preset } from "../../api/presets";
import {
  createBusiness,
  createTemplate,
  type Business,
  type CardTemplate,
} from "../../api/businesses";

const NICHE_ORDER = ["barber", "cafe", "trainer", "therapist", "other"];

interface BusinessStepProps {
  onCreated: (business: Business, template: CardTemplate) => void;
}

export function BusinessStep({ onCreated }: BusinessStepProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data: presets } = useQuery({
    queryKey: ["presets"],
    queryFn: () => getPresets(),
    staleTime: Infinity,
  });

  const [name, setName] = useState("");
  const [niche, setNiche] = useState("barber");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const orderedPresets = (presets ?? []).slice().sort(
    (a, b) => NICHE_ORDER.indexOf(a.niche) - NICHE_ORDER.indexOf(b.niche),
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const business = await createBusiness({
        name,
        niche,
        phone,
        timezone: "Asia/Jerusalem",
      });
      const preset = presets?.find((p: Preset) => p.niche === niche);
      const template = await createTemplate(business.id!, {
        name: preset?.name ?? "Loyalty Card",
        stamps_required: preset?.stamps_required ?? 10,
        reward_description: preset?.reward_description ?? "Free reward",
        background_color: preset?.background_color ?? "#111827",
        foreground_color: preset?.foreground_color ?? "#FFFFFF",
        label_color: preset?.label_color ?? "#9CA3AF",
        logo_url: "",
      });
      await queryClient.invalidateQueries({ queryKey: ["business", "me"] });
      onCreated(business, template);
    } catch {
      setError(t("auth.error"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full max-w-sm">
      <h1 className="text-2xl text-navy">{t("onboarding.business.title")}</h1>

      <Input
        label={t("onboarding.business.nameLabel")}
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <div className="flex flex-col gap-1.5 text-start">
        <label className="text-sm font-medium text-navy font-body">
          {t("onboarding.business.nicheLabel")}
        </label>
        <div className="flex flex-wrap gap-2">
          {orderedPresets.map((preset) => (
            <button
              key={preset.niche}
              type="button"
              onClick={() => setNiche(preset.niche)}
              className={
                "rounded-full border px-4 py-2 text-sm font-body transition-colors " +
                (niche === preset.niche
                  ? "bg-navy text-white border-navy"
                  : "border-navy/20 text-navy hover:bg-navy/5")
              }
            >
              {t(`onboarding.business.niches.${preset.niche}`)}
            </button>
          ))}
        </div>
      </div>

      <Input
        label={t("onboarding.business.phoneLabel")}
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        dir="ltr"
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" disabled={isSubmitting || !name}>
        {t("common.next")}
      </Button>
    </form>
  );
}
