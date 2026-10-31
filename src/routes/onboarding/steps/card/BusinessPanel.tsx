import { useId, type FormEvent, type Ref } from "react";
import { useTranslation } from "react-i18next";
import { CircleAlert } from "lucide-react";
import { ChoiceTiles, type Tile } from "../../../../components/card-studio/controls/ChoiceTiles";
import type { PlaceResult } from "../../../../lib/googlePlaces";
import { NICHES, type Niche } from "../../draft";
import { useOnboardingDraft } from "../../useOnboardingDraft";
import { BusinessNameField } from "../BusinessNameField";

/** The order the trades are offered in: the ones the product is built for
 * first, "other" last. */
const NICHE_ORDER: Niche[] = ["barber", "cafe", "trainer", "therapist", "other"];

/**
 * The business: its name, with Google Places' suggestions, and its trade, as
 * pills. The map's first part, and the one the walk can't leave unfinished:
 * the card's name and its look come from here. The card above prints the
 * name as it is typed and wears the trade's look the moment one is picked.
 * Nothing is disabled to say "not yet": leaving with the name or the trade
 * missing says which (`asked`), under the field it's missing from, and the
 * screen takes focus there. Enter in the name goes on, as the tray's own
 * button does.
 */
export function BusinessPanel({
  asked,
  nameRef,
  tradeRef,
  onEnter,
  onPick,
}: {
  /** The owner tried to leave without a name or a trade. */
  asked: boolean;
  nameRef: Ref<HTMLInputElement>;
  tradeRef: Ref<HTMLDivElement>;
  onEnter: () => void;
  /** A trade picked: its stamp lands on the card. */
  onPick?: () => void;
}) {
  const { t } = useTranslation();
  const { draft, update, presets } = useOnboardingDraft();
  const tradeErrorId = useId();

  // Only trades the server has a preset for, once it has said; until then,
  // or if it lists none at all, all five (the API's closed set either way,
  // and the built-in looks dress every one). The trade already chosen
  // always stays, so a catalog that changed under a draft never hides it.
  const listed = presets?.length ? NICHES.filter((niche) => presets.some((preset) => preset.niche === niche)) : NICHES;
  const niches = NICHE_ORDER.filter((niche) => listed.includes(niche) || niche === draft.niche);

  const nameMissing = asked && !draft.name.trim();
  const tradeMissing = asked && !draft.niche;

  function onPlace(place: PlaceResult) {
    update({ name: place.displayName, phone: place.internationalPhoneNumber ?? draft.phone });
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    onEnter();
  }

  const tiles: Tile<Niche>[] = niches.map((niche) => ({
    value: niche,
    label: t(`onboarding.business.niches.${niche}`),
    render: () => <span className="px-4 type-label text-ink">{t(`onboarding.business.niches.${niche}`)}</span>,
  }));

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-6">
      <BusinessNameField
        ref={nameRef}
        value={draft.name}
        onChange={(name) => update({ name })}
        onPlace={onPlace}
        error={nameMissing ? t("onboarding.missing.name") : undefined}
      />
      <div ref={tradeRef} className="flex flex-col gap-2">
        <ChoiceTiles
          legend={t("onboarding.business.nicheLabel")}
          tiles={tiles}
          value={draft.niche}
          onChange={(niche) => {
            update({ niche });
            onPick?.();
          }}
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
    </form>
  );
}
