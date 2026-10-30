import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
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
import { sampleStamps } from "../draft";
import { defaultRewards, withTradeLook } from "../looks";
import { useStorageFull } from "../storageCheck";
import { StorageNotice } from "../StorageNotice";
import { useOnboardingDraft } from "../useOnboardingDraft";
import { ColoursPanel } from "./card/ColoursPanel";
import { RewardPanel } from "./card/RewardPanel";
import { StampPanel } from "./card/StampPanel";

type Tray = "reward" | "colours" | "stamp";

/** From 1024px the trays are tabs, the reward first. */
const TABS: Tray[] = ["reward", "colours", "stamp"];
/** On a phone the reward row opens the reward, so the chips are the other two. */
const CHIPS: Tray[] = ["colours", "stamp"];

/** The trays' addresses: the colours at `/color` (and `/accent`, opened at the
 * stamp colour), the stamp at `/stamp`. The reward has no route of its own:
 * it is the card screen's, at `/reward`. */
const ROUTE: Record<Tray, string> = {
  reward: "/onboarding/reward",
  colours: "/onboarding/color",
  stamp: "/onboarding/stamp",
};

/** What a tray's history entry carries: opened from the card screen (so
 * closing goes back), and on `/reward`, that the reward tray is the one open. */
interface TrayState {
  fromCard?: boolean;
  tray?: "reward";
}

function trayAt(last: string | undefined, state: TrayState | null): Tray | null {
  if (last === "color" || last === "accent") return "colours";
  if (last === "stamp") return "stamp";
  return state?.tray === "reward" ? "reward" : null;
}

/**
 * Your card, ready: the second stop, at `/onboarding/reward`. The finished
 * card at full size with the reward said as a sentence under it, and one
 * coral "Save the card".
 *
 * On a phone, the reward row and two chips open trays over the lower half
 * (Card Studio's own `StudioTray`), so every choice lands on the card in
 * view above them. Opening one pushes its address and closing goes back, so
 * the phone's back gesture closes a tray and closing never stacks history;
 * arriving at a tray's address (a reload, the forward guard) opens the card
 * with that tray open. From 1024px the trays are tabs beside the card, the
 * open tab its address.
 *
 * The screen stays mounted across its four addresses: the router gives all
 * four the same component, so a tray opens over the card as it stands.
 */
