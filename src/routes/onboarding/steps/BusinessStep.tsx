import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { PlacesAutocomplete } from "../../../components/ui";
import { StepShell } from "../../../components/onboarding/StepShell";
import { cn } from "../../../lib/cn";
import type { PlaceResult } from "../../../lib/googlePlaces";
import { useOnboardingDraft } from "../useOnboardingDraft";
import { NICHES, type Niche } from "../draft";

/** The order the trades are offered in — the ones the product is built for
 * first, "other" last. */
const NICHE_ORDER: Niche[] = ["barber", "cafe", "trainer", "therapist", "other"];

export function BusinessStep() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { draft, update, presets } = useOnboardingDraft();

  // Only trades the server actually has a preset for, once we know; until
  // then, all five (they are the API's closed set either way).
  const available = presets ? NICHES.filter((n) => presets.some((p) => p.niche === n)) : NICHES;
  const niches = NICHE_ORDER.filter((n) => available.includes(n));

  function handlePlaceSelect(place: PlaceResult) {
    update({
      name: place.displayName,
      phone: place.internationalPhoneNumber ?? draft.phone,
    });
  }

  const canContinue = draft.name.trim().length > 0 && draft.niche !== null;

  return (
    <StepShell
      title={t("onboarding.business.title")}
      subtitle={t("onboarding.business.subtitle")}
      onNext={() => navigate("/onboarding/color")}
      nextDisabled={!canContinue}
    >
      <PlacesAutocomplete
        label={t("onboarding.business.nameLabel")}
        value={draft.name}
        onQueryChange={(value) => update({ name: value })}
        onSelect={handlePlaceSelect}
        placeholder={t("onboarding.business.namePlaceholder")}
        required
      />

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-ink">
          {t("onboarding.business.nicheLabel")}
        </legend>
        <div className="flex flex-wrap gap-2">
          {niches.map((niche) => {
            const selected = draft.niche === niche;
            return (
              <label
                key={niche}
                className={cn(
                  "inline-flex min-h-[44px] cursor-pointer items-center rounded-lg border px-4 text-sm font-medium transition-colors",
                  selected
                    ? "border-ink bg-navy-deep text-white"
                    : "border-border-strong bg-surface text-ink hover:bg-background",
                  "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary-text has-[:focus-visible]:ring-offset-2",
                )}
              >
                <input
                  type="radio"
                  name="niche"
                  value={niche}
                  checked={selected}
                  onChange={() => update({ niche })}
                  className="sr-only"
                />
                {t(`onboarding.business.niches.${niche}`)}
              </label>
            );
          })}
        </div>
      </fieldset>
    </StepShell>
  );
}
