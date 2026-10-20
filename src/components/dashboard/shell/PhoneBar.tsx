import type { Ref } from "react";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import { CircleUserRound, Ellipsis, type LucideIcon } from "lucide-react";
import { useBusiness } from "../../../business/useBusiness";
import { focusRingInset } from "../../kit";
import { cn } from "../../../lib/cn";
import { barItems, type NavItem } from "../navigation";
import { ScanCircle } from "./ScanCircle";

/** What the fifth slot opens: More for a manager or an owner, the account
 * for staff, whose More would hold nothing but account rows. */
export type FifthSlot = "more" | "account";

/**
 * The phone's bar, at the bottom where the thumb is: the counter, the same
 * four pages for every role with Scan in the middle, and a fifth slot that
 * is the role's. No slot is ever empty.
 *
 * Lit acrylic with a hairline along its top: no blur, no shadow. A tab is an
 * icon over its word, the current one in ink with a 2px ink rule along the
 * bar's top edge above it, appearing at once rather than sliding. A press
 * puts an ink well behind the icon for 120ms; nothing else moves, because
 * this is used dozens of times a day.
 *
 * Its controls never open the long-press callout and never select text, and
 * `touch-manipulation` takes the double-tap zoom's wait off every tap. Hover
 * only where a pointer hovers.
 */
export function PhoneBar({
  frame,
  fifth,
  fifthRef,
  fifthOpen,
  fifthLit,
  onFifth,
  className,
}: {
  /** The frame's theme classes, from `useDashboardTheme`. */
  frame: string;
  fifth: FifthSlot;
  /** Where focus comes back to when the account sheet was reached through
   * More, whose own row is gone by the time it closes. */
  fifthRef?: Ref<HTMLButtonElement>;
  /** The sheet the fifth slot opens is showing. */
  fifthOpen: boolean;
  /** The page on screen is one the More sheet holds. */
  fifthLit: boolean;
  onFifth: () => void;
  className?: string;
}) {
  const { t } = useTranslation();
  const { role } = useBusiness();
  return (
    <nav
      aria-label={t("dashboard.nav.label")}
      className={cn(
        frame,
        "fixed inset-x-0 bottom-0 z-30 touch-manipulation select-none border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] text-ink [-webkit-touch-callout:none]",
        className,
      )}
    >
      <ul className="flex h-16 items-stretch">
        {barItems(role).map((item) => (
          <li key={item.key} className="relative flex min-w-0 flex-1 basis-0">
            {item.key === "scan" ? <ScanTab item={item} /> : <Tab item={item} />}
          </li>
        ))}
        <li className="relative flex min-w-0 flex-1 basis-0">
          <button
            ref={fifthRef}
            type="button"
            onClick={onFifth}
            aria-haspopup="dialog"
            aria-expanded={fifthOpen}
            className={tabClasses(fifthLit)}
          >
            <TabFace
              Icon={fifth === "more" ? Ellipsis : CircleUserRound}
              label={t(fifth === "more" ? "dashboard.nav.more" : "dashboard.groups.account")}
              current={fifthLit}
            />
          </button>
        </li>
      </ul>
    </nav>
  );
}

function tabClasses(current: boolean) {
  return cn(
    "group flex h-16 w-full min-w-0 flex-col items-center justify-end gap-0.5 pb-1 [-webkit-tap-highlight-color:transparent]",
    focusRingInset,
    current ? "text-ink" : "text-ink-muted hover-fine:text-ink",
  );
}

function Tab({ item }: { item: NavItem }) {
  const { t } = useTranslation();
  return (
    <NavLink
      to={item.to}
      end={item.end}
      data-tour={`nav-${item.key}`}
      className={({ isActive }) => tabClasses(isActive)}
    >
      {({ isActive }) => (
        <TabFace Icon={item.Icon} label={t(`dashboard.nav.${item.key}`)} current={isActive} />
      )}
    </NavLink>
  );
}

/** Icon over word, and the rule at the bar's top edge for the current one. */
function TabFace({ Icon, label, current }: { Icon: LucideIcon; label: string; current: boolean }) {
  return (
    <>
      <span
        aria-hidden
        className={cn("absolute inset-x-3 top-0 h-0.5 rounded-b-full bg-ink", !current && "opacity-0")}
      />
      <span
        aria-hidden
        className="flex h-8 w-14 items-center justify-center rounded-full transition-colors duration-press ease-out group-active:bg-ink/[0.06]"
      >
        <Icon className="size-6" strokeWidth={current ? 2.25 : 1.75} />
      </span>
      <span className="type-tag w-full truncate px-1 text-center">{label}</span>
    </>
  );
}

/**
 * Scan: a 56px coral circle raised 16px out of the bar, inside a 4px ring
 * of the bar's own ground, so it reads as cut out of the bar rather than
 * floating over it. No halo and no shadow. Its word sits in the bar's word
 * row under it, so the one control used dozens of times a day says what it
 * is, and it keeps its place in the reading order.
 *
 * The link runs from the circle's top to the bar's foot, so the whole
 * circle is its target and what the tour lights.
 */
function ScanTab({ item }: { item: NavItem }) {
  const { t } = useTranslation();
  return (
    <NavLink
      to={item.to}
      end={item.end}
      data-tour={`nav-${item.key}`}
      className={({ isActive }) =>
        cn(
          // 22px above the bar: the circle's top then stands 16px out of it,
          // past the bar's hairline and the ring's own.
          "group -mt-[1.375rem] flex h-[5.375rem] w-full min-w-0 flex-col items-center justify-between pb-1 outline-none [-webkit-tap-highlight-color:transparent]",
          isActive ? "text-ink" : "text-ink-muted hover-fine:text-ink",
        )
      }
    >
      <span
        aria-hidden
        className="flex size-16 shrink-0 items-center justify-center rounded-full border-t border-border bg-surface"
      >
        <ScanCircle />
      </span>
      <span className="type-tag w-full truncate px-1 text-center">{t(`dashboard.nav.${item.key}`)}</span>
    </NavLink>
  );
}
