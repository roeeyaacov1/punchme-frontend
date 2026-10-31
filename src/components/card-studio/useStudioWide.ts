import { useEffect, useState } from "react";

/**
 * Whether the studio stands in two columns: the trays as tabs, beside the
 * card in a sticky column. From 64rem, which is 1024px at the default text
 * size. The card's column is 22rem and the trays need room of their own
 * beside it, so a larger text size keeps the phone's layout until the
 * screen is as much wider (2048px at 200%): at 200% on a 1280px screen, the
 * dashboard's whole column is narrower than the card's alone. Never under
 * 1024px, where the classes the two columns lean on (`lg:`) don't apply.
 */
function standsWide(): boolean {
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  return window.matchMedia(`(min-width: ${Math.max(1024, 64 * rem)}px)`).matches;
}

/**
 * The studio's layout, followed as the screen and the text size change,
 * and a ref for the studio's own box. A new text size fires no event of its
 * own, but that box changes size with it; the page's may not, on a screen
 * taller than the page.
 */
export function useStudioWide() {
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
