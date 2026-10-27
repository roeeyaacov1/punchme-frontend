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
import { Info } from "lucide-react";
import { cn } from "../../lib/cn";
import { SegmentedControl } from "../kit/SegmentedControl";
import { WallpaperStage } from "../kit/WallpaperStage";
import { AppleCardPreview, GoogleCardPreview, type CardPreviewValue } from "./CardPreviews";
import { stampColourOf, type CardStudioImages, type CardStudioValue, type HeldPictures } from "./studioDraft";

export type Wallet = "apple" | "google";

/** The three places on the card that open what they show. */
export type CardPart = "stamps" | "names" | "logo";

export interface StageHandle {
  /** Where a part of the card is on screen now, to bring it into view. */
  rect: (part: CardPart) => DOMRect | null;
}

/**
 * Which pictures have loaded. A published picture is handed to the pass only
 * once it has, so one still on its way (or failing, as the local fake
 * wallet's always do) leaves the stand-in in its place rather than a broken
 * image: staging, not redrawing.
 */
function useLoaded(urls: readonly string[]): Set<string> {
  const [loaded, setLoaded] = useState<Set<string>>(() => new Set());
  const key = urls.join("\n");
  useEffect(() => {
    let live = true;
    for (const url of key ? key.split("\n") : []) {
      const image = new Image();
      image.onload = () => {
        if (live) setLoaded((current) => (current.has(url) ? current : new Set(current).add(url)));
      };
      image.src = url;
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
    wallet: Wallet;
    onWallet: (wallet: Wallet) => void;
    onPart: (part: CardPart) => void;
    /** Under the stage: the owner's own pass, to add to their wallet. */
    foot?: ReactNode;
  }
>(function StudioStage(
  { value, businessName, images, held, stampPicture, pictureMissing, unsaved, sample, wallet, onWallet, onPart, foot },
  ref,
) {
  const { t } = useTranslation();
  const slot = useRef<HTMLDivElement>(null);
  const [boxes, setBoxes] = useState<Partial<Record<CardPart, Box>>>({});
  const [lit, setLit] = useState<CardPart | null>(null);

  const states = wallet === "apple" ? images.strip_states : images.hero_states;
  const published = useMemo(
    () => [images.apple_logo, images.logo, ...Object.values(states ?? {})].filter((url): url is string => !!url),
    [images.apple_logo, images.logo, states],
  );
  const loaded = useLoaded(published);
  const shown = (url: string | undefined) => (url && loaded.has(url) ? url : undefined);
  const stripStates = onlyLoaded(images.strip_states, loaded);
  const heroStates = onlyLoaded(images.hero_states, loaded);
  const publishedShowing = !unsaved && !!(wallet === "apple" ? stripStates : heroStates)?.[String(sample)];

  const preview: CardPreviewValue = {
    businessName,
    cardName: value.name,
    stampsRequired: value.stamps_required,
    currentStamps: sample,
    rewardDescription: value.reward_description,
    backgroundColor: value.background_color,
    foregroundColor: value.foreground_color,
    labelColor: value.label_color,
    design: value.design,
    logoUrl: held.logo ?? shown(images.logo),
    appleLogoUrl: held.logo ?? shown(images.apple_logo),
    stampArtUrl: stampPicture ?? images.stamp_art,
    stampedArtUrl: held.stamped_art ?? images.stamped_art,
    unstampedArtUrl: held.unstamped_art ?? images.unstamped_art,
    stripBaseUrl: held.strip_base ?? images.strip_base,
    stripStates,
    heroStates,
    unsaved,
    holderName: t("studio.sampleName"),
  };
  const Preview = wallet === "apple" ? AppleCardPreview : GoogleCardPreview;

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

  const summary = t("studio.stageSummary", {
    name: value.name,
    count: sample,
    total: value.stamps_required,
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
          cardColor={value.background_color}
          stampColor={stampColourOf(value)}
          foregroundColor={value.foreground_color}
          summary={summary}
        >
          <div ref={slot} className="relative">
            <Preview {...preview} />
            {(Object.keys(boxes) as CardPart[]).map((part) => {
              const box = boxes[part]!;
              return (
                <button
                  key={part}
                  type="button"
                  tabIndex={-1}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    setLit(part);
                    onPart(part);
                  }}
                  className={cn(
                    "absolute cursor-pointer touch-manipulation rounded-[18px] outline-offset-[-2px] [-webkit-tap-highlight-color:transparent]",
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
      {foot}
    </div>
  );
});
