import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useTranslation } from "react-i18next";
import { CreditCard, Info } from "lucide-react";
import { cn } from "../../lib/cn";
import { Button } from "../kit/Button";
import { useReducedMotion } from "../kit/motion";
import { Notice } from "../kit/Notice";
import { SegmentedControl } from "../kit/SegmentedControl";
import { WallpaperStage } from "../kit/WallpaperStage";
import { AppleCardPreview, GoogleCardPreview, type CardPreviewValue } from "./CardPreviews";
import {
  designOptions,
  drawKey,
  heldArt,
  isStyled,
  stageOnFailure,
  stagePictures,
  stageShown,
  type DrawnCard,
  type SavedPicture,
  type StageShown,
} from "./designOptions";
import { stampColourOf, type CardStudioImages, type CardStudioValue, type HeldPictures } from "./studioDraft";

export type Wallet = "apple" | "google";

/** The three places on the card that open what they show. */
export type CardPart = "stamps" | "names" | "logo";

export interface StageHandle {
  /** Where a part of the card is on screen now, to bring it into view. */
  rect: (part: CardPart) => DOMRect | null;
}

/**
 * Which pictures have loaded and decoded. A published picture is handed to
 * the pass only once it has, so one still on its way (or failing, as the
 * local fake wallet's always do) leaves the stand-in in its place rather
 * than a broken image: staging, not redrawing.
 */
function useLoaded(urls: readonly string[]): Set<string> {
  const [loaded, setLoaded] = useState<Set<string>>(() => new Set());
  const key = urls.join("\n");
  useEffect(() => {
    let live = true;
    for (const url of key ? key.split("\n") : []) {
      const image = new Image();
      const done = () => {
        if (live) setLoaded((current) => (current.has(url) ? current : new Set(current).add(url)));
      };
      image.src = url;
      // Decoded, not only loaded, so the pass paints it the frame it gets it.
      if (typeof image.decode === "function") image.decode().then(done, () => {});
      else image.onload = done;
    }
    return () => {
      live = false;
    };
  }, [key]);
  return loaded;
}

function onlyLoaded(states: Record<string, string> | undefined, loaded: Set<string>) {
  if (!states) return undefined;
  return Object.fromEntries(Object.entries(states).filter(([, url]) => loaded.has(url)));
}

type Box = { top: number; left: number; width: number; height: number };

const NO_PICTURES: readonly (DrawnCard | null)[] = [];

/** The pass's own rows, by wallet: its children, in the order the frozen
 * previews draw them. Read, never changed. */
const ROWS: Record<Wallet, Record<CardPart, [number, number]>> = {
  // Logo row, strip, fields, barcode.
  apple: { logo: [0, 0], stamps: [1, 1], names: [2, 2] },
  // Title bar, rule, program name, fields, barcode, hero.
  google: { logo: [0, 0], names: [2, 3], stamps: [5, 5] },
};

function boxOf(card: Element, from: number, to: number, origin: DOMRect): Box | null {
  const first = card.children[from]?.getBoundingClientRect();
  const last = card.children[to]?.getBoundingClientRect();
  if (!first || !last) return null;
  return { top: first.top - origin.top, left: 0, width: origin.width, height: last.bottom - first.top };
}

/** The stand-in's stamp at a count, in the frozen grid's own order: none
 * while the published picture stands in the grid's place. */
function stampAt(frame: HTMLElement | null, wallet: Wallet, count: number): HTMLElement | null {
  const strip = frame?.firstElementChild?.children[ROWS[wallet].stamps[0]];
  if (!(strip instanceof HTMLDivElement) || count < 1) return null;
  return strip.querySelectorAll<HTMLElement>(":scope > div > span")[count - 1] ?? null;
}

/**
 * The card on its own wallpaper: the kit's `WallpaperStage`, a nested day
 * scope that keeps its light at night, with the pass in its 300px slot,
 * untouched. Over it, three places open what they show; they are pointer
 * shortcuts like the stamp strip's dots, hidden from screen readers and out
 * of the Tab order, because the chips are the controls.
 */
