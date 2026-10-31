import { createContext } from "react";

/**
 * How a screen of the wizard arrives as the road moves: from the end edge
 * going on, from the start going back (both mirrored in Hebrew), or the
 * gentle fade with reduced motion; null on the first screen and once it has
 * arrived. The frame (`OnboardingLayout`) sets it as the stop changes, and
 * `StepShell` plays it on what the screen holds, never on its docked action:
 * a moving parent would carry a fixed bar off with it.
 */
export const StepArrival = createContext<{ motion: string | null; arrived: () => void }>({
  motion: null,
  arrived: () => {},
});