export function CardStep() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const wide = useWide();
  const reduced = useReducedMotion();
  const { draft, resolved, update, artUrl, artPersisted, presets } = useOnboardingDraft();
  const storageFull = useStorageFull(draft, artPersisted);
  const stage = useRef<StageHandle>(null);
  const openers = useRef(new Map<Tray, HTMLButtonElement>());
  const rewardField = useRef<HTMLTextAreaElement>(null);
  const stampColour = useRef<HTMLDivElement>(null);
  const lostMessage = useRef<HTMLParagraphElement>(null);
  const [asked, setAsked] = useState(false);
  const [trayHeight, setTrayHeight] = useState(0);
  // Counted up when something asks for the reward field: it takes focus as
  // soon as its tray or tab is there to hold it.
  const [rewardWanted, setRewardWanted] = useState(0);

  const state = location.state as TrayState | null;
  const last = location.pathname.replace(/\/+$/, "").split("/").pop();
  const atAccent = last === "accent";
  const tray = trayAt(last, state);
  // A picture the card says it has but this device doesn't: the forward
  // guard holds the owner at the stamp until another is chosen.
  const lost = resolved.stamp.kind !== "glyph" && !artUrl;
  // What the tray shows while it leaves, so its words don't go first.
  const [shownTray, setShownTray] = useState<Tray | null>(tray);
  useEffect(() => {
    if (tray) setShownTray(tray);
  }, [tray]);

  // A draft that reaches the card without its look (the business left
  // without Continue, or a draft from the old wizard) is finished here, once,
  // as Continue would have finished it. The forward guard sent it to the
  // first empty field's tray, so the finished card is shown instead; closing
  // that tray would only have been sent back.
  const finished = useRef(false);
  useEffect(() => {
    if (finished.current) return;
    finished.current = true;
    const patch = withTradeLook(draft, presets, defaultRewards(t));
    const look = (["background", "accent", "stamp", "pattern", "stampsRequired"] as const).some((key) => key in patch);
    if (!look) return;
    update(patch);
    if (tray && !state?.fromCard && !lost) navigate(ROUTE.reward, { replace: true });
    // Once, as the screen first stands.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!rewardWanted || !rewardField.current) return;
    rewardField.current.focus();
    setRewardWanted(0);
  }, [rewardWanted, tray]);

  /** The picture that went is said where it is chosen again, and read out. */
  const sayLost = useCallback(() => lostMessage.current?.focus(), []);

  const open = useCallback(
    (next: Tray) => {
      if (next === tray) return;
      if (lost && next !== "stamp") {
        sayLost();
        return;
      }
      // From the card it is a new entry; from another tray it takes that
      // one's place, so Back still lands on the card.
      const replace = tray !== null;
      navigate(ROUTE[next], {
        replace,
        state: { fromCard: replace ? state?.fromCard === true : true, ...(next === "reward" ? { tray: "reward" } : {}) },
      });
    },
    [tray, state, lost, sayLost, navigate],
  );

  const close = useCallback(() => {
    if (!tray) return;
    // The stamp tray holds while its picture is lost: the card can't go on
    // without a stamp, and the guard would only open it again.
    if (lost && tray === "stamp") {
      sayLost();
      return;
    }
    if (state?.fromCard) navigate(-1);
    else navigate(ROUTE.reward, { replace: true });
  }, [tray, state, lost, sayLost, navigate]);

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
      if (lost && next !== "stamp") {
        sayLost();
        return;
      }
      navigate(ROUTE[next], { replace: true });
    },
    [lost, sayLost, navigate],
  );

  // Bring the stamps into view above a tray as it opens, and as it grows:
  // they sit at the foot of Google's card, under its barcode.
  useEffect(() => {
    if (wide || !tray || !trayHeight) return;
    const rect = stage.current?.stampsRect();
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
    // A picture this device no longer has is chosen again where it lives.
    if (lost) {
      if (wide) showTab("stamp");
      else open("stamp");
      sayLost();
      return;
    }
    const reward = resolved.reward.trim();
    if (!reward) {
      setAsked(true);
      setRewardWanted((count) => count + 1);
      if (wide) showTab("reward");
      else open("reward");
      return;
    }
    // Written down as the owner sees it, so what they saw is what is kept.
    update({
      background: resolved.background,
      accent: resolved.accent,
      stamp: resolved.stamp,
      pattern: resolved.pattern,
      stampsRequired: resolved.stampsRequired,
      reward,
    });
    navigate("/onboarding/account");
  }, [resolved, lost, wide, showTab, open, sayLost, update, navigate]);

  const opener = (id: Tray) => (element: HTMLButtonElement | null) => {
    if (element) openers.current.set(id, element);
    else openers.current.delete(id);
  };

  const panel = (id: Tray | null): ReactNode => {
    if (id === "reward") return <RewardPanel ref={rewardField} asked={asked} onSave={save} />;
    if (id === "colours") return <ColoursPanel ref={stampColour} />;
    if (id === "stamp") return <StampPanel storageFull={storageFull} lostRef={lostMessage} />;
    return null;
  };

  const saveButton = (
    <Button size="lg" onClick={save} iconEnd={<ArrowRight aria-hidden className="rtl:-scale-x-100" />} className="w-full">
      {t("onboarding.card.save")}
    </Button>
  );

  const under = (
    <>
      <p className="type-body text-center text-ink-muted">
        {t("studio.sample", { count: sampleStamps(resolved.stampsRequired), total: resolved.stampsRequired })}
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
            count={resolved.stampsRequired}
            values={{ reward: rewardForRow(resolved.reward) || t("studio.noReward") }}
            components={{ b: <bdi className="font-semibold" /> }}
          />
        </span>
        <Pencil aria-hidden className="size-5 shrink-0 text-ink-muted" />
        <span className="sr-only">{t("studio.editReward")}</span>
      </button>
    </>
  );

  return (
    <>
      <StepShell
        heading={
          <StepHeading
            title={t("onboarding.card.title")}
            lead={t("onboarding.card.lead")}
            onBack={() => navigate("/onboarding/business")}
          />
        }
        notice={<StorageNotice full={storageFull} />}
        card={<CardStage ref={stage} />}
        under={under}
        action={wide || !tray ? saveButton : undefined}
      >
        {wide ? (
          <Tabs value={tray ?? "reward"} onChange={(next) => showTab(next as Tray)}>
            <TabList label={t("onboarding.steps.reward")}>
              {TABS.map((id) => (
                <Tab key={id} value={id}>
                  {t(`studio.chips.${id}`)}
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
                {t(`studio.chips.${id}`)}
              </Button>
            ))}
          </div>
        )}
      </StepShell>

      {!wide && (
        <>
          <StudioTray
            open={!!tray}
            title={t(`studio.chips.${tray ?? shownTray ?? "reward"}`)}
            trayKey={tray ?? shownTray ?? ""}
            onClose={close}
            onHeight={setTrayHeight}
            foot={saveButton}
            start={tray === "reward" && asked ? rewardField : tray === "colours" && atAccent ? stampColour : undefined}
          >
            {panel(tray ?? shownTray)}
          </StudioTray>
          {/* Room under the page, so the card can scroll above the tray. */}
          {tray && <div aria-hidden style={{ height: trayHeight }} />}
        </>
      )}
    </>
  );
}
