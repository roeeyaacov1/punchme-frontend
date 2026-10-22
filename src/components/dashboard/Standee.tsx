import {
  createContext,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from "react";
import { useTranslation } from "react-i18next";
import { QRCodeSVG } from "qrcode.react";
import { Lock } from "lucide-react";
import { contrastRatio, normalizeHex } from "../../lib/color";
import { STAMP_GLYPHS } from "../../lib/stampGlyphs";
import { cn } from "../../lib/cn";

/**
 * The paper the owner hands to the room.
 *
 * Four designs, because a barber taping A4 inside a window and a therapist
 * standing a card on a side table are not printing the same object, and the
 * page used to offer one layout at three paper sizes as if they were.
 *
 * Everything here is sized in `cqw` — hundredths of the sheet's own width —
 * so a single component is the chooser's thumbnail, the on-screen preview and
 * the 210mm sheet that comes out of the printer, with no second set of numbers
 * to drift out of step. `--u` is the one dial: a tent panel is the same width
 * and half the height of an A4, so its type is turned down rather than
 * re-authored.
 *
 * The colours are the owner's, taken from their own card template and used the
 * way the pass uses them: ground, ink, and the label colour as the single
 * accent. `plain` is the exception and prints on white — see `paletteFor`.
 */

export type StandeeDesign = "poster" | "counter" | "card" | "plain";

export const STANDEE_DESIGNS: readonly StandeeDesign[] = [
  "poster",
  "counter",
  "card",
  "plain",
] as const;

export type PrintFormat = "a4" | "a5" | "tent";

export const PRINT_FORMATS: readonly PrintFormat[] = ["a4", "a5", "tent"] as const;

/**
 * The language the sign speaks, which the owner picks above the paper. It
 * starts on the card's own language, not the dashboard's: a sign stays on
 * the counter for months and speaks to customers, so a Hebrew dashboard can
 * print an English sign, and a bilingual shop prints one of each.
 */
export type SignLanguage = "he" | "en";

const SheetLanguage = createContext<SignLanguage>("he");

/** Every word on the sheet comes through here, in the sign's language. */
function useSheetT() {
  const lng = useContext(SheetLanguage);
  return useTranslation(undefined, { lng }).t;
}

/**
 * The paper, in millimetres, because that is the unit it is sold in.
 *
 * The tent is A4 *portrait* folded across the middle — two 210×148.5 panels,
 * the upper one upside down so both faces read the right way up once it is
 * standing. It used to be A4 landscape, which folds to a 297mm-wide strip no
 * table wants and, worse, prints wider than the `lg:` breakpoint: the desktop
 * rail was laying itself out down the side of the sheet.
 */
export const SHEET_SPECS: Record<
  PrintFormat,
  { page: string; width: number; height: number; panels: 1 | 2 }
> = {
  a4: { page: "A4 portrait", width: 210, height: 297, panels: 1 },
  a5: { page: "A5 portrait", width: 148, height: 210, panels: 1 },
  tent: { page: "A4 portrait", width: 210, height: 297, panels: 2 },
};

export interface StandeeArt {
  businessName: string;
  reward: string;
  stampsRequired: number;
  /** The template's three colours, as the two wallets render them. */
  background: string;
  foreground: string;
  label: string;
  /** One of the sixteen names in `stampGlyphs`, when the owner picked a glyph. */
  glyph?: string;
  logoUrl?: string;
  enrollUrl: string;
  /**
   * Whether the code is live.
   *
   * Free plan enrols nobody — `FREE_CUSTOMER_CAP` is 0 and the API 403s
   * `upgrade_required` — so before the owner activates there is no code to
   * print, only a design to choose. The sheet draws the slot empty and says
   * so rather than drawing a scannable square that leads to "this business
   * isn't accepting new customers": a dead code in a shop window is worse
   * than no code, because the customer blames the shop.
   */
  active: boolean;
}

/* ── Contrast ──────────────────────────────────────────────────────────
   The card's colours belong to the owner, not to us, so `plain` cannot just
   pick one and hope: a pale mint that reads beautifully as a card ground is
   invisible as ink on white paper. The WCAG maths is `lib/color`'s, the same
   one the Card Studio lints with — only the choosing is local. */

/** The first candidate that clears AA on `ground`, else the strongest one
 * offered. It never returns nothing: a poster with no usable accent still has
 * to print. */
function bestOn(ground: string, candidates: (string | undefined)[]): string {
  const usable = candidates.filter((c): c is string => !!c && !!normalizeHex(c));
  const clean = usable.find((c) => contrastRatio(c, ground) >= 4.5);
  if (clean) return clean;
  return (
    [...usable].sort((x, y) => contrastRatio(y, ground) - contrastRatio(x, ground))[0] ??
    "#111111"
  );
}

export interface StandeePalette {
  ground: string;
  ink: string;
  accent: string;
  /** True when the white QR tile would all but disappear into the ground and
   * needs a hairline to sit on. Measured against the tile, not guessed from a
   * luminance threshold. */
  lightGround: boolean;
}

export function standeePalette(
  design: StandeeDesign,
  art: StandeeArt,
): StandeePalette {
  if (design === "plain") {
    // White paper, and the card's colours borrowed only where they can carry
    // themselves: whichever one is legible on white becomes the accent, and
    // the running text stays near-black.
    const accent = bestOn("#ffffff", [art.label, art.background, art.foreground]);
    return { ground: "#ffffff", ink: "#111111", accent, lightGround: true };
  }
  const ground = art.background || "#ffffff";
  const ink = art.foreground || "#111111";
  return {
    ground,
    ink,
    // The label colour is the pass's accent, but some cards draw it for a
    // small mono field where it dies at poster size — fall back to the ink.
    accent: bestOn(ground, [art.label, ink]),
    lightGround: contrastRatio(ground, "#FFFFFF") < 1.6,
  };
}

/* ── One dial ──────────────────────────────────────────────────────────
   `u(n)` is n hundredths of the sheet's width, turned down for a tent panel.
   Every size on the sheet is a multiple of it and of nothing else, so the
   whole thing scales as one object. */
const u = (n: number) => `calc(var(--u) * ${n})`;

/* ── The fit ───────────────────────────────────────────────────────────
   The business name and the reward are the owner's, of any length, on a
   panel whose height is fixed by the paper. So they carry one more dial,
   `--fit`, which the sheet steps down from 1 until its content fits the
   panel: it never clips. The QR code doesn't take it and never shrinks. The
   dial is a multiplier on `cqw` sizes, so a fit measured on screen holds on
   paper, where everything is the same multiple larger. */
const fit = (n: number) => `calc(var(--u) * ${n} * var(--fit, 1))`;

const FIT_STEP = 0.04;
/** Below two thirds of their size the name and the reward are cramped, and
 * the page says so; the sheet still steps on until it fits. */
export const FIT_FLOOR = 0.66;
const FIT_MIN = 0.3;

/* ── The code's quiet zone ─────────────────────────────────────────────
   ISO/IEC 18004 asks for four modules of white on every side, which the
   code carries itself (`marginSize`), so the room it takes grows with how
   many modules it has and the modules never get smaller. How many depends
   on the URL: qrcode.react takes the smallest version that holds it, in
   byte mode, because a URL's lowercase letters rule out the denser
   alphanumeric mode. These are the bytes versions 1 to 10 hold at level M. */
const QUIET_MODULES = 4;
const BYTES_AT_LEVEL_M = [14, 26, 42, 62, 84, 106, 122, 152, 180, 213];

function modulesFor(text: string): number {
  const bytes = new TextEncoder().encode(text).length;
  const version = BYTES_AT_LEVEL_M.findIndex((max) => bytes <= max) + 1 || BYTES_AT_LEVEL_M.length;
  return 17 + 4 * version;
}

/** A join link is a version 5 code, 37 modules: the room the empty slot holds. */
const SLOT_MODULES = 37;

/* ── Blocks ───────────────────────────────────────────────────────────── */

function Qr({
  art,
  size,
  palette,
}: {
  art: StandeeArt;
  size: number;
  palette: StandeePalette;
}) {
  const t = useSheetT();
  // `size` is the code itself, its modules edge to edge; the quiet zone is
  // laid round it, in the same units.
  const quiet = (size * QUIET_MODULES) / (art.active ? modulesFor(art.enrollUrl) : SLOT_MODULES);
  return (
    // The tile is white and the same size either way — it is the footprint
    // the code will occupy, so activating changes what is in the slot and
    // not where anything sits.
    //
    // Forced LTR only around a real code: a QR is a picture of a URL and has
    // no writing direction. The waiting slot is a sentence and keeps the
    // page's.
    <div
      dir={art.active ? "ltr" : undefined}
      style={{
        backgroundColor: "#ffffff",
        padding: art.active ? 0 : u(quiet),
        borderRadius: u(size * 0.05),
        boxShadow: palette.lightGround ? "0 0 0 1px rgb(0 0 0 / 0.1)" : undefined,
      }}
    >
      {art.active ? (
        <QRCodeSVG
          value={art.enrollUrl}
          // A render resolution, not a printed size: the SVG is scaled by the
          // box below, and the box is what the paper sees.
          size={1024}
          level="M"
          marginSize={QUIET_MODULES}
          style={{ display: "block", width: u(size + 2 * quiet), height: u(size + 2 * quiet) }}
        />
      ) : (
        // An empty slot, drawn as one: a dashed cut-out and the reason. Ink
        // on white rather than the owner's palette — the tile is always
        // white, and this has to stay legible whatever they painted the
        // card. #111 on #fff is 18.9:1; the dashed edge carries no text.
        <span
          className="flex flex-col items-center justify-center text-center font-body font-bold"
          style={{
            width: u(size),
            height: u(size),
            gap: u(size * 0.06),
            padding: u(size * 0.08),
            borderRadius: u(size * 0.03),
            border: `${u(size * 0.012)} dashed rgb(17 17 17 / 0.3)`,
            color: "#111111",
            fontSize: u(size * 0.085),
            lineHeight: 1.25,
          }}
        >
          <Lock
            aria-hidden
            style={{ width: u(size * 0.2), height: u(size * 0.2) }}
            strokeWidth={1.75}
          />
          {t("standee.inactiveCode")}
        </span>
      )}
    </div>
  );
}

/** The row of marks the whole product is about: the owner's own stamp,
 * repeated as many times as their card asks for, with the last ring left
 * standing as the reward. Above fourteen the marks stop being countable and
 * the figure has to carry it alone — the rule `CardPunches` follows too. */
function PunchRow({
  art,
  palette,
  max,
}: {
  art: StandeeArt;
  palette: StandeePalette;
  /** The biggest a mark is allowed to get, in `u`. */
  max: number;
}) {
  const total = Math.max(1, art.stampsRequired);
  const Glyph = art.glyph ? STAMP_GLYPHS[art.glyph] : undefined;
  if (total > 14) return null;
  // The row is one row. A card of twelve drawn at the size of a card of four
  // wraps, and a punch card that wraps stops reading as a run of visits — so
  // the mark shrinks to fit the width instead. 1.3 is the mark plus its gap.
  const mark = Math.min(max, 86 / (total * 1.3));
  return (
    <div
      aria-hidden="true"
      className="flex items-center justify-center"
      style={{ gap: u(mark * 0.3), maxWidth: "92%" }}
    >
      {Array.from({ length: total }).map((_, i) => {
        const last = i === total - 1;
        return (
          <span
            key={i}
            className="inline-flex items-center justify-center"
            style={{
              width: u(mark),
              height: u(mark),
              borderRadius: "9999px",
              // A dashed guide circle is what a punch card actually prints
              // before anybody has been in; the solid ring in the accent at
              // the end is the one worth walking back for.
              border: `${u(mark * (last ? 0.1 : 0.07))} ${
                last ? "solid" : "dashed"
              } ${last ? palette.accent : palette.ink}`,
              opacity: last ? 1 : 0.4,
              color: last ? palette.accent : palette.ink,
            }}
          >
            {Glyph ? (
              <Glyph
                aria-hidden
                style={{ width: u(mark * 0.48), height: u(mark * 0.48) }}
                strokeWidth={2}
              />
            ) : null}
          </span>
        );
      })}
    </div>
  );
}

/** The three steps, side by side. A tent's panel is wider than an A4's in
 * sheet units, so there each step gets room to say itself on one line. */
function Steps({
  palette,
  size,
  wide = false,
}: {
  palette: StandeePalette;
  size: number;
  wide?: boolean;
}) {
  const t = useSheetT();
  const steps = [
    t("standee.steps.scan"),
    t("standee.steps.join"),
    t("standee.steps.collect"),
  ];
  return (
    <ol
      className="flex flex-row items-start justify-center font-body"
      style={{ gap: u(size * 1.4), fontSize: u(size) }}
    >
      {steps.map((step, i) => (
        <li
          key={step}
          className="flex min-w-0 flex-col items-center text-center"
          style={{ gap: u(size * 0.5), maxWidth: u(size * (wide ? 13 : 9)) }}
        >
          <span
            aria-hidden="true"
            className="inline-flex shrink-0 items-center justify-center font-heading font-bold"
            style={{
              width: u(size * 1.8),
              height: u(size * 1.8),
              borderRadius: "9999px",
              backgroundColor: palette.accent,
              color: palette.ground,
              fontSize: u(size),
              lineHeight: 1,
            }}
          >
            {i + 1}
          </span>
          <span style={{ lineHeight: 1.3 }}>{step}</span>
        </li>
      ))}
    </ol>
  );
}

function Footer({ palette, size }: { palette: StandeePalette; size: number }) {
  const t = useSheetT();
  return (
    <p
      className="font-body"
      style={{
        fontSize: u(size),
        color: palette.ink,
        opacity: 0.55,
      }}
    >
      {t("standee.poweredBy")}
    </p>
  );
}

function Logo({ url, height }: { url: string; height: number }) {
  return (
    <img
      src={url}
      alt=""
      style={{ height: u(height), maxWidth: "52%", objectFit: "contain" }}
    />
  );
}

/* ── The four sheets ──────────────────────────────────────────────────── */

interface Layout {
  art: StandeeArt;
  palette: StandeePalette;
  wide: boolean;
}

/**
 * A sheet is three bands: the masthead, the thing itself, and what to do
 * about it — pushed to the top, the middle and the foot of the paper.
 *
 * Bands rather than one centred stack, because a sheet of paper has a top and
 * a bottom. A centred stack that happens to be two thirds of an A4 tall leaves
 * a hand's width of empty colour at each end and reads as a printing mistake,
 * and it moves every time a business name or a reward runs to a second line.
 */
function Sheet({ pad, children }: { pad: number; children: ReactNode }) {
  return (
    <div
      className="flex h-full flex-col items-center justify-between text-center"
      style={{ padding: u(pad), gap: u(pad * 0.4) }}
    >
      {children}
    </div>
  );
}

function Band({
  gap,
  children,
}: {
  gap: number;
  children: ReactNode;
}) {
  return (
    <div
      className="flex w-full flex-col items-center"
      style={{ gap: u(gap) }}
    >
      {children}
    </div>
  );
}

/** Full colour, for a wall or a window: the name reads from the far side of
 * the room, the offer and the code hold the middle, and the three steps
 * close. */
function Poster({ art, palette, wide }: Layout) {
  const t = useSheetT();
  return (
    <Sheet pad={wide ? 4 : 8}>
      <Band gap={wide ? 1.5 : 3}>
        {art.logoUrl ? <Logo url={art.logoUrl} height={wide ? 6 : 9} /> : null}
        {/* Not a heading. This is a picture of a sheet of paper, and four
            thumbnails of it would put four <h2>s into the page's outline. */}
        <p
          dir="auto"
          className="font-heading font-bold"
          style={{
            fontSize: fit(9.5),
            lineHeight: 1.05,
            letterSpacing: "-0.015em",
            textWrap: "balance",
          }}
        >
          {art.businessName}
        </p>
        <span
          aria-hidden="true"
          style={{
            width: u(13),
            height: u(0.65),
            borderRadius: "9999px",
            backgroundColor: palette.accent,
          }}
        />
      </Band>

      <Band gap={wide ? 2.2 : 4.4}>
        <p
          dir="auto"
          className="font-heading font-bold"
          style={{
            fontSize: fit(5.8),
            lineHeight: 1.2,
            color: palette.accent,
            textWrap: "balance",
          }}
        >
          {art.reward}
        </p>
        <Qr art={art} size={wide ? 33 : 38} palette={palette} />
        <p
          className="font-body font-bold"
          style={{
            fontSize: u(3),
            lineHeight: 1.35,
            maxWidth: "88%",
            textWrap: "balance",
          }}
        >
          {t("standee.scanCta")}
        </p>
      </Band>

      <Band gap={wide ? 1.8 : 3.4}>
        <Steps palette={palette} size={wide ? 2.2 : 2.4} wide={wide} />
        <Footer palette={palette} size={1.7} />
      </Band>
    </Sheet>
  );
}

/** Code first. For a till, a reception desk, a bar — anywhere the customer is
 * already standing still and has about four seconds to spare. */
function Counter({ art, palette, wide }: Layout) {
  const t = useSheetT();
  return (
    <Sheet pad={wide ? 5.5 : 8}>
      <Band gap={0}>
        <p
          dir="auto"
          className="font-heading font-bold"
          style={{
            fontSize: fit(7),
            lineHeight: 1.1,
            color: palette.accent,
            textWrap: "balance",
          }}
        >
          {art.reward}
        </p>
      </Band>

      <Band gap={0}>
        <Qr art={art} size={wide ? 42 : 52} palette={palette} />
      </Band>

      <Band gap={wide ? 2 : 3}>
        <p
          className="font-heading font-bold"
          style={{ fontSize: u(6.4), lineHeight: 1.05 }}
        >
          {t("standee.scanToJoin")}
        </p>
        <p className="font-body" style={{ fontSize: u(3), opacity: 0.85 }}>
          {t("standee.noApp")}
        </p>
        <p
          dir="auto"
          className="font-body font-bold"
          style={{ fontSize: fit(2.6), opacity: 0.9 }}
        >
          {art.businessName}
        </p>
        <Footer palette={palette} size={1.7} />
      </Band>
    </Sheet>
  );
}

/** The deal, drawn. A row of the owner's own stamps says "collect these, get
 * that" before anyone reads a word, which is the entire argument for a punch
 * card and the one thing a bare QR code cannot make. */
function CardDeal({ art, palette, wide }: Layout) {
  const t = useSheetT();
  return (
    <Sheet pad={wide ? 5.5 : 7.5}>
      <Band gap={wide ? 2.6 : 3.6}>
        <p
          dir="auto"
          className="font-heading font-bold"
          style={{ fontSize: fit(4.4), lineHeight: 1.15, opacity: 0.9 }}
        >
          {art.businessName}
        </p>
        <PunchRow art={art} palette={palette} max={wide ? 8.5 : 9.5} />
        {/* Assistant, not Plex Mono, which has no Hebrew; and no capitals,
            which Hebrew doesn't have either. */}
        <p className="font-body font-semibold" style={{ fontSize: u(2.6), opacity: 0.75 }}>
          {t("standee.stampsLine", { count: art.stampsRequired })}
        </p>
      </Band>

      <Band gap={wide ? 2.8 : 4}>
        <p
          dir="auto"
          className="font-heading font-bold"
          style={{
            fontSize: fit(7.2),
            lineHeight: 1.12,
            color: palette.accent,
            textWrap: "balance",
          }}
        >
          {art.reward}
        </p>
        <Qr art={art} size={wide ? 31 : 38} palette={palette} />
      </Band>

      <Band gap={wide ? 1.6 : 2.2}>
        <p
          className="font-body font-bold"
          style={{
            fontSize: u(2.9),
            lineHeight: 1.35,
            maxWidth: "88%",
            textWrap: "balance",
          }}
        >
          {t("standee.scanCta")}
        </p>
        <Footer palette={palette} size={1.6} />
      </Band>
    </Sheet>
  );
}

/** White paper and almost no ink. A colour-flooded A4 costs real money on an
 * office inkjet and looks wrong on plenty of walls — this is the one an owner
 * can reprint every month without thinking about it. */
function Plain({ art, palette, wide }: Layout) {
  const t = useSheetT();
  return (
    <Sheet pad={wide ? 4 : 7.5}>
      <Band gap={wide ? 1.8 : 3.2}>
        <span
          aria-hidden="true"
          className="w-full"
          style={{
            height: u(1),
            borderRadius: "9999px",
            backgroundColor: palette.accent,
          }}
        />
        {art.logoUrl ? <Logo url={art.logoUrl} height={wide ? 6 : 8} /> : null}
        <p
          dir="auto"
          className="font-heading font-bold"
          style={{ fontSize: fit(7.6), lineHeight: 1.1, textWrap: "balance" }}
        >
          {art.businessName}
        </p>
      </Band>

      <Band gap={wide ? 2.2 : 4}>
        <p
          dir="auto"
          className="font-heading font-bold"
          style={{
            fontSize: fit(5),
            lineHeight: 1.2,
            color: palette.accent,
            textWrap: "balance",
          }}
        >
          {art.reward}
        </p>
        <Qr art={art} size={wide ? 30 : 35} palette={palette} />
        <p
          className="font-body font-bold"
          style={{
            fontSize: u(2.9),
            lineHeight: 1.35,
            maxWidth: "88%",
            textWrap: "balance",
          }}
        >
          {t("standee.scanCta")}
        </p>
      </Band>

      <Band gap={wide ? 1.8 : 3.2}>
        <Steps palette={palette} size={wide ? 2.1 : 2.3} wide={wide} />
        <Footer palette={palette} size={1.6} />
      </Band>
    </Sheet>
  );
}

const LAYOUTS: Record<StandeeDesign, (props: Layout) => ReactElement> = {
  poster: Poster,
  counter: Counter,
  card: CardDeal,
  plain: Plain,
};

/**
 * One printed side.
 *
 * It carries no height of its own — the sheet around it owns the geometry, by
 * aspect ratio on screen and in millimetres on paper, and the panel just fills
 * what it is given. That is what keeps one component honest across a 140px
 * thumbnail and an A4.
 */
function StandeePanel({
  design,
  art,
  wide,
  className,
  style,
}: {
  design: StandeeDesign;
  art: StandeeArt;
  wide: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const palette = standeePalette(design, art);
  const Layout = LAYOUTS[design];
  return (
    <div
      className={cn("standee-panel", className)}
      style={{
        backgroundColor: palette.ground,
        color: palette.ink,
        // Turned down for the tent, whose panel has the same width and half
        // the height — one number instead of a second set of type sizes.
        ["--u" as string]: wide ? "0.72cqw" : "1cqw",
        ...style,
      }}
    >
      <Layout art={art} palette={palette} wide={wide} />
    </div>
  );
}

/**
 * One sheet of paper: what a single press of Print puts on a single page.
 *
 * `single` is the chooser's thumbnail, which shows one face rather than a
 * folded pair — two 35px-tall halves say nothing about a design.
 *
 * It speaks `language` whatever the dashboard speaks, and says so with its
 * own `lang` and `dir`, so the print copy in its portal does too and a
 * screen reader reads it in the right voice.
 *
 * It fits itself to its paper (see "The fit"), measuring in a layout effect
 * whenever what it holds or its width changes, and tells `onFit`. The print
 * copy is `display: none` until the printer asks, so it can't measure: it
 * takes the on-screen sheet's `fit` instead, which holds because both are
 * drawn in the same `cqw`.
 */
export function StandeeSheet({
  design,
  art,
  format,
  language,
  single = false,
  fit: fixedFit,
  onFit,
  measureAtPaper = false,
  className,
}: {
  design: StandeeDesign;
  art: StandeeArt;
  format: PrintFormat;
  language: SignLanguage;
  single?: boolean;
  /** A fit measured elsewhere, for a copy that can't measure itself. */
  fit?: number;
  onFit?: (fit: number) => void;
  /** Also measured at the paper's width: for the sheet whose fit prints. */
  measureAtPaper?: boolean;
  className?: string;
}) {
  const { t } = useTranslation(undefined, { lng: language });
  const spec = SHEET_SPECS[format];
  const folded = spec.panels === 2 && !single;
  const wide = spec.panels === 2;
  const height = wide && !folded ? spec.height / 2 : spec.height;
  const palette = standeePalette(design, art);

  const root = useRef<HTMLDivElement>(null);
  const [measured, setMeasured] = useState(1);
  const report = useRef(onFit);
  report.current = onFit;
  const measuring = fixedFit === undefined;
  const paperWidth = measureAtPaper ? `${spec.width}mm` : null;
  const { businessName, reward, stampsRequired, logoUrl, glyph, active } = art;
  useLayoutEffect(() => {
    const sheet = root.current;
    if (!measuring || !sheet) return;
    // Step the dial down until no panel's content is taller than the panel,
    // writing it straight onto the element so each step lays out at once.
    const measure = () => {
      // A sheet that isn't laid out has nothing to measure: printing hides
      // the page around the print copy, and a fit taken then would be 1.
      if (sheet.getClientRects().length === 0) return;
      const contents = [...sheet.querySelectorAll<HTMLElement>(".standee-panel > *")];
      // What the bands need, padding and gaps included, against what the
      // panel has: `scrollHeight` would let the last band eat the bottom
      // padding and set the footer on the paper's edge.
      const overflows = () =>
        contents.some((content) => {
          const style = getComputedStyle(content);
          const bands = [...content.children];
          const needed =
            parseFloat(style.paddingTop) +
            parseFloat(style.paddingBottom) +
            (parseFloat(style.rowGap) || 0) * Math.max(0, bands.length - 1) +
            bands.reduce((sum, band) => sum + band.getBoundingClientRect().height, 0);
          return needed - content.getBoundingClientRect().height > 0.5;
        });
      let next = 1;
      const stepDown = () => {
        while (overflows() && next - FIT_STEP >= FIT_MIN) {
          next = Math.round((next - FIT_STEP) * 100) / 100;
          sheet.style.setProperty("--fit", String(next));
        }
      };
      sheet.style.setProperty("--fit", "1");
      stepDown();
      // Type doesn't scale quite linearly from 300px to 210mm, so a sheet
      // whose fit the printer takes is measured at the paper's own width
      // too, before anything paints, and keeps the smaller of the two.
      if (paperWidth) {
        sheet.style.width = paperWidth;
        sheet.style.maxWidth = "none";
        stepDown();
        sheet.style.width = "";
        sheet.style.maxWidth = "";
      }
      setMeasured(next);
      report.current?.(next);
    };
    measure();
    // Again once the faces have loaded, since Rubik sets wider than its
    // fallback, and whenever the sheet's width changes.
    let width = sheet.getBoundingClientRect().width;
    const resized = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width === 0 || Math.abs(entry.contentRect.width - width) < 1) return;
      width = entry.contentRect.width;
      measure();
    });
    resized.observe(sheet);
    let live = true;
    void document.fonts?.ready.then(() => live && measure());
    return () => {
      live = false;
      resized.disconnect();
    };
  }, [measuring, paperWidth, design, format, language, single, businessName, reward, stampsRequired, logoUrl, glyph, active]);

  return (
    <SheetLanguage.Provider value={language}>
      <div
        ref={root}
        lang={language}
        dir={language === "he" ? "rtl" : "ltr"}
        className={cn("standee-sheet", className)}
        style={{ aspectRatio: `${spec.width} / ${height}`, ["--fit" as string]: fixedFit ?? measured }}
      >
        {folded && <StandeePanel design={design} art={art} wide className="rotate-180" />}
        <StandeePanel design={design} art={art} wide={wide} />
        {folded && (
          // The fold, marked. A tent that is guessed at folds crooked, and the
          // guide costs one hairline of ink.
          <span
            aria-hidden="true"
            className="standee-fold"
            style={{ color: palette.ink, borderColor: palette.ink }}
          >
            <span
              className="standee-fold-tag font-body font-semibold"
              // Hebrew isn't letter-spaced, and the tag says "fold" in it.
              style={{ backgroundColor: palette.ground, color: palette.ink, letterSpacing: "normal" }}
            >
              {t("standee.fold")}
            </span>
          </span>
        )}
      </div>
    </SheetLanguage.Provider>
  );
}
