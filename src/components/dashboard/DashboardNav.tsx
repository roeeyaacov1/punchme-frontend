import { useEffect, useRef, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import { Store, X } from "lucide-react";
import { useBusiness } from "../../business/useBusiness";
import { focusRing } from "../marketing/primitives";
import { cn } from "../../lib/cn";
import { GroupLabel } from "./primitives";
import { moreGroups, visibleGroups } from "./navigation";

/**
 * What is left of the old frame: the desktop rail and the More sheet, both
 * built from `NAV_GROUPS` in `navigation.ts`. Each goes as its replacement
 * in `shell/` lands.
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

/** The viewer's More groups, laid out for the sheet: everything they can
 * open that the bar doesn't carry. */
export function SetupRows({ onNavigate }: { onNavigate: () => void }) {
  const { t } = useTranslation();
  const { role } = useBusiness();
  return (
    <div className="flex flex-col gap-4">
      {moreGroups(role).map((group) => (
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
              onClick={onNavigate}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
