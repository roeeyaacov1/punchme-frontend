import { createContext, useContext } from "react";
import type { PreviewPlatform } from "../../components/card-studio/CardPreviews";

/** Which wallet the card is shown in, kept across the wizard's screens: an
 * owner who switched to Google on the card screen still sees Google on the
 * next one. */
export const StageWallet = createContext<[PreviewPlatform, (wallet: PreviewPlatform) => void] | null>(null);

export function useStageWallet(): [PreviewPlatform, (wallet: PreviewPlatform) => void] {
  const value = useContext(StageWallet);
  if (!value) throw new Error("useStageWallet must be used inside the wizard");
  return value;
}
