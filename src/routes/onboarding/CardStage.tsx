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
import { CircleAlert } from "lucide-react";
import {
  AppleCardPreview,
  GoogleCardPreview,
  type CardPreviewValue,
  type PreviewPlatform,
} from "../../components/card-studio/CardPreviews";
import { SegmentedControl, useReducedMotion, WallpaperStage } from "../../components/kit";
import { useWide } from "../../components/onboarding/useWide";
import { cn } from "../../lib/cn";
import { MAX_STAMPS, type MapPart, type Niche } from "./draft";
import { drawBody } from "./drawing";
import { lookPreview, stillItself } from "./looks";
import { useLookOff } from "./useLookOff";
import { useStageWallet } from "./stageWallet";
import { useLookDrawing } from "./useLookDrawing";
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

/** The cards going at once, at most, as a new drawing crosses over them. */
const GHOSTS = 3;

/** A picture for the unseen copy that keeps the drawn card's height: the
 * pass sizes its strip by its ratio, so any picture holds the room. */
const UNSEEN = { 0: "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" };

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
 * `top` shows the top of the pass in one column: its name and, on Apple's,
 * its stamps, cut where the pass has nothing to say. In two columns
 * (`useWide`), where the card has a column of its own, it is always whole,
 * with the switch over it.
 *
 * On the map the card is the map: its name, its stamps and its count open
 * what they show (`onPart`), and the open part is outlined (`lit`). Both are
 * measured from the pass's own rows and laid over them, never drawn on the
 * pass. The places are pointer shortcuts, like the studio's, hidden from
 * screen readers and out of the Tab order: the chips are the controls. The
 * outline is two rings, surface then ink, so it shows on a dark card and a
 * light one.
 *
 * A card from a look is drawn by the wallet, through the backend (brief
 * §7.4): the strip, or Google's hero, is that drawing, staged as the pass's
 * published picture, and the rows are the frozen preview's own, so the name
 * lands as typed. While the next is drawn the last stays, and from 500ms a
 * tag under the stage says so; the new one crosses over it, as the studio's
 * does. Before the first, a card still the look's own stands as the look's
 * picture, never as circles for a beat. When it can't be drawn, the stage shows the
 * look as itself, in its own colours, and says so; the save goes on, since
 * it sends the draft, not the picture. A stamp that is a picture, which the
 * drawing can't take, stands in the circles, as the stamp's part says.
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
  const { t, i18n } = useTranslation();
  const { draft, preview: drafted, resolved, presets, templateInput } = useOnboardingDraft();
  const [wallet, setWallet] = useStageWallet();
  const reduced = useReducedMotion();
  const wide = useWide();
  const cut = crop === "top" && !wide;
  const slot = useRef<HTMLDivElement>(null);

  // The draft's own card from a look is the wallet's drawing of it. Where
  // the wallet draws none of the options the card has, every drawing would
  // fail: none is asked, and the card shows as its look, as on a failed
  // drawing, with nothing said under it, since the notice over it says why.
  const { off } = useLookOff();
  const body = useMemo(
    () => (given || !draft.look || off ? null : drawBody(resolved, wallet)),
    [given, draft.look, off, resolved, wallet],
  );
  const drawing = useLookDrawing(body);
  const lang = i18n.resolvedLanguage ?? "en";
  // Before the first drawing for this wallet, a card that is still the
  // look's own stands as the look's published picture, the card the looks
  // screen showed, rather than as circles for a beat; the drawing then
  // crosses over it. A card the owner has changed shows the circles in its
  // own colours, which is what it is until drawn.
  const look = useMemo(
    () => (draft.look ? presets?.find((preset) => preset.id === draft.look) : undefined),
    [draft.look, presets],
  );
  const waiting = !!body && (!drawing.picture || drawing.picture.role !== body.role);
  const ownPicture = useMemo(
    () => !!look && waiting && !drawing.failure && stillItself(look, draft, presets, t, wallet),
    [look, waiting, drawing.failure, draft, presets, t, wallet],
  );
  // The logo is the owner's, as the name and the reward are, so the look's
  // picture carries it: it never goes out for a beat while the drawing comes.
  const itself = useMemo(() => {
    const its =
      look && (drawing.failure || off || ownPicture) ? lookPreview(look, draft, presets, lang, t, templateInput.name) : null;
    return (
      its && { ...its, logoUrl: drafted.logoUrl, appleLogoUrl: drafted.appleLogoUrl, logoText: drafted.logoText }
    );
  }, [look, drawing.failure, off, ownPicture, draft, presets, lang, t, templateInput.name, drafted]);
  const preview = useMemo((): CardPreviewValue => {
    if (given) return given;
    if (off) return itself ?? drafted;
    if (!body) return drafted;
    if (drawing.failure) return itself ?? drafted;
    const picture = drawing.picture;
    if (!picture || picture.role !== body.role) return itself ?? drafted;
    const states = { [String(drafted.currentStamps)]: picture.url };
    return { ...drafted, unsaved: false, ...(picture.role === "hero" ? { heroStates: states } : { stripStates: states }) };
  }, [given, off, body, drafted, drawing.failure, drawing.picture, itself]);
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

  // A new drawing, or a look picked on the looks screen, crosses over the
  // card that was there, as in the studio: that card stays over the slot as
  // a layer and goes out (`crossfade-out`, or the gentle fade), so the pass
  // itself is never touched. Only a change of picture crosses; a swap that
  // changes the card's height (the circles against a drawn strip) is left
  // to cut, since two cards out of step would show every row twice. Set
  // before paint, so the new picture never shows a frame on its own.
  //
  // A change that comes while a card is still going adds the card it
  // replaces under the one going, which carries on from where it is. The
  // newest is first, so lowest.
  const picture = (wallet === "apple" ? shown.stripStates : shown.heroStates)?.[String(shown.currentStamps)];
  const face = !shown.unsaved && picture ? picture : "circles";
  const [ghosts, setGhosts] = useState<{ value: CardPreviewValue; wallet: PreviewPlatform; n: number }[]>([]);
  const ghostCount = useRef(0);
  const committed = useRef<{ face: string; wallet: PreviewPlatform; value: CardPreviewValue } | null>(null);
  useLayoutEffect(() => {
    const before = committed.current;
    if (!before) return;
    // Another wallet is another pass: nothing crosses over to it.
    if (before.wallet !== wallet) {
      setGhosts([]);
      return;
    }
    if (before.face === face) return;
    ghostCount.current += 1;
    const n = ghostCount.current;
    // Three at most: the one let go of is the oldest, all but gone by then.
    setGhosts((was) => [{ value: before.value, wallet, n }, ...was].slice(0, GHOSTS));
  }, [face, wallet]);
  // After the one above, so it reads the card as the last commit left it.
  useLayoutEffect(() => {
    committed.current = { face, wallet, value: shown };
  });
  useLayoutEffect(() => {
    const card = slot.current?.firstElementChild;
    if (!ghosts.length || !card) return;
    const height = card.getBoundingClientRect().height;
    const layers = slot.current!.querySelectorAll<HTMLElement>("[data-ghost]");
    if ([...layers].some((layer) => Math.abs(layer.getBoundingClientRect().height - height) > 0.5)) setGhosts([]);
  }, [ghosts]);

  // A logo the owner has just given the card comes on by light where the
  // pass puts it (`lights-on`, or the gentle fade), found in the frozen
  // pass's first row and never drawn here. Only a new one: not the logo
  // the card opens with, nor the same one on the other wallet. New by the
  // draft's own word, its hash, not by the picture the pass shows: the
  // published card has a picture for each wallet, and one shown again after
  // a beat without it is not one just given.
  const logo = wallet === "apple" ? shown.appleLogoUrl : shown.logoUrl;
  const lastLogo = useRef(draft.logo);
  useLayoutEffect(() => {
    if (!draft.logo) lastLogo.current = undefined;
    if (!logo || !draft.logo || draft.logo === lastLogo.current) return;
    lastLogo.current = draft.logo;
    const image = slot.current?.firstElementChild?.children[0]?.querySelector("img");
    if (!image) return;
    const motion = reduced ? "animate-gentle-in" : "animate-lights-on";
    const settle = () => {
      image.removeEventListener("animationend", settle);
      image.classList.remove(motion);
    };
    image.classList.add(motion);
    image.addEventListener("animationend", settle);
  }, [logo, draft.logo, reduced]);

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
  // A card that is drawn, or can be, keeps room for both its faces: the
  // circles and the drawn strip, which is taller. Going from one to the
  // other (a picture of one's own for a stamp, a classic look picked after
  // a drawn one) then moves nothing under the card. Once drawn, always.
  const [drawable, setDrawable] = useState(false);
  if (!drawable && (!!draft.look || face !== "circles")) setDrawable(true);
  // Their height is all they are for, and that changes only with the wallet.
  const twin = useMemo(
    () => (
      <>
        <div aria-hidden className="invisible">
          <Pass {...shown} stampsRequired={MAX_STAMPS} currentStamps={0} unsaved />
        </div>
        {drawable && (
          <div aria-hidden className="invisible">
            <Pass {...shown} currentStamps={0} unsaved={false} stripStates={UNSEEN} heroStates={UNSEEN} />
          </div>
        )}
      </>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [Pass, drawable],
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
        className={cut ? "hidden" : undefined}
      />
      <div
        className={cn(
          "relative w-[340px] max-w-full",
          // 176px: just under Apple's strip, in the gap before its fields,
          // and just under Google's fields, before its barcode. A phone seen
          // past the edge of the page, not content clipped by accident.
          cut && "h-44 overflow-hidden rounded-t-glass",
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
              {ghosts.map(
                (ghost) =>
                  ghost.wallet === wallet && (
                    <div
                      key={ghost.n}
                      data-ghost
                      aria-hidden
                      className={cn(
                        "pointer-events-none absolute inset-x-0 top-0",
                        reduced ? "animate-gentle-out" : "animate-crossfade-out",
                      )}
                      onAnimationEnd={(event) => {
                        if (event.target === event.currentTarget)
                          setGhosts((was) => was.filter((other) => other.n !== ghost.n));
                      }}
                    >
                      <Pass {...ghost.value} />
                    </div>
                  ),
              )}
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
      {/* Under the stage, never over the pass, as the studio's: a tag while
          a drawing has been on its way 500ms, said once per drawing; the
          reason when there is none. Its place is kept while the card is
          drawn, so the tag coming and going moves nothing. */}
      {body && (
        <div aria-live="polite" className={cn("flex min-h-7 w-full max-w-[340px] flex-col items-center", cut && "hidden")}>
          {drawing.failure ? (
            <p className="flex items-start gap-1.5 text-sm leading-snug text-ink">
              <CircleAlert aria-hidden className="mt-px size-4 shrink-0" />
              <span>{t(drawing.failure === "tooMany" ? "onboarding.look.tooMany" : "onboarding.look.drawFailed")}</span>
            </p>
          ) : (
            drawing.slow && (
              <span
                className={cn(
                  "theme-lit type-tag inline-flex items-center rounded-[1.30625rem] border border-border bg-surface/95 px-3 py-1 text-center text-ink-muted",
                  !reduced && "animate-gentle-in",
                )}
              >
                {t("studio.drawn.drawing")}
              </span>
            )
          )}
        </div>
      )}
    </div>
  );
});
