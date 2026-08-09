import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { DesignDoc } from "../../api/designs";
import type { CardPattern } from "../../lib/cardPatterns";
import { cn } from "../../lib/cn";
import { PreviewBarcode } from "./PreviewBarcode";
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
  logoUrl?: string;
  stampArtUrl?: string;
  stripBaseUrl?: string;
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

function barcodeFormat(value: CardPreviewValue): string {
  return value.design.barcode?.format || "QR";
}

function fieldLabel(value: CardPreviewValue, binding: string, fallback: string): string {
  const field = value.design.fields?.find((f) => f.binding === binding);
  return field?.label || fallback;
}

const SAMPLE_NAME = "דנה לוי";

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
        {value.logoUrl ? (
          <img src={value.logoUrl} alt="" className="h-8 max-w-[140px] object-contain" />
        ) : (
          <span className="text-sm font-heading font-semibold truncate">
            {value.businessName || "—"}
          </span>
        )}
      </div>

      <div className="px-3">
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
      </div>

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
        <PreviewBarcode format={barcodeFormat(value)} />
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
        <PreviewBarcode format={barcodeFormat(value)} />
      </div>

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
