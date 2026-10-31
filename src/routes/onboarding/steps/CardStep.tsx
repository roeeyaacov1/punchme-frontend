import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Gift, Pencil } from "lucide-react";
import { StudioTray } from "../../../components/card-studio/StudioTray";
import { rewardForRow } from "../../../components/card-studio/studioDraft";
import { Button, focusRingInset, Tab, TabList, TabPanel, Tabs, useReducedMotion } from "../../../components/kit";
import { noTapFlash } from "../../../components/kit/classes";
import { StepHeading, StepShell } from "../../../components/onboarding/StepShell";
import { useWide } from "../../../components/onboarding/useWide";
import { cn } from "../../../lib/cn";
import { CardStage, type StageHandle } from "../CardStage";
import { buildTemplateInput, draftPreviewValue, MAP_PARTS, resolveDraft, sampleStamps, type MapPart } from "../draft";
import { defaultRewards, withTradeLook } from "../looks";
import { useStorageFull } from "../storageCheck";
import { StorageNotice } from "../StorageNotice";
import { useOnboardingDraft } from "../useOnboardingDraft";
import { businessMissing, partAtAddress } from "../walk";
import { BusinessPanel } from "./card/BusinessPanel";
import { ColoursPanel } from "./card/ColoursPanel";
import { RewardPanel } from "./card/RewardPanel";
import { StampPanel } from "./card/StampPanel";

type Tray = MapPart;

/** From 1024px the parts are tabs, in the walk's order. */
const TABS: readonly Tray[] = MAP_PARTS;
/** On a phone the reward sentence opens the reward, so the chips are the other three. */
const CHIPS: Tray[] = ["business", "colours", "stamp"];

/** The trays' addresses: the business at `/business`, the colours at `/color`
 * (and `/accent`, opened at the stamp colour), the stamp at `/stamp`. The
 * reward has no route of its own: it is the map's, at `/reward`. */
const ROUTE: Record<Tray, string> = {
  business: "/onboarding/business",
  colours: "/onboarding/color",
  stamp: "/onboarding/stamp",
  reward: "/onboarding/reward",
};

/** Each part by name: the business by its stop's, the rest by the studio's chips. */
const PART_NAME: Record<Tray, string> = {
  business: "onboarding.steps.business",
  colours: "studio.chips.colours",
  stamp: "studio.chips.stamp",
  reward: "studio.chips.reward",
};

/** What a look writes: a patch with any of these finishes the card. */
const LOOK_KEYS = ["background", "accent", "stamp", "pattern", "stampsRequired"] as const;

/** What a tray's history entry carries: opened from the map (so closing goes
 * back), and on `/reward`, that the reward tray is the one open. */
interface TrayState {
  fromCard?: boolean;
  tray?: "reward";
}

function trayAt(last: string | undefined, state: TrayState | null): Tray | null {
  return partAtAddress(last) ?? (state?.tray === "reward" ? "reward" : null);
}

/**
 * The map: the first stop, at `/onboarding/reward` and the addresses of its
 * trays. The card at full size with the reward said as a sentence under it,
 * chips for the other parts, and one coral "Save the card".
 *
 * Its parts are the business (the name, with Places, and the trade), the
 * colours, the stamp and the reward. On a phone each opens in a tray over the
 * lower half (Card Studio's own `StudioTray`), so every choice lands on the
 * card in view above it. Opening one pushes its address and closing goes
 * back, so the phone's back gesture closes a tray and closing never stacks
 * history; arriving at a tray's address (a first visit, a reload, the forward
 * guard) opens the card with that tray open. From 1024px the parts are tabs
 * beside the card, the open tab its address.
 *
 * The business can't be left unfinished, by any way out: it says what's
 * missing, there, and stays. While it is on screen the card wears the
 * trade's look the moment one is picked, and leaving it writes the name and
 * that look into the draft, once.
 *
 * The screen stays mounted across its five addresses: the router gives all
 * five the same component, so a tray opens over the card as it stands.
 */
