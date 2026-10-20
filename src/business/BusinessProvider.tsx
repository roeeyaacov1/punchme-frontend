import { createContext, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMyBusiness, type Business } from "../api/businesses";
import { ApiError } from "../api/errors";
import type { Role } from "../api/team";
import { roleOf } from "./gating";

/**
 * Where the business stands, for the gate in front of the dashboard:
 * - `loading`: still on its way;
 * - `ready`: here;
 * - `none`: the account has no business yet (a 404), which is onboarding's;
 * - `signedOut`: a 401 the refresh couldn't answer, so the session is gone;
 * - `failed`: anything else, a 500 or no connection (a query paused
 *   offline counts), which must never read as "no business" and send a
 *   live shop to onboarding.
 */
export type BusinessStatus = "loading" | "ready" | "none" | "signedOut" | "failed";

export interface BusinessContextValue {
  business: Business | null;
  isLoading: boolean;
  hasBusiness: boolean;
  isPro: boolean;
  /** What the signed-in person is to this business — owner, manager or
   * staff. Carried on the business response itself, so the shell can decide
   * what to draw without a second request standing between a hire and the
   * scanner. Null only before the response lands. */
  role: Role | null;
  status: BusinessStatus;
  /** Asking again is under way: the failure page's "Try again" waits on it. */
  isFetching: boolean;
  refetch: () => void;
}

export const BusinessContext = createContext<BusinessContextValue | null>(
  null,
);

function statusOf(
  business: Business | null,
  error: unknown,
  paused: boolean,
): BusinessStatus {
  if (business) return "ready";
  if (error instanceof ApiError && error.status === 404) return "none";
  if (error instanceof ApiError && error.status === 401) return "signedOut";
  if (error || paused) return "failed";
  return "loading";
}

export function BusinessProvider({ children }: { children: ReactNode }) {
  // A fresh user 404s here (no Business yet) — that's an expected, common
  // state, not worth retrying. The error is kept rather than thrown, and
  // `status` says which kind of failure it was: `hasBusiness` alone can't
  // tell "none" from "couldn't ask".
  const query = useQuery({
    queryKey: ["business", "me"],
    queryFn: getMyBusiness,
    retry: false,
  });

  const business = query.data ?? null;

  const value: BusinessContextValue = {
    business,
    isLoading: query.isLoading,
    hasBusiness: !!business,
    isPro: business?.plan === "pro",
    role: roleOf(business),
    status: statusOf(business, query.error, query.fetchStatus === "paused"),
    isFetching: query.isFetching,
    refetch: () => void query.refetch(),
  };

  return (
    <BusinessContext.Provider value={value}>
      {children}
    </BusinessContext.Provider>
  );
}
