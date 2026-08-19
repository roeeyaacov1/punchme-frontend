import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { ChoiceGrid } from "../../../components/onboarding/ChoiceGrid";
import { StepShell } from "../../../components/onboarding/StepShell";
import { ColorField } from "../../../components/ui";
import { focusRing } from "../../../components/marketing/primitives";
import { relatedAccents } from "../../../lib/accentPalette";
import { cn } from "../../../lib/cn";
import { normalizeHex, readableInk } from "../../../lib/color";
import { useOnboardingDraft } from "../useOnboardingDraft";
import { swatch } from "./swatch";

type TextMode = "auto" | "white" | "black" | "custom";

function modeFor(foreground: string | null): TextMode {
  if (foreground === null) return "auto";
  if (foreground === "#FFFFFF") return "white";
  if (foreground === "#000000") return "black";
  return "custom";
}

export function AccentStep() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { draft, resolved, update } = useOnboardingDraft();

  const accents = useMemo(() => relatedAccents(resolved.background), [resolved.background]);
  const current = resolved.accent;
  const isOffered = accents.includes(current);
  const autoInk = readableInk(resolved.background);

  const [textMode, setTextMode] = useState<TextMode>(() => modeFor(draft.foreground));
  const [advancedOpen, setAdvancedOpen] = useState(textMode !== "auto" || !isOffered);

  const choices = accents.map((hex, i) => ({
    value: hex,
    label: t("onboarding.accent.swatchLabel", { n: i + 1, hex }),
    render: (selected: boolean) => swatch(hex, selected),
  }));

  const textChoices: Array<{ value: TextMode; label: string; preview: string }> = [
    { value: "auto", label: t("onboarding.accent.textAuto"), preview: autoInk },
    { value: "white", label: t("onboarding.accent.textWhite"), preview: "#FFFFFF" },
    { value: "black", label: t("onboarding.accent.textBlack"), preview: "#000000" },
    { value: "custom", label: t("onboarding.accent.textCustom"), preview: resolved.foreground },
  ];

  function chooseText(mode: TextMode) {
    setTextMode(mode);
    if (mode === "auto") update({ foreground: null });
    else if (mode === "white") update({ foreground: "#FFFFFF" });
    else if (mode === "black") update({ foreground: "#000000" });
    else update({ foreground: resolved.foreground });
  }

  return (
    <StepShell
      title={t("onboarding.accent.title")}
      onBack={() => navigate("/onboarding/color")}
      onNext={() => {
        update({ accent: current });
        navigate("/onboarding/stamp");
      }}
    >
      <ChoiceGrid
        name="accent"
        legend={t("onboarding.accent.gridLabel")}
        legendHidden
        choices={choices}
        value={isOffered ? current : null}
        onChange={(hex) => update({ accent: hex })}
        columns={4}
      />

      <div>
        <button
          type="button"
          onClick={() => setAdvancedOpen((open) => !open)}
          aria-expanded={advancedOpen}
          className={cn(
            "-ms-1 inline-flex min-h-[44px] items-center gap-1 rounded-lg px-1 text-sm font-semibold text-primary-text hover:underline",
            focusRing,
          )}
        >
          {t("onboarding.accent.advanced")}
          <ChevronDown
            size={16}
            aria-hidden="true"
            className={cn("transition-transform", advancedOpen && "rotate-180")}
          />
        </button>

        {advancedOpen && (
          <div className="mt-2 flex flex-col gap-4 rounded-xl border border-border bg-background/50 p-4">
            <fieldset>
              <legend className="mb-2 text-sm font-medium text-ink">
                {t("onboarding.accent.textColorLabel")}
              </legend>
              <div className="flex flex-wrap gap-2">
                {textChoices.map((choice) => {
                  const selected = textMode === choice.value;
                  return (
                    <label
                      key={choice.value}
                      className={cn(
                        "inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors",
                        selected
                          ? "border-ink bg-navy-deep text-white"
                          : "border-border-strong bg-surface text-ink hover:bg-background",
                        "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary-text has-[:focus-visible]:ring-offset-2",
                      )}
                    >
                      <input
                        type="radio"
                        name="text-colour"
                        value={choice.value}
                        checked={selected}
                        onChange={() => chooseText(choice.value)}
                        className="sr-only"
                      />
                      <span
                        aria-hidden="true"
                        className="h-4 w-4 rounded-full ring-1 ring-border-strong"
                        style={{ backgroundColor: choice.preview }}
                      />
                      {choice.label}
                    </label>
                  );
                })}
              </div>
            </fieldset>

            {textMode === "custom" && (
              <div className="max-w-xs">
                <ColorField
                  label={t("onboarding.accent.textColorLabel")}
                  value={resolved.foreground}
                  onChange={(hex) => {
                    const next = normalizeHex(hex);
                    if (next) update({ foreground: next });
                  }}
                />
              </div>
            )}

            <div className="max-w-xs">
              <ColorField
                label={t("onboarding.accent.customAccent")}
                value={current}
                onChange={(hex) => {
                  const next = normalizeHex(hex);
                  if (next) update({ accent: next });
                }}
              />
            </div>
          </div>
        )}
      </div>
    </StepShell>
  );
}
