import { createContext, useContext, useEffect, useState } from "react";

/**
 * Whether the wizard stands in two columns: the step, and the card in a
 * column of its own at the end. From 1024px, while the screen is at least
 * 58rem: the step's 30rem, the card's 22rem, the gap between them (4rem at
 * most) and the page's 1rem sides. So two columns never leave the step less
 * room than the one column gives it (30rem). At the default text size they
 * always fit from 1024px (58rem is 928px), and the step has 34rem or more.
 * Large text narrows it in rem: at 200% on a 1280px screen it would have
 * 12rem beside the card's 704px, so the wizard keeps the tablet's one
 * column until the screen is as much wider (1856px at 200%).
 */
function standsWide(): boolean {
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  return window.matchMedia(`(min-width: ${Math.max(1024, 58 * rem)}px)`).matches;
}

const Wide = createContext(false);

/** What the frame decided, for everything inside it. */
export const WideProvider = Wide.Provider;

/**
 * The wizard's layout, decided once by its frame and followed as the screen
 * and the text size change, and a ref for the frame's column. A new text
 * size fires no event of its own, but the column changes size with it: its
 * sides are in rem.
 */
export function useWideFrame() {
  const [wide, setWide] = useState(() => typeof window !== "undefined" && standsWide());
  const [box, setBox] = useState<HTMLElement | null>(null);
  useEffect(() => {
    const update = () => setWide(standsWide());
    update();
    window.addEventListener("resize", update);
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(update);
    if (box) observer?.observe(box);
    return () => {
      window.removeEventListener("resize", update);
      observer?.disconnect();
    };
  }, [box]);
  return [wide, setBox] as const;
}

/** Whether the wizard stands in two columns (`useWideFrame`). */
export function useWide(): boolean {
  return useContext(Wide);
}
