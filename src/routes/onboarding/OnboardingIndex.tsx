import { Navigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { BusinessProvider } from "../../business/BusinessProvider";
import { isOwner } from "../../business/gating";
import { useBusiness } from "../../business/useBusiness";
import { useOnboardingDraft } from "./useOnboardingDraft";
import { firstIncompleteStep, hasDraftInProgress } from "./draft";

/**
 * `/onboarding` itself decides where the owner belongs:
 *
 * | signed in | business              | draft                     | go to                |
 * |-----------|-----------------------|---------------------------|----------------------|
 * | no        | –                     | any                       | first incomplete step|
 * | yes       | none                  | any                       | first incomplete step|
 * | yes       | yours to staff/manage | any                       | /dashboard           |
 * | yes       | owned                 | committed with a template | wallet               |
 * | yes       | owned                 | anything else in progress | its first incomplete |
 * | yes       | owned                 | empty                     | /dashboard           |
 *
 * A hire never resumes a draft: one left on a shared device is someone
 * else's card, and the wizard's saves are the owner's to make.
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
  const { isLoading, hasBusiness, role } = useBusiness();
  const { draft, hasArt } = useOnboardingDraft();
  if (isLoading) return null;

  const first = firstIncompleteStep(draft, hasArt);
  if (!hasBusiness) return <Navigate to={`/onboarding/${first}`} replace />;
  if (!isOwner(role)) return <Navigate to="/dashboard" replace />;
  if (draft.committed?.templateId) return <Navigate to="/onboarding/wallet" replace />;

  if (hasDraftInProgress(draft)) return <Navigate to={`/onboarding/${first}`} replace />;
  return <Navigate to="/dashboard" replace />;
}
