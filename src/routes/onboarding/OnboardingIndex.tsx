import { Navigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { BusinessProvider } from "../../business/BusinessProvider";
import { isOwner } from "../../business/gating";
import { useBusiness } from "../../business/useBusiness";
import { useOnboardingDraft } from "./useOnboardingDraft";
import { hasDraftInProgress } from "./draft";
import { whereToStart } from "./walk";

/**
 * `/onboarding` itself decides where the owner belongs:
 *
 * | signed in | business              | draft                     | go to                 |
 * |-----------|-----------------------|---------------------------|-----------------------|
 * | no        | –                     | any                       | where the walk stands |
 * | yes       | none                  | any                       | where the walk stands |
 * | yes       | yours to staff/manage | any                       | /dashboard            |
 * | yes       | owned                 | committed with a template | wallet                |
 * | yes       | owned                 | anything else in progress | where the walk stands |
 * | yes       | owned                 | empty                     | /dashboard            |
 *
 * Where the walk stands (`whereToStart`): the field the card still needs,
 * or a lost picture's stamp; otherwise the first part of the map not yet
 * opened; and once every part has been, saving.
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
    return <Navigate to={`/onboarding/${whereToStart(draft, hasArt)}`} replace />;
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

  const start = whereToStart(draft, hasArt);
  if (!hasBusiness) return <Navigate to={`/onboarding/${start}`} replace />;
  if (!isOwner(role)) return <Navigate to="/dashboard" replace />;
  if (draft.committed?.templateId) return <Navigate to="/onboarding/wallet" replace />;

  if (hasDraftInProgress(draft)) return <Navigate to={`/onboarding/${start}`} replace />;
  return <Navigate to="/dashboard" replace />;
}
