import { createContext, useContext, useLayoutEffect } from "react";

/**
 * A page's own name, where the navigation's doesn't fit it.
 *
 * The shell titles every dashboard page by its navigation label, the way
 * onboarding titles its steps ("סריקה — פאנץ' מי"); a nested page takes its
 * parent's. The shell's own pages say something else: the refusal, the page
 * with no page behind it and the page that failed each name themselves, and
 * the same name is what the route announcement reads out.
 */
export const PageTitleOverride = createContext<((name: string | null) => void) | null>(null);

/** Names the calling page for as long as it is mounted. */
export function usePageTitle(name: string): void {
  const set = useContext(PageTitleOverride);
  useLayoutEffect(() => {
    set?.(name);
    return () => set?.(null);
  }, [set, name]);
}
