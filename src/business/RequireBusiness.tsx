import { Navigate, Outlet } from "react-router-dom";
import { BusinessLoadFailed, SessionEnded } from "../components/dashboard/shell/BusinessPages";
import { Opening } from "../components/opening/Opening";
import { useBusiness } from "./useBusiness";

/**
 * The business behind every dashboard page. Onboarding only for an account
 * that has none (a 404): a 500, or no connection, says so and offers to try
 * again instead of sending a live shop back to the wizard.
 */
export function RequireBusiness() {
  const { status } = useBusiness();

  if (status === "loading") return <Opening />;
  // The wizard loads on demand: the opening holds the screen while its code
  // arrives, where the redirect alone would leave a blank page.
  if (status === "none") {
    return (
      <>
        <Navigate to="/onboarding" replace />
        <Opening />
      </>
    );
  }
  if (status === "signedOut") return <SessionEnded />;
  if (status === "failed") return <BusinessLoadFailed />;
  return <Outlet />;
}
