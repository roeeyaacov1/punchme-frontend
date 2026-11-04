import { useEffect, useLayoutEffect, useState, useSyncExternalStore, type CSSProperties } from "react";
import { Loading, useReducedMotion } from "../kit";
import { appearAt, createOpeningStore, leaveAt } from "./waits";

const opening = createOpeningStore({
  now: () => performance.now(),
  nextFrame: (callback) => {
    const frame = requestAnimationFrame(callback);
    return () => cancelAnimationFrame(frame);
  },
});

/** The exit (180 ms, or 150 ms with reduced motion) and room for its last
 * frame: the layer ends by then even where the animation never reports. */
const EXIT_MS = 300;

/**
 * What every wait between the tap and the shell renders: the router's
 * stand-in while the dashboard's code arrives, the start-up check, the
 * business being read, and staff's check for /admin. It draws nothing of
 * its own; it holds the one `OpeningLayer` on screen, so going from one wait
 * to the next never starts the stamps again.
 *
 * `fromLoad`: this wait only comes with the page's first load, so the first
 * opening counts from the tap.
 */
export function Opening({ fromLoad = false }: { fromLoad?: boolean }) {
  useLayoutEffect(() => opening.hold({ fromLoad }), [fromLoad]);
  return null;
}

/**
 * The opening: one layer over everything, mounted once beside the router,
 * on the ground <html> wears (Lightbox for the dashboard from the first
 * paint, by index.html's pre-paint script). Nothing until a wait holds it,
 * so the public pages never see it.
 *
 * For the first 0.9 s it is the ground alone; then a row of five stamps
 * comes on and fills one by one while the waits last (`waits.ts` has the
 * timings and why). When the last wait lets go, the shell is mounted under
 * it and the whole layer fades off it in the kit's exit. The stamps sit
 * inside the kit's `Loading`, mounted once and only when they appear, so a
 * screen reader hears "Loading" once, and only on an open slow enough to
 * show them.
 */
export function OpeningLayer() {
  const state = useSyncExternalStore(opening.subscribe, opening.state);
  if (state.origin === null) return null;
  return <OpeningRun key={state.run} run={state.run} origin={state.origin} overAt={state.overAt} />;
}

function OpeningRun({ run, origin, overAt }: { run: number; origin: number; overAt: number | null }) {
  const reduced = useReducedMotion();
  const [shownAt, setShownAt] = useState<number | null>(null);
  const [leaving, setLeaving] = useState(false);

  // The stamps come on at the threshold, unless the waits are over first.
  useEffect(() => {
    if (shownAt !== null || overAt !== null) return;
    const id = setTimeout(() => setShownAt(performance.now()), Math.max(0, appearAt(origin) - performance.now()));
    return () => clearTimeout(id);
  }, [origin, overAt, shownAt]);

  // Once the waits are over, the layer gives way: at once, or after its hold.
  useEffect(() => {
    if (overAt === null || leaving) return;
    const id = setTimeout(() => setLeaving(true), Math.max(0, leaveAt(overAt, shownAt) - performance.now()));
    return () => clearTimeout(id);
  }, [overAt, shownAt, leaving]);

  // Ends with its exit; the timer covers a tab whose animations are paused.
  useEffect(() => {
    if (!leaving) return;
    const id = setTimeout(() => opening.end(run), EXIT_MS);
    return () => clearTimeout(id);
  }, [leaving, run]);

  return (
    <div
      className="opening"
      data-leaving={leaving || undefined}
      data-reduced={reduced || undefined}
      onAnimationEnd={(event) => {
        if (leaving && event.target === event.currentTarget) opening.end(run);
      }}
    >
      {shownAt !== null && (
        <Loading className="opening-centre">
          <span aria-hidden className="opening-stamps">
            {[0, 1, 2, 3, 4].map((index) => (
              <span key={index} className="opening-stamp" style={{ "--opening-i": index } as CSSProperties} />
            ))}
          </span>
        </Loading>
      )}
    </div>
  );
}
