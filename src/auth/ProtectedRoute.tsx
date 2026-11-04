import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Opening } from "../components/opening/Opening";
import { SessionUnreachable } from "./SessionUnreachable";
import { useAuth } from "./useAuth";

export function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();

  // The start-up check only runs as the page loads, so this wait began at
  // the tap.
  if (status === "checking") return <Opening fromLoad />;

  // Still signed in as far as anyone can tell: the server just can't be
  // reached to say so. Sending the owner to /login would ask for a password
  // the session doesn't need.
  if (status === "unreachable") return <SessionUnreachable />;

  if (status === "signedOut") {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
