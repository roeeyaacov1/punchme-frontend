import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { BusinessProvider } from "../../business/BusinessProvider";
import { Loading, Skeleton } from "../../components/kit";

/**
 * The wallet and billing steps need an account. This is `ProtectedRoute` in
 * spirit, but it keeps the owner inside the wizard: signed out means "go and
 * make the account", not `/login`, and while the session loads, the screen's
 * place is held in the wizard's own frame rather than a full-screen block.
 * It asks for an account only; the two steps read the business themselves
 * and send an owner who has none back to the account step.
 */
export function OnboardingGate() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return (
      <Loading className="flex flex-col gap-4">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-12 w-full !rounded-field" />
      </Loading>
    );
  }
  if (!isAuthenticated) return <Navigate to="/onboarding/account" replace />;
  return (
    <BusinessProvider>
      <Outlet />
    </BusinessProvider>
  );
}
