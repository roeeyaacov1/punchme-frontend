import { Fragment, type Ref } from "react";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import { useBusiness } from "../../../business/useBusiness";
import { focusRing, focusRingInset } from "../../kit";
import { cn } from "../../../lib/cn";
import { visibleGroups, type NavItem } from "../navigation";
import { PersonLine, PersonMark } from "./Person";
import { ScanCircle } from "./ScanCircle";

/**
 * The tablet's rail, from 768 to 1279px: 88px at the start edge, the
 * screen's full height, lit acrylic with a hairline at its end edge.
 *
 * Top to bottom: the Scan circle with its word, the same as the phone's,
 * because a tablet on the counter does the phone's job; the other counter
 * pages; then, past a hairline each, what customers see and the business,
 * for whoever can open them. No group headings: there is no room for them,
 * and every entry carries its word. The person's initial at the foot opens
 * the account sheet, which comes in from the end edge.
 *
 * When the screen is too short for it, a landscape tablet or a phone on
 * its side, the pages scroll on their own and the person stays put at the
 * foot.
 *
 * In landscape the rail takes the start edge's safe-area inset, so nothing
 * on it sits under a phone's notch, and the top's, beside the masthead that
 * already does. Its controls press like the bar's, without the long-press
 * callout or a text selection.
 */
export function TabletRail({
  frame,
  accountOpen,
  onAccount,
  personRef,
  className,
}: {
  frame: string;
  accountOpen: boolean;
  onAccount: () => void;
  personRef?: Ref<HTMLButtonElement>;
  className?: string;
}) {
  const { t } = useTranslation();
  const { role } = useBusiness();
  const groups = visibleGroups(role);
  const scan = groups[0]?.items.find((item) => item.key === "scan");

  return (
    <div
      className={cn(
        frame,
        "flex h-dvh w-[calc(5.5rem+env(safe-area-inset-left))] flex-col border-e border-border bg-surface ps-[env(safe-area-inset-left)] pt-[env(safe-area-inset-top)] text-ink rtl:w-[calc(5.5rem+env(safe-area-inset-right))] rtl:ps-[env(safe-area-inset-right)]",
        className,
      )}
    >
      {/* Only the pages scroll, so the person stays at the foot: a phone in
          landscape is 390px tall and the rail is twice that, and the way to
          sign out must never be two screens down. No scrollbar of its own:
          a classic one would take 15 of the rail's 88px and push "Card
          Studio" onto two lines. Its foot fades instead, so an entry cut
          off there reads as more to come; the padding under the last one
          clears the fade once it is reached. */}
      <nav
        aria-label={t("dashboard.nav.label")}
        className="flex min-h-0 flex-1 touch-manipulation select-none flex-col overflow-y-auto overscroll-contain pb-4 [-webkit-touch-callout:none] [mask-image:linear-gradient(to_bottom,#000_calc(100%-1.5rem),transparent)] [scrollbar-width:none]"
      >
        {scan && (
          <NavLink
            to={scan.to}
            end={scan.end}
            data-tour={`nav-${scan.key}`}
            className={({ isActive }) =>
              cn(
                "group relative flex flex-col items-center gap-1 px-1 pb-2 pt-4 outline-none [-webkit-tap-highlight-color:transparent]",
                isActive ? "text-ink" : "text-ink-muted hover-fine:text-ink",
              )
            }
          >
            {({ isActive }) => (
              <>
                <StartRule on={isActive} />
                <ScanCircle />
                <span className="type-tag w-full text-center">{t(`dashboard.nav.${scan.key}`)}</span>
              </>
            )}
          </NavLink>
        )}
        {groups.map((group, index) => (
          <Fragment key={group.key}>
            {index > 0 && <hr className="mx-4 my-2 border-border" />}
            {group.items
              .filter((item) => item.key !== "scan")
              .map((item) => (
                <RailEntry key={item.key} item={item} label={t(`dashboard.nav.${item.key}`)} />
              ))}
          </Fragment>
        ))}
      </nav>

      <div className="flex shrink-0 justify-center pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
        <button
          ref={personRef}
          type="button"
          onClick={onAccount}
          aria-haspopup="dialog"
          aria-expanded={accountOpen}
          className={cn(
            "flex size-14 touch-manipulation select-none items-center justify-center rounded-full transition-colors duration-gentle ease-out active:bg-ink/[0.06] hover-fine:bg-ink/5 [-webkit-tap-highlight-color:transparent]",
            focusRing,
          )}
        >
          <PersonMark className="size-10" />
          <span className="sr-only">
            {t("dashboard.groups.account")} · <PersonLine />
          </span>
        </button>
      </div>
    </div>
  );
}

/** An icon over its word, 56px tall at least: a long word, such as "Customer
 * messages", takes a second line rather than being cut. */
function RailEntry({ item, label }: { item: NavItem; label: string }) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      data-tour={`nav-${item.key}`}
      className={({ isActive }) =>
        cn(
          "relative flex min-h-14 w-full flex-col items-center justify-center gap-1 px-1 py-2 text-center transition-colors duration-press ease-out active:bg-ink/[0.06] [-webkit-tap-highlight-color:transparent]",
          focusRingInset,
          isActive ? "text-ink" : "text-ink-muted hover-fine:text-ink",
        )
      }
    >
      {({ isActive }) => (
        <>
          <StartRule on={isActive} />
          <item.Icon aria-hidden className="size-6" strokeWidth={isActive ? 2.25 : 1.75} />
          <span className="type-tag line-clamp-2 w-full break-words">{label}</span>
        </>
      )}
    </NavLink>
  );
}

/** The current entry's 2px ink rule at the rail's start edge, lit at once. */
function StartRule({ on }: { on: boolean }) {
  return (
    <span
      aria-hidden
      className={cn("absolute inset-y-3 start-0 w-0.5 rounded-e-full bg-ink", !on && "opacity-0")}
    />
  );
}
