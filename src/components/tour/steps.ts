import { CreditCard, Palette, Printer, ScanLine, Store, Users } from "lucide-react";
import type { Role } from "../../api/team";
import { atLeast } from "../../business/gating";

/**
 * The walk: where the tour goes, and what it lights up when it gets there.
 *
 * Each step is a real route and a real element on it. The tour drives to the
 * route, finds `[data-tour="<anchor>"]`, cuts the page dark around it and
 * says one sentence. Nothing is drawn twice — the owner is looking at their
 * own customers on their own customers page, not at a picture of one.
 *
 * Filtered by role exactly the way `NAV_GROUPS` is, and for the same reason:
 * a hire should never be driven to a page the API would close on them. A
 * staff member gets three stops, everyone else five.
 *
 * The order is the shop's own — what it is, who is in it, how they get in,
 * what it looks like, what it costs — and it ends on the scanner, which is
 * the only stop that is an action rather than a reading and the one thing
 * every role does every day. That last step drives nowhere: it lights up the
 * Scan entry in the rail and waits for a tap, so the tour finishes by putting
 * them where they will actually work.
 *
 * Two conditional stops, neither of them arbitrary:
 *
 * - `whileFree` — "activate it" is not news to a business that already has.
 * - `whilePro` — a free owner walked out of the wizard four steps ago, and
 *   those four steps *were* the studio. Showing it to them again is showing
 *   them what they just did. An owner who set the card up months ago is the
 *   one who has forgotten it can be changed.
 *
 * Both keep every version of this at five stops or fewer.
 */

export interface TourStep {
  key: string;
  Icon: typeof ScanLine;
  /** `dashboard.groups.*` — the rail's heading this lives under. */
  group: string;
  /** `dashboard.nav.*` — the rail's name for it. */
  nav: string;
  /** Where the tour drives before looking for the anchor. */
  to: string;
  /** The `data-tour` value to light up. More than one element may carry it —
   * the rail and the tab bar both answer to `nav-scan`, and the roster is a
   * table on a desk and a stack of cards on a phone — so the tour takes the
   * first one that is actually on screen. */
  anchor: string;
  /** i18n keys. */
  title: string;
  body: string;
  /** A step the owner finishes by touching the thing itself. The lit element
   * stays live on every step; this is the one where doing so is the point, so
   * it says so, and the tour closes behind them instead of dragging them
   * back. */
  act?: string;
}

interface Entry extends TourStep {
  /** Lowest role worth driving there. Mirrors `NAV_GROUPS`'s `min`. */
  min: Role;
  whileFree?: boolean;
  whilePro?: boolean;
}

const STEPS: readonly Entry[] = [
  {
    key: "overview",
    Icon: Store,
    group: "counter",
    nav: "overview",
    to: "/dashboard",
    anchor: "overview-lead",
    title: "tour.steps.overview.title",
    body: "tour.steps.overview.body",
    min: "staff",
  },
  {
    key: "customers",
    Icon: Users,
    group: "counter",
    nav: "customers",
    to: "/dashboard/customers",
    anchor: "customers-roster",
    title: "tour.steps.customers.title",
    body: "tour.steps.customers.body",
    min: "staff",
  },
  {
    key: "join",
    Icon: Printer,
    group: "setup",
    nav: "standee",
    to: "/dashboard/standee",
    anchor: "standee-sheet",
    title: "tour.steps.join.title",
    body: "tour.steps.join.body",
    min: "manager",
  },
  {
    key: "design",
    Icon: Palette,
    group: "setup",
    nav: "design",
    to: "/dashboard/design",
    anchor: "design-studio",
    title: "tour.steps.design.title",
    body: "tour.steps.design.body",
    min: "manager",
    whilePro: true,
  },
  {
    key: "activate",
    Icon: CreditCard,
    group: "setup",
    nav: "billing",
    to: "/dashboard/billing",
    anchor: "billing-activate",
    title: "tour.steps.activate.title",
    body: "tour.steps.activate.body",
    min: "owner",
    whileFree: true,
  },
  {
    key: "scan",
    Icon: ScanLine,
    group: "counter",
    nav: "scan",
    // Back where it started, so the last thing lit is the first thing in the
    // menu. Deliberately not `/dashboard/scan`: arriving there opens the
    // camera, and a permission prompt is a browser dialog dropped on top of a
    // tour nobody asked to be interrupted. Their tap opens it instead.
    to: "/dashboard",
    anchor: "nav-scan",
    title: "dashboard.scan.title",
    body: "dashboard.scan.lead",
    act: "tour.steps.scan.act",
    min: "staff",
  },
];

export function tourSteps(role: Role | null, canEnroll: boolean): TourStep[] {
  return STEPS.filter(
    (step) =>
      atLeast(role, step.min) &&
      (!step.whileFree || !canEnroll) &&
      (!step.whilePro || canEnroll),
  ).map((entry) => ({
    key: entry.key,
    Icon: entry.Icon,
    group: entry.group,
    nav: entry.nav,
    to: entry.to,
    anchor: entry.anchor,
    title: entry.title,
    body: entry.body,
    act: entry.act,
  }));
}
