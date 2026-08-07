import { createContext, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMyBusiness, type Business } from "../api/businesses";

export interface BusinessContextValue {
  business: Business | null;
  isLoading: boolean;
  hasBusiness: boolean;
  isPro: boolean;
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
    refetch: () => void query.refetch(),
  };

  return (
    <BusinessContext.Provider value={value}>
      {children}
    </BusinessContext.Provider>
  );
}
