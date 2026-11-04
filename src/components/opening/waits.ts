/**
 * When the opening shows anything, how long it stays once it has, and when
 * it is over. Chosen from cold opens of /dashboard measured frame by frame
 * on the production build (4 Nov 2026), counted from the tap:
 *
 * - A warm desk open reached the shell at 0.25 s against the local API and
 *   0.75 s with a 150 ms round trip to it; a cold one at 1.3 s. A phone on
 *   Fast 4G with its CPU slowed four times got there at 1.6 s, on Slow 4G at
 *   3.9 s, and cold on Slow 4G at 5.5 s.
 * - `appearAfter`: nothing but the ground for 0.9 s, which clears every warm
 *   desk open measured, so the commonest open shows the ground and then the
 *   shell, nothing between.
 * - `holdAtLeast`: once the stamps have begun to show they stay 0.4 s, the
 *   row's 240 ms entrance and as long again, so they never read as a
 *   flicker. Only an open that lands in those 0.4 s is held, which the
 *   measurements put at cold desks alone.
 */
export const OPENING = { appearAfter: 900, holdAtLeast: 400 } as const;

/** When the stamps appear in an opening that began at `origin`. */
export function appearAt(origin: number): number {
  return origin + OPENING.appearAfter;
}

/** Whether the stamps get to show: the waits outlast the threshold. */
export function shows(origin: number, overAt: number | null): boolean {
  return overAt === null || overAt > appearAt(origin);
}

/**
 * When the layer starts to give way: as soon as the waits are over if
 * nothing showed, or once what showed has had its hold.
 */
export function leaveAt(overAt: number, shownAt: number | null): number {
  return shownAt === null ? overAt : Math.max(overAt, shownAt + OPENING.holdAtLeast);
}

/**
 * One opening, from the first wait to the last: `run` tells one from the
 * next, `origin` is when it began, `overAt` when the last wait let go.
 */
export interface OpeningState {
  run: number;
  origin: number | null;
  overAt: number | null;
}

export interface OpeningStore {
  /**
   * A wait holds the opening on screen until it lets go. `fromLoad`: the
   * wait can only come with the page's first load (the router's own
   * stand-in, the start-up check), so the first opening counts from the tap,
   * the page's own start, rather than from the moment the code ran.
   */
  hold: (options?: { fromLoad?: boolean }) => () => void;
  /** The layer has given way: opening `run` is done. Once; a later call, or
   * one about an opening already gone, changes nothing. */
  end: (run: number) => void;
  state: () => OpeningState;
  subscribe: (listener: () => void) => () => void;
}

/**
 * The waits share one opening. One wait hands over to the next inside one
 * commit, letting go and taking hold again, so "over" is decided a frame
 * after the last one lets go, never at once.
 */
export function createOpeningStore({
  now,
  nextFrame,
}: {
  now: () => number;
  nextFrame: (callback: () => void) => () => void;
}): OpeningStore {
  let holds = 0;
  let firstRun = true;
  let state: OpeningState = { run: 0, origin: null, overAt: null };
  let pending: (() => void) | null = null;
  const listeners = new Set<() => void>();

  function set(next: OpeningState) {
    state = next;
    listeners.forEach((listener) => listener());
  }

  function begin(fromLoad: boolean) {
    const origin = fromLoad && firstRun ? 0 : now();
    firstRun = false;
    set({ run: state.run + 1, origin, overAt: null });
  }

  return {
    hold({ fromLoad = false } = {}) {
      holds++;
      pending?.();
      pending = null;
      if (state.origin === null) begin(fromLoad);
      else if (state.overAt !== null) set({ ...state, overAt: null });
      let held = true;
      return () => {
        if (!held) return;
        held = false;
        holds--;
        if (holds > 0) return;
        pending?.();
        pending = nextFrame(() => {
          pending = null;
          if (holds === 0 && state.origin !== null && state.overAt === null) set({ ...state, overAt: now() });
        });
      };
    },
    end(run) {
      if (run !== state.run || state.origin === null) return;
      set({ run: state.run, origin: null, overAt: null });
      // A wait that took hold while the layer was giving way starts the next.
      if (holds > 0) begin(false);
    },
    state: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
