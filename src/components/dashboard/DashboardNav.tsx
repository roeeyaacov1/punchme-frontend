import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import { Store } from "lucide-react";
import { useBusiness } from "../../business/useBusiness";
import { focusRing } from "../marketing/primitives";
import { cn } from "../../lib/cn";
import { GroupLabel } from "./primitives";
import { visibleGroups } from "./navigation";

/**
 * What is left of the old frame: the desktop rail, built from `NAV_GROUPS`
 * in `navigation.ts`. It goes when the new rails in `shell/` land.
 */

const ROW_BASE =
  "inline-flex w-full min-h-[44px] items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors";

function NavRow({
  to,
  end,
  tour,
  Icon,
  label,
  onClick,
}: {
  to: string;
  end: boolean;
  /** What the tour calls this door. Both this row and its twin in the tab
   * bar carry it; only one of the two is ever on screen, and the tour takes
   * whichever measures. See `components/tour/steps.ts`. */
  tour: string;
  Icon: typeof Store;
  label: string;
  onClick?: () => void;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      data-tour={tour}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          ROW_BASE,
          focusRing,
          isActive
            ? "bg-primary/10 text-primary-text"
            : "text-ink-muted hover:bg-ink/[0.06] hover:text-ink",
        )
      }
    >
      {({ isActive }) => (
        <>
          {/* The active row is marked at the start edge, not by a filled
              pill: at a glance you are looking for where you are, and a rule
              in the margin reads faster than a change of ground. */}
          <span
            aria-hidden
            className={cn(
              "h-5 w-0.5 rounded-full transition-colors",
              isActive ? "bg-primary" : "bg-transparent",
            )}
          />
          <Icon size={17} aria-hidden className="shrink-0" />
          <span className="truncate">{label}</span>
        </>
      )}
    </NavLink>
  );
}

/** The desktop rail. Its own <nav> so a screen reader can skip the whole
 * thing in one move. */
export function SidebarNav({
  header,
  footer,
}: {
  header: ReactNode;
  footer: ReactNode;
}) {
  const { t } = useTranslation();
  const { role } = useBusiness();
  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto border-e border-border bg-surface px-4 py-5">
      {header}

      <nav aria-label={t("dashboard.nav.label")} className="flex flex-col gap-5">
        {visibleGroups(role).map((group) => (
          <div key={group.key} className="flex flex-col gap-1">
            <GroupLabel className="px-3 pb-1">
              {t(`dashboard.groups.${group.key}`)}
            </GroupLabel>
            {group.items.map((item) => (
              <NavRow
                key={item.key}
                to={item.to}
                end={item.end}
                tour={`nav-${item.key}`}
                Icon={item.Icon}
                label={t(`dashboard.nav.${item.key}`)}
              />
            ))}
          </div>
        ))}
      </nav>

      <div className="mt-auto pt-4">{footer}</div>
    </div>
  );
}
