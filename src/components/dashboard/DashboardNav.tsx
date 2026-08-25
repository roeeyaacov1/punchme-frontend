import { useEffect, useRef, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import {
  CreditCard,
  Ellipsis,
  Palette,
  Printer,
  ScanLine,
  Send,
  Stamp,
  Store,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import type { Role } from "../../api/team";
import { atLeast } from "../../business/gating";
import { useBusiness } from "../../business/useBusiness";
import { focusRing } from "../marketing/primitives";
import { cn } from "../../lib/cn";
import { GroupLabel } from "./primitives";

/**
 * Nine destinations, in the three groups they actually fall into.
 *
 * The old header listed them in one row of pills, which said they were
 * equal things to keep an eye on. They are not: four of them are the
 * counter — what an owner does and reads between customers, possibly daily —
 * one is marketing (messages to customers: set a rule once, send a broadcast
 * on a slow day), and four are setup, which is done once and then revisited
 * when something changes. Saying so is the difference between a dashboard
 * you can scan and a menu you have to read.
 *
 * Scan leads the counter group and is the only entry there that is an
 * action rather than a reading: it is the only screen an owner opens with a
 * customer standing in front of them, which is why it is never behind
 * "More" and why on a phone it is a button rather than a tab.
 *
 * Which of these get a tab on the phone is no longer "the first group", and
 * is not decided here — see `TAB_START` / `TAB_CENTER` / `TAB_END` below.
 *
 * `min` is the lowest role a destination is worth showing to. It is not the
 * security boundary — the API is, and it answers 403 either way — it is what
 * keeps a hire from being shown a Billing tab that refuses them. Note how it
 * falls out: the counter group is exactly the staff role, which is not a
 * coincidence but the definition of the job.
 */
export const NAV_GROUPS = [
  {
    key: "counter",
    items: [
      { to: "/dashboard/scan", end: false, key: "scan", Icon: ScanLine, min: "staff" },
      { to: "/dashboard", end: true, key: "overview", Icon: Store, min: "staff" },
      { to: "/dashboard/customers", end: false, key: "customers", Icon: Users, min: "staff" },
      { to: "/dashboard/activity", end: false, key: "activity", Icon: Stamp, min: "staff" },
    ],
  },
  {
    key: "marketing",
    items: [
      { to: "/dashboard/messages", end: false, key: "messages", Icon: Send, min: "manager" },
    ],
  },
  {
    key: "setup",
    items: [
      { to: "/dashboard/design", end: false, key: "design", Icon: Palette, min: "manager" },
      { to: "/dashboard/standee", end: false, key: "standee", Icon: Printer, min: "manager" },
      { to: "/dashboard/team", end: false, key: "team", Icon: UserPlus, min: "owner" },
      { to: "/dashboard/billing", end: false, key: "billing", Icon: CreditCard, min: "owner" },
    ],
  },
] as const;

type NavItem = {
  to: string;
  end: boolean;
  key: string;
  Icon: typeof Store;
  min: string;
};

/** The groups this role has any business seeing, with empty ones dropped —
 * a staff member gets a rail of four rows and no headings for doors that
 * aren't there. */
export function visibleGroups(role: Role | null) {
  return NAV_GROUPS.map((group) => ({
    key: group.key,
    items: (group.items as readonly NavItem[]).filter((item) =>
      atLeast(role, item.min as Role),
    ),
  })).filter((group) => group.items.length > 0);
}

/**
 * What the phone's bar carries, and in what order.
 *
 * It used to be "the first group", which was true for exactly as long as the
 * counter was what fitted. It isn't any more: Messages is on the bar and
 * Activity is not, and neither of those is a thing the groups can say. The
 * groups are about what a route *is*; this is about what an owner reaches
 * for with a customer standing in front of them. So the bar gets its own
 * list, and everything not on it falls behind "More" automatically.
 *
 * Scan is the middle because it is the only entry here that is an action
 * rather than a reading, and the only screen anyone opens mid-transaction.
 * The rest read outwards from it: what the shop did (Overview) and who it
 * did it with (Customers) on the leading side, what to say to them (Push)
 * and everything else (More) on the trailing side. In Hebrew that whole row
 * mirrors, which is why it is written as start-and-end and never as
 * left-and-right.
 *
 * Typed off `NAV_GROUPS` rather than as loose strings, so a rename over
 * there is a compile error here instead of a tab that silently vanishes.
 */
type NavKey = (typeof NAV_GROUPS)[number]["items"][number]["key"];

const TAB_START: readonly NavKey[] = ["overview", "customers"];
const TAB_CENTER: NavKey = "scan";
const TAB_END: readonly NavKey[] = ["messages"];

const TAB_KEYS: readonly NavKey[] = [...TAB_START, TAB_CENTER, ...TAB_END];

const ALL_ITEMS = NAV_GROUPS.flatMap(
  (group) => group.items as readonly NavItem[],
);

function itemByKey(key: NavKey): NavItem {
  return ALL_ITEMS.find((item) => item.key === key)!;
}

/** Everything the bar doesn't carry lives behind "More" — Activity included,
 * now that it is off the bar. Sub-routes (`/dashboard/messages/new`) count as
 * their parent, so the tab lights up on them too. */
export const MORE_PATHS: readonly string[] = ALL_ITEMS.filter(
  (item) => !TAB_KEYS.includes(item.key as NavKey),
).map((item) => item.to);

export function isMorePath(pathname: string): boolean {
  return MORE_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

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

/** The bar's own word for a destination, where the rail's is too long to sit
 * under a 22px icon. "Customer messages" is the right name in a list of
 * nine; on a tab it truncates to "Customer m..." and says nothing. */
const TAB_LABEL: Partial<Record<NavKey, string>> = {
  messages: "dashboard.nav.messagesTab",
};

const TAB_BASE =
  "flex min-h-[56px] w-full flex-col items-center justify-center gap-1 px-1 pb-2 pt-2.5 text-[0.6875rem] font-semibold transition-colors";

function tabClasses(active: boolean) {
  return cn(
    TAB_BASE,
    focusRing,
    active ? "text-primary-text" : "text-ink-subtle",
  );
}

/**
 * One tab's face: icon over label, the active one marked by a filled ground
 * behind the icon as well as by colour.
 *
 * The design draws its active state as a filled icon against an outlined
 * one, which lucide cannot do — it ships strokes only. The ground is the
 * stand-in, and it is the honest one: it changes the icon's silhouette at a
 * glance, which is the whole job the filled variant was doing, and it does
 * it in the accent already measured rather than in a second colour that
 * would need measuring.
 */
function TabFace({
  Icon,
  label,
  active,
}: {
  Icon: typeof Store;
  label: string;
  active: boolean;
}) {
  return (
    <>
      <span
        aria-hidden
        className={cn(
          "flex h-8 w-12 shrink-0 items-center justify-center rounded-full transition-colors",
          active ? "bg-primary/10" : "bg-transparent",
        )}
      >
        <Icon size={22} strokeWidth={active ? 2.4 : 1.8} />
      </span>
      <span className="w-full truncate text-center">{label}</span>
    </>
  );
}

/**
 * The phone's bar, at the bottom where the thumb is.
 *
 * Five slots, and the middle one is a raised button rather than a tab. Scan
 * is not a place you go to look at something; it is the one thing an owner
 * does with a person waiting, so it is drawn as the button it is, lifted
 * clear of the bar's own edge and sized well past a thumb.
 *
 * A slot whose role can't reach it stays in the row, empty. The bar is two
 * equal halves either side of that button, and dropping a slot outright
 * would slide the button off centre — so a staff member, who has no
 * Messages, gets a gap on the trailing side rather than a bar that is
 * visibly a different shape from everyone else's.
 */
export function BottomBar({
  onMore,
  moreActive,
}: {
  onMore: () => void;
  moreActive: boolean;
}) {
  const { t } = useTranslation();
  const { role } = useBusiness();
  const scan = itemByKey(TAB_CENTER);

  // The rail's filter, with one difference that only matters on a phone: a
  // tab asking for no more than the floor is drawn before the role lands.
  // `staff` is what anyone with a dashboard at all already is, and a bar
  // that empties itself for the length of a fetch is a bar that flickers.
  const slot = (key: NavKey) => {
    const item = itemByKey(key);
    const shown = item.min === "staff" || atLeast(role, item.min as Role);
    if (!shown) return <li key={key} aria-hidden className="flex-1 basis-0" />;
    return (
      <li key={key} className="flex-1 basis-0">
        <NavLink
          to={item.to}
          end={item.end}
          data-tour={`nav-${item.key}`}
          className={({ isActive }) => tabClasses(isActive)}
        >
          {({ isActive }) => (
            <TabFace
              Icon={item.Icon}
              label={t(TAB_LABEL[key] ?? `dashboard.nav.${key}`)}
              active={isActive}
            />
          )}
        </NavLink>
      </li>
    );
  };

  return (
    <nav
      aria-label={t("dashboard.nav.label")}
      className="fixed inset-x-0 bottom-0 z-30 lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto max-w-lg rounded-t-[28px] border border-b-0 border-border bg-surface/95 shadow-panel-lift backdrop-blur">
        <ul className="flex items-stretch">
          {TAB_START.map(slot)}

          {/* Scan keeps its place in the row — same reading order, same tab
              order — and only its own box climbs out of it. */}
          <li className="flex w-[5.5rem] shrink-0 items-start justify-center">
            <NavLink
              to={scan.to}
              end={scan.end}
              data-tour={`nav-${scan.key}`}
              aria-label={t(`dashboard.nav.${scan.key}`)}
              className={({ isActive }) =>
                cn(
                  "-mt-4 flex h-[4.625rem] w-[4.625rem] items-center justify-center rounded-full border-[5px] bg-primary bg-clip-padding text-primary-on shadow-lift transition-colors",
                  focusRing,
                  // The halo is the fill again at low alpha, so it reads as
                  // the button's own light in either theme rather than as a
                  // colour of its own.
                  isActive ? "border-primary/45" : "border-primary/20",
                )
              }
            >
              <scan.Icon size={26} aria-hidden strokeWidth={2} />
            </NavLink>
          </li>

          {TAB_END.map(slot)}

          <li className="flex-1 basis-0">
            <button
              type="button"
              onClick={onMore}
              aria-haspopup="dialog"
              className={tabClasses(moreActive)}
            >
              <TabFace
                Icon={Ellipsis}
                label={t("dashboard.nav.more")}
                active={moreActive}
              />
            </button>
          </li>
        </ul>
      </div>
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

/** The groups behind "More" (everything but the counter), laid out for the
 * sheet. */
export function SetupRows({ onNavigate }: { onNavigate: () => void }) {
  const { t } = useTranslation();
  const { role } = useBusiness();
  // By tab rather than by group: Activity is a counter route that no longer
  // has a tab, so "every group but the counter" would leave it with nowhere
  // to be reached from on a phone. The sheet is the complement of the bar,
  // which is the same sentence `MORE_PATHS` is written in.
  const groups = visibleGroups(role)
    .map((group) => ({
      key: group.key,
      items: group.items.filter(
        (item) => !TAB_KEYS.includes(item.key as NavKey),
      ),
    }))
    .filter((group) => group.items.length > 0);
  return (
    <div className="flex flex-col gap-4">
      {groups.map((group) => (
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
