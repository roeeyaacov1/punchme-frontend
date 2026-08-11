import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { DesignDoc, ImageUse } from "../../api/designs";
import { CARD_PALETTES } from "../../lib/cardPalettes";
import { CARD_PATTERNS, patternStyle, type CardPattern } from "../../lib/cardPatterns";
import { STAMP_GLYPHS, STAMP_GLYPH_NAMES } from "../../lib/stampGlyphs";
import { cn } from "../../lib/cn";
import { ColorField, Input, Slider } from "../ui";
import { CardPreview } from "./CardPreviews";
import { FieldsEditor } from "./FieldsEditor";
import { LabelsEditor } from "./LabelsEditor";

/** Everything the designer edits — the template's flat fields plus the
 * canonical design doc. Mirrors what PATCH .../templates/{id} accepts. */
export interface CardStudioValue {
  name: string;
  stamps_required: number;
  reward_description: string;
  background_color: string;
  foreground_color: string;
  label_color: string;
  design: DesignDoc;
}

export interface CardStudioImages {
  logo?: string;
  apple_logo?: string;
  stamp_art?: string;
  strip_base?: string;
  stamped_art?: string;
  unstamped_art?: string;
  /** Published per-state artwork — the exact PNGs on the phone. */
  strip_states?: Record<string, string>;
  hero_states?: Record<string, string>;
}

export interface CardStudioProps {
  value: CardStudioValue;
  onChange: (value: CardStudioValue) => void;
  businessName: string;
  /** Existing image URLs (logo/art) for the preview. */
  images?: CardStudioImages;
  /** When provided, upload controls appear (owned templates); catalog
   * authoring may omit uses it can't host. */
  onUpload?: (use: ImageUse, file: File) => Promise<void>;
  /** Publish-readiness problems from the server (DesignOut.lint). */
  lint?: string[];
  /** Unsaved edits pending: the published artwork is stale, so the preview
   * falls back to the live approximation until the design is saved. */
  unsaved?: boolean;
  /** Trim Advanced to colors + labels (e.g. tight onboarding flows) —
   * wallet plumbing like barcode format and custom artwork stays out. */
  simpleOnly?: boolean;
}

const MIN_STAMPS = 2;
const MAX_STAMPS = 12;

/** The Card Studio designer: simple controls up front, colors/labels and
 * the wallet plumbing behind an Advanced disclosure, and a live preview
 * that switches between the real Apple and Google layouts. Pure controlled
 * component — persistence (save/upload) belongs to the parent. */
