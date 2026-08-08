import { useTranslation } from "react-i18next";
import { cn } from "../../lib/cn";
import { HERO_BACKGROUNDS, HERO_BACKGROUND_KEYS, isPresetHeroBackground } from "../../lib/heroBackgrounds";

interface BackgroundPickerProps {
  label?: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  onUploadClick?: () => void;
  isUploading?: boolean;
}

/** "None" + themed gradient presets + an upload trigger for a custom image.
 * `value` is either "" (none), a preset key, or an uploaded image URL. */
export function BackgroundPicker({
  label,
  hint,
  value,
  onChange,
  onUploadClick,
  isUploading,
}: BackgroundPickerProps) {
  const { t } = useTranslation();
  const isCustomUpload = value !== "" && !isPresetHeroBackground(value);

  return (
    <div className="flex flex-col gap-1.5 text-start">
      {label && <p className="text-sm font-medium text-navy font-body">{label}</p>}
      {hint && <p className="text-xs text-slate">{hint}</p>}
      <div role="radiogroup" className="flex flex-wrap gap-2">
        <button
          type="button"
          role="radio"
          aria-checked={value === ""}
          onClick={() => onChange("")}
          className={cn(
            "h-12 w-16 rounded-lg border flex items-center justify-center text-xs font-body transition-colors",
            value === ""
              ? "border-navy bg-navy/5 text-navy"
              : "border-navy/15 text-slate hover:bg-navy/5",
          )}
        >
          {t("onboarding.design.heroBackgroundNone")}
        </button>
        {HERO_BACKGROUND_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={value === key}
            title={t(`onboarding.design.heroBackgrounds.${key}`)}
            onClick={() => onChange(key)}
            style={{ background: HERO_BACKGROUNDS[key] }}
            className={cn(
              "h-12 w-16 rounded-lg border-2 transition-colors",
              value === key ? "border-navy" : "border-transparent",
            )}
          />
        ))}
        {onUploadClick && (
          <button
            type="button"
            onClick={onUploadClick}
            disabled={isUploading}
            className={cn(
              "h-12 w-16 rounded-lg border border-dashed flex items-center justify-center text-xs font-body transition-colors",
              isCustomUpload
                ? "border-navy bg-navy/5 text-navy"
                : "border-navy/25 text-slate hover:bg-navy/5",
            )}
          >
            {t("onboarding.design.heroBackgroundUpload")}
          </button>
        )}
      </div>
    </div>
  );
}
