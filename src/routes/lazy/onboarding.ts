// The wizard, loaded on demand as one chunk, so stepping through it never
// waits between steps.
export { OnboardingLayout } from "../onboarding/OnboardingLayout";
export { OnboardingIndex } from "../onboarding/OnboardingIndex";
export { OnboardingGate } from "../onboarding/OnboardingGate";
// One screen at five addresses: the map at /reward, its trays at /business,
// /color, /accent and /stamp. The same component under every name, so moving
// between them keeps the card on screen rather than mounting it again.
export {
  CardStep as BusinessStep,
  CardStep as ColorStep,
  CardStep as AccentStep,
  CardStep as StampStep,
  CardStep as RewardStep,
} from "../onboarding/steps/CardStep";
export { AccountStep } from "../onboarding/steps/AccountStep";
export { WalletStep } from "../onboarding/steps/WalletStep";
export { BillingStep } from "../onboarding/steps/BillingStep";
