import { Navigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { BusinessProvider } from "../../business/BusinessProvider";
import { useBusiness } from "../../business/useBusiness";
import { useOnboardingDraft } from "./useOnboardingDraft";
import { firstIncompleteStep } from "./draft";

/**
 * `/onboarding` itself decides where the owner belongs:
 *
 * | signed in | business | draft                     | go to                |
 * |-----------|----------|---------------------------|----------------------|
 * | no        | –        | any                       | first incomplete step|
 * | yes       | none     | any                       | first incomplete step|
 * | yes       | exists   | committed with a template | wallet               |
 * | yes       | exists   | anything else in progress | its first incomplete |
 * | yes       | exists   | empty                     | /dashboard           |
 *
 * Renders nothing while auth or the business are still loading rather than
 * guessing and bouncing twice.
 */
export function OnboardingIndex() {
  const { isAuthenticated, isLoading } = useAuth();
  const { draft, hasArt } = useOnboardingDraft();
  if (isLoading) return null;
  if (!isAuthenticated) {
    return <Navigate to={`/onboarding/${firstIncompleteStep(draft, hasArt)}`} replace />;
  }
  return (
    <BusinessProvider>
      <SignedInIndex />
    </BusinessProvider>
  );
}

function SignedInIndex() {
  const { isLoading, hasBusiness } = useBusiness();
  const { draft, hasArt } = useOnboardingDraft();
  if (isLoading) return null;

  const first = firstIncompleteStep(draft, hasArt);
  if (!hasBusiness) return <Navigate to={`/onboarding/${first}`} replace />;
  if (draft.committed?.templateId) return <Navigate to="/onboarding/wallet" replace />;

  const inProgress = draft.committed !== null || draft.name.trim() !== "" || draft.background !== null;
  if (inProgress) return <Navigate to={`/onboarding/${first}`} replace />;
  return <Navigate to="/dashboard" replace />;
}
