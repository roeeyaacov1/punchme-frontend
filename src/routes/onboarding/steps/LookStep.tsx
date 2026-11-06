import { useId, useMemo, useRef, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CircleAlert } from "lucide-react";
import type { Preset } from "../../../api/presets";
import { ChoiceTiles, type Tile } from "../../../components/card-studio/controls/ChoiceTiles";
import { StampGrid } from "../../../components/card-studio/StampGrid";
import { Button } from "../../../components/kit";
import { StepHeading, StepShell } from "../../../components/onboarding/StepShell";
import { useWide } from "../../../components/onboarding/useWide";
import { cn } from "../../../lib/cn";
import { CardStage } from "../CardStage";
import { draftPreviewValue, resolveDraft, sampleStamps, type Niche } from "../draft";
import {
  classicChoicePatch,
  defaultRewards,
  drawnLooks,
  listedTrades,
  lookChoicePatch,
  lookName,
  lookPreview,
  looksFor,
  readyLooks,
  type CardLook,
} from "../looks";
import { useStageWallet } from "../stageWallet";
import { useOnboardingDraft } from "../useOnboardingDraft";

/** One look on the screen: a drawn one, or a trade's classic look where it
 * has none drawn. */
type Choice = { id: string; name: string } & ({ drawn: Preset } | { classic: CardLook });

/** A drawn look's tile: its own picture, the wallet's own (Apple's strip, or
 * Google's hero on an Android), under its name. The picture is the look, so
 * it is said by its name, never as a picture (the radio's own label). */
function DrawnFace({ preset, name, google }: { preset: Preset; name: string; google: boolean }) {
  return (
    <span className="flex w-full flex-col gap-2 rounded-field bg-surface p-2 shadow-panel">
      <img
        src={google ? preset.pictures!.hero : preset.pictures!.strip}
        alt=""
        draggable={false}
        className={cn("block w-full rounded-[0.5rem] bg-ink/5", google ? "aspect-[1032/336]" : "aspect-[1125/432]")}
      />
      <span aria-hidden className="type-label px-1 pb-1 text-start text-ink">
        {name}
      </span>
    </span>
  );
}

/** A classic look's tile: the strip as the frozen stand-in draws it, in that
 * look's colours, never redrawn. Nothing is said about there being no other:
 * it is a look like the rest. */
function ClassicFace({ look, name }: { look: CardLook; name: string }) {
  return (
    <span className="flex w-full flex-col gap-2 rounded-field bg-surface p-2 shadow-panel">
      <StampGrid
        stampsRequired={look.stamps}
        currentStamps={sampleStamps(look.stamps)}
        stampColor={look.accent}
        backgroundColor={look.background}
        glyph={look.glyph}
        pattern={look.pattern}
      />
      <span aria-hidden className="type-label px-1 pb-1 text-start text-ink">
        {name}
      </span>
    </span>
  );
}

/**
 * The first stop while the wizard offers the card looks (brief §7.3): what
 * kind of business it is, then that trade's published looks, each its own
 * picture, the one the draft has, or the trade's first, chosen. "Continue
 * with {look}" writes the trade and the look into the draft and opens the
 * map at its business, where the name is asked.
 *
 * Nothing is written until then: changing the trade here only shows its
 * looks. Back on the map, "Change" beside the trade comes here again, and a
 * different look takes what a look sets, never what is the owner's own
 * (`lookChoicePatch`).
 *
 * On a phone, one look to a row, the action docked at the foot. In two
 * columns, the looks two to a row and the chosen one as the whole pass in
 * the card's column, as every other stop has it.
 */
