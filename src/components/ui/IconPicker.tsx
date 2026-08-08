import { useTranslation } from "react-i18next";
import { cn } from "../../lib/cn";
import { STAMP_ICON_KEYS, STAMP_ICONS } from "../../lib/stampIcons";

interface IconPickerProps {
  label?: string;
  value?: string;
  onChange: (key: string) => void;
}

/** Radiogroup of preset stamp icons — stamps render as this icon instead of
 * a plain filled circle in `WalletCardPreview` when a value is set. */
export function IconPicker({ label, value, onChange }: IconPickerProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-1.5 text-start">
      {label && <p className="text-sm font-medium text-navy font-body">{label}</p>}
      <div role="radiogroup" className="flex flex-wrap gap-2">
        {STAMP_ICON_KEYS.map((key) => {
          const Icon = STAMP_ICONS[key];
          const isSelected = value === key;
          const iconLabel = t(`onboarding.design.stampIcons.${key}`);
          return (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={iconLabel}
              title={iconLabel}
              onClick={() => onChange(key)}
              className={cn(
                "h-10 w-10 rounded-xl border flex items-center justify-center transition-colors",
                isSelected
                  ? "bg-navy text-white border-navy"
                  : "border-navy/15 text-navy hover:bg-navy/5",
              )}
            >
              <Icon size={18} strokeWidth={2} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
