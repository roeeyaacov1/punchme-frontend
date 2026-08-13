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
  stripBaseUrl?: string;
  /** The real published strip/hero PNGs by stamp state. When present (and the
   * draft matches what's saved) we show the actual card art instead of the
   * CSS approximation — same renderer as the phone, so they cannot disagree. */
  stripStates?: Record<string, string>;
  heroStates?: Record<string, string>;
  /** True while there are unsaved edits: the published PNGs are stale, so the
   * live CSS approximation is the honest thing to show. */
  unsaved?: boolean;
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
      stripBaseUrl={value.stripBaseUrl}
    />
  );
}

/** Apple Wallet storeCard layout: logo row up top, the strip (stamp grid)
 * in the middle, secondary fields, barcode at the bottom. */
export function AppleCardPreview(value: CardPreviewValue) {
  const { t } = useTranslation();
  return (
    <div
      className="rounded-[18px] overflow-hidden shadow-[0_16px_40px_rgba(14,17,32,0.28)]"
      style={{ backgroundColor: value.backgroundColor, color: value.foregroundColor }}
    >
      <div className="flex items-center gap-2.5 px-4 pt-4 pb-3">
        {value.appleLogoUrl ? (
          <img src={value.appleLogoUrl} alt="" className="h-8 max-w-[160px] object-contain" />
        ) : (
          <span className="text-sm font-heading font-semibold truncate">
            {value.businessName || "—"}
          </span>
        )}
      </div>

      {/* Apple renders the strip full-bleed at a fixed 375x144 — no insets,
          no rounding. */}
      <StripArt value={value} states={value.stripStates} />

      <div className="flex justify-between gap-3 px-4 pt-3 pb-2">
        <div className="min-w-0">
          <p
            className="text-[9px] font-mono uppercase tracking-wide"
            style={{ color: value.labelColor }}
          >
            {fieldLabel(value, "person.displayName", t("studio.preview.nameLabel"))}
          </p>
          <p className="text-sm truncate">{SAMPLE_NAME}</p>
        </div>
        <div className="text-end shrink-0">
          <p
            className="text-[9px] font-mono uppercase tracking-wide"
            style={{ color: value.labelColor }}
          >
            {fieldLabel(value, "members.member.points", t("studio.preview.pointsLabel"))}
          </p>
          <p className="text-sm">{value.currentStamps}</p>
        </div>
      </div>

      <div className="bg-white mx-4 mb-4 mt-2 rounded-lg p-2 flex items-center justify-center h-[72px]">
        <PassBarcode
          format={barcodeFormat(value.design)}
          payload={resolveBarcodePayload(value.design)}
        />
      </div>
    </div>
  );
}

/** Google Wallet's FIXED loyalty layout: round logo + program header,
 * member name and points row, barcode, then the hero image (our stamp
 * grid) at the very bottom. Deliberately different from Apple — the
 * layouts will never match, so the switcher shows the real thing. */
export function GoogleCardPreview(value: CardPreviewValue) {
  const { t } = useTranslation();
  return (
    <div
      className="rounded-[18px] overflow-hidden shadow-[0_16px_40px_rgba(14,17,32,0.28)]"
      style={{ backgroundColor: value.backgroundColor, color: value.foregroundColor }}
    >
      <div className="flex items-center gap-3 px-4 pt-4">
        <span className="h-10 w-10 rounded-full bg-white/90 overflow-hidden flex items-center justify-center shrink-0">
          {value.logoUrl ? (
            <img src={value.logoUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-sm font-heading font-bold text-navy">
              {(value.businessName || "?").slice(0, 1)}
            </span>
          )}
        </span>
        <div className="min-w-0">
          <p className="text-[11px] opacity-80 truncate">{value.businessName || "—"}</p>
          <p className="text-sm font-medium truncate">
            {value.design.organization_name || value.businessName || "—"}
          </p>
        </div>
      </div>

      <div className="flex justify-between gap-3 px-4 pt-4">
        <div className="min-w-0">
          <p
            className="text-[10px] uppercase tracking-wide"
            style={{ color: value.labelColor }}
          >
            {fieldLabel(value, "person.displayName", t("studio.preview.nameLabel"))}
          </p>
          <p className="text-base truncate">{SAMPLE_NAME}</p>
        </div>
        <div className="text-end shrink-0">
          <p
            className="text-[10px] uppercase tracking-wide"
            style={{ color: value.labelColor }}
          >
            {fieldLabel(value, "members.member.points", t("studio.preview.pointsLabel"))}
          </p>
          <p className="text-base font-heading">{value.currentStamps}</p>
        </div>
      </div>

      <div className="bg-white mx-4 my-3 rounded-lg p-2 flex items-center justify-center h-[64px]">
        <PassBarcode
          format={barcodeFormat(value.design)}
          payload={resolveBarcodePayload(value.design)}
        />
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
      <div className="inline-flex rounded-full border border-slate/25 bg-white p-1">
        {PLATFORMS.map((key) => (
          <button
            key={key}
            type="button"
            aria-pressed={platform === key}
            onClick={() => setPlatform(key)}
            className={cn(
              "px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-wide transition-colors",
              platform === key
                ? "bg-navy text-white"
                : "text-slate hover:text-navy",
            )}
          >
            {t(`studio.preview.${key}`)}
          </button>
        ))}
      </div>

      <div className="w-[300px] shrink-0">
        {platform === "apple" ? (
          <AppleCardPreview {...props} />
        ) : (
          <GoogleCardPreview {...props} />
        )}
      </div>
    </div>
  );
}
