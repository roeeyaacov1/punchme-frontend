import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";
import { Loading, Skeleton } from "../components/kit";
import { column } from "../components/onboarding/column";
import { Opening } from "../components/opening/Opening";
import { TopBar } from "../components/onboarding/TopBar";
import { useWideFrame, WideProvider } from "../components/onboarding/useWide";
import { cn } from "../lib/cn";
import { setWizardFrameShown } from "./wizardFrame";

/**
 * What a cold load shows while a group that loads on demand fetches its
 * code: the router's `fallbackElement`, so a slow phone sees the frame it is
 * about to get rather than a blank page.
 *
 * - The dashboard: the opening, the first of the waits before the shell, on
 *   the ground `index.html`'s pre-paint script has already set. The router
 *   shows this only as the page loads, so the wait began at the tap.
 * - The wizard: its own top bar on the wall, and the road, the card and the
 *   question still on their way.
 * - Admin and the checkout returns: the kit's loading line on the page.
 */
export function RouteLoading() {
  const { pathname } = useLocation();
  if (/^\/dashboard(\/|$)/.test(pathname)) return <Opening fromLoad />;
  if (/^\/onboarding(\/|$)/.test(pathname)) return <WizardLoading />;
  return (
    <Loading className="flex min-h-dvh items-center justify-center bg-background p-6">
      <Skeleton className="h-4 w-40" />
    </Loading>
  );
}

/** The wizard's frame on the column the wizard will stand on. While it is
 * up, the wizard's own wait knows to take over from it at once. */
function WizardLoading() {
  const [wide, setColumn] = useWideFrame();
  useLayoutEffect(() => {
    setWizardFrameShown(true);
    return () => setWizardFrameShown(false);
  }, []);
  return (
    <WideProvider value={wide}>
      <div className="theme-lightbox flex min-h-svh flex-col bg-background text-ink">
        <TopBar />
        <main ref={setColumn} className={cn(column(wide), "pt-2")}>
          <WizardSkeleton />
        </main>
      </div>
    </WideProvider>
  );
}

/** The road, the card and the question, on their way. Also the wizard's
 * own while it learns whether it opens on the card looks. */
export function WizardSkeleton() {
  return (
    <Loading className="flex flex-col gap-6">
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="mx-auto h-[12.5rem] w-[340px] max-w-full !rounded-glass" />
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-12 w-full !rounded-field" />
    </Loading>
  );
}
