import { useContext } from "react";
import { DraftContext, type DraftContextValue } from "./DraftContext";

export function useOnboardingDraft(): DraftContextValue {
  const ctx = useContext(DraftContext);
  if (!ctx) throw new Error("useOnboardingDraft must be used within OnboardingDraftProvider");
  return ctx;
}