export function LookStep() {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage ?? "en";
  const navigate = useNavigate();
  const wide = useWide();
  const [wallet] = useStageWallet();
  const { draft, update, presets } = useOnboardingDraft();
  const defaults = useMemo(() => defaultRewards(t), [t]);
  const tradeBox = useRef<HTMLDivElement>(null);
  const tradeErrorId = useId();
  const looksHeadingId = useId();
  const [trade, setTrade] = useState<Niche | null>(draft.niche);
  const [picked, setPicked] = useState<string | null>(null);
  const [asked, setAsked] = useState(false);

  const trades = listedTrades(presets, trade);
  const choices = useMemo((): Choice[] => {
    if (!trade) return [];
    const drawn = drawnLooks(trade, presets);
    if (drawn.length) return drawn.map((preset) => ({ id: preset.id, name: lookName(preset, drawn, t), drawn: preset }));
    const classic = looksFor(trade, presets)[0];
    return classic ? [{ id: classic.key, name: readyLooks([classic], t)[0].name, classic }] : [];
  }, [trade, presets, t]);
  const chosen =
    choices.find((choice) => choice.id === picked) ?? choices.find((choice) => choice.id === draft.look) ?? choices[0];

  const preview = useMemo(() => {
    if (!wide || !trade || !chosen) return undefined;
    const here = { ...draft, niche: trade };
    if ("drawn" in chosen) return lookPreview(chosen.drawn, here, presets, lang, t) ?? undefined;
    const resolved = resolveDraft({ ...here, ...classicChoicePatch(chosen.classic, here, presets, defaults) }, presets, t);
    return draftPreviewValue(resolved, lang, t, undefined);
  }, [wide, trade, chosen, draft, presets, lang, t, defaults]);

  function go(event?: FormEvent) {
    event?.preventDefault();
    if (!trade || !chosen) {
      setAsked(true);
      tradeBox.current?.querySelector<HTMLInputElement>("input")?.focus();
      return;
    }
    const patch =
      "drawn" in chosen
        ? lookChoicePatch(chosen.drawn, draft, presets, defaults)
        : classicChoicePatch(chosen.classic, draft, presets, defaults);
    update({ niche: trade, ...patch });
    navigate("/onboarding/business");
  }

  const tradeTiles: Tile<Niche>[] = trades.map((niche) => ({
    value: niche,
    label: t(`onboarding.business.niches.${niche}`),
    render: () => <span className="px-4 type-label text-ink">{t(`onboarding.business.niches.${niche}`)}</span>,
  }));

  const lookTiles: Tile<string>[] = choices.map((choice) => ({
    value: choice.id,
    label: choice.name,
    render: () =>
      "drawn" in choice ? (
        <DrawnFace preset={choice.drawn} name={choice.name} google={wallet === "google"} />
      ) : (
        <ClassicFace look={choice.classic} name={choice.name} />
      ),
  }));

  const action = (
    <Button
      size="lg"
      onClick={() => go()}
      iconEnd={<ArrowRight aria-hidden className="rtl:-scale-x-100" />}
      // With large text on a narrow phone the words wrap inside the pill.
      className="w-full !whitespace-normal text-center"
    >
      {chosen ? t("onboarding.look.next", { look: chosen.name }) : t("common.next")}
    </Button>
  );

  return (
    <StepShell
      heading={<StepHeading title={t("onboarding.business.nicheLabel")} />}
      card={preview && <CardStage preview={preview} />}
      action={action}
    >
      <form noValidate onSubmit={go} className="flex flex-col gap-8">
        <div ref={tradeBox} className="flex flex-col gap-2">
          <ChoiceTiles
            legend={t("onboarding.business.nicheLabel")}
            hideLegend
            tiles={tradeTiles}
            value={trade}
            onChange={(niche) => {
              setTrade(niche);
              setPicked(null);
              setAsked(false);
            }}
            shape="pill"
            listClassName="gap-2"
            describedBy={asked && !trade ? tradeErrorId : undefined}
          />
          {asked && !trade && (
            <p id={tradeErrorId} className="flex items-start gap-1.5 text-sm font-semibold leading-snug text-danger">
              <CircleAlert aria-hidden className="mt-px size-4 shrink-0" />
              <span>{t("onboarding.missing.trade")}</span>
            </p>
          )}
        </div>

        <section aria-labelledby={looksHeadingId} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <h2 id={looksHeadingId} className="type-title text-ink">
              {t("onboarding.look.heading")}
            </h2>
            <p className="type-body text-pretty text-ink-muted">
              {trade ? t(`onboarding.look.lead.${trade}`) : t("onboarding.look.noTrade")}
            </p>
          </div>
          {choices.length > 0 && chosen && (
            <ChoiceTiles
              legend={t("onboarding.look.heading")}
              hideLegend
              tiles={lookTiles}
              value={chosen.id}
              onChange={setPicked}
              shape="rounded"
              listClassName={cn("grid gap-4", wide ? "grid-cols-2" : "grid-cols-1")}
            />
          )}
        </section>
      </form>
    </StepShell>
  );
}
