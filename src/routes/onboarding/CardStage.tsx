import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import {
  AppleCardPreview,
  GoogleCardPreview,
  type CardPreviewValue,
  type PreviewPlatform,
} from "../../components/card-studio/CardPreviews";
import { SegmentedControl, useReducedMotion, WallpaperStage } from "../../components/kit";
import { cn } from "../../lib/cn";
import { MAX_STAMPS, type MapPart, type Niche } from "./draft";
import { useStageWallet } from "./stageWallet";
import { useOnboardingDraft } from "./useOnboardingDraft";

const WALLETS: PreviewPlatform[] = ["apple", "google"];

/** The parts the card's own rows open; the colours are the whole pass. */
type Placed = Exclude<MapPart, "colours">;
const PLACED: Placed[] = ["business", "stamp", "reward"];

/** Where each part is on the pass: its own rows, first to last, in the
 * order the frozen previews draw them (as the studio's stage reads them).
 * Apple: the logo row with the name, the strip, the fields with the count.
 * Google: the title bar, the rule and the program name; the hero, under the
 * barcode; the fields. Read, never changed. */
const ROWS: Record<PreviewPlatform, Record<Placed, [number, number]>> = {
  apple: { business: [0, 0], stamp: [1, 1], reward: [2, 2] },
  google: { business: [0, 2], stamp: [5, 5], reward: [3, 3] },
};

type Box = Pick<CSSProperties, "borderRadius"> & { top: number; left: number; width: number; height: number };

/** The name the pass prints before there is one: the trade's own ("מספרה"),
 * and before a trade, or for "other", "Your business". Never "—", and never
 * a business someone made up. */
function nameBeforeOne(niche: Niche | null, t: TFunction): string {
  return niche && niche !== "other" ? t(`onboarding.business.niches.${niche}`) : t("onboarding.preview.yourBusiness");
}

export interface StageHandle {
  /** Where a part's rows are on screen now, to keep them in view above a tray. */
  rect: (part: Placed) => DOMRect | null;
}

/**
 * The owner's card, standing on its own wallpaper (the kit's
 * `WallpaperStage`), the pass in its 300px slot, never redrawn. Above it, the
 * Apple/Google switch, which opens on the phone's own wallet.
 *
 * `top` shows the top of the pass on a phone: its name and, on Apple's, its
 * stamps, cut where the pass has nothing to say. From 1024px, where the card
 * has a column of its own, it is always whole, with the switch over it.
 *
 * On the map the card is the map: its name, its stamps and its count open
 * what they show (`onPart`), and the open part is outlined (`lit`). Both are
 * measured from the pass's own rows and laid over them, never drawn on the
 * pass. The places are pointer shortcuts, like the studio's, hidden from
 * screen readers and out of the Tab order: the chips are the controls. The
 * outline is two rings, surface then ink, so it shows on a dark card and a
 * light one.
 */
export const CardStage = forwardRef<
  StageHandle,
  {
    /** The pass as it stands: the draft's, unless a screen has something
     * truer (the published card, or the look a trade is about to bring). */
    preview?: CardPreviewValue;
    crop?: "top" | "whole";
    /** Said over the pass's corner, such as "Not live yet". */
    tag?: ReactNode;
    /** The pass's rows open their parts. */
    onPart?: (part: Placed) => void;
    /** The part outlined on the pass: its rows, or the whole pass for the colours. */
    lit?: MapPart | null;
    /** Counted up each time the owner picks a stamp or its colour: lands
     * the last punched stamp on the card. */
    land?: number;
    className?: string;
  }
