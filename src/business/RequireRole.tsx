import { Outlet } from "react-router-dom";
import type { Role } from "../api/team";
import { RoleLoading, RoleRefusal } from "../components/dashboard/shell/RoleRefusal";
import { atLeast } from "./gating";
import { useBusiness } from "./useBusiness";

/**
 * UI gate for the dashboard routes a hire can't use — convenience only; the
 * real boundary is the API, which answers 403 (`insufficient_role`) on every
 * one of them.
 *
 * Says "no" out loud rather than redirecting, for the same reason
 * `RequireStaff` does: a silent bounce back to the overview is
 * indistinguishable from a broken link, which is how it gets reported. It
 * renders inside the dashboard shell — the person is signed in and in the
 * right place, they just can't open this page — so it is a panel in the
 * page area, not a full-screen block, and the page it guards makes none of
 * its calls.
 */
export function RequireRole({ minimum }: { minimum: Role }) {
  const { role, isLoading } = useBusiness();

  if (isLoading) return <RoleLoading />;
  if (!atLeast(role, minimum)) return <RoleRefusal minimum={minimum} />;
  return <Outlet />;
}
