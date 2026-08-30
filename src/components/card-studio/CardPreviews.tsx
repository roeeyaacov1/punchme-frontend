import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { DesignDoc } from "../../api/designs";
import type { CardPattern } from "../../lib/cardPatterns";
import { cn } from "../../lib/cn";
import { barcodeFormat, resolveBarcodePayload } from "../../lib/passBarcode";
import { PassBarcode } from "../wallet-card/PassBarcode";
import { StampGrid } from "./StampGrid";

export interface CardPreviewValue {
  businessName: string;
  stampsRequired: number;
  currentStamps: number;
  rewardDescription: string;
  backgroundColor: string;
  foregroundColor: string;
  labelColor: string;
  design: DesignDoc;
  /** Square badge — what Google circle-crops. */
  logoUrl?: string;
  /** Wide logo — what Apple actually renders. Falls back to the business
   * name, which is exactly what the server generates when none was uploaded. */
  appleLogoUrl?: string;
  stampArtUrl?: string;
  /** Whole-tile before/after artwork — beats the stamp photo and the glyph. */
  stampedArtUrl?: string;
  unstampedArtUrl?: string;
  stripBaseUrl?: string;
  /** The real published strip/hero PNGs by stamp state. When present (and the
   * draft matches what's saved) we show the actual card art instead of the
   * CSS approximation — same renderer as the phone, so they cannot disagree. */
  stripStates?: Record<string, string>;
  heroStates?: Record<string, string>;
  /** True while there are unsaved edits: the published PNGs are stale, so the
   * live CSS approximation is the honest thing to show. */
  unsaved?: boolean;
  /** The card serial. Supplying it turns the barcode from a simulation into
   * the real thing — `/api/scan` matches a code against `serial` as well as
   * the PassKit member id an installed pass renders, so a customer whose
   * pass never made it into their wallet can still be scanned off this
   * screen. Omit in the studio, where no card exists yet. */
  serial?: string;
  /** Whose card this is, printed in the name field. Defaults to the sample
   * name — right for a design preview, wrong on a page showing someone
   * their own pass. */
  holderName?: string;
  /** The template's own name ("Haircut card"). Google prints a *program*
   * name as the card's title and the backend builds it as
   * "{business} - {card}", so without this the header can only repeat the
   * business name twice — which is what the installed pass never does. */
  cardName?: string;
}

/** The published artwork for a stamp state, when it is safe to trust it. */
function publishedArt(
  states: Record<string, string> | undefined,
  currentStamps: number,
  unsaved: boolean | undefined,
): string | undefined {
  if (unsaved || !states) return undefined;
  return states[String(currentStamps)] || undefined;
}

export type PreviewPlatform = "apple" | "google";

function stampColor(value: CardPreviewValue): string {
  return value.design.stamp?.color || value.foregroundColor;
}

function glyph(value: CardPreviewValue): string {
  return value.design.stamp?.glyph || "check";
}

function pattern(value: CardPreviewValue): CardPattern {
  return (value.design.pattern as CardPattern) || "none";
}

function fieldLabel(value: CardPreviewValue, binding: string, fallback: string): string {
  const field = value.design.fields?.find((f) => f.binding === binding);
  return field?.label || fallback;
}

/** Google's two header lines. They are different things and the card shows
 * both: the issuer is the business, the program is the card. The backend
 * derives them the same way every time — `organizationName` from the
 * business name, `description` as "{business} - {card}" — and only a design
 * doc that names them itself overrides that. */
function issuerName(value: CardPreviewValue): string {
  return value.design.organization_name?.trim() || value.businessName.trim() || "—";
}

function programName(value: CardPreviewValue): string {
  const named = value.design.description?.trim();
  if (named) return named;
  const business = value.businessName.trim();
  const card = value.cardName?.trim();
  if (business && card) return `${business} - ${card}`;
  return card || business || "—";
}

/** The face Apple Wallet sets a pass in: the device's own system face, which
 * IS SF on the phone and the Mac the owner is designing on. Nothing to load
 * and nothing to substitute — asking for `system-ui` is asking for exactly
 * what the pass will be set in, Hebrew included. */
const APPLE_WALLET_FONT =
  '-apple-system, "SF Pro Text", system-ui, "Segoe UI", Roboto, sans-serif';

