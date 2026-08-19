import { useEffect, useRef, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import {
  CreditCard,
  Ellipsis,
  Palette,
  Printer,
  Stamp,
  Store,
  Users,
  X,
} from "lucide-react";
import { focusRing } from "../marketing/primitives";
import { cn } from "../../lib/cn";
import { GroupLabel } from "./primitives";

/**
 * Six destinations, in the two groups they actually fall into.
 *
 * The old header listed all six in one row of pills, which said they were
 * six equal things to keep an eye on. They are not: three of them are the
 * counter — what an owner reads between customers, possibly daily — and
 * three are setup, which is done once and then revisited when something
 * changes. Saying so is the difference between a dashboard you can scan and
 * a menu you have to read.
 *
 * `to` and `end` are exactly as they were. Nothing here changes a route.
 */
export const NAV_GROUPS = [
  {
    key: "counter",
    items: [
      { to: "/dashboard", end: true, key: "overview", Icon: Store },
      { to: "/dashboard/customers", end: false, key: "customers", Icon: Users },
      { to: "/dashboard/activity", end: false, key: "activity", Icon: Stamp },
    ],
  },
  {
    key: "setup",
    items: [
      { to: "/dashboard/design", end: false, key: "design", Icon: Palette },
      { to: "/dashboard/standee", end: false, key: "standee", Icon: Printer },
      { to: "/dashboard/billing", end: false, key: "billing", Icon: CreditCard },
    ],
  },
] as const;

export const SETUP_PATHS: readonly string[] = NAV_GROUPS[1].items.map(
  (item) => item.to,
);

const ROW_BASE =
  "inline-flex w-full min-h-[44px] items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors";

function NavRow({
  to,
  end,
  Icon,
  label,
  onClick,
}: {
  to: string;
  end: boolean;
  Icon: typeof Store;
  label: string;
  onClick?: () => void;
}) {
  return (
    <NavLink
      to={to}
      end={end}
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
  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto border-e border-border bg-surface px-4 py-5">
      {header}

      <nav aria-label={t("dashboard.nav.label")} className="flex flex-col gap-5">
        {NAV_GROUPS.map((group) => (
          <div key={group.key} className="flex flex-col gap-1">
            <GroupLabel className="px-3 pb-1">
              {t(`dashboard.groups.${group.key}`)}
            </GroupLabel>
            {group.items.map((item) => (
              <NavRow
                key={item.key}
                to={item.to}
                end={item.end}
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

/**
 * The phone's bar, at the bottom where the thumb is.
 *
 * Only the counter three get a tab. Setup lives behind "More" with the
 * account rows, because a tab bar stops being scannable at five and because
 * the three routes behind it are not things you reach for mid-shift.
 */
export function BottomBar({
  onMore,
  moreActive,
}: {
  onMore: () => void;
  moreActive: boolean;
}) {
  const { t } = useTranslation();
  return (
    <nav
      aria-label={t("dashboard.nav.label")}
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 backdrop-blur lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-lg items-stretch">
        {NAV_GROUPS[0].items.map((item) => (
          <li key={item.key} className="flex-1">
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex min-h-[56px] flex-col items-center justify-center gap-1 px-1 py-2 text-[0.6875rem] font-semibold transition-colors",
                  focusRing,
                  isActive ? "text-primary-text" : "text-ink-subtle",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.Icon
                    size={20}
                    aria-hidden
                    strokeWidth={isActive ? 2.4 : 1.8}
                  />
                  <span className="truncate">{t(`dashboard.nav.${item.key}`)}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
        <li className="flex-1">
          <button
            type="button"
            onClick={onMore}
            aria-haspopup="dialog"
            className={cn(
              "flex min-h-[56px] w-full flex-col items-center justify-center gap-1 px-1 py-2 text-[0.6875rem] font-semibold transition-colors",
              focusRing,
              moreActive ? "text-primary-text" : "text-ink-subtle",
            )}
          >
            <Ellipsis size={20} aria-hidden strokeWidth={moreActive ? 2.4 : 1.8} />
            <span>{t("dashboard.nav.more")}</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}

/** What "More" opens: the setup routes and the account rows, on a sheet that
 * comes up from the same edge the bar sits on. */
export function MoreSheet({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  const panel = useRef<HTMLDivElement>(null);
  const opener = useRef<Element | null>(null);

  useEffect(() => {
    if (!open) return;
    opener.current = document.activeElement;
    panel.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    // The sheet covers the page; letting the page behind it scroll under a
    // dragging thumb is the classic way to lose your place.
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
      (opener.current as HTMLElement | null)?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 lg:hidden">
      <button
        type="button"
        aria-label={t("dashboard.close")}
        onClick={onClose}
        className="absolute inset-0 bg-navy-deep/60 backdrop-blur-[2px]"
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={t("dashboard.nav.more")}
        tabIndex={-1}
        className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl border-t border-border bg-surface p-4 shadow-panel-lift outline-none animate-sheet-up"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 1rem)" }}
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border-strong" aria-hidden />
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className={cn(
              "inline-flex h-11 w-11 items-center justify-center rounded-xl text-ink-muted hover:bg-ink/[0.06] hover:text-ink",
              focusRing,
            )}
          >
            <X size={18} aria-hidden />
            <span className="sr-only">{t("dashboard.close")}</span>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/** The setup group, laid out for the sheet. */
export function SetupRows({ onNavigate }: { onNavigate: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-1">
      <GroupLabel className="px-3 pb-1">
        {t("dashboard.groups.setup")}
      </GroupLabel>
      {NAV_GROUPS[1].items.map((item) => (
        <NavRow
          key={item.key}
          to={item.to}
          end={item.end}
          Icon={item.Icon}
          label={t(`dashboard.nav.${item.key}`)}
          onClick={onNavigate}
        />
      ))}
    </div>
  );
}
