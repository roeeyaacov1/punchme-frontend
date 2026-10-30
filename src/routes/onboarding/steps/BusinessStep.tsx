import { useId, useMemo, useRef, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CircleAlert } from "lucide-react";
import { ChoiceTiles, type Tile } from "../../../components/card-studio/controls/ChoiceTiles";
import { Button } from "../../../components/kit";
import { StepHeading, StepShell } from "../../../components/onboarding/StepShell";
import type { PlaceResult } from "../../../lib/googlePlaces";
import { CardStage } from "../CardStage";
import { buildTemplateInput, draftPreviewValue, NICHES, resolveDraft, type Niche } from "../draft";
import { defaultRewards, withTradeLook } from "../looks";
import { useStorageFull } from "../storageCheck";
import { StorageNotice } from "../StorageNotice";
import { useOnboardingDraft } from "../useOnboardingDraft";
import { BusinessNameField } from "./BusinessNameField";

/** The order the trades are offered in: the ones the product is built for
 * first, "other" last. */
const NICHE_ORDER: Niche[] = ["barber", "cafe", "trainer", "therapist", "other"];

/**
 * The first stop: the business's name and its trade. The card above it is
 * the trade's first look the moment a trade is chosen, its name printed as
 * it is typed, and Next writes that look into whatever the owner hasn't
 * chosen, so the card screen opens on a finished card. Nothing here is
 * disabled to say "not yet": pressing on with the name or the trade missing
 * says which, where it is missing, and takes focus there.
 */
export function BusinessStep() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { draft, update, presets, artUrl, artPersisted } = useOnboardingDraft();
  const storageFull = useStorageFull(draft, artPersisted);
  const lang = i18n.resolvedLanguage ?? "en";
  const nameField = useRef<HTMLInputElement>(null);
  const tradeBox = useRef<HTMLDivElement>(null);
  const tradeErrorId = useId();
  const [pressed, setPressed] = useState(false);

  // Only trades the server has a preset for, once it has said; until then,
  // all five (the API's closed set either way).
  const available = presets ? NICHES.filter((niche) => presets.some((preset) => preset.niche === niche)) : NICHES;
  const niches = NICHE_ORDER.filter((niche) => available.includes(niche));

  // A reward still saying a trade's default follows a change of trade.
  const defaults = useMemo(() => defaultRewards(t), [t]);

  // The card as Next will leave it: the trade's look in every field still empty.
  const preview = useMemo(() => {
    const look = draft.niche ? withTradeLook(draft, presets, defaults) : {};
    const resolved = resolveDraft({ ...draft, ...look }, presets, t);
    return draftPreviewValue(resolved, lang, t, artUrl, buildTemplateInput(resolved, presets, lang, t).name);
  }, [draft, presets, defaults, lang, t, artUrl]);

  const nameMissing = pressed && !draft.name.trim();
  const tradeMissing = pressed && !draft.niche;

  function onPlace(place: PlaceResult) {
    update({ name: place.displayName, phone: place.internationalPhoneNumber ?? draft.phone });
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    setPressed(true);
    if (!draft.name.trim()) {
      nameField.current?.focus();
      return;
    }
    if (!draft.niche) {
      tradeBox.current?.querySelector<HTMLInputElement>("input")?.focus();
      return;
    }
    update({ name: draft.name.trim(), ...withTradeLook(draft, presets, defaults) });
    navigate("/onboarding/reward");
  }

  const tiles: Tile<Niche>[] = niches.map((niche) => ({
    value: niche,
    label: t(`onboarding.business.niches.${niche}`),
    render: () => <span className="px-4 type-label text-ink">{t(`onboarding.business.niches.${niche}`)}</span>,
  }));

  return (
    <form noValidate onSubmit={submit}>
      <StepShell
        cardFirst
        notice={<StorageNotice full={storageFull} />}
        card={<CardStage crop="top" preview={preview} />}
        heading={<StepHeading title={t("onboarding.business.title")} />}
        action={
          <Button
            type="submit"
            size="lg"
            iconEnd={<ArrowRight aria-hidden className="rtl:-scale-x-100" />}
            className="w-full"
          >
            {t("onboarding.continue")}
          </Button>
        }
      >
        <BusinessNameField
          ref={nameField}
          value={draft.name}
          onChange={(name) => update({ name })}
          onPlace={onPlace}
          error={nameMissing ? t("onboarding.missing.name") : undefined}
        />
        <div ref={tradeBox} className="flex flex-col gap-2">
          <ChoiceTiles
            legend={t("onboarding.business.nicheLabel")}
            tiles={tiles}
            value={draft.niche}
            onChange={(niche) => update({ niche })}
            shape="pill"
            listClassName="gap-2"
            describedBy={tradeMissing ? tradeErrorId : undefined}
          />
          {tradeMissing && (
            <p id={tradeErrorId} className="flex items-start gap-1.5 text-sm font-semibold leading-snug text-danger">
              <CircleAlert aria-hidden className="mt-px size-4 shrink-0" />
              <span>{t("onboarding.missing.trade")}</span>
            </p>
          )}
        </div>
      </StepShell>
    </form>
  );
}
