import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Languages, LogOut, Monitor, Moon, Shield, Sun } from "lucide-react";
import { focusRing } from "../marketing/primitives";
import { cn } from "../../lib/cn";
import { THEME_MODES, type ThemeMode } from "../../theme/useDashboardTheme";
import { GroupLabel } from "./primitives";

const MODE_ICONS: Record<ThemeMode, typeof Sun> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

/**
 * Light, dark, or whatever the phone is already doing.
 *
 * Three buttons rather than a switch, because a two-state switch has no way
 * to say "follow the device" and that is the setting most people want — a
 * shop is bright at noon and dark at closing, and the owner should not have
 * to come here twice a day.
 */
export function ThemeChoice({
  mode,
  onChange,
  className,
}: {
  mode: ThemeMode;
  onChange: (mode: ThemeMode) => void;
  className?: string;
}) {
  const { t } = useTranslation();
  return (
    <div
      role="group"
      aria-label={t("dashboard.theme.label")}
      className={cn(
        "inline-flex rounded-xl border border-border bg-background p-1",
        className,
      )}
    >
      {THEME_MODES.map((value) => {
        const Icon = MODE_ICONS[value];
        const active = mode === value;
        return (
          <button
            key={value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(value)}
            className={cn(
              "inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-lg px-3 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-on"
                : "text-ink-muted hover:text-ink",
              focusRing,
            )}
          >
            <Icon size={15} aria-hidden />
            {t(`dashboard.theme.${value}`)}
          </button>
        );
      })}
    </div>
  );
}

const ROW =
  "inline-flex w-full min-h-[44px] items-center gap-3 rounded-xl px-3 text-sm font-medium text-ink-muted transition-colors hover:bg-ink/[0.06] hover:text-ink";

/**
 * Everything that is about the account rather than about the shop: the
 * appearance choice, the language, the staff door, and the way out. Rendered
 * once and placed twice — the foot of the desktop sidebar, and the mobile
 * sheet — so the two can never drift.
 */
export function AccountControls({
  mode,
  onModeChange,
  isStaff,
  onSignOut,
  onNavigate,
}: {
  mode: ThemeMode;
  onModeChange: (mode: ThemeMode) => void;
  isStaff: boolean;
  onSignOut: () => void;
  /** Closes the mobile sheet when a row inside it navigates. */
  onNavigate?: () => void;
}) {
  const { t, i18n } = useTranslation();
  return (
    <div className="flex flex-col gap-2">
      <GroupLabel className="px-3">{t("dashboard.groups.account")}</GroupLabel>

      <ThemeChoice mode={mode} onChange={onModeChange} className="w-full" />

      <button
        type="button"
        onClick={() =>
          i18n.changeLanguage(i18n.resolvedLanguage === "he" ? "en" : "he")
        }
        className={cn(ROW, focusRing)}
      >
        <Languages size={16} aria-hidden />
        {t("language.switch")}
      </button>

      {isStaff && (
        <Link to="/admin" onClick={onNavigate} className={cn(ROW, focusRing)}>
          <Shield size={16} aria-hidden />
          {t("admin.title")}
        </Link>
      )}

      <button type="button" onClick={onSignOut} className={cn(ROW, focusRing)}>
        <LogOut size={16} aria-hidden className="rtl:-scale-x-100" />
        {t("dashboard.nav.signOut")}
      </button>
    </div>
  );
}
