import { createContext, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMyBusiness, type Business } from "../api/businesses";
import type { Role } from "../api/team";
import { roleOf } from "./gating";

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
  refetch: () => void;
}

export const BusinessContext = createContext<BusinessContextValue | null>(
  null,
);

export function BusinessProvider({ children }: { children: ReactNode }) {
  // A fresh user 404s here (no Business yet) — that's an expected, common
  // state, not worth retrying. query.error stays set (unused by consumers
  // here) rather than thrown; hasBusiness:false covers the same ground.
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
    refetch: () => void query.refetch(),
  };

  return (
    <BusinessContext.Provider value={value}>
      {children}
    </BusinessContext.Provider>
  );
}