/** Apple sizes the barcode plate by symbology: a square for the square
 * codes, a wide one for the linear pair. Measured off Apple's own store card
 * and coupon (150x150 and 263x82 on a 343-wide pass). */
function squareBarcode(format: string): boolean {
  return format !== "PDF417" && format !== "CODE128";
}

/** The face Google Wallet sets a pass in, copied from its own renderer.
 * Google Sans is not public, so Roboto — loaded in index.html for exactly
 * this — carries the Latin. Hebrew falls through to the system face on
 * purpose: Roboto ships no Hebrew, and a pass on a phone is set in that
 * phone's Hebrew face too, not in ours. */
const GOOGLE_WALLET_FONT = '"Google Sans", Roboto, "Noto Sans Hebrew", Arial, sans-serif';

const SAMPLE_NAME = "דנה לוי";

/** The card art. Prefers the PUBLISHED PNG — the identical file PassKit
 * serves to the phone — and only falls back to the CSS approximation while
 * there are unsaved edits (or before the first sync). Redrawing the strip in
 * CSS is what made the studio and the installed pass disagree about stamp
 * size, strip proportions, patterns and custom artwork. */
function StripArt({
  value,
  states,
  aspect = "1125 / 432",
}: {
  value: CardPreviewValue;
  states?: Record<string, string>;
  /** Apple strip is 1125x432; Google's hero is its own 1032x336 render. */
  aspect?: string;
}) {
  const published = publishedArt(states, value.currentStamps, value.unsaved);
  if (published) {
    return (
      <img
        src={published}
        alt=""
        className="block w-full"
        style={{ aspectRatio: aspect, objectFit: "cover" }}
      />
    );
  }
  return (
    <StampGrid
      stampsRequired={value.stampsRequired}
      currentStamps={value.currentStamps}
      stampColor={stampColor(value)}
      backgroundColor={value.backgroundColor}
      glyph={glyph(value)}
      pattern={pattern(value)}
      stampArtUrl={value.stampArtUrl}
      stampedArtUrl={value.stampedArtUrl}
      unstampedArtUrl={value.unstampedArtUrl}
      stripBaseUrl={value.stripBaseUrl}
    />
  );
}

/**
 * Apple Wallet's storeCard, measured off Apple's own render of one — the
 * `wallet-passes-types-store-card` artwork in the Wallet HIG, which is the
 * same pass style, the same field sections and the same barcode our
 * `passkit_template` asks for.
 *
 * What that render says, and this now does:
 *
 * - The system face throughout, labels UPPERCASE in the label colour at
 *   ~11px with a little tracking, values a good deal larger (18px) in the
 *   text colour. Apple honours `labelColor`; Google has nowhere to put one.
 * - The strip full-bleed at 2.604:1 directly under the logo row, no insets.
 * - A white plate under the barcode, square for a square code, at 44% of the
 *   card — Apple gives the code a lot more room than a thin strip does.
 *
 * What it does NOT say, though it looks like it does: that a pass is a fixed
 * card. All four styles Apple publishes measure exactly 343x503 with a large
 * gap above the barcode — but so does the boarding pass, which carries three
 * times the fields. That is a uniform artboard, not a pass height. A real
 * store card (Loopy Loyalty's own Wallet screenshots) puts the barcode
 * directly under the last field and ends. So this is content-height, and the
 * horizontal geometry and type are what the artwork is trusted for.
 *
 * Type and insets are Apple's own scaled by 300/343 — the width every surface
 * but one stages the pass at; the wizard's phone mock is 280px and hands the
 * card 248, so its type reads a touch large. The plate is a fraction of the
 * card, so it is right at either.
 *
 * `logoText` is empty on our passes: the wide logo PNG the server generates
 * carries the business name, which is why the fallback here prints it rather
 * than inventing a second line.
 */
