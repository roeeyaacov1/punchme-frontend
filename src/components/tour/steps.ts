import { CreditCard, Palette, Printer, ScanLine, Store, Users } from "lucide-react";
import type { Role } from "../../api/team";
import { atLeast } from "../../business/gating";
import { PUNCHME_MONTHLY_PRICE } from "../marketing/calculator";

/**
 * The walk: where the tour goes, what it lights up when it gets there, and
 * what it says, true for this person on this plan.
 *
 * Each step is a real route and a real element on it. The tour drives to the
 * route, finds `[data-tour="<anchor>"]`, cuts the page dark around it and
 * says one sentence. Nothing is drawn twice — the owner is looking at their
 * own customers on their own customers page, not at a picture of one.
 *
 * Filtered by role exactly the way `NAV_GROUPS` is, and for the same reason:
 * a hire should never be driven to a page the API would close on them. The
 * order is the shop's own — what it is, who is in it, how they get in, what
 * it looks like, what it costs — and it ends on the scanner, the one stop
 * that is an action rather than a reading and the one thing every role
 * does every day. That last step drives nowhere: it lights up Scan where it
 * already is and waits, so the tour finishes by putting them where they
 * will actually work.
 *
 * What it says depends on the plan, because Free has no customers yet:
 * - Free skips Customers, which would be empty, and the studio, which the
 *   owner left four steps ago;
 * - its stops say what activation unlocks instead of promising customers;
 * - only the owner, who can activate, hears what it costs;
 * - and on Free the Scan stop asks for no tap, since there is nobody to
 *   scan yet.
 *
 * And on the role: a hire's Overview line is their own, on either plan,
 * because "the card you designed" isn't theirs to have designed.
 */

export interface TourStep {
  key: string;
  Icon: typeof ScanLine;
  /** `dashboard.groups.*` — the group this lives under. */
  group: string;
  /** `dashboard.nav.*` — the navigation's name for it. */
  nav: string;
  /** Where the tour drives before looking for the anchor. */
  to: string;
  /** The `data-tour` value to light up. More than one element may carry it —
   * the bar, the rails, and the roster as a table or a stack of cards — so
   * the tour takes the first one that is actually on screen. */
  anchor: string;
  /** i18n keys. */
  title: string;
  body: string;
  /** Interpolated into the body: the price, set left to right. */
  values?: Record<string, string | number>;
  /** "Tap it": the one stop that asks to be touched. The lit element stays
   * live on every step; this says so where doing it is the point. */
  act?: string;
}

interface Copy {
  title: string;
  body: string;
  act?: string;
}

interface Entry extends Omit<TourStep, "title" | "body" | "act" | "values"> {
  /** Lowest role worth driving there. Mirrors `NAV_GROUPS`'s `min`. */
  min: Role;
  whileFree?: boolean;
  whilePro?: boolean;
  /** What the owner hears on Pro, and the fallback for every other case. */
  pro: Copy;
  /** On Free, where it differs. */
  free?: Copy;
  /** A hire (a manager or staff) on Pro, and on Free. */
  hirePro?: Copy;
  hireFree?: Copy;
  values?: Record<string, string | number>;
}

const STEPS: readonly Entry[] = [
  {
    key: "overview",
    Icon: Store,
    group: "counter",
    nav: "overview",
    to: "/dashboard",
    anchor: "overview-lead",
    min: "staff",
    pro: { title: "tour.steps.overview.title", body: "tour.steps.overview.body" },
    hirePro: { title: "tour.steps.overview.titleHire", body: "tour.steps.overview.bodyHire" },
    free: { title: "tour.steps.overview.titleFree", body: "tour.steps.overview.bodyFree" },
    hireFree: { title: "tour.steps.overview.titleFree", body: "tour.steps.overview.bodyFreeHire" },
  },
  {
    key: "customers",
    Icon: Users,
    group: "counter",
    nav: "customers",
    to: "/dashboard/customers",
    anchor: "customers-roster",
    min: "staff",
    whilePro: true,
    pro: { title: "tour.steps.customers.title", body: "tour.steps.customers.body" },
  },
  {
    key: "join",
    Icon: Printer,
    group: "facing",
    nav: "standee",
    to: "/dashboard/standee",
    anchor: "standee-sheet",
    min: "manager",
    pro: { title: "tour.steps.join.title", body: "tour.steps.join.body" },
    free: { title: "tour.steps.join.title", body: "tour.steps.join.bodyFree" },
  },
  {
    key: "design",
    Icon: Palette,
    group: "facing",
    nav: "design",
    to: "/dashboard/design",
    anchor: "design-studio",
    min: "manager",
    // A Free owner walked out of the wizard four steps ago, and those four
    // steps were the studio. An owner who set the card up months ago is the
    // one who has forgotten it can be changed.
    whilePro: true,
    pro: { title: "tour.steps.design.title", body: "tour.steps.design.body" },
  },
  {
    key: "activate",
    Icon: CreditCard,
    group: "business",
    nav: "billing",
    to: "/dashboard/billing",
    anchor: "billing-activate",
    min: "owner",
    whileFree: true,
    pro: { title: "tour.steps.activate.title", body: "tour.steps.activate.body" },
    values: { price: PUNCHME_MONTHLY_PRICE },
  },
  {
    key: "scan",
    Icon: ScanLine,
    group: "counter",
    nav: "scan",
    // Back where it started. Deliberately not `/dashboard/scan`: arriving
    // there opens the camera, and a permission prompt is a browser dialog
    // dropped on top of a tour nobody asked to be interrupted. Their tap
    // opens it instead.
    to: "/dashboard",
    anchor: "nav-scan",
    min: "staff",
    pro: { title: "tour.steps.scan.title", body: "tour.steps.scan.body", act: "tour.steps.scan.act" },
    free: { title: "tour.steps.scan.title", body: "tour.steps.scan.bodyFree" },
  },
];

function copyFor(entry: Entry, hire: boolean, canEnroll: boolean): Copy {
  if (canEnroll) return (hire && entry.hirePro) || entry.pro;
  return (hire && entry.hireFree) || entry.free || entry.pro;
}

export function tourSteps(role: Role | null, canEnroll: boolean): TourStep[] {
  const hire = role !== "owner";
  return STEPS.filter(
    (step) =>
      atLeast(role, step.min) &&
      (!step.whileFree || !canEnroll) &&
      (!step.whilePro || canEnroll),
  ).map((entry) => {
    const copy = copyFor(entry, hire, canEnroll);
    return {
      key: entry.key,
      Icon: entry.Icon,
      group: entry.group,
      nav: entry.nav,
      to: entry.to,
      anchor: entry.anchor,
      title: copy.title,
      body: copy.body,
      values: entry.values,
      act: copy.act,
    };
  });
}