export function CardStep() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const wide = useWide();
  const reduced = useReducedMotion();
  const { draft, resolved, update, artUrl, artPersisted, presets } = useOnboardingDraft();
  const storageFull = useStorageFull(draft, artPersisted);
  const lang = i18n.resolvedLanguage ?? "en";
  const stage = useRef<StageHandle>(null);
  const openers = useRef(new Map<Tray, HTMLButtonElement>());
  const nameField = useRef<HTMLInputElement>(null);
  const tradeBox = useRef<HTMLDivElement>(null);
  const rewardField = useRef<HTMLTextAreaElement>(null);
  const stampColour = useRef<HTMLDivElement>(null);
  const lostMessage = useRef<HTMLParagraphElement>(null);
  const [asked, setAsked] = useState(false);
  // A business with a look but no name was emptied after it was finished
  // (and then Back, or a reload): it says so at once.
  const [emptied] = useState(() => !!businessMissing(draft) && draft.background !== null);
  const [businessAsked, setBusinessAsked] = useState(emptied);
  const [trayHeight, setTrayHeight] = useState(0);
  // Counted up when something asks for the reward field: it takes focus as
  // soon as its tray or tab is there to hold it.
  const [rewardWanted, setRewardWanted] = useState(0);
  // A reward still saying a trade's default follows a change of trade.
  const defaults = useMemo(() => defaultRewards(t), [t]);

  const state = location.state as TrayState | null;
  const last = location.pathname.replace(/\/+$/, "").split("/").pop();
  const atAccent = last === "accent";
  const tray = trayAt(last, state);
  /** The part on screen: the open tray on a phone, the shown tab from 1024px. */
  const showing: Tray | null = wide ? (tray ?? "reward") : tray;
  // A picture the card says it has but this device doesn't: the forward
  // guard holds the owner at the stamp until another is chosen.
  const lost = resolved.stamp.kind !== "glyph" && !artUrl;
  // What the tray shows while it leaves, so its words don't go first.
  const [shownTray, setShownTray] = useState<Tray | null>(tray);
  useEffect(() => {
    if (tray) setShownTray(tray);
  }, [tray]);

  // While the business is on screen the card wears what leaving it will
  // write: the trade's look, the moment one is picked. Everywhere else the
  // draft has it already.
  const onBusiness = showing === "business";
  const card = useMemo(
    () =>
      onBusiness && draft.niche
        ? resolveDraft({ ...draft, ...withTradeLook(draft, presets, defaults) }, presets, t)
        : resolved,
    [onBusiness, draft, presets, defaults, t, resolved],
  );
  const businessPreview = useMemo(
    () =>
      onBusiness ? draftPreviewValue(card, lang, t, artUrl, buildTemplateInput(card, presets, lang, t).name) : undefined,
    [onBusiness, card, lang, t, artUrl, presets],
  );

  // A draft that reaches the map with its business but not its look (a
  // business left before the map wrote it, or a draft from the old wizard)
  // is finished here, once, as leaving the business would have finished it.
  // Never one whose business isn't: the look is the trade's.
  const finished = useRef(false);
  useEffect(() => {
    if (finished.current) return;
    finished.current = true;
    if (businessMissing(draft)) return;
    const patch = withTradeLook(draft, presets, defaults);
    if (LOOK_KEYS.some((key) => key in patch)) update(patch);
    // Once, as the screen first stands.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Back on an emptied business, the field that's missing has focus, after
  // the heading's own.
  useEffect(() => {
    if (emptied && tray === "business") nameField.current?.focus({ preventScroll: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!rewardWanted || !rewardField.current) return;
    rewardField.current.focus();
    setRewardWanted(0);
  }, [rewardWanted, tray]);

  /** The picture that went is said where it is chosen again, and read out. */
  const sayLost = useCallback(() => lostMessage.current?.focus(), []);

  /** The business can't be left without its name and its trade: what's
   * missing is said where it is, and takes focus. */
  const holdBusiness = useCallback((): boolean => {
    const missing = businessMissing(draft);
    if (!missing) return false;
    setBusinessAsked(true);
    if (missing === "name") nameField.current?.focus();
    else tradeBox.current?.querySelector<HTMLInputElement>("input")?.focus();
    return true;
  }, [draft]);

  /** The name, and the trade's look in what the owner hasn't chosen
   * (`withTradeLook`), written as the business is left. Nothing when it is
   * written already. */
  const writeBusiness = useCallback(() => {
    const patch = withTradeLook(draft, presets, defaults);
    const name = draft.name.trim();
    if (name !== draft.name) patch.name = name;
    if (Object.keys(patch).length) update(patch);
  }, [draft, presets, defaults, update]);

  /** Leaving the part on screen: false while the business holds. */
  const leave = useCallback((): boolean => {
    if (showing !== "business") return true;
    if (holdBusiness()) return false;
    writeBusiness();
    return true;
  }, [showing, holdBusiness, writeBusiness]);

  // The phone's back gesture leaves the business without asking: it is
  // written then. (Unfinished, the forward guard brings the owner back.)
  const wasShowing = useRef(showing);
  useEffect(() => {
    const was = wasShowing.current;
    wasShowing.current = showing;
    if (was === "business" && showing !== "business" && !businessMissing(draft)) writeBusiness();
    // Only as the part on screen changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showing]);

  const open = useCallback(
    (next: Tray) => {
      // A lost picture keeps the owner at the stamp.
      const target = lost && next !== "stamp" ? "stamp" : next;
      if (target === tray) {
        if (lost) sayLost();
        return;
      }
      if (!leave()) return;
      // From the map it is a new entry; from another tray it takes that
      // one's place, so Back still lands on the map.
      const replace = tray !== null;
      navigate(ROUTE[target], {
        replace,
        state: { fromCard: replace ? state?.fromCard === true : true, ...(target === "reward" ? { tray: "reward" } : {}) },
      });
    },
    [tray, state, lost, sayLost, leave, navigate],
  );

  const close = useCallback(() => {
    if (!tray) return;
    // The stamp tray holds while its picture is lost: the card can't go on
    // without a stamp, and the guard would only open it again.
    if (lost && tray === "stamp") {
      sayLost();
      return;
    }
    if (!leave()) return;
    if (state?.fromCard) navigate(-1);
    else navigate(ROUTE.reward, { replace: true });
  }, [tray, state, lost, sayLost, leave, navigate]);

  // However a tray closes (its button, Escape, a drag, the phone's back
  // gesture), focus goes back to what opened it, unless it is already
  // somewhere else on the page.
  const wasTray = useRef(tray);
  useEffect(() => {
    const was = wasTray.current;
    wasTray.current = tray;
    if (!was || tray) return;
    const active = document.activeElement;
    if (!active || active === document.body || active.closest("section[aria-labelledby]")) {
      openers.current.get(was)?.focus();
    }
  }, [tray]);

  /** A tab from 1024px: its address in place of the last, never a new entry. */
  const showTab = useCallback(
    (next: Tray) => {
      const target = lost && next !== "stamp" ? "stamp" : next;
      if (target === showing) {
        if (lost) sayLost();
        return;
      }
      if (!leave()) return;
      navigate(ROUTE[target], { replace: true });
    },
    [showing, lost, sayLost, leave, navigate],
  );

  // Bring what the tray changes into view above it as it opens, and as it
  // grows: the name for the business, the stamps for the rest (they sit at
  // the foot of Google's card, under its barcode).
  useEffect(() => {
    if (wide || !tray || !trayHeight) return;
    const rect = stage.current?.rect(tray === "business" ? "business" : "stamp");
    if (!rect) return;
    const edge = window.innerHeight - trayHeight - 8;
    let delta = Math.max(0, rect.bottom - edge);
    if (rect.top - delta < 8) delta = rect.top - 8;
    // "instant", not "auto": a page that sets smooth scrolling would glide.
    if (Math.abs(delta) > 1) window.scrollBy({ top: delta, behavior: reduced ? "instant" : "smooth" });
  }, [wide, tray, trayHeight, reduced]);

  // `/onboarding/accent` opens the colours at the stamp colour.
  useEffect(() => {
    const section = stampColour.current;
    if (!atAccent || !section) return;
    if (wide) {
      // After the frame's own scroll to the top of a new stop.
      const id = window.setTimeout(() => section.scrollIntoView({ block: "start", behavior: "instant" }), 0);
      return () => window.clearTimeout(id);
    }
    const box = section.closest<HTMLElement>(".overflow-y-auto");
    if (box) box.scrollTop = section.offsetTop - 8;
  }, [atAccent, wide, trayHeight]);

  const save = useCallback(() => {
    if (!leave()) return;
    // A picture this device no longer has is chosen again where it lives.
    if (lost) {
      if (wide) showTab("stamp");
      else open("stamp");
      sayLost();
      return;
    }
    const reward = card.reward.trim();
    if (!reward) {
      setAsked(true);
      setRewardWanted((count) => count + 1);
      if (wide) showTab("reward");
      else open("reward");
      return;
    }
    // Written down as the owner sees it, so what they saw is what is kept.
    update({
      background: card.background,
      accent: card.accent,
      stamp: card.stamp,
      pattern: card.pattern,
      stampsRequired: card.stampsRequired,
      reward,
    });
    navigate("/onboarding/account");
  }, [card, lost, wide, leave, showTab, open, sayLost, update, navigate]);

  /** Enter in the business's name, and its tray's button: on, out of it. */
  const goOn = useCallback(() => (wide ? showTab("reward") : close()), [wide, showTab, close]);

  const opener = (id: Tray) => (element: HTMLButtonElement | null) => {
    if (element) openers.current.set(id, element);
    else openers.current.delete(id);
  };

  const panel = (id: Tray | null): ReactNode => {
    if (id === "business")
      return <BusinessPanel asked={businessAsked} nameRef={nameField} tradeRef={tradeBox} onEnter={goOn} />;
    if (id === "reward") return <RewardPanel ref={rewardField} asked={asked} onSave={save} />;
    if (id === "colours") return <ColoursPanel ref={stampColour} />;
    if (id === "stamp") return <StampPanel storageFull={storageFull} lostRef={lostMessage} />;
    return null;
  };

  const arrow = <ArrowRight aria-hidden className="rtl:-scale-x-100" />;
  const saveButton = (
    <Button size="lg" onClick={save} iconEnd={arrow} className="w-full">
      {t("onboarding.card.save")}
    </Button>
  );
  const continueButton = (
    <Button size="lg" onClick={goOn} iconEnd={arrow} className="w-full">
      {t("onboarding.continue")}
    </Button>
  );

  const under = (
    <>
      <p className="type-body text-center text-ink-muted">
        {t("studio.sample", { count: sampleStamps(card.stampsRequired), total: card.stampsRequired })}
      </p>
      {/* The screen's question: is this what you give? */}
      <button
        ref={opener("reward")}
        type="button"
        aria-expanded={wide ? undefined : tray === "reward"}
        onClick={() => {
          if (!wide) {
            if (tray === "reward") close();
            else open("reward");
            return;
          }
          setRewardWanted((count) => count + 1);
          showTab("reward");
        }}
        className={cn(
          "flex min-h-14 w-full items-center gap-3 rounded-panel border border-border bg-surface px-4 py-3 text-start shadow-panel",
          "touch-manipulation select-none transition-colors duration-gentle ease-out active:bg-ink/[0.06] hover-fine:bg-ink/5",
          noTapFlash,
          focusRingInset,
        )}
      >
        <Gift aria-hidden className="size-5 shrink-0 text-ink" />
        <span className="type-body min-w-0 flex-1 text-ink">
          <Trans
            i18nKey="studio.rewardSentence"
            count={card.stampsRequired}
            values={{ reward: rewardForRow(card.reward) || t("studio.noReward") }}
            components={{ b: <bdi className="font-semibold" /> }}
          />
        </span>
        <Pencil aria-hidden className="size-5 shrink-0 text-ink-muted" />
        <span className="sr-only">{t("studio.editReward")}</span>
      </button>
    </>
  );

  const trayPart = tray ?? shownTray;

  return (
    <>
      <StepShell
        heading={
          // A tray the map opens by itself takes focus to its own heading.
          <StepHeading title={t("onboarding.map.title")} lead={t("onboarding.map.lead")} autoFocus={wide || !tray} />
        }
        notice={<StorageNotice full={storageFull} />}
        card={
          <CardStage
            ref={stage}
            preview={businessPreview}
            onPart={(part) => (wide ? showTab(part) : open(part))}
            lit={showing}
          />
        }
        under={under}
        action={wide || !tray ? saveButton : undefined}
      >
        {wide ? (
          <Tabs value={showing ?? "reward"} onChange={(next) => showTab(next as Tray)}>
            <TabList label={t("onboarding.steps.reward")}>
              {TABS.map((id) => (
                <Tab key={id} value={id}>
                  {t(PART_NAME[id])}
                </Tab>
              ))}
            </TabList>
            {TABS.map((id) => (
              <TabPanel key={id} value={id} className="rounded-panel border border-border bg-surface p-5 shadow-panel">
                {panel(id)}
              </TabPanel>
            ))}
          </Tabs>
        ) : (
          <div role="group" aria-label={t("studio.chips.label")} className="flex touch-manipulation flex-wrap gap-2">
            {CHIPS.map((id) => (
              <Button
                key={id}
                ref={opener(id)}
                variant={tray === id ? "ink" : "secondary"}
                aria-expanded={tray === id}
                onClick={() => (tray === id ? close() : open(id))}
              >
                {t(PART_NAME[id])}
              </Button>
            ))}
          </div>
        )}
      </StepShell>

      {!wide && (
        <>
          <StudioTray
            open={!!tray}
            title={t(PART_NAME[trayPart ?? "reward"])}
            trayKey={trayPart ?? ""}
            onClose={close}
            onHeight={setTrayHeight}
            foot={trayPart === "business" ? continueButton : saveButton}
            start={tray === "reward" && asked ? rewardField : tray === "colours" && atAccent ? stampColour : undefined}
          >
            {panel(trayPart)}
          </StudioTray>
          {/* Room under the page, so the card can scroll above the tray. */}
          {tray && <div aria-hidden style={{ height: trayHeight }} />}
        </>
      )}
    </>
  );
}