export function AppleCardPreview(value: CardPreviewValue) {
  const { t } = useTranslation();
  const format = barcodeFormat(value.design);
  const square = squareBarcode(format);
  return (
    <div
      className="flex flex-col rounded-[18px] overflow-hidden shadow-[0_16px_40px_rgba(14,17,32,0.28)]"
      style={{
        backgroundColor: value.backgroundColor,
        color: value.foregroundColor,
        fontFamily: APPLE_WALLET_FONT,
      }}
    >
      <div className="flex h-[57px] shrink-0 items-start px-[14px] pt-[11px]">
        {value.appleLogoUrl ? (
          <img
            src={value.appleLogoUrl}
            alt=""
            className="max-h-[26px] max-w-[140px] object-contain"
          />
        ) : (
          <span className="truncate text-[15px] font-semibold">
            {value.businessName || "—"}
          </span>
        )}
      </div>

      {/* Apple renders the strip full-bleed at 2.604:1 — no insets, no
          rounding. */}
      <StripArt value={value} states={value.stripStates} />

      <div className="flex justify-between gap-3 px-[14px] pt-[8px]">
        <div className="min-w-0">
          <p
            className="truncate text-[11px] font-medium uppercase leading-tight tracking-[0.06em]"
            style={{ color: value.labelColor }}
          >
            {fieldLabel(value, "person.displayName", t("studio.preview.nameLabel"))}
          </p>
          <p className="truncate text-[18px] leading-tight">
            {value.holderName || SAMPLE_NAME}
          </p>
        </div>
        <div className="min-w-0 text-end">
          <p
            className="truncate text-[11px] font-medium uppercase leading-tight tracking-[0.06em]"
            style={{ color: value.labelColor }}
          >
            {fieldLabel(value, "members.member.points", t("studio.preview.pointsLabel"))}
          </p>
          <p className="truncate text-[18px] leading-tight">{value.currentStamps}</p>
        </div>
      </div>

      {/* Straight under the fields, the way a real card ends. The plate is a
          fraction of the card rather than a pixel count, so it holds at the
          248px the wizard's phone hands it as well as at 300. */}
      <div className="flex justify-center pb-[14px] pt-[14px]">
        <div
          className={cn(
            "rounded-[5px] bg-white",
            square ? "aspect-square w-[44%] p-[11px]" : "aspect-[263/82] w-[77%] p-[13px]",
          )}
        >
          <PassBarcode
            format={format}
            payload={resolveBarcodePayload(value.design, value.serial)}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Google Wallet's loyalty layout, measured off Google's own renderer rather
 * than guessed at: the Loyalty Pass builder at
 * developers.google.com/wallet/retail/loyalty-cards/resources/pass-builder
 * draws a card from the same class and object fields PassKit sends, and
 * every size, weight and inset below is read off it.
 *
 * What that renderer does, and this now does:
 *
 * - Two different header lines. The *issuer* (the business) sits beside the
 *   round logo; the *program* — "{business} - {card}" — is a 20px title on
 *   its own line under a dim rule. They are not the same string, and a card
 *   in a real wallet never shows the business name twice.
 * - "Google Sans"/Roboto throughout, at 11px/500 for a field label and
 *   14px/500 for its value, in the case the owner typed. Google does not
 *   letter-space or upper-case them, and it has no font of ours.
 * - One row of two items, points at the start and the holder at the end —
 *   the order `googlePaySettings.classTemplateInfo` asks for.
 * - No label colour. Google's LoyaltyClass has nowhere to put one, so the
 *   studio's label colour reaches Apple only; painting it here would be the
 *   preview inventing something the phone cannot show.
 *
 * Deliberately different from Apple — the layouts will never match, so the
 * switcher shows the real thing.
 */
export function GoogleCardPreview(value: CardPreviewValue) {
  const { t } = useTranslation();
  return (
    <div
      className="rounded-[18px] overflow-hidden shadow-[0_16px_40px_rgba(14,17,32,0.28)]"
      style={{
        backgroundColor: value.backgroundColor,
        color: value.foregroundColor,
        fontFamily: GOOGLE_WALLET_FONT,
      }}
    >
      {/* Title bar: a 24px logo inside a 36px well, then the issuer. */}
      <div className="flex h-12 items-center">
        <span className="ms-1.5 my-1.5 flex h-9 w-9 items-center justify-center p-1.5 shrink-0">
          <span className="h-6 w-6 rounded-full bg-white/[0.87] overflow-hidden flex items-center justify-center">
            {value.logoUrl ? (
              <img src={value.logoUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-[11px] font-bold text-navy">
                {(value.businessName || "?").slice(0, 1)}
              </span>
            )}
          </span>
        </span>
        <span className="me-3 min-w-0 truncate p-1.5 text-[14px] font-medium tracking-[0.21px]">
          {issuerName(value)}
        </span>
      </div>

      {/* Drawn in the card's own text colour rather than Google's flat
          white, so the rule survives a light card the way it does a dark
          one. */}
      <div className="h-px w-full bg-current opacity-[0.08]" />

      <p className="mt-[10px] truncate px-3 py-px text-[20px] leading-[30px]">
        {programName(value)}
      </p>

      {/* The card row. Points start, holder end — classTemplateInfo's order,
          and start/end rather than left/right so a Hebrew card reads the way
          the phone renders it. */}
      <div className="flex">
        <div className="flex min-w-0 flex-1 flex-col text-start">
          <p className="w-full truncate px-3 pt-1.5 text-[11px] font-medium">
            {fieldLabel(value, "members.member.points", t("studio.preview.pointsLabel"))}
          </p>
          <p className="w-full truncate px-3 pb-1.5 text-[14px] font-medium">
            {value.currentStamps}
          </p>
        </div>
        <div className="flex min-w-0 flex-1 flex-col text-end">
          <p className="w-full truncate px-3 pt-1.5 text-[11px] font-medium">
            {fieldLabel(value, "person.displayName", t("studio.preview.nameLabel"))}
          </p>
          <p className="w-full truncate px-3 pb-1.5 text-[14px] font-medium">
            {value.holderName || SAMPLE_NAME}
          </p>
        </div>
      </div>

      {/* A centred square on white, not a full-width strip, rounded at 12px
          the way Google rounds it.

          The ONE number on this card that is ours rather than Google's. Google
          draws the plate at 138px on its own 270px mock; 34% of the card is
          smaller than that, and it is what brings this card within ~15px of
          the Apple one instead of 46 above it.

          They cannot be made equal. Google carries two header lines where
          Apple carries one, which is 34px of real difference before anything
          else, and the two art slots are different shapes — so the gap moves
          with the staged width and with whether the published PNG or the CSS
          strip is showing. 34% is the value that keeps the worst of those
          cases small. A switcher that barely moves is worth more than the last
          30px of code, and the QR is still ~80px at the width the public pages
          stage it, which is what `/c` and `/join` need it scannable for.

          Padding in px, not %: a percentage padding resolves against the
          card's width, not the plate's. */}
      <div className="flex justify-center pt-[14px] pb-[14px]">
        <div className="w-[34%] aspect-square rounded-xl bg-white p-[11px]">
          <PassBarcode
            format={barcodeFormat(value.design)}
            payload={resolveBarcodePayload(value.design, value.serial)}
          />
        </div>
      </div>

      {/* Google's hero is its own render (1032x336), not the Apple strip. */}
      <StripArt value={value} states={value.heroStates} aspect="1032 / 336" />
    </div>
  );
}

const PLATFORMS: PreviewPlatform[] = ["apple", "google"];

/** One card, two wallets: a segmented switch picks which platform's real
 * layout is rendered. */
export function CardPreview(props: CardPreviewValue) {
  const { t } = useTranslation();
  const [platform, setPlatform] = useState<PreviewPlatform>("apple");

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* The switch is ours, not the wallets' — so unlike the card below it,
          it is token-built and follows whatever ground it is dropped on: the
          light values inside a `LitStage`, the dark ones in the studio. */}
      <div className="inline-flex rounded-full border border-border bg-surface p-1">
        {PLATFORMS.map((key) => (
          <button
            key={key}
            type="button"
            aria-pressed={platform === key}
            onClick={() => setPlatform(key)}
            className={cn(
              "px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-wide transition-colors",
              platform === key
                ? "bg-ink text-background"
                : "text-ink-muted hover:text-ink",
            )}
          >
            {t(`studio.preview.${key}`)}
          </button>
        ))}
      </div>

      {/* A hairline rim, traced on the card's own radius rather than painted
          into it — the colours inside belong to the owner and stay untouched.
          A pass is a discrete object and needs an edge at every colour: the
          near-black palette on a dark ground would otherwise dissolve into
          it, exactly as a white card did on white. iOS draws the same
          highlight for the same reason, and the landing page's phone frame
          already wears this one.

          Outset, not inset — the card fills this box and would paint its own
          background over anything drawn inside it. `/10` because that is a
          real step on Tailwind's opacity scale; `/12` compiles to nothing at
          all and leaves the default blue ring showing. */}
      <div className="w-[300px] shrink-0 rounded-[18px] ring-1 ring-white/10">
        {platform === "apple" ? (
          <AppleCardPreview {...props} />
        ) : (
          <GoogleCardPreview {...props} />
        )}
      </div>
    </div>
  );
}
