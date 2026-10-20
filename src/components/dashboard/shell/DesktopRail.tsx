import { useId } from "react";
import { useTranslation } from "react-i18next";
import { Link, NavLink } from "react-router-dom";
import { useBusiness } from "../../../business/useBusiness";
import { focusRing } from "../../kit";
import { cn } from "../../../lib/cn";
import { visibleGroups, type NavGroup, type NavItem } from "../navigation";
import { Identity } from "./Identity";
import { PersonRow } from "./Person";
import logo from "../../../assets/logo.png";

/**
 * The desk's rail, from 1280px: 272px at the start edge, lit acrylic with a
 * hairline at its end edge, and short enough for an 860px screen with room
 * to spare.
 *
 * Its head is the wordmark, which leads to the dashboard rather than out to
 * the landing page, then the shop's sign with its name and, on Free, the
 * plan's state. Then every group the viewer can open, under its name, and
 * at the foot one row for the person, which opens the account sheet.
 *
 * Scan is the Counter group's first row and an ordinary one: a desk is not
 * the counter. The wordmark stays today's logo until the logo is decided,
 * so the product never shows two.
 */
export function DesktopRail({
  frame,
  switchOn,
  accountOpen,
  onAccount,
  className,
}: {
  frame: string;
  switchOn: boolean;
  accountOpen: boolean;
  onAccount: () => void;
  className?: string;
}) {
  const { t } = useTranslation();
  const { role } = useBusiness();
  return (
    <div
      className={cn(
        frame,
        "flex h-dvh w-[17rem] flex-col gap-6 overflow-y-auto border-e border-border bg-surface px-4 py-5 text-ink",
        className,
      )}
    >
      <div className="flex flex-col gap-3">
        <Link
          to="/dashboard"
          className={cn("inline-flex min-h-11 w-fit items-center rounded-field", focusRing)}
        >
          <img src={logo} alt={t("app.name")} className="logo-mark h-7 w-auto" />
        </Link>
        <Identity layout="stack" switchOn={switchOn} />
      </div>

      <nav aria-label={t("dashboard.nav.label")} className="flex flex-col gap-5">
        {visibleGroups(role).map((group) => (
          <RailGroup key={group.key} group={group} />
        ))}
      </nav>

      <div className="mt-auto">
        <PersonRow onClick={onAccount} expanded={accountOpen} />
      </div>
    </div>
  );
}

/** A group under its name in Assistant 600 at 14px, ink-muted, with no
 * uppercase and no tracking, since Hebrew has neither. Named to a screen
 * reader as a group rather than set as a heading, so the page's own h1
 * stays the first heading. */
function RailGroup({ group }: { group: NavGroup }) {
  const { t } = useTranslation();
  const id = useId();
  return (
    <div role="group" aria-labelledby={id} className="flex flex-col gap-0.5">
      <p id={id} className="type-label px-3 pb-1 text-ink-muted">
        {t(`dashboard.groups.${group.key}`)}
      </p>
      {group.items.map((item) => (
        <RailRow key={item.key} item={item} label={t(`dashboard.nav.${item.key}`)} />
      ))}
    </div>
  );
}

/** A 44px row: a 20px icon and the word in Rubik 500 at 16px. The current
 * row is ink with a 2px ink rule at its start edge, lit at once; the rest
 * are ink-muted. */
function RailRow({ item, label }: { item: NavItem; label: string }) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      data-tour={`nav-${item.key}`}
      className={({ isActive }) =>
        cn(
          "relative flex min-h-11 items-center gap-3 rounded-field px-3 font-heading text-base font-medium transition-colors duration-gentle ease-out",
          focusRing,
          isActive ? "text-ink" : "text-ink-muted hover-fine:bg-ink/5 hover-fine:text-ink",
        )
      }
    >
      {({ isActive }) => (
        <>
          <span
            aria-hidden
            className={cn("absolute inset-y-2.5 start-0 w-0.5 rounded-e-full bg-ink", !isActive && "opacity-0")}
          />
          <item.Icon aria-hidden className="size-5 shrink-0" strokeWidth={isActive ? 2.25 : 1.75} />
          <span className="truncate">{label}</span>
        </>
      )}
    </NavLink>
  );
}