export function CardStudio({
  value,
  onChange,
  businessName,
  images = {},
  onUpload,
  lint,
  unsaved,
  simpleOnly = false,
}: CardStudioProps) {
  const { t } = useTranslation();
  const [showAdvanced, setShowAdvanced] = useState(false);
  // Starts at 0 — the state of a freshly issued card. Defaulting to a few
  // punched stamps showed the designed stamp colour on a card that, in the
  // owner's actual wallet, is entirely grey until someone earns a stamp.
  const [sampleStamps, setSampleStamps] = useState(0);
  const [uploading, setUploading] = useState<ImageUse | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const design = value.design;
  const stampColor = design.stamp?.color || value.foreground_color;
  const glyph = design.stamp?.glyph || "check";
  const pattern = (design.pattern as CardPattern) || "none";

  function update(patch: Partial<CardStudioValue>) {
    onChange({ ...value, ...patch });
  }

  function updateDesign(patch: Partial<DesignDoc>) {
    update({ design: { ...design, ...patch } });
  }

  async function handleUpload(use: ImageUse, file: File) {
    if (!onUpload) return;
    setUploadError(null);
    setUploading(use);
    try {
      await onUpload(use, file);
    } catch {
      setUploadError(t("studio.uploadError"));
    } finally {
      setUploading(null);
    }
  }

  function fileButton(use: ImageUse, label: string) {
    if (!onUpload) return null;
    return (
      <label
        key={use}
        className="text-sm font-body text-navy underline hover:no-underline cursor-pointer w-fit"
      >
        {uploading === use ? t("common.loading") : label}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleUpload(use, file);
            e.target.value = "";
          }}
        />
      </label>
    );
  }

  return (
    <div className="flex flex-col xl:flex-row gap-10 w-full items-start">
      <div className="flex flex-col gap-6 w-full max-w-md">
        <Input
          label={t("studio.nameLabel")}
          value={value.name}
          onChange={(e) => update({ name: e.target.value })}
          required
        />

        <Slider
          label={t("studio.stampsLabel")}
          hint={t("studio.stampsHint", { count: value.stamps_required })}
          min={MIN_STAMPS}
          max={MAX_STAMPS}
          value={value.stamps_required}
          onChange={(count) => {
            update({ stamps_required: count });
            setSampleStamps((current) => Math.min(current, count));
          }}
        />

        <Input
          label={t("studio.rewardLabel")}
          value={value.reward_description}
          onChange={(e) => update({ reward_description: e.target.value })}
          required
        />

        {/* Stamp glyph — 1:1 with the server-side renderer's registry */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-navy font-body">
            {t("studio.glyphLabel")}
          </span>
          <div className="grid grid-cols-8 gap-1.5">
            {STAMP_GLYPH_NAMES.map((name) => {
              const Icon = STAMP_GLYPHS[name];
              const selected = glyph === name && !images.stamp_art;
              return (
                <button
                  key={name}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => updateDesign({ stamp: { ...design.stamp, glyph: name } })}
                  className={cn(
                    "h-9 rounded-lg border flex items-center justify-center transition-colors",
                    selected
                      ? "border-navy bg-navy text-white"
                      : "border-slate/25 text-navy hover:border-navy/50",
                  )}
                >
                  <Icon size={16} strokeWidth={2.2} />
                </button>
              );
            })}
          </div>
          {fileButton("stamp_art", t("studio.uploadStampArt"))}
        </div>

        {/* Palettes + colors */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-navy font-body">
            {t("studio.paletteLabel")}
          </span>
          <div className="flex gap-2 flex-wrap">
            {CARD_PALETTES.map((palette) => (
              <button
                key={palette.key}
                type="button"
                title={palette.key}
                onClick={() =>
                  onChange({
                    ...value,
                    background_color: palette.background,
                    foreground_color: palette.text,
                    label_color: palette.label,
                    design: {
                      ...design,
                      stamp: { ...design.stamp, color: palette.stamp },
                    },
                  })
                }
                className="h-9 w-9 rounded-full border border-slate/25 overflow-hidden flex flex-wrap rotate-45 hover:scale-110 transition-transform"
              >
                <span className="h-1/2 w-1/2" style={{ backgroundColor: palette.background }} />
                <span className="h-1/2 w-1/2" style={{ backgroundColor: palette.stamp }} />
                <span className="h-1/2 w-1/2" style={{ backgroundColor: palette.label }} />
                <span className="h-1/2 w-1/2" style={{ backgroundColor: palette.text }} />
              </button>
            ))}
          </div>
        </div>

        {/* Background pattern */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-navy font-body">
            {t("studio.patternLabel")}
          </span>
          <div className="flex gap-2">
            {CARD_PATTERNS.map((kind) => (
              <button
                key={kind}
                type="button"
                aria-pressed={pattern === kind}
                onClick={() => updateDesign({ pattern: kind })}
                className={cn(
                  "h-10 w-14 rounded-lg border-2 overflow-hidden",
                  pattern === kind ? "border-navy" : "border-slate/25",
                )}
                style={{
                  backgroundColor: value.background_color,
                  ...patternStyle(kind, stampColor),
                }}
                title={t(`studio.patterns.${kind}`)}
              />
            ))}
          </div>
        </div>

        {/* Logo */}
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-navy font-body">
            {t("studio.logoLabel")}
          </span>
          <p className="text-xs text-slate font-body">{t("studio.logoHint")}</p>
          <div className="flex items-center gap-3">
            {images.logo && (
              <img
                src={images.logo}
                alt=""
                className="h-10 max-w-[120px] object-contain rounded bg-slate/10 p-1"
              />
            )}
            {fileButton("logo", t("studio.uploadLogo"))}
          </div>
        </div>

        {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}

        {/* Advanced */}
        <div className="flex flex-col gap-4 border-t border-slate/15 pt-4">
          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            className="text-sm font-medium text-navy font-body text-start underline hover:no-underline w-fit"
          >
            {showAdvanced ? t("studio.hideAdvanced") : t("studio.showAdvanced")}
          </button>

          {showAdvanced && (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-navy font-body">
                  {t("studio.colorsLabel")}
                </span>
                {/* One column below `sm`: the picker panel is wider than a
                    half-width cell and would run off a phone screen. */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <ColorField
                    label={t("studio.backgroundColor")}
                    value={value.background_color}
                    onChange={(color) => update({ background_color: color })}
                  />
                  <ColorField
                    label={t("studio.stampColor")}
                    value={stampColor}
                    onChange={(color) =>
                      updateDesign({ stamp: { ...design.stamp, color } })
                    }
                  />
                  <ColorField
                    label={t("studio.textColor")}
                    value={value.foreground_color}
                    onChange={(color) => update({ foreground_color: color })}
                  />
                  <ColorField
                    label={t("studio.labelColor")}
                    value={value.label_color}
                    onChange={(color) => update({ label_color: color })}
                  />
                </div>
              </div>

              <LabelsEditor
                fields={design.fields ?? []}
                onChange={(fields) => updateDesign({ fields })}
              />

              {!simpleOnly && (
                <>
                  <div className="flex gap-3">
                    <label className="flex flex-col gap-1 text-sm font-medium text-navy font-body flex-1">
                      {t("studio.languageLabel")}
                      <select
                        className="rounded-lg border border-slate/30 bg-white px-2 py-2 text-sm font-body"
                        value={design.default_language ?? "HE"}
                        onChange={(e) =>
                          updateDesign({ default_language: e.target.value as "HE" | "EN" })
                        }
                      >
                        <option value="HE">{t("studio.languages.HE")}</option>
                        <option value="EN">{t("studio.languages.EN")}</option>
                      </select>
                    </label>
                    <label className="flex flex-col gap-1 text-sm font-medium text-navy font-body flex-1">
                      {t("studio.barcodeLabel")}
                      <select
                        className="rounded-lg border border-slate/30 bg-white px-2 py-2 text-sm font-body"
                        value={design.barcode?.format ?? "QR"}
                        onChange={(e) =>
                          updateDesign({
                            barcode: {
                              ...design.barcode,
                              format: e.target.value as NonNullable<
                                DesignDoc["barcode"]
                              >["format"],
                            },
                          })
                        }
                      >
                        {["QR", "PDF417", "AZTEC", "CODE128"].map((format) => (
                          <option key={format} value={format}>
                            {format}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <Input
                    label={t("studio.orgNameLabel")}
                    hint={t("studio.orgNameHint")}
                    value={design.organization_name ?? ""}
                    onChange={(e) => updateDesign({ organization_name: e.target.value })}
                  />

                  {onUpload && (
                    <div className="flex flex-col gap-2">
                      <span className="text-sm font-medium text-navy font-body">
                        {t("studio.artworkLabel")}
                      </span>
                      <p className="text-xs text-slate font-body">{t("studio.artworkHint")}</p>
                      {fileButton("strip_base", t("studio.uploadStripBase"))}
                      {fileButton("stamped_art", t("studio.uploadStampedArt"))}
                      {fileButton("unstamped_art", t("studio.uploadUnstampedArt"))}
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-navy font-body">
                      {t("studio.fieldsLabel")}
                    </span>
                    <FieldsEditor
                      fields={design.fields ?? []}
                      onChange={(fields) => updateDesign({ fields })}
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Live preview */}
      <div className="flex flex-col gap-4 w-full xl:sticky xl:top-8">
        <CardPreview
          businessName={businessName}
          stampsRequired={value.stamps_required}
          currentStamps={sampleStamps}
          rewardDescription={value.reward_description}
          backgroundColor={value.background_color}
          foregroundColor={value.foreground_color}
          labelColor={value.label_color}
          design={design}
          logoUrl={images.logo}
          appleLogoUrl={images.apple_logo}
          stampArtUrl={images.stamp_art}
          stripBaseUrl={images.strip_base}
          stripStates={images.strip_states}
          heroStates={images.hero_states}
          unsaved={unsaved}
        />
        <div className="max-w-xs mx-auto w-full">
          <Slider
            label={t("studio.sampleStampsLabel")}
            hint={t("studio.sampleStampsHint", { count: sampleStamps })}
            min={0}
            max={value.stamps_required}
            value={sampleStamps}
            onChange={setSampleStamps}
          />
        </div>

        {lint !== undefined && (
          <div className="max-w-md mx-auto w-full">
            {lint.length === 0 ? (
              <p className="text-sm text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2 font-body">
                {t("studio.lintClean")}
              </p>
            ) : (
              <div className="text-sm text-amber-800 bg-amber-50 rounded-lg px-3 py-2 font-body">
                <p className="font-medium mb-1">{t("studio.lintTitle")}</p>
                <ul className="list-disc ms-5 space-y-0.5">
                  {lint.map((problem) => (
                    <li key={problem} dir="ltr" className="text-start">
                      {problem}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
