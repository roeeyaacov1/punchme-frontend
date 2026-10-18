/**
 * Stops the page scrolling behind a dialog or a sheet.
 *
 * On <html> rather than <body>, with a count, so two open layers (a sheet
 * that opens a dialog) release it only when both have closed, and so it
 * never fights the older overlays, which save and restore `body.style`.
 * Where the scrollbar takes up room (Windows' classic scrollbars) the page
 * is padded by its width on the scrollbar's side, the inline end in either
 * direction, so nothing shifts sideways while it's hidden.
 */
let holds = 0;
let saved: { overflow: string; paddingInlineEnd: string } | null = null;

export function lockScroll(): () => void {
  const root = document.documentElement;
  if (holds === 0) {
    const scrollbar = window.innerWidth - root.clientWidth;
    saved = { overflow: root.style.overflow, paddingInlineEnd: root.style.paddingInlineEnd };
    root.style.overflow = "hidden";
    if (scrollbar > 0) root.style.paddingInlineEnd = `${scrollbar}px`;
  }
  holds += 1;

  let released = false;
  return () => {
    if (released) return;
    released = true;
    holds -= 1;
    if (holds === 0 && saved) {
      root.style.overflow = saved.overflow;
      root.style.paddingInlineEnd = saved.paddingInlineEnd;
      saved = null;
    }
  };
}
