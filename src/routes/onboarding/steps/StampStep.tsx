import { useRef, useState, type ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ImagePlus } from "lucide-react";
import { ChoiceGrid } from "../../../components/onboarding/ChoiceGrid";
import { StepShell } from "../../../components/onboarding/StepShell";
import { focusRing } from "../../../components/marketing/primitives";
import { cn } from "../../../lib/cn";
import {
  EMOJI_STAMPS,
  emojiToPngDataUrl,
  fileToStampDataUrl,
  hashDataUrl,
  singleGrapheme,
} from "../../../lib/stampArt";
import { STAMP_GLYPH_NAMES, STAMP_GLYPHS } from "../../../lib/stampGlyphs";
import { useOnboardingDraft } from "../useOnboardingDraft";
import type { StampChoice } from "../draft";

type Tab = "icons" | "emoji" | "image";
const TABS: Tab[] = ["icons", "emoji", "image"];

function tabFor(stamp: StampChoice): Tab {
  return stamp.kind === "glyph" ? "icons" : stamp.kind;
}

export function StampStep() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { resolved, update, setArt, artPersisted, artUrl } =
    useOnboardingDraft();
  const [tab, setTab] = useState<Tab>(() => tabFor(resolved.stamp));
  const [typed, setTyped] = useState("");
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const stamp = resolved.stamp;
  // A picture stamp whose picture is gone (a full localStorage, a reload)
  // has to be picked again before Next.
  const artMissing = stamp.kind !== "glyph" && !artUrl;

  function chooseGlyph(glyph: string) {
    setError(null);
    update({ stamp: { kind: "glyph", glyph } });
  }

  function chooseEmoji(emoji: string) {
    setError(null);
    let dataUrl: string;
    try {
      dataUrl = emojiToPngDataUrl(emoji);
    } catch {
      setError(t("onboarding.stamp.uploadUnreadable"));
      return;
    }
    const hash = hashDataUrl(dataUrl);
    const persisted = setArt({ hash, dataUrl });
    setNote(persisted ? null : t("onboarding.stamp.artMemoryOnly"));
    update({ stamp: { kind: "emoji", emoji, hash } });
  }

  function handleTyped(value: string) {
    setTyped(value);
    const one = singleGrapheme(value);
    if (!one) {
      if (value.trim()) setError(t("onboarding.stamp.emojiInvalid"));
      return;
    }
    chooseEmoji(one);
  }

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);
    try {
      const dataUrl = await fileToStampDataUrl(file);
      const hash = hashDataUrl(dataUrl);
      const persisted = setArt({ hash, dataUrl });
      setNote(persisted ? null : t("onboarding.stamp.artMemoryOnly"));
      update({ stamp: { kind: "image", hash } });
    } catch (err) {
      setError(
        err instanceof Error && err.message === "too large"
          ? t("onboarding.stamp.uploadTooLarge")
          : t("onboarding.stamp.uploadUnreadable"),
      );
    }
  }

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

  const emojiChoices = EMOJI_STAMPS.map((emoji) => ({
    value: emoji,
    label: emoji,
    render: (selected: boolean) => (
      <span
        className={cn(
          "flex h-11 w-11 items-center justify-center rounded-full text-2xl leading-none ring-offset-2 ring-offset-surface",
          selected
            ? "bg-navy-deep ring-2 ring-ink"
            : "bg-background ring-1 ring-border-strong/70",
        )}
      >
        {emoji}
      </span>
    ),
  }));

  const selectedEmoji =
    stamp.kind === "emoji" && EMOJI_STAMPS.includes(stamp.emoji)
      ? stamp.emoji
      : null;

  return (
    <StepShell
      title={t("onboarding.stamp.title")}
      subtitle={t("onboarding.stamp.subtitle")}
      onBack={() => navigate("/onboarding/accent")}
      onNext={() => {
        update({ stamp });
        navigate("/onboarding/reward");
      }}
      nextDisabled={artMissing}
      error={error}
    >
      <div
        role="tablist"
        aria-label={t("onboarding.stamp.title")}
        className="flex rounded-lg border border-border bg-surface p-0.5"
      >
        {TABS.map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            id={`stamp-tab-${key}`}
            aria-selected={tab === key}
            aria-controls={`stamp-panel-${key}`}
            onClick={() => setTab(key)}
            className={cn(
              "min-h-[40px] flex-1 rounded-md px-2 text-sm font-semibold transition-colors",
              tab === key
                ? "bg-navy-deep text-white"
                : "text-ink-muted hover:text-ink",
              focusRing,
            )}
          >
            {t(`onboarding.stamp.tabs.${key}`)}
          </button>
        ))}
      </div>

      {artMissing && (
        <p className="text-sm font-medium text-red-700">
          {t("onboarding.stamp.artMissing")}
        </p>
      )}
      {note && !artMissing && <p className="text-sm text-ink-muted">{note}</p>}
      {!artPersisted && !note && stamp.kind !== "glyph" && (
        <p className="text-sm text-ink-muted">
          {t("onboarding.stamp.artMemoryOnly")}
        </p>
      )}

      {tab === "icons" && (
        <div
          role="tabpanel"
          id="stamp-panel-icons"
          aria-labelledby="stamp-tab-icons"
        >
          <ChoiceGrid
            name="glyph"
            legend={t("onboarding.stamp.gridLabel")}
            legendHidden
            choices={glyphChoices}
            value={stamp.kind === "glyph" ? stamp.glyph : null}
            onChange={chooseGlyph}
            columns={4}
            smColumns={8}
          />
        </div>
      )}

      {tab === "emoji" && (
        <div
          role="tabpanel"
          id="stamp-panel-emoji"
          aria-labelledby="stamp-tab-emoji"
          className="flex flex-col gap-4"
        >
          <ChoiceGrid
            name="emoji"
            legend={t("onboarding.stamp.emojiGridLabel")}
            legendHidden
            choices={emojiChoices}
            value={selectedEmoji}
            onChange={chooseEmoji}
            columns={6}
            smColumns={8}
          />
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="emoji-typed"
              className="text-sm font-medium text-ink"
            >
              {t("onboarding.stamp.emojiInputLabel")}
            </label>
            <input
              id="emoji-typed"
              type="text"
              inputMode="text"
              autoComplete="off"
              value={typed}
              onChange={(e) => handleTyped(e.target.value)}
              className={cn(
                "w-24 rounded-lg border border-border-strong bg-surface px-3 py-2 text-center text-2xl leading-none",
                focusRing,
              )}
            />
            <p className="text-xs text-ink-subtle">
              {t("onboarding.stamp.emojiHint")}
            </p>
          </div>
        </div>
      )}

      {tab === "image" && (
        <div
          role="tabpanel"
          id="stamp-panel-image"
          aria-labelledby="stamp-tab-image"
          className="flex flex-col gap-3"
        >
          <div className="flex items-center gap-4">
            <span
              aria-hidden="true"
              className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-background ring-1 ring-border-strong/70"
            >
              {stamp.kind === "image" && artUrl ? (
                <img
                  src={artUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <ImagePlus size={24} className="text-ink-subtle" />
              )}
            </span>
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                className={cn(
                  "inline-flex min-h-[44px] items-center justify-center rounded-lg border border-border-strong bg-surface px-4 text-sm font-semibold text-ink hover:bg-background",
                  focusRing,
                )}
              >
                {stamp.kind === "image" && artUrl
                  ? t("onboarding.stamp.uploadReplace")
                  : t("onboarding.stamp.uploadCta")}
              </button>
              <p className="text-xs text-ink-subtle">
                {t("onboarding.stamp.uploadHint")}
              </p>
            </div>
            <input
              ref={fileInput}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif,image/bmp"
              onChange={handleFile}
              className="sr-only"
              tabIndex={-1}
              aria-hidden="true"
            />
          </div>
        </div>
      )}
    </StepShell>
  );
}
