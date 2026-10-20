import {
  CreditCard,
  Handshake,
  Palette,
  Printer,
  ScanLine,
  Send,
  Stamp,
  Store,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "../../api/team";
import { atLeast } from "../../business/gating";

/**
 * Ten destinations, in three groups, and the groups are the roles.
 *
 * - **The counter** is what anyone on the team does and reads between
 *   customers: scanning a card, how the shop is doing, who its customers
 *   are, what just happened. It is exactly the staff role, which is not a
 *   coincidence but the definition of the job.
 * - **What customers see** is the card, the standee, the messages and the
 *   referral programme: everything a manager may change and a hire may not.
 * - **The business** is money and the team, the owner's alone.
 *
 * So a hire only ever sees whole groups, and nobody is shown a door that
 * would refuse them. Within a group, pages run by how often they are opened:
 * Messages, used weekly, before the studio and the standee, which are set up
 * once and revisited; Billing before Team, because a Free owner comes for
 * Billing.
 *
 * `min` is the lowest role a destination is worth showing to. It is not the
 * security boundary (the API is, and it answers 403 either way); it is what
 * keeps a hire from being shown a Billing entry that refuses them. Every
 * item in a group shares the group's floor, and the test holds it to that.
 *
 * This list is the only source of the navigation: the phone bar, both rails
 * and the More sheet are all built from `visibleGroups(role)`.
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
    key: "facing",
    items: [
      { to: "/dashboard/messages", end: false, key: "messages", Icon: Send, min: "manager" },
      { to: "/dashboard/design", end: false, key: "design", Icon: Palette, min: "manager" },
      { to: "/dashboard/standee", end: false, key: "standee", Icon: Printer, min: "manager" },
      { to: "/dashboard/referrals", end: false, key: "referrals", Icon: Handshake, min: "manager" },
    ],
  },
  {
    key: "business",
    items: [
      { to: "/dashboard/billing", end: false, key: "billing", Icon: CreditCard, min: "owner" },
      { to: "/dashboard/team", end: false, key: "team", Icon: UserPlus, min: "owner" },
    ],
  },
] as const;

export type GroupKey = (typeof NAV_GROUPS)[number]["key"];
export type NavKey = (typeof NAV_GROUPS)[number]["items"][number]["key"];

export interface NavItem {
  to: string;
  /** Lights only on this exact path, as the Overview does at /dashboard. */
  end: boolean;
  /** `dashboard.nav.*`, and `nav-<key>` for the tour's anchor. */
  key: NavKey;
  Icon: LucideIcon;
  min: Role;
}

export interface NavGroup {
  /** `dashboard.groups.*` */
  key: GroupKey;
  items: NavItem[];
}

const GROUPS: readonly { key: GroupKey; items: readonly NavItem[] }[] = NAV_GROUPS;
const ITEMS: readonly NavItem[] = GROUPS.flatMap((group) => group.items);

/** The groups this role has any business seeing, with empty ones dropped. A
 * role nobody knows yet sees none. */
export function visibleGroups(role: Role | null): NavGroup[] {
  return GROUPS.map((group) => ({
    key: group.key,
    items: group.items.filter((item) => atLeast(role, item.min)),
  })).filter((group) => group.items.length > 0);
}

/**
 * The phone bar's four pages, in its own order. Scan sits in the middle,
 * because it is the one action among readings and the one screen anyone
 * opens with a customer waiting; what the shop did and who it did it with
 * read outwards from it on the leading side, and what just happened on the
 * trailing side. The fifth slot is the role's: More, or the account.
 */
export const BAR_KEYS = ["overview", "customers", "scan", "activity"] as const satisfies readonly NavKey[];

export function barItems(role: Role | null): NavItem[] {
  const counter = visibleGroups(role).find((group) => group.key === "counter");
  return BAR_KEYS.flatMap((key) => counter?.items.find((item) => item.key === key) ?? []);
}

/** Everything this role can open that the bar doesn't carry, by group: the
 * More sheet. Empty for staff, whose whole job is on the bar. */
export function moreGroups(role: Role | null): NavGroup[] {
  return visibleGroups(role).filter((group) => group.key !== "counter");
}

/** Whether a path is this page or one under it: `/dashboard/messages/new`
 * belongs to Messages. */
export function isAt(item: NavItem, pathname: string): boolean {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  return item.end ? path === item.to : path === item.to || path.startsWith(`${item.to}/`);
}

/** The page a path belongs to, whoever is looking, or null for a path the
 * navigation has no page for. */
export function pageFor(pathname: string): NavItem | null {
  return ITEMS.find((item) => isAt(item, pathname)) ?? null;
}

/** Whether More should light for this path: only for a page in this role's
 * own More, never for one it doesn't hold (a page above the role, a path
 * with no page). */
export function inMore(pathname: string, role: Role | null): boolean {
  const page = pageFor(pathname);
  if (!page) return false;
  return moreGroups(role).some((group) => group.items.some((item) => item.key === page.key));
}
