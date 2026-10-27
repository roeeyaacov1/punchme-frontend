import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Gift, Minus, Pencil, Plus } from "lucide-react";
import { cn } from "../../lib/cn";
import { Button } from "../kit/Button";
import { focusRingInset, noTapFlash } from "../kit/classes";
import { useReducedMotion } from "../kit/motion";
import { Tab, TabList, TabPanel, Tabs } from "../kit/Tabs";
import type { StampPicture } from "./controls";
import type { LintReading } from "./lintProblems";
import { StudioBar, type StudioBarProps } from "./StudioBar";
import { StudioStage, type CardPart, type StageHandle, type Wallet } from "./StudioStage";
import { StudioTray } from "./StudioTray";
import {
  backState,
  sampleStart,
  type CardStudioImages,
  type CardStudioValue,
  type HeldPictures,
  type HeldUse,
} from "./studioDraft";
import { ColoursTray } from "./trays/ColoursTray";
import { LogoTray } from "./trays/LogoTray";
import { NamesTray } from "./trays/NamesTray";
import { BackDiffers, RewardTray } from "./trays/RewardTray";
import { StampTray } from "./trays/StampTray";
import { WalletDetailsTray } from "./trays/WalletDetailsTray";

export type { CardStudioImages, CardStudioValue } from "./studioDraft";

/** A tray only one page has (the catalog's shelf and art). */
export interface ExtraTray {
  id: string;
  label: string;
  body: ReactNode;
  /** The part of the card it changes, brought into view above it. */
  part?: CardPart;
}

const PART_OF: Record<string, CardPart | undefined> = {
  colours: "stamps",
  stamp: "stamps",
  reward: "stamps",
  names: "names",
  logo: "logo",
};

/** The device's own wallet first, as the Overview's own pass opens. */
function deviceWallet(): Wallet {
  return typeof navigator !== "undefined" && /iPhone|iPad|Macintosh/.test(navigator.userAgent) ? "apple" : "google";
}

/** From 1024px the trays become tabs beside a sticky card. */
const WIDE = "(min-width: 1024px)";

