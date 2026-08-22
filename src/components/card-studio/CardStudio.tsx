import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, CircleCheck, Info } from "lucide-react";
import type { DesignDoc, ImageUse } from "../../api/designs";
import { ChoiceGrid } from "../onboarding/ChoiceGrid";
import { CARD_PALETTES, type CardPalette } from "../../lib/cardPalettes";
import { CARD_PATTERNS, patternStyle, type CardPattern } from "../../lib/cardPatterns";
import { STAMP_GLYPHS, STAMP_GLYPH_NAMES } from "../../lib/stampGlyphs";
import { useDebounce } from "../../hooks/useDebounce";
import { cn } from "../../lib/cn";
import { CardPreview } from "./CardPreviews";
import { ColorWell } from "./ColorWell";
import { FieldsEditor } from "./FieldsEditor";
import { LabelsEditor } from "./LabelsEditor";
import {
  PunchStrip,
  StudioDisclosure,
  StudioGroupLabel,
  StudioPanel,
  StudioSelect,
  StudioSlider,
  StudioText,
  UploadButton,
} from "./studio-primitives";

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

/**
 * The Card Studio: a bench with a lamp on it.
 *
 * The controls are the dashboard — token-built panels that turn dark with the
 * rest of the page. The pass is not: both wallets draw it on white by their
 * own definition, so it keeps the lit stage it has always had and the desk
 * around it goes dark. Only the object under the lamp is a spec match; the
 * tools beside it belong to us.
 *
 * Pure controlled component — persistence (save/upload) belongs to the parent.
 */
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
  const GlyphIcon = STAMP_GLYPHS[glyph] ?? STAMP_GLYPHS.check;

  // Dragging either strip must not read out every tick.
  const stampsText = t("studio.stampsHint", { count: value.stamps_required });
  const spokenStamps = useDebounce(stampsText, 500);
  const sampleText = t("studio.sampleStampsHint", { count: sampleStamps });
  const spokenSample = useDebounce(sampleText, 500);

  function update(patch: Partial<CardStudioValue>) {
    onChange({ ...value, ...patch });
  }

  function updateDesign(patch: Partial<DesignDoc>) {
    update({ design: { ...design, ...patch } });
  }

  function setStampsRequired(count: number) {
    update({ stamps_required: count });
    setSampleStamps((current) => Math.min(current, count));
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

  function uploadButton(use: ImageUse, label: string, preview?: string) {
    if (!onUpload) return null;
    return (
      <UploadButton
        key={use}
        label={uploading === use ? t("common.loading") : label}
        busy={uploading === use}
        preview={preview}
        onFile={(file) => void handleUpload(use, file)}
      />
    );
  }

  const paletteChoices = CARD_PALETTES.map((palette: CardPalette) => ({
    value: palette.key,
    label: t(`studio.palettes.${palette.key}`),
    // The chip is a scrap of the card itself, drawn with the stamp the owner
    // has actually chosen — so picking a glyph changes every palette, and the
    // row reads as "here is mine, in six colourways" rather than as six
    // abstract pinwheels.
    render: (selected: boolean) => (
      <span
        className={cn(
          "flex h-11 w-11 flex-col items-center justify-center gap-1 rounded-xl ring-offset-2 ring-offset-surface transition-shadow",
          selected ? "ring-2 ring-ink" : "ring-1 ring-border-strong/70",
        )}
        style={{ backgroundColor: palette.background }}
      >
        <GlyphIcon size={16} strokeWidth={2.4} color={palette.stamp} aria-hidden="true" />
        <span
          className="h-[2px] w-5 rounded-full"
          style={{ backgroundColor: palette.label }}
        />
      </span>
    ),
  }));

  const glyphChoices = STAMP_GLYPH_NAMES.map((name) => {
    const Icon = STAMP_GLYPHS[name];
    return {
      value: name,
      label: t(`onboarding.stamp.glyphs.${name}`),
      render: (selected: boolean) => (
        <span
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-full ring-offset-2 ring-offset-surface transition-colors",
            selected
              ? "bg-navy-deep text-white ring-2 ring-ink"
              : "bg-background text-ink ring-1 ring-border-strong/70",
          )}
        >
          <Icon size={20} strokeWidth={2.2} aria-hidden="true" />
        </span>
      ),
    };
  });

  // Each texture tile is a piece of the strip: the card colour with the
  // pattern in the stamp colour, exactly as the renderer bakes it.
  const patternChoices = CARD_PATTERNS.map((kind: CardPattern) => ({
    value: kind,
    label: t(`studio.patterns.${kind}`),
    render: (selected: boolean) => (
      <span
        className={cn(
          "flex h-12 w-full items-center justify-center rounded-xl ring-offset-2 ring-offset-surface transition-shadow",
          selected ? "ring-2 ring-ink" : "ring-1 ring-border-strong/70",
        )}
        style={{
          backgroundColor: value.background_color,
          ...patternStyle(kind, stampColor),
        }}
      >
        <span
          className={cn(
            "rounded-md px-1.5 py-0.5 text-[11px] font-semibold",
            selected ? "bg-surface text-ink" : "bg-surface/85 text-ink-muted",
          )}
        >
          {t(`studio.patterns.${kind}`)}
        </span>
      </span>
    ),
  }));

  return (
    <div className="grid items-start gap-4 sm:gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
      {/* ── The lamp ──────────────────────────────────────────────────
          First on a phone, because the whole point is watching the card
          change; second column and sticky from `xl`, where it can sit beside
          the controls instead of above them. */}
      <div className="order-1 flex flex-col gap-4 xl:order-2 xl:sticky xl:top-6">
        <div className="theme-lit rounded-2xl bg-background p-4 text-ink shadow-panel-lift ring-1 ring-black/5 sm:p-5">
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

          {/* Try it: punch the sample card and watch the pass above follow. */}
          <div className="mt-5 flex flex-col gap-2.5 border-t border-border pt-4">
            <StudioSlider
              label={t("studio.sampleStampsLabel")}
              min={0}
              max={value.stamps_required}
              value={sampleStamps}
              onChange={setSampleStamps}
              valueText={sampleText}
              spoken={spokenSample}
            />
            <PunchStrip
              count={value.stamps_required}
              filled={sampleStamps}
              // Clicking the last punched dot lifts it again, so the empty
              // card is one click away rather than a drag back to zero.
              onPick={(picked) => setSampleStamps(picked === sampleStamps ? picked - 1 : picked)}
              glyph={GlyphIcon}
              stampArtUrl={images.stamp_art}
              stampColor={stampColor}
              cardColor={value.background_color}
            />
          </div>
        </div>

        {lint !== undefined &&
          (lint.length === 0 ? (
            <p className="flex items-start gap-2.5 rounded-xl bg-ok-bg px-4 py-3 text-sm text-ok">
              <CircleCheck size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
              <span className="min-w-0">{t("studio.lintClean")}</span>
            </p>
          ) : (
            <div className="flex items-start gap-2.5 rounded-xl bg-warn-bg px-4 py-3 text-sm text-warn">
              <Info size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="font-medium">{t("studio.lintTitle")}</p>
                <ul className="mt-1 list-disc space-y-0.5 ms-5">
                  {lint.map((problem) => (
                    <li key={problem} dir="ltr" className="text-start">
                      {problem}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
      </div>

      {/* ── The bench ─────────────────────────────────────────────────── */}
      <div className="order-2 flex flex-col gap-4 xl:order-1">
        <StudioPanel title={t("studio.groups.card")}>
          {/* Two short answers, side by side once there is room — a card name
              does not need 700px of field to be typed into. */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <StudioText
              label={t("studio.nameLabel")}
              value={value.name}
              onChange={(e) => update({ name: e.target.value })}
              required
            />

            <StudioText
              label={t("studio.rewardLabel")}
              value={value.reward_description}
              onChange={(e) => update({ reward_description: e.target.value })}
              required
            />
          </div>

          <div className="flex flex-col gap-2.5">
            <StudioSlider
              label={t("studio.stampsLabel")}
              min={MIN_STAMPS}
              max={MAX_STAMPS}
              value={value.stamps_required}
              onChange={setStampsRequired}
              valueText={stampsText}
              spoken={spokenStamps}
            />
            {/* The strip drawn at full length, so the choice is "how long is
                my card" rather than a number on a rail. The first dot is
                below the minimum and clamps up to it — a one-stamp loyalty
                card is not a thing the renderer will draw. */}
            <PunchStrip
              count={MAX_STAMPS}
              filled={value.stamps_required}
              onPick={(picked) => setStampsRequired(Math.max(MIN_STAMPS, picked))}
              glyph={GlyphIcon}
              stampArtUrl={images.stamp_art}
              stampColor={stampColor}
              cardColor={value.background_color}
            />
          </div>
        </StudioPanel>

        <StudioPanel title={t("studio.groups.stamp")}>
          <div className="flex flex-col gap-3">
            <ChoiceGrid
              name="studio-glyph"
              legend={t("studio.glyphLabel")}
              choices={glyphChoices}
              // Uploaded art wins over any glyph in the doc — the renderer
              // uses the picture, so no icon here is the selected one.
              value={images.stamp_art ? null : glyph}
              onChange={(name) => updateDesign({ stamp: { ...design.stamp, glyph: name } })}
              columns={4}
              smColumns={8}
            />
            {uploadButton("stamp_art", t("studio.uploadStampArt"), images.stamp_art)}
          </div>
        </StudioPanel>

        <StudioPanel title={t("studio.groups.look")}>
          <ChoiceGrid
            name="studio-palette"
            legend={t("studio.paletteLabel")}
            choices={paletteChoices}
            // A palette is a shortcut that writes four colours at once, not a
            // stored choice — an owner who then nudges one colour has left it,
            // and nothing should still look picked.
            value={
              CARD_PALETTES.find(
                (p) =>
                  p.background === value.background_color &&
                  p.text === value.foreground_color &&
                  p.label === value.label_color &&
                  p.stamp === stampColor,
              )?.key ?? null
            }
            onChange={(key) => {
              const palette = CARD_PALETTES.find((p) => p.key === key);
              if (!palette) return;
              onChange({
                ...value,
                background_color: palette.background,
                foreground_color: palette.text,
                label_color: palette.label,
                design: { ...design, stamp: { ...design.stamp, color: palette.stamp } },
              });
            }}
            columns={6}
          />

          <div className="flex flex-col gap-2">
            <StudioGroupLabel>{t("studio.colorsLabel")}</StudioGroupLabel>
            {/* One column below `sm`: the picker panel is wider than a
                half-width cell and would run off a phone screen. */}
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <ColorWell
                label={t("studio.backgroundColor")}
                value={value.background_color}
                onChange={(color) => update({ background_color: color })}
              />
              <ColorWell
                label={t("studio.stampColor")}
                value={stampColor}
                onChange={(color) => updateDesign({ stamp: { ...design.stamp, color } })}
              />
              <ColorWell
                label={t("studio.textColor")}
                value={value.foreground_color}
                onChange={(color) => update({ foreground_color: color })}
              />
              <ColorWell
                label={t("studio.labelColor")}
                value={value.label_color}
                onChange={(color) => update({ label_color: color })}
              />
            </div>
          </div>

          <ChoiceGrid
            name="studio-pattern"
            legend={t("studio.patternLabel")}
            choices={patternChoices}
            value={pattern}
            onChange={(kind) => updateDesign({ pattern: kind })}
            columns={4}
            cellClassName="[&>span]:w-full"
          />
        </StudioPanel>

        {onUpload && (
          <StudioPanel title={t("studio.groups.logo")} hint={t("studio.logoHint")}>
            {uploadButton("logo", t("studio.uploadLogo"), images.logo)}
          </StudioPanel>
        )}

        {uploadError && (
          <p role="alert" className="rounded-xl bg-danger-bg px-4 py-3 text-sm text-danger">
            {uploadError}
          </p>
        )}

        <StudioDisclosure
          open={showAdvanced}
          onToggle={() => setShowAdvanced((v) => !v)}
          label={t("studio.groups.advanced")}
          hint={t("studio.groups.advancedHint")}
          icon={<ChevronDown size={18} />}
        >
          <LabelsEditor
            fields={design.fields ?? []}
            onChange={(fields) => updateDesign({ fields })}
          />

          {!simpleOnly && (
            <>
              <div className="flex flex-wrap gap-3">
                <StudioSelect
                  label={t("studio.languageLabel")}
                  value={design.default_language ?? "HE"}
                  onChange={(e) =>
                    updateDesign({ default_language: e.target.value as "HE" | "EN" })
                  }
                >
                  <option value="HE">{t("studio.languages.HE")}</option>
                  <option value="EN">{t("studio.languages.EN")}</option>
                </StudioSelect>
                <StudioSelect
                  label={t("studio.barcodeLabel")}
                  value={design.barcode?.format ?? "QR"}
                  onChange={(e) =>
                    updateDesign({
                      barcode: {
                        ...design.barcode,
                        format: e.target.value as NonNullable<DesignDoc["barcode"]>["format"],
                      },
                    })
                  }
                >
                  {["QR", "PDF417", "AZTEC", "CODE128"].map((format) => (
                    <option key={format} value={format}>
                      {format}
                    </option>
                  ))}
                </StudioSelect>
              </div>

              <StudioText
                label={t("studio.orgNameLabel")}
                hint={t("studio.orgNameHint")}
                value={design.organization_name ?? ""}
                onChange={(e) => updateDesign({ organization_name: e.target.value })}
              />

              {onUpload && (
                <div className="flex flex-col gap-2">
                  <StudioGroupLabel>{t("studio.artworkLabel")}</StudioGroupLabel>
                  <p className="text-xs text-ink-subtle">{t("studio.artworkHint")}</p>
                  <div className="mt-1 flex flex-col gap-2">
                    {uploadButton("strip_base", t("studio.uploadStripBase"), images.strip_base)}
                    {uploadButton("stamped_art", t("studio.uploadStampedArt"), images.stamped_art)}
                    {uploadButton(
                      "unstamped_art",
                      t("studio.uploadUnstampedArt"),
                      images.unstamped_art,
                    )}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <StudioGroupLabel>{t("studio.fieldsLabel")}</StudioGroupLabel>
                <FieldsEditor
                  fields={design.fields ?? []}
                  onChange={(fields) => updateDesign({ fields })}
                />
              </div>
            </>
          )}
        </StudioDisclosure>
      </div>
    </div>
  );
}
