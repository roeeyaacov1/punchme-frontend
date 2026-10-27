import { useLayoutEffect, useRef, type Ref, type RefObject } from "react";
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
 *
 * It grows with the reader's text size, and the bars docked on it (a
 * broadcast's send, a rule's save, the studio's save) stand on its 4rem.
 * A fifth of the phone doesn't grow, though: nothing in a slot is wider than
 * the slot, the Scan circle rises only as far as it still needs to, and the
 * five words step down together until the longest fits.
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
  const { t, i18n } = useTranslation();
  const { role } = useBusiness();
  const list = useRef<HTMLUListElement>(null);
  useWordsThatFit(list, `${i18n.language} ${role} ${fifth}`);
  return (
    <nav
      aria-label={t("dashboard.nav.label")}
      className={cn(
        frame,
        "fixed inset-x-0 bottom-0 z-30 touch-manipulation select-none border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] text-ink [-webkit-touch-callout:none]",
        className,
      )}
    >
      <ul ref={list} className="flex h-16 items-stretch">
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

/**
 * The words keep the reader's text size until the longest no longer fits
 * its fifth of the bar, as "Customers" doesn't at 200% on a 375px phone.
 * Then all five step down together to the size at which it does, so none is
 * cut short and none is louder than its neighbours. They never go below the
 * ramp's 13px; a word still too long there truncates, as it always has. At
 * 100% every word fits and nothing is set.
 */
function useWordsThatFit(list: RefObject<HTMLUListElement>, words: string) {
  useLayoutEffect(() => {
    const ul = list.current;
    if (!ul) return;
    const labels = [...ul.querySelectorAll<HTMLElement>("[data-bar-word]")];
    // Each word's own width, its inset included, to the fraction of a pixel.
    const widest = () => {
      labels.forEach((label) => (label.style.width = "max-content"));
      const width = Math.max(...labels.map((label) => label.getBoundingClientRect().width));
      labels.forEach((label) => label.style.removeProperty("width"));
      return width;
    };
    const fit = () => {
      labels.forEach((label) => label.style.removeProperty("font-size"));
      if (labels.length === 0) return;
      const room = Math.min(...labels.map((label) => label.getBoundingClientRect().width));
      const natural = parseFloat(getComputedStyle(labels[0]).fontSize);
      const floor = Math.min(natural, 13);
      // The inset doesn't shrink with the word, so each step lands a little
      // short of fitting and the next one finishes it.
      for (let size = natural, need = widest(); need > room && size > floor; need = widest()) {
        size = Math.max(floor, Math.min(size - 0.25, Math.floor(((size * room) / need) * 4) / 4));
        labels.forEach((label) => (label.style.fontSize = `${size}px`));
      }
    };
    fit();
    // A word's box changes height with the text size and width with the
    // screen; a web font arriving changes neither, so it is listened for.
    let frame = 0;
    const refit = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(fit);
    };
    const observer = new ResizeObserver(refit);
    labels.forEach((label) => observer.observe(label));
    document.fonts.addEventListener("loadingdone", refit);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.fonts.removeEventListener("loadingdone", refit);
    };
  }, [list, words]);
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

/** Icon over word, and the rule at the bar's top edge for the current one.
 * The well is never wider than its slot. */
function TabFace({ Icon, label, current }: { Icon: LucideIcon; label: string; current: boolean }) {
  return (
    <>
      <span
        aria-hidden
        className={cn("absolute inset-x-3 top-0 h-0.5 rounded-b-full bg-ink", !current && "opacity-0")}
      />
      <span
        aria-hidden
        className="flex h-8 w-14 max-w-full items-center justify-center rounded-full transition-colors duration-press ease-out group-active:bg-ink/[0.06]"
      >
        <Icon className="size-6" strokeWidth={current ? 2.25 : 1.75} />
      </span>
      <Word>{label}</Word>
    </>
  );
}

/** A slot's word. Its inset stays 4px at any text size, so the room it
 * leaves goes to the word. */
function Word({ children }: { children: string }) {
  return (
    <span data-bar-word className="type-tag w-full truncate px-[4px] text-center">
      {children}
    </span>
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
 *
 * It stands on the bar's foot and is as tall as the ring and the word under
 * it, so whatever the bar can't hold rises out of it: 22px at 100%, the
 * circle's top then 16px out past the bar's hairline and the ring's own.
 * With large text the bar grows taller than a fifth of the phone is wide,
 * the ring stops at the slot's width, and the circle sinks into the bar,
 * all of it still the target.
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
          "group absolute inset-x-0 bottom-0 flex min-h-full min-w-0 flex-col items-center justify-end gap-px pb-1 outline-none [-webkit-tap-highlight-color:transparent]",
          isActive ? "text-ink" : "text-ink-muted hover-fine:text-ink",
        )
      }
    >
      <span
        aria-hidden
        className="flex aspect-square w-16 max-w-full shrink-0 items-center justify-center rounded-full border-t border-border bg-surface"
      >
        <ScanCircle />
      </span>
      <Word>{t(`dashboard.nav.${item.key}`)}</Word>
    </NavLink>
  );
}
