import type { RefObject } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Compass, Languages, LogOut, Shield } from "lucide-react";
import { useAuth } from "../../../auth/useAuth";
import { useBusiness } from "../../../business/useBusiness";
import { List, ListRow, SegmentedControl, Sheet } from "../../kit";
import { THEME_MODES, type ThemeMode } from "../../../theme/useDashboardTheme";
import { personName } from "./personName";

/**
 * Everything about the person rather than the shop, opened from the phone
 * bar's fifth slot (directly for staff, from More's person row for everyone
 * else) or from the foot of a rail.
 *
 * It starts with who is signed in, because a shared phone at a counter is
 * passed from hand to hand. Then how the dashboard looks, the other
 * language, the tour again, PunchMe's own admin for PunchMe staff, and the
 * way out.
 */
export function AccountSheet({
  open,
  onClose,
  returnFocus,
  mode,
  onModeChange,
  onShowTour,
  onSignOut,
}: {
  open: boolean;
  onClose: () => void;
  returnFocus?: RefObject<HTMLElement>;
  mode: ThemeMode;
  onModeChange: (mode: ThemeMode) => void;
  onShowTour: () => void;
  onSignOut: () => void;
}) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { role } = useBusiness();
  const other = i18n.resolvedLanguage === "he" ? "en" : "he";
  return (
    <Sheet open={open} onClose={onClose} title={t("dashboard.groups.account")} returnFocus={returnFocus}>
      <div className="flex flex-col gap-6">
        <p className="type-body text-ink">
          <Trans
            i18nKey="dashboard.account.signedInAs"
            values={{ name: personName(user), role: role ? t(`team.role.${role}`) : "" }}
            components={{ who: <bdi className="font-semibold" /> }}
          />
        </p>

        {/* Day, night, or whatever the device is doing: a shop is bright at
            noon and dark at closing, and Automatic stays the default. The
            stored values don't change; only their names do. Selected is
            drawn in ink, never coral. */}
        <div className="flex flex-col gap-2">
          <SegmentedControl
            label={t("dashboard.theme.label")}
            options={THEME_MODES.map((value) => ({ value, label: t(`dashboard.theme.${value}`) }))}
            value={mode}
            onChange={onModeChange}
          />
          <p className="text-sm text-ink-muted">{t("dashboard.theme.hint")}</p>
        </div>

        <List className="-mx-6 border-y border-border">
          <ListRow
            onClick={() => void i18n.changeLanguage(other)}
            leading={<Languages aria-hidden className="size-5 text-ink-muted" />}
            // The other language's own name, in its own language.
            title={<span lang={other}>{t("language.switch")}</span>}
          />
          <ListRow
            onClick={onShowTour}
            leading={<Compass aria-hidden className="size-5 text-ink-muted" />}
            title={t("tour.replay")}
          />
          {user?.is_staff && (
            <ListRow
              to="/admin"
              leading={<Shield aria-hidden className="size-5 text-ink-muted" />}
              title={t("admin.title")}
              chevron
            />
          )}
          <ListRow
            onClick={onSignOut}
            leading={<LogOut aria-hidden className="size-5 text-ink-muted rtl:-scale-x-100" />}
            title={t("dashboard.nav.signOut")}
          />
        </List>
      </div>
    </Sheet>
  );
}
