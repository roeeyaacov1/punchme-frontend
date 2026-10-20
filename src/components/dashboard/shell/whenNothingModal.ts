/** At most this long for a closing sheet to finish before going ahead. */
const WAIT_MS = 1_500;

/**
 * Resolves once no modal dialog is open. A sheet that is closing keeps the
 * rest of the page inert until its exit ends: nothing outside it can take
 * focus or a tap meanwhile, and a live region updated then may go unread.
 * So whatever comes after a sheet (the tour opening, a page being announced)
 * waits for it, a second and a half at most.
 */
export function whenNothingModal(): Promise<void> {
  return new Promise((resolve) => {
    const started = performance.now();
    const check = () => {
      if (!document.querySelector("dialog:modal") || performance.now() - started > WAIT_MS) {
        resolve();
      } else {
        window.setTimeout(check, 50);
      }
    };
    check();
  });
}
