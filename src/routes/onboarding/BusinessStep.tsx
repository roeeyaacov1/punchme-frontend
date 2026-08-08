import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Input, PlacesAutocomplete } from "../../components/ui";
import { getPresets, type Preset } from "../../api/presets";
import {
  createBusiness,
  createTemplate,
  type Business,
  type CardTemplate,
} from "../../api/businesses";
import type { PlaceResult } from "../../lib/googlePlaces";

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
  const [autofilled, setAutofilled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const orderedPresets = (presets ?? []).slice().sort(
    (a, b) => NICHE_ORDER.indexOf(a.niche) - NICHE_ORDER.indexOf(b.niche),
  );

  function handlePlaceSelect(place: PlaceResult) {
    setName(place.displayName);
    if (place.internationalPhoneNumber) {
      setPhone(place.internationalPhoneNumber);
    }
    setAutofilled(true);
  }

  function handleClearAutofill() {
    setName("");
    setPhone("");
    setAutofilled(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const business = await createBusiness({
        name,
        niche,
        phone,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
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

      <PlacesAutocomplete
        label={t("onboarding.business.nameLabel")}
        value={name}
        onQueryChange={(value) => {
          setName(value);
          if (autofilled) setAutofilled(false);
        }}
        onSelect={handlePlaceSelect}
        required
      />
      {autofilled && (
        <div className="flex items-start justify-between gap-3 rounded-xl bg-navy/5 px-4 py-3">
          <div className="flex flex-col gap-0.5">
            <p className="text-sm font-medium text-navy font-body">
              {t("onboarding.business.autofillTitle")}
            </p>
            <p className="text-xs text-slate font-body">
              {t("onboarding.business.autofillBody")}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClearAutofill}
            className="shrink-0 text-xs font-medium text-navy underline hover:no-underline"
          >
            {t("onboarding.business.autofillClear")}
          </button>
        </div>
      )}

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
