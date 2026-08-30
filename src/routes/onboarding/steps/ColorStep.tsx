import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { ChoiceGrid } from "../../../components/onboarding/ChoiceGrid";
import { LookGallery } from "../../../components/onboarding/LookGallery";
import { StepShell } from "../../../components/onboarding/StepShell";
import { ColorField } from "../../../components/ui";
import { focusRing } from "../../../components/marketing/primitives";
import { accentFits, CARD_BACKGROUNDS } from "../../../lib/accentPalette";
import { cn } from "../../../lib/cn";
import { normalizeHex } from "../../../lib/color";
import { useOnboardingDraft } from "../useOnboardingDraft";
import { looksFor, lookPatch, matchLook, type CardLook } from "../looks";
import { swatch } from "./swatch";

/**
 * Where the card gets its look.
 *
 * Two ways down, in the order most owners want them. A ready-made look is a
 * finished card for their trade, authored by staff in `/admin` — one tap and
 * the colours, the stamp and the texture are all decided, and Next carries the
 * owner past the two screens that would have asked for them one at a time. The
 * colour grid underneath is the old road, unchanged, for anyone who arrived
 * with a brand colour in mind.
 *
 * Taking a look never skips the *reward* step: a look decides how the card
 * looks and has no business deciding what it is worth.
 */
export function ColorStep() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { draft, resolved, update, presets } = useOnboardingDraft();
  const current = resolved.background;
  const isCurated = CARD_BACKGROUNDS.some((b) => b.hex === current);
  const [customOpen, setCustomOpen] = useState(!isCurated);

  // Published catalog entries for this trade, topped up with built-ins — see
  // `looks.ts`. Recomputed only when the trade or the catalog changes, not on
  // every colour tap.
  const looks = useMemo(() => looksFor(resolved.niche, presets), [resolved.niche, presets]);
  const selectedLook = matchLook(draft, looks);
  // Only this visit's tap shortcuts the road. A returning owner walking back
  // to change a colour should carry on through the steps they know, not be
  // flung forward because their card happens to still match a look.
  const [tookLook, setTookLook] = useState(false);

  function choose(hex: string) {
    const next = normalizeHex(hex);
    if (!next) return;
    setTookLook(false);
    update({
      background: next,
      // A stamp colour picked against the old background may no longer
      // read on the new one; let it be chosen again.
      accent: accentFits(draft.accent, next) ? draft.accent : null,
    });
  }

  function takeLook(look: CardLook) {
    setTookLook(true);
    update(lookPatch(look));
  }

  const choices = CARD_BACKGROUNDS.map((b) => ({
    value: b.hex,
    label: t(`onboarding.color.names.${b.key}`),
    render: (selected: boolean) => swatch(b.hex, selected),
  }));

  return (
    <StepShell
      title={t("onboarding.color.title")}
      onBack={() => navigate("/onboarding/business")}
      onNext={() => {
        // Write the resolved value down, so what the owner saw is what is kept.
        update({ background: current });
        navigate(tookLook ? "/onboarding/reward" : "/onboarding/accent");
      }}
    >
      {looks.length > 0 && (
        <LookGallery
          looks={looks}
          value={selectedLook}
          onChange={takeLook}
          legend={t("onboarding.looks.legend")}
          // A catalog look is named by whoever authored it in /admin; only a
          // built-in has a key the app can translate.
          nameFor={(look) => look.name ?? t(`onboarding.looks.names.${look.key}`)}
        />
      )}

      <ChoiceGrid
        name="background"
        legend={t("onboarding.looks.orColor")}
        choices={choices}
        value={isCurated ? current : null}
        onChange={choose}
        columns={5}
      />

      <div>
        <button
          type="button"
          onClick={() => setCustomOpen((open) => !open)}
          aria-expanded={customOpen}
          className={cn(
            "-ms-1 -mt-2 inline-flex min-h-[44px] items-center gap-1 rounded-lg px-1 text-sm font-semibold text-primary-text hover:underline",
            focusRing,
          )}
        >
          {t("onboarding.color.custom")}
          <ChevronDown
            size={16}
            aria-hidden="true"
            className={cn("transition-transform", customOpen && "rotate-180")}
          />
        </button>
        {customOpen && (
          <div className="mt-1 max-w-xs">
            <ColorField label={t("onboarding.color.customLabel")} value={current} onChange={choose} />
          </div>
        )}
      </div>
    </StepShell>
  );
}
