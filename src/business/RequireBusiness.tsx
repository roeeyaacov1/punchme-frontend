import { Navigate, Outlet } from "react-router-dom";
import {
  BusinessLoadFailed,
  BusinessLoading,
  SessionEnded,
} from "../components/dashboard/shell/BusinessPages";
import { useBusiness } from "./useBusiness";

/**
 * The business behind every dashboard page. Onboarding only for an account
 * that has none (a 404): a 500, or no connection, says so and offers to try
 * again instead of sending a live shop back to the wizard.
 */
export function RequireBusiness() {
  const { status } = useBusiness();

  if (status === "loading") return <BusinessLoading />;
  if (status === "none") return <Navigate to="/onboarding" replace />;
  if (status === "signedOut") return <SessionEnded />;
  if (status === "failed") return <BusinessLoadFailed />;
  return <Outlet />;
}
