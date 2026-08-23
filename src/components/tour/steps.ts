import { CreditCard, Palette, Printer, ScanLine, Users } from "lucide-react";
import type { Role } from "../../api/team";
import { atLeast } from "../../business/gating";

/**
 * What a person is shown the first time they open the dashboard.
 *
 * Five cards at the outside and never five for the same person: the table is
 * filtered by role the way `NAV_GROUPS` is, and for the same reason — a hire
 * who is only ever going to hold the scanner should not be walked past
 * Billing and the Card Studio, which are doors the API would close on them.
 * A staff member gets two cards, a manager four, an owner four or five. That
 * is the whole tour, and it is short on purpose: an owner who has just
 * finished the wizard has already spent five minutes on us.
 *
 * `group` and `nav` are not decoration — they name the step's real address in
 * the rail, in the rail's own words, off the rail's own keys. That is the
 * part of a spotlight tour worth keeping: a card that says "Counter · Scan"
 * teaches where the thing lives without having to anchor a popover to a
 * sidebar that becomes a tab bar on a phone and flips end for end in Hebrew.
 *
 * Copy that already exists somewhere is pointed at rather than written twice
 * — the scanner's own lead is the best sentence we have about scanning, and
 * it should stay one sentence in one place.
 */

export interface TourStep {
  key: string;
  Icon: typeof ScanLine;
  /** `dashboard.groups.*` — the rail's heading this lives under. */
  group: string;
  /** `dashboard.nav.*` — the rail's name for it. */
  nav: string;
  title: string;
  body: string;
}

interface Entry extends TourStep {
  /** Lowest role worth showing this to. Mirrors `NAV_GROUPS`'s `min`. */
  min: Role;
  /** Only while the card is not activated yet — once real customers can
   * join, "activate it" is not news. */
  whileFree?: boolean;
}

const STEPS: readonly Entry[] = [
  {
    key: "scan",
    Icon: ScanLine,
    group: "counter",
    nav: "scan",
    title: "dashboard.scan.title",
    body: "dashboard.scan.lead",
    min: "staff",
  },
  {
    key: "join",
    Icon: Printer,
    group: "setup",
    nav: "standee",
    title: "tour.steps.join.title",
    body: "tour.steps.join.body",
    min: "manager",
  },
  {
    key: "customers",
    Icon: Users,
    group: "counter",
    nav: "customers",
    title: "tour.steps.customers.title",
    body: "tour.steps.customers.body",
    min: "staff",
  },
  {
    key: "design",
    Icon: Palette,
    group: "setup",
    nav: "design",
    title: "tour.steps.design.title",
    body: "tour.steps.design.body",
    min: "manager",
  },
  {
    key: "activate",
    Icon: CreditCard,
    group: "setup",
    nav: "billing",
    title: "tour.steps.activate.title",
    body: "tour.steps.activate.body",
    min: "owner",
    whileFree: true,
  },
];

/**
 * The cards this person gets, in order.
 *
 * Scan leads for the same reason it leads the tab bar: it is the only screen
 * anyone opens with a customer standing in front of them, and it is the one
 * thing every role on the team does.
 */
export function tourSteps(role: Role | null, canEnroll: boolean): TourStep[] {
  return STEPS.filter(
    (step) => atLeast(role, step.min) && (!step.whileFree || !canEnroll),
  ).map(({ key, Icon, group, nav, title, body }) => ({
    key,
    Icon,
    group,
    nav,
    title,
    body,
  }));
}
