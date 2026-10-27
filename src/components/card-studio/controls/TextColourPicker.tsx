import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChoiceTiles, type Tile } from "./ChoiceTiles";
import { ColourPickerPanel } from "./ColourPickerPanel";
import { automaticText, textModeOf, type TextMode } from "./controlRules";

/**
 * The colour the card sets its words in: automatic (black or white by the
 * card's own luminance), white, black, or one's own. `null` is automatic,
 * as onboarding's draft keeps it; a page that stores a hex maps it.
 */
export function TextColourPicker({
  background,
  value,
  onChange,
}: {
  background: string;
  value: string | null;
  onChange: (next: string | null) => void;
}) {
  const { t } = useTranslation();
  const [customOpen, setCustomOpen] = useState(() => textModeOf(value) === "custom");
  const mode: TextMode = customOpen ? "custom" : textModeOf(value);
  const shown = value ?? automaticText(background);

  const dot = (hex: string) => (
    <span aria-hidden className="size-4 shrink-0 rounded-full ring-1 ring-inset ring-field" style={{ backgroundColor: hex }} />
  );
  const options: { value: TextMode; label: string; hex: string }[] = [
    { value: "auto", label: t("onboarding.accent.textAuto"), hex: automaticText(background) },
    { value: "white", label: t("onboarding.accent.textWhite"), hex: "#FFFFFF" },
    { value: "black", label: t("onboarding.accent.textBlack"), hex: "#000000" },
    { value: "custom", label: t("onboarding.accent.textCustom"), hex: shown },
  ];
  const tiles: Tile<TextMode>[] = options.map((option) => ({
    value: option.value,
    label: option.label,
    render: () => (
      <span className="flex items-center gap-2 px-4 type-label text-ink">
        {dot(option.hex)}
        {option.label}
      </span>
    ),
  }));

  return (
    <div className="flex flex-col gap-4">
      <ChoiceTiles
        legend={t("onboarding.accent.textColorLabel")}
        tiles={tiles}
        value={mode}
        shape="pill"
        listClassName="gap-2"
        onChange={(next) => {
          setCustomOpen(next === "custom");
          if (next === "auto") onChange(null);
          else if (next === "white") onChange("#FFFFFF");
          else if (next === "black") onChange("#000000");
          else onChange(shown);
        }}
      />
      {mode === "custom" && (
        <ColourPickerPanel label={t("onboarding.accent.textColorLabel")} value={shown} onChange={onChange} />
      )}
    </div>
  );
}
