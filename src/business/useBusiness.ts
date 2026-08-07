import { useContext } from "react";
import { BusinessContext } from "./BusinessProvider";

export function useBusiness() {
  const ctx = useContext(BusinessContext);
  if (!ctx) throw new Error("useBusiness must be used within BusinessProvider");
  return ctx;
}