>(function CardStage({ preview: given, crop = "whole", tag, onPart, lit = null, land, className }, ref) {
  const { t } = useTranslation();
  const { draft, preview: drafted } = useOnboardingDraft();
  const [wallet, setWallet] = useStageWallet();
  const reduced = useReducedMotion();
  const slot = useRef<HTMLDivElement>(null);
  const preview = given ?? drafted;
  const [boxes, setBoxes] = useState<Partial<Record<MapPart, Box>>>({});

  const shown = useMemo<CardPreviewValue>(
    () => ({
      ...preview,
      businessName: preview.businessName.trim() ? preview.businessName : nameBeforeOne(draft.niche, t),
      holderName: t("studio.sampleName"),
    }),
    [preview, draft.niche, t],
  );

  useImperativeHandle(
    ref,
    () => ({
      rect: (part) => {
        const pass = slot.current?.firstElementChild;
        const [from, to] = ROWS[wallet][part];
        const first = pass?.children[from]?.getBoundingClientRect();
        const last = pass?.children[to]?.getBoundingClientRect();
        if (!first || !last) return null;
        return new DOMRect(first.left, first.top, first.width, last.bottom - first.top);
      },
    }),
    [wallet],
  );

  const Pass = wallet === "apple" ? AppleCardPreview : GoogleCardPreview;

  // The places and the outline, from where the pass's rows are now. Again
  // as the pass changes size (the count, a long name, the fonts arriving)
  // and with the wallet.
  const mapped = !!onPart || lit !== null;
  const measure = useCallback(() => {
    const frame = slot.current;
    const pass = frame?.firstElementChild;
    if (!frame || !pass) return;
    const origin = frame.getBoundingClientRect();
    const whole = pass.getBoundingClientRect();
    const left = whole.left - origin.left;
    const next: Partial<Record<MapPart, Box>> = {
      colours: {
        top: whole.top - origin.top,
        left,
        width: whole.width,
        height: whole.height,
        borderRadius: getComputedStyle(pass).borderRadius,
      },
    };
    for (const part of PLACED) {
      const [from, to] = ROWS[wallet][part];
      const first = pass.children[from]?.getBoundingClientRect();
      const last = pass.children[to]?.getBoundingClientRect();
      if (first && last) next[part] = { top: first.top - origin.top, left, width: whole.width, height: last.bottom - first.top };
    }
    setBoxes(next);
  }, [wallet]);

  // A stamp or its colour picked lands on the card, as in the studio: the
  // kit's stamp-land, 340ms on the overshoot, on the last punched stamp,
  // found in the frozen grid and never drawn here; with reduced motion it
  // fades in over 150ms. Set before paint, so the stamp never shows a frame
  // early. Each landing runs out on its own: a second pick mid-landing
  // carries on with it rather than starting again.
  const landed = useRef(land);
  const landing = useRef<(() => void) | null>(null);
  useLayoutEffect(() => {
    if (land === landed.current) return;
    landed.current = land;
    landing.current?.();
    const strip = slot.current?.firstElementChild?.children[ROWS[wallet].stamp[0]];
    if (!(strip instanceof HTMLDivElement)) return;
    const stamp = strip.querySelectorAll<HTMLElement>(":scope > div > span")[shown.currentStamps - 1];
    if (!stamp) return;
    const motion = reduced ? "animate-gentle-in" : "animate-stamp-land";
    const settle = () => {
      stamp.removeEventListener("animationend", settle);
      stamp.classList.remove(motion);
      landing.current = null;
    };
    stamp.classList.add(motion);
    stamp.addEventListener("animationend", settle);
    landing.current = settle;
  }, [land, wallet, shown.currentStamps, reduced]);

  useLayoutEffect(() => {
    if (!mapped) return;
    measure();
    const frame = slot.current;
    const pass = frame?.firstElementChild;
    if (!frame || !pass || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    observer.observe(pass);
    return () => observer.disconnect();
  }, [mapped, measure, Pass]);
  // Its height is all it is for, and that changes only with the wallet and
  // whether the pass draws the published strip or the stand-in.
  const published = !!shown.stripStates;
  const twin = useMemo(
    () => (
      <div aria-hidden className="invisible">
        <Pass {...shown} stampsRequired={MAX_STAMPS} currentStamps={0} />
      </div>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [Pass, published],
  );
  const summary = t("onboarding.preview.summary", {
    name: shown.businessName,
    count: shown.stampsRequired,
    reward: shown.rewardDescription,
  });

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <SegmentedControl<PreviewPlatform>
        label={t("onboarding.preview.wallets")}
        hideLabel
        options={WALLETS.map((key) => ({ value: key, label: t(`studio.preview.${key}`) }))}
        value={wallet}
        onChange={setWallet}
        className={crop === "top" ? "max-lg:hidden" : undefined}
      />
      <div
        className={cn(
          "relative w-[340px] max-w-full",
          // 176px: just under Apple's strip, in the gap before its fields,
          // and just under Google's fields, before its barcode. A phone seen
          // past the edge of the page, not content clipped by accident.
          crop === "top" && "max-lg:h-44 max-lg:overflow-hidden max-lg:rounded-t-glass",
        )}
      >
        <WallpaperStage
          cardColor={preview.backgroundColor}
          stampColor={preview.design.stamp?.color ?? preview.labelColor}
          summary={summary}
        >
          {/* The stand-in grows by a row of stamps from 7 up, so the stage
              keeps room for the two-row card: an unseen copy with all twelve
              shares the cell. Dragging the count never moves the card, or
              the control under the finger. One column that can't grow past
              the slot: an `auto` one took a long name's whole width. */}
          <div className="grid grid-cols-1 [&>*]:col-start-1 [&>*]:row-start-1">
            {/* A finger held on the map selects none of the pass's words
                and raises no picture's callout. */}
            <div ref={slot} className={cn("relative", onPart && "select-none [-webkit-touch-callout:none]")}>
              <Pass {...shown} />
              {onPart &&
                PLACED.map((part) => {
                  const box = boxes[part];
                  if (!box) return null;
                  return (
                    <button
                      key={part}
                      type="button"
                      tabIndex={-1}
                      aria-hidden
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => onPart(part)}
                      className={cn(
                        "absolute cursor-pointer touch-manipulation rounded-[18px] outline-offset-[-2px] [-webkit-tap-highlight-color:transparent]",
                        lit !== part && "hover-fine:outline hover-fine:outline-2 hover-fine:outline-ink/40",
                      )}
                      style={box}
                    />
                  );
                })}
              {lit && boxes[lit] && (
                <div
                  aria-hidden
                  className="pointer-events-none absolute rounded-[18px] ring-2 ring-ink ring-offset-2 ring-offset-surface"
                  style={boxes[lit]}
                />
              )}
            </div>
            {twin}
          </div>
        </WallpaperStage>
        {tag && <div className="absolute end-3 top-3">{tag}</div>}
      </div>
    </div>
  );
});