export const StudioStage = forwardRef<
  StageHandle,
  {
    value: CardStudioValue;
    businessName: string;
    images: CardStudioImages;
    held: HeldPictures;
    /** The stamp picture this device can draw, if any. */
    stampPicture: string | null;
    /** The card's stamp is a picture this device can't draw. */
    pictureMissing: boolean;
    unsaved: boolean;
    sample: number;
    /** Goes up each time a hand adds a stamp to the sample: that stamp lands. */
    landed: number;
    wallet: Wallet;
    onWallet: (wallet: Wallet) => void;
    onPart: (part: CardPart) => void;
    /** A save is running: the card's places open nothing meanwhile. */
    busy?: boolean;
    /** Under the stage: the owner's own pass, to add to their wallet. */
    foot?: ReactNode;
    /** The server's pictures of a card it draws itself (`isStyled`): its
     * latest of the draft, then the design read's. */
    pictures?: readonly (DrawnCard | null)[];
    /** The card has a logo of the owner's own, held or saved. */
    hasLogo?: boolean;
    /** The card as saved: what the stage shows when a drawing of the draft
     * fails, since it is what customers have. */
    saved?: CardStudioValue;
    /** The saved card's own picture, out of the design read. */
    savedPicture?: SavedPicture | null;
    /** Ask for the failed drawing again. */
    onRedraw?: () => void;
    /** Told whether the stage shows the saved card for a drawing that failed. */
    onFailed?: (failed: boolean) => void;
    /** The wallet draws none of the options the card has (`studioMode`
     * "off"): every drawing fails, and the page says why, so the stage says
     * only that it shows the saved card. */
    optionsOff?: boolean;
  }