function useWide(): boolean {
  const [wide, setWide] = useState(() => typeof window !== "undefined" && window.matchMedia(WIDE).matches);
  useEffect(() => {
    const query = window.matchMedia(WIDE);
    const update = () => setWide(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return wide;
}

/** The height a part of the page can't be under: the masthead, if there is one. */
function topClearance(): number {
  const main = document.getElementById("dashboard-main");
  return (main ? parseFloat(getComputedStyle(main).scrollMarginTop) || 0 : 0) + 8;
}

/** The bar's light comes up in 240ms and goes out in 180ms; 150ms either
 * way with reduced motion. */
const BAR_IN_MS = 240;
const BAR_OUT_MS = 180;
const GENTLE_MS = 150;

type BarPhase = "still" | "arriving" | "leaving";

/**
 * When the save bar comes and goes. It arrives when a hand's first change
 * brings it, never with the page or a draft kept from an earlier visit, and
 * leaves when a save or a discard takes it, still saying what it said.
 * Moving between the dock and a tray's foot is neither.
 */
function useBarPresence(bar: StudioBarProps, reduced: boolean) {
  const shown = bar.changes > 0 || !!bar.problem || !!bar.stale;
  const [was, setWas] = useState(shown);
  const [phase, setPhase] = useState<BarPhase>("still");
  // Followed while rendering, not in an effect, so the bar starts to come
  // or go in the very frame it changes.
  if (shown !== was) {
    setWas(shown);
    setPhase(shown ? "arriving" : "leaving");
  }
  // What it said the last time it was shown, to say as it leaves.
  const last = useRef(bar);
  useEffect(() => {
    if (shown) last.current = bar;
  });
  useEffect(() => {
    if (phase === "still") return;
    const ms = reduced ? GENTLE_MS : phase === "arriving" ? BAR_IN_MS : BAR_OUT_MS;
    const id = window.setTimeout(() => setPhase("still"), ms);
    return () => window.clearTimeout(id);
  }, [phase, reduced]);
  return { drawn: shown || phase === "leaving", props: shown ? bar : last.current, phase };
}

/**
 * The bar arriving by light, up 8px on the ease-out, and leaving as a fade,
 * no longer pressable; with reduced motion, the fade alone. Transitions, not
 * keyframes: the next change can turn it round halfway.
 */
function barLight(phase: BarPhase, reduced: boolean): string | undefined {
  if (phase === "still") return undefined;
  const arriving = phase === "arriving";
  if (reduced) {
    return cn(
      "transition-opacity duration-gentle ease-out",
      arriving ? "[@starting-style]:opacity-0" : "pointer-events-none opacity-0",
    );
  }
  return arriving
    ? "transition-[opacity,transform] duration-lights ease-out-strong [@starting-style]:translate-y-2 [@starting-style]:opacity-0"
    : "pointer-events-none opacity-0 transition-[opacity,transform] duration-exit ease-out";
}

export interface CardStudioProps {
  value: CardStudioValue;
  onChange: (next: CardStudioValue) => void;
  /** The reward as saved, which the back of the card follows. */
  savedReward: string;
  /** The owner asked the back to say the reward. */
  follow: boolean;
  onFollow: () => void;
  businessName: string;
  /** The business's trade: its glyph leads. */
  niche?: string | null;
  /** Published pictures (hosted URLs), or a catalog look's art. */
  images?: CardStudioImages;
  /** Pictures held for Save. With `onHold`, the owner's studio: a logo tray,
   * a stamp picture of one's own, custom art. */
  held?: HeldPictures;
  onHold?: (use: HeldUse, dataUrl: string | null) => void;
  stampPicture: StampPicture;
  /** Why no glyph can be chosen now. */
  pictureLocked?: ReactNode;
  /** Said before a picture is chosen. */
  pictureNote?: ReactNode;
  lint: LintReading;
  /** Edits not saved yet: the stand-in shows instead of the published card. */
  unsaved: boolean;
  bar: StudioBarProps;
  /** Under the stage: the sync's notices and the check's. */
  notices?: ReactNode;
  /** At the foot: the owner's own pass. */
  foot?: ReactNode;
  /** The tray open (on a phone) or the tab shown (from 1024px). */
  tray: string | null;
  onTray: (tray: string | null) => void;
  /** The field Wallet details shows in its editor. */
  editingField: number | null;
  onEditingField: (index: number | null) => void;
  extraTrays?: ExtraTray[];
  /** Where Save is, so a page can put focus back on it. */
  saveRef?: React.Ref<HTMLButtonElement>;
}

/**
 * The card studio. The card is the map: it stands on its own wallpaper and
 * never leaves the screen while it is edited.
 *
 * On a phone, the card first, the sample under it, the reward said as a
 * sentence, and a row of chips. A tap on the card's stamps, its names or its
 * logo, or on a chip, opens what it shows in a tray over the lower half, so
 * every choice lands on the card in view. From 1024px the trays are tabs in
 * a working column, beside the card in a sticky column with Save under it.
 *
 * Controlled: the page holds the draft, the held pictures and the save.
 */
export function CardStudio({
  value,
  onChange,
  savedReward,
  follow,
  onFollow,
  businessName,
  niche,
  images = {},
  held = {},
  onHold,
  stampPicture,
  pictureLocked,
  pictureNote,
  lint,
  unsaved,
  bar,
  notices,
  foot,
  tray,
  onTray,
  editingField,
  onEditingField,
  extraTrays = [],
  saveRef,
}: CardStudioProps) {
  const { t } = useTranslation();
  const wide = useWide();
  const reduced = useReducedMotion();
  const stage = useRef<StageHandle>(null);
  const chips = useRef(new Map<string, HTMLButtonElement>());
  const [wallet, setWallet] = useState<Wallet>(deviceWallet);
  const [sample, setSample] = useState(() => sampleStart(value.stamps_required));
  // Stamps a hand has added to the sample with +: each one lands on the card.
  const [landed, setLanded] = useState(0);
  const [trayHeight, setTrayHeight] = useState(0);
  const [shownTray, setShownTray] = useState(tray);
  const scrolledFor = useRef<string | null>(null);

  const owner = !!onHold;
  const back = backState(value.design, savedReward, follow);
  const shownSample = Math.min(sample, value.stamps_required);

  const trays: { id: string; label: string }[] = [
    { id: "colours", label: t("studio.chips.colours") },
    { id: "stamp", label: t("studio.chips.stamp") },
    { id: "reward", label: t("studio.chips.reward") },
    { id: "names", label: t("studio.chips.names") },
    ...(owner ? [{ id: "logo", label: t("studio.chips.logo") }] : []),
    { id: "wallet", label: t("studio.chips.wallet") },
    ...extraTrays.map(({ id, label }) => ({ id, label })),
  ];
  const labelOf = (id: string | null) => trays.find((candidate) => candidate.id === id)?.label ?? "";
  const partOf = (id: string) => PART_OF[id] ?? extraTrays.find((extra) => extra.id === id)?.part;

  const open = useCallback(
    (id: string) => {
      // The stamp colour can't be seen on an empty card.
      if ((id === "colours" || id === "stamp") && sample === 0) setSample(sampleStart(value.stamps_required));
      onTray(id);
    },
    [onTray, sample, value.stamps_required],
  );

  // What the tray shows while it leaves, so its words don't go first.
  useEffect(() => {
    if (tray) setShownTray(tray);
  }, [tray]);

  // From a phone to the wide layout with nothing open: the first tab. Back
  // to a phone, nothing is open: a tray is something the owner opens.
  const wasWide = useRef(wide);
  useEffect(() => {
    if (wide && !tray) onTray("colours");
    if (!wide && wasWide.current) onTray(null);
    wasWide.current = wide;
  }, [wide, tray, onTray]);

  const close = useCallback(() => {
    const was = tray;
    onTray(null);
    if (was) chips.current.get(was)?.focus();
  }, [tray, onTray]);

  // Bring the part of the card the tray changes into view above it, once
  // per tray: the stamps sit at the foot of Google's card, not under its logo.
  useEffect(() => {
    if (wide || !tray || !trayHeight) return;
    if (scrolledFor.current === tray) return;
    scrolledFor.current = tray;
    const part = partOf(tray);
    const rect = part ? stage.current?.rect(part) : null;
    if (!rect) return;
    const top = topClearance();
    const bottom = window.innerHeight - trayHeight - 8;
    let delta = rect.bottom > bottom ? rect.bottom - bottom : 0;
    if (rect.top - delta < top) delta = rect.top - top;
    // "instant", not "auto": a page that sets `scroll-behavior: smooth` would
    // turn "auto" back into a glide.
    if (Math.abs(delta) > 1) window.scrollBy({ top: delta, behavior: reduced ? "instant" : "smooth" });
    // partOf reads props that don't change while a tray is open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wide, tray, trayHeight, reduced]);

  useEffect(() => {
    if (!tray) scrolledFor.current = null;
  }, [tray]);

  const onPart = (part: CardPart) => {
    if (part === "stamps") open("stamp");
    else if (part === "names") open("names");
    else open(owner ? "logo" : "names");
  };

  const body = (id: string | null) => {
    switch (id) {
      case "colours":
        return <ColoursTray value={value} onChange={onChange} />;
      case "stamp":
        return (
          <StampTray
            value={value}
            onChange={onChange}
            niche={niche}
            picture={stampPicture}
            onPicture={onHold ? (dataUrl) => onHold("stamp_art", dataUrl) : undefined}
            note={stampPicture.inUse ? undefined : pictureNote}
            locked={pictureLocked}
          />
        );
      case "reward":
        return (
          <RewardTray value={value} onChange={onChange} back={back} onFollow={onFollow} stampPicture={stampPicture.url} />
        );
      case "names":
        return <NamesTray value={value} onChange={onChange} businessName={businessName} />;
      case "logo":
        return onHold ? (
          <LogoTray
            logo={held.logo ?? images.logo}
            ground={value.background_color}
            onPick={(dataUrl) => onHold("logo", dataUrl)}
          />
        ) : null;
      case "wallet":
        return (
          <WalletDetailsTray
            value={value}
            onChange={onChange}
            lint={lint}
            editing={editingField}
            onEditing={onEditingField}
            art={onHold ? { held, images, onPick: onHold } : undefined}
          />
        );
      default:
        return extraTrays.find((extra) => extra.id === id)?.body ?? null;
    }
  };

  const { drawn: barDrawn, props: barProps, phase: barPhase } = useBarPresence(bar, reduced);
  const light = barLight(barPhase, reduced);
  const studioBar = <StudioBar ref={saveRef} {...barProps} />;

  const sampleRow = (
    // Quick taps on + land one stamp each, never a double-tap zoom.
    <div className="flex touch-manipulation items-center justify-center gap-3">
      <Button
        variant="secondary"
        size="icon"
        icon={<Minus aria-hidden />}
        aria-label={t("studio.sampleFewer")}
        disabled={shownSample <= 0}
        onClick={() => setSample(Math.max(0, shownSample - 1))}
      />
      <p aria-live="polite" className="type-body min-w-0 text-center text-ink-muted">
        {t("studio.sample", { count: shownSample, total: value.stamps_required })}
      </p>
      <Button
        variant="secondary"
        size="icon"
        icon={<Plus aria-hidden />}
        aria-label={t("studio.sampleMore")}
        disabled={shownSample >= value.stamps_required}
        onClick={() => {
          setSample(Math.min(value.stamps_required, shownSample + 1));
          setLanded((count) => count + 1);
        }}
      />
    </div>
  );

  const rewardRow = (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => open("reward")}
        className={cn(
          "theme-lit flex min-h-14 w-full items-center gap-3 rounded-panel border border-border bg-surface px-4 py-3 text-start shadow-panel",
          "touch-manipulation select-none transition-colors duration-gentle ease-out active:bg-ink/[0.06] hover-fine:bg-ink/5",
          noTapFlash,
          focusRingInset,
        )}
      >
        <Gift aria-hidden className="size-5 shrink-0 text-ink" />
        <span className="type-body min-w-0 flex-1 text-ink">
          <Trans
            i18nKey="studio.rewardSentence"
            count={value.stamps_required}
            values={{ reward: value.reward_description.trim() || t("studio.noReward") }}
            components={{ b: <bdi className="font-semibold" /> }}
          />
        </span>
        <Pencil aria-hidden className="size-5 shrink-0 text-ink-muted" />
        <span className="sr-only">{t("studio.editReward")}</span>
      </button>
      {back.kind === "differs" && <BackDiffers text={back.text} onFollow={onFollow} />}
    </div>
  );

  const stageView = (
    <StudioStage
      ref={stage}
      value={value}
      businessName={businessName}
      images={images}
      held={held}
      stampPicture={stampPicture.url}
      pictureMissing={stampPicture.inUse && !stampPicture.url}
      unsaved={unsaved}
      sample={shownSample}
      landed={landed}
      wallet={wallet}
      onWallet={setWallet}
      onPart={onPart}
    />
  );

  if (wide) {
    const tab = tray ?? "colours";
    return (
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex min-w-0 flex-col gap-5">
          {notices}
          <Tabs value={tab} onChange={onTray}>
            {/* Wrapping rather than scrolling, so no tray hides past the column's edge. */}
            <TabList label={t("studio.title")} className="flex-wrap overflow-visible">
              {trays.map(({ id, label }) => (
                <Tab key={id} value={id}>
                  {label}
                </Tab>
              ))}
            </TabList>
            {trays.map(({ id }) => (
              <TabPanel key={id} value={id} className="rounded-panel border border-border bg-surface p-5 shadow-panel">
                {body(id)}
              </TabPanel>
            ))}
          </Tabs>
        </div>
        <aside className="flex flex-col gap-4 lg:sticky lg:top-8">
          {stageView}
          {sampleRow}
          {barDrawn && (
            <div className={cn("rounded-panel border border-border bg-surface p-4 shadow-panel", light)}>{studioBar}</div>
          )}
          {rewardRow}
          {foot}
        </aside>
      </div>
    );
  }

  const chipTrays = trays.filter(({ id }) => id !== "reward");
  return (
    <div className="flex flex-col gap-4">
      {stageView}
      {sampleRow}
      {notices}
      {rewardRow}
      <div role="group" aria-label={t("studio.chips.label")} className="flex touch-manipulation flex-wrap gap-2">
        {chipTrays.map(({ id, label }) => (
          <Button
            key={id}
            ref={(element) => {
              if (element) chips.current.set(id, element);
              else chips.current.delete(id);
            }}
            variant={tray === id ? "ink" : "secondary"}
            aria-expanded={tray === id}
            onClick={() => (tray === id ? close() : open(id))}
          >
            {label}
          </Button>
        ))}
      </div>
      {foot}

      <StudioTray
        open={!!tray}
        title={labelOf(tray ?? shownTray)}
        trayKey={tray ?? shownTray ?? ""}
        onClose={close}
        onHeight={setTrayHeight}
        foot={barDrawn ? <div className={light}>{studioBar}</div> : undefined}
      >
        {body(tray ?? shownTray)}
      </StudioTray>

      {!tray && barDrawn && (
        <>
          {/* Above the phone bar; its foot runs under the Scan circle that
              stands out of it. From 768px there is no phone bar. */}
          <div
            className={cn(
              "fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-20 border-t border-border bg-surface px-4 pb-7 pt-3 md:bottom-0 md:pb-[max(0.75rem,env(safe-area-inset-bottom))]",
              light,
            )}
          >
            <div className="mx-auto max-w-2xl">{studioBar}</div>
          </div>
          <div aria-hidden className="h-36" />
        </>
      )}
      {/* Room under the page, so any part of the card can scroll above the tray. */}
      {tray && <div aria-hidden style={{ height: trayHeight }} />}
    </div>
  );
}
