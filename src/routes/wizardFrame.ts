/**
 * Whether the wizard's loading frame is on screen: the frame a cold load
 * shows while the wizard's code is on its way (`RouteLoading`). The wizard
 * reads it as it first draws, while that frame is still up, and its own
 * wait takes over from it at once rather than going blank for its quiet
 * moment (`OnboardingLayout`).
 */
let shown = false;

export function wizardFrameShown(): boolean {
  return shown;
}

export function setWizardFrameShown(on: boolean) {
  shown = on;
}