>(function StudioStage(
  {
    value,
    businessName,
    images,
    held,
    stampPicture,
    pictureMissing,
    unsaved,
    sample,
    landed,
    wallet,
    onWallet,
    onPart,
    busy = false,
    foot,
    pictures: serverPictures = NO_PICTURES,
    hasLogo = false,
    saved,
    savedPicture = null,
    onRedraw,
    onFailed,
    optionsOff = false,
  },
  ref,
) {
  const { t } = useTranslation();
  const reduced = useReducedMotion();
  const slot = useRef<HTMLDivElement>(null);
  const [boxes, setBoxes] = useState<Partial<Record<CardPart, Box>>>({});
  const [lit, setLit] = useState<CardPart | null>(null);

  const styled = isStyled(value.design);
  const states = wallet === "apple" ? images.strip_states : images.hero_states;
  // Both wallets' pictures of a drawn card, so switching wallets finds the
  // other one there already.
  const drawnUrls = serverPictures.flatMap((picture) => [picture?.strip, picture?.hero]).join("\n");
  const need = wallet === "apple" ? "strip" : "hero";
  const published = useMemo(
    () =>
      [images.apple_logo, images.logo, ...Object.values(states ?? {}), ...drawnUrls.split("\n")].filter(
        (url): url is string => !!url,
      ),
    [images.apple_logo, images.logo, states, drawnUrls],
  );
  const loaded = useLoaded(published);
  const shown = (url: string | undefined) => (url && loaded.has(url) ? url : undefined);
  // The server's pictures of the card, once they have loaded, as the
  // published ones are: staging, not redrawing. What the stage showed last
  // stays up while a fresh one is drawn.
  const lastShown = useRef<StageShown | null>(null);
  const key = drawKey(value, sample, heldArt(held));
  const pictures = stagePictures({
    styled,
    unsaved,
    sample,
    stripStates: onlyLoaded(images.strip_states, loaded),
    heroStates: onlyLoaded(images.hero_states, loaded),
    pictures: serverPictures,
    key,
    loaded: (url) => loaded.has(url),
    last: lastShown.current,
    need,
  });
  // The server answered for this draft and count, and drew nothing: the
  // stage shows the saved card, which is what customers have (§6.6).
  const drawFailed = styled && pictures.failed && !!saved;
  const onFailure = drawFailed
    ? stageOnFailure({
        saved: saved!,
        savedPicture: savedPicture && shown(savedPicture[need]) ? savedPicture : null,
        sample,
        stripStates: onlyLoaded(images.strip_states, loaded),
        heroStates: onlyLoaded(images.hero_states, loaded),
      })
    : null;
  const { stripStates, heroStates } = onFailure ?? pictures;
  const shownCount = onFailure?.currentStamps ?? sample;
  const shownUnsaved = onFailure ? onFailure.unsaved : pictures.unsaved;
  const publishedShowing = !shownUnsaved && !!(wallet === "apple" ? stripStates : heroStates)?.[String(shownCount)];
  const shownNow = stageShown(lastShown.current, {
    stripStates,
    heroStates,
    count: shownCount,
    unsaved: shownUnsaved,
    waiting: styled && !onFailure,
  });
  useLayoutEffect(() => {
    lastShown.current = shownNow;
  });
  // A drawing on its way: said from 500ms, so a quick one says nothing.
  const drawing = styled && pictures.drawing && !drawFailed;
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    if (!drawing) {
      setSlow(false);
      return;
    }
    const id = window.setTimeout(() => setSlow(true), 500);
    return () => window.clearTimeout(id);
  }, [drawing]);
  useEffect(() => {
    onFailed?.(drawFailed);
  }, [onFailed, drawFailed]);

  // On a failure, the saved card as it is, with the pictures it has: none of
  // the held ones, which haven't reached it.
  const card = onFailure ? saved! : value;
  // The name every pass carries is the card's own where its design sets one
  // (backend PR #20, item 5): Apple writes it in the logo row. Google's
  // issuer line reads it from the design itself, and its program line is
  // "{business} - {card}" with the business's own name, as the backend sends.
  const passName = wallet === "apple" ? card.design.organization_name?.trim() || businessName : businessName;
  // A logo the server drew from the name, not the owner's own, says the name
  // the card was saved with: while the draft names it otherwise, the row
  // prints the new name, as the next save draws it.
  const renamed =
    !hasLogo && (card.design.organization_name?.trim() ?? "") !== (saved?.design.organization_name?.trim() ?? "");
  const preview: CardPreviewValue = {
    businessName: passName,
    cardName: card.name,
    stampsRequired: card.stamps_required,
    currentStamps: shownCount,
    rewardDescription: card.reward_description,
    backgroundColor: card.background_color,
    foregroundColor: card.foreground_color,
    labelColor: card.label_color,
    design: card.design,
    logoUrl: (onFailure ? undefined : held.logo) ?? shown(images.logo),
    appleLogoUrl: (onFailure ? undefined : held.logo) ?? (renamed ? undefined : shown(images.apple_logo)),
    stampArtUrl: (onFailure ? undefined : stampPicture) ?? images.stamp_art,
    stampedArtUrl: (onFailure ? undefined : held.stamped_art) ?? images.stamped_art,
    unstampedArtUrl: (onFailure ? undefined : held.unstamped_art) ?? images.unstamped_art,
    stripBaseUrl: (onFailure ? undefined : held.strip_base) ?? images.strip_base,
    stripStates,
    heroStates,
    unsaved: shownUnsaved,
    holderName: t("studio.sampleName"),
    logoText: hasLogo && designOptions(card.design).logoText,
  };
  const Preview = wallet === "apple" ? AppleCardPreview : GoogleCardPreview;

  // A new drawing of a drawn card, or the saved card standing in for one
  // that failed, crosses over the card that was there: that card stays over
  // the slot as a layer and goes out (`crossfade-out`, or the gentle fade),
  // so the pass itself is never touched. Only the drawing differs, so only
  // the drawing is seen to cross. A swap that changes the card's height (the
  // stand-in grid is shorter than a drawn strip) is left to cut, since two
  // cards out of step would show every row twice. Set before paint, so the
  // new drawing never shows a frame on its own.
  const shownPicture = (wallet === "apple" ? stripStates : heroStates)?.[String(shownCount)];
  const face = `${onFailure ? "saved" : "draft"}:${!shownUnsaved && shownPicture ? shownPicture : "stand-in"}`;
  const [ghost, setGhost] = useState<{ value: CardPreviewValue; wallet: Wallet; n: number } | null>(null);
  const ghostBox = useRef<HTMLDivElement>(null);
  const committed = useRef<{ face: string; wallet: Wallet; styled: boolean; preview: CardPreviewValue } | null>(null);
  useLayoutEffect(() => {
    const before = committed.current;
    if (!before) return;
    // Another wallet is another pass: nothing crosses over to it.
    if (before.wallet !== wallet) {
      setGhost(null);
      return;
    }
    if (before.face === face || !(before.styled || styled)) return;
    setGhost((was) => ({ value: before.preview, wallet, n: (was?.n ?? 0) + 1 }));
  }, [face, wallet, styled]);
  // After the one above, so it reads the card as the last commit left it.
  useLayoutEffect(() => {
    committed.current = { face, wallet, styled, preview };
  });
  // The card going, measured against the one coming in the same layout: a
  // different height goes at once, before it is painted.
  useLayoutEffect(() => {
    const card = slot.current?.firstElementChild;
    const layer = ghostBox.current;
    if (!ghost || !card || !layer) return;
    if (Math.abs(layer.getBoundingClientRect().height - card.getBoundingClientRect().height) > 0.5) setGhost(null);
  }, [ghost]);

  const measure = useCallback(() => {
    const frame = slot.current;
    const card = frame?.firstElementChild;
    if (!frame || !card) return;
    const origin = frame.getBoundingClientRect();
    const next: Partial<Record<CardPart, Box>> = {};
    for (const part of ["logo", "names", "stamps"] as const) {
      const [from, to] = ROWS[wallet][part];
      const box = boxOf(card, from, to, origin);
      if (box) next[part] = box;
    }
    setBoxes(next);
  }, [wallet]);

  useLayoutEffect(() => {
    measure();
    const frame = slot.current;
    const card = frame?.firstElementChild;
    if (!frame || !card || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    observer.observe(card);
    return () => observer.disconnect();
  }, [measure, Preview]);

  useImperativeHandle(
    ref,
    () => ({
      rect: (part) => {
        const frame = slot.current;
        const card = frame?.firstElementChild;
        if (!frame || !card) return null;
        const [from, to] = ROWS[wallet][part];
        const first = card.children[from]?.getBoundingClientRect();
        const last = card.children[to]?.getBoundingClientRect();
        if (!first || !last) return null;
        return new DOMRect(first.left, first.top, first.width, last.bottom - first.top);
      },
    }),
    [wallet],
  );

  useEffect(() => {
    if (!lit) return;
    const id = window.setTimeout(() => setLit(null), 120);
    return () => window.clearTimeout(id);
  }, [lit]);

  // A stamp a hand adds lands on the card: the kit's stamp-land, 340ms on
  // the overshoot, on the stand-in's own stamp, found in the frozen grid and
  // never drawn here; with reduced motion it is there at its size after the
  // 150ms fade. Set before paint, so the stamp never shows a frame early.
  // Each landing runs out on its own, so quick presses ripple rather than cut
  // one another short; only a stamp the sample no longer reaches, or a card
  // drawn afresh, settles at once. The published picture has no stamp to
  // land: it just changes.
  const landing = useRef(new Map<HTMLElement, { count: number; settle: () => void }>());
  const handled = useRef(landed);
  useLayoutEffect(() => {
    for (const [stamp, { count, settle }] of landing.current) {
      if (count > sample || !stamp.isConnected) settle();
    }
    if (landed === handled.current) return;
    handled.current = landed;
    const stamp = stampAt(slot.current, wallet, sample);
    if (!stamp) return;
    const motion = reduced ? "animate-gentle-in" : "animate-stamp-land";
    const settle = () => {
      stamp.removeEventListener("animationend", settle);
      stamp.classList.remove(motion);
      landing.current.delete(stamp);
    };
    stamp.classList.add(motion);
    stamp.addEventListener("animationend", settle);
    landing.current.set(stamp, { count: sample, settle });
  }, [landed, sample, wallet, reduced]);

  const summary = t("studio.stageSummary", {
    name: card.name,
    count: shownCount,
    total: card.stamps_required,
  });

  return (
    <div className="flex flex-col items-center gap-4">
      <SegmentedControl<Wallet>
        label={t("onboarding.preview.wallets")}
        hideLabel
        value={wallet}
        onChange={onWallet}
        options={[
          { value: "apple", label: t("studio.preview.apple") },
          { value: "google", label: t("studio.preview.google") },
        ]}
      />
      {/* The tour lights this box. On a phone narrower than the stage's
          340px it runs to the screen's edges and clips the pass's sides. */}
      <div data-tour="design-studio" className="-mx-4 flex w-[calc(100%+2rem)] justify-center sm:mx-0 sm:w-full">
        <WallpaperStage
          cardColor={card.background_color}
          stampColor={stampColourOf(card)}
          foregroundColor={card.foreground_color}
          summary={summary}
        >
          {/* A finger held on the card selects none of the pass's words and
              raises no picture's callout: the card is the studio's map, not
              text to copy. */}
          <div ref={slot} className="relative select-none [-webkit-touch-callout:none]">
            <Preview {...preview} />
            {ghost?.wallet === wallet && (
              <div
                key={ghost.n}
                ref={ghostBox}
                aria-hidden
                className={cn(
                  "pointer-events-none absolute inset-x-0 top-0",
                  reduced ? "animate-gentle-out" : "animate-crossfade-out",
                )}
                onAnimationEnd={(event) => {
                  if (event.target === event.currentTarget) setGhost(null);
                }}
              >
                <Preview {...ghost.value} />
              </div>
            )}
            {(Object.keys(boxes) as CardPart[]).map((part) => {
              const box = boxes[part]!;
              return (
                <button
                  key={part}
                  type="button"
                  tabIndex={-1}
                  disabled={busy}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    setLit(part);
                    onPart(part);
                  }}
                  className={cn(
                    "absolute cursor-pointer touch-manipulation rounded-[18px] outline-offset-[-2px] [-webkit-tap-highlight-color:transparent] disabled:pointer-events-none",
                    lit === part ? "outline outline-2 outline-ink" : "hover-fine:outline hover-fine:outline-2 hover-fine:outline-ink/40",
                  )}
                  style={{ top: box.top, left: box.left, width: box.width, height: box.height }}
                />
              );
            })}
          </div>
        </WallpaperStage>
      </div>
      {pictureMissing && !publishedShowing && (
        <p className="flex max-w-[340px] items-start gap-1.5 text-sm leading-snug text-ink-muted">
          <Info aria-hidden className="mt-px size-4 shrink-0" />
          <span>{t("studio.picture.notHere")}</span>
        </p>
      )}
      {/* The server draws a styled card. From 500ms of a drawing, a lit tag
          in the caption's shape says so, under the stage and never over the
          pass; when it couldn't, the tag says the stage is the card customers
          have, over a plain panel with the way to try again. Polite, and
          only when its words change, so a drawing is said once however many
          changes it takes in. Its place is kept while the card is drawn by
          the server, so the tag coming and going moves nothing. The tag's
          light comes up in the gentle fade, and with reduced motion it is
          simply there; the panel lights on, or fades in, once a failure. */}
      {styled && (
        <div aria-live="polite" className="flex min-h-7 w-full max-w-[340px] flex-col items-center gap-3">
          {(slow || drawFailed) && (
            <span
              className={cn(
                "theme-lit type-tag inline-flex items-center gap-1.5 rounded-[1.30625rem] border border-border bg-surface/95 px-3 py-1 text-center text-ink-muted",
                !reduced && "animate-gentle-in",
              )}
            >
              {drawFailed && <CreditCard aria-hidden className="size-4 shrink-0" />}
              {drawFailed ? t("studio.drawn.current") : t("studio.drawn.drawing")}
            </span>
          )}
          {drawFailed && !optionsOff && (
            <Notice
              tone="warn"
              arrive
              className="w-full"
              action={
                onRedraw && (
                  <Button variant="secondary" onClick={onRedraw}>
                    {t("studio.drawn.retry")}
                  </Button>
                )
              }
            >
              {t("studio.drawn.failedSaved")}
            </Notice>
          )}
        </div>
      )}
      {foot}
    </div>
  );
});
