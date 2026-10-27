import { endsSession } from "./endsSession";

export interface CheckSessionOptions<U> {
  /** Who is signed in: `GET /api/auth/me`. */
  read: () => Promise<U>;
  /** The server answered with the user. The check is over. */
  onUser: (user: U) => void;
  /** The server said the session is over (`endsSession`). The check is over. */
  onEnded: () => void;
  /** A try didn't get through, or ran out of patience. Still signed in, and
   * still trying. */
  onUnreachable: () => void;
  /** Whether a try is out: what "Try again" shows as busy. */
  onTrying: (trying: boolean) => void;
  isOnline?: () => boolean;
  /** Where the browser says it is back online. */
  events?: Pick<EventTarget, "addEventListener" | "removeEventListener">;
  patienceMs?: number;
  /** The waits between tries that didn't get through; the last repeats. */
  delaysMs?: readonly number[];
}

export interface SessionCheck {
  /** Tries at once, unless a try is already out, and starts the waits over. */
  retry: () => void;
  /** Stops for good: nothing is reported after it. */
  cancel: () => void;
}

/**
 * The start-up check, apart from the provider so it can be tested.
 *
 * Asks who is signed in until the server settles it: with the user, or by
 * refusing the session (`endsSession`). A try that fails any other way —
 * no answer, cut off, the throttle, a 5xx — says nothing about the session,
 * so it reports `onUnreachable` and tries again in 5, 10, 20 and 40 s, then
 * every minute; never on the clock while the browser says it is offline.
 * Coming back online, or `retry()`, tries at once and starts the waits over.
 *
 * A try gets 4 s. One that hasn't answered by then counts as one that
 * didn't get through, so the pages waiting on the check can stop, and a
 * request hanging on a bad connection doesn't hold up the next try. If it
 * answers after all, a user or a refusal still counts.
 */
export function checkSession<U>({
  read,
  onUser,
  onEnded,
  onUnreachable,
  onTrying,
  isOnline = () => navigator.onLine,
  events = window,
  patienceMs = 4_000,
  delaysMs = [5_000, 10_000, 20_000, 40_000, 60_000],
}: CheckSessionOptions<U>): SessionCheck {
  let over = false;
  // The newest try, and whether it is still out within its patience. Only
  // its failure moves the next try; an older one it replaced is ignored.
  let newest = 0;
  let waiting = false;
  let failures = 0;
  let next: ReturnType<typeof setTimeout> | undefined;
  let patience: ReturnType<typeof setTimeout> | undefined;

  function stop() {
    over = true;
    clearTimeout(next);
    clearTimeout(patience);
    events.removeEventListener("online", retry);
  }

  function settle(report: () => void) {
    const wasWaiting = waiting;
    waiting = false;
    stop();
    if (wasWaiting) onTrying(false);
    report();
  }

  function didNotGetThrough() {
    waiting = false;
    clearTimeout(patience);
    onTrying(false);
    failures += 1;
    onUnreachable();
    if (isOnline()) {
      next = setTimeout(attempt, delaysMs[Math.min(failures, delaysMs.length) - 1]);
    }
  }

  function attempt() {
    if (over || waiting) return;
    // A try that starts early (retry, back online) replaces the one due.
    clearTimeout(next);
    const id = ++newest;
    waiting = true;
    onTrying(true);
    patience = setTimeout(() => {
      if (id === newest && waiting) didNotGetThrough();
    }, patienceMs);
    read().then(
      (user) => {
        if (!over) settle(() => onUser(user));
      },
      (failure: unknown) => {
        if (over) return;
        if (endsSession(failure)) settle(onEnded);
        else if (id === newest && waiting) didNotGetThrough();
      },
    );
  }

  function retry() {
    if (over) return;
    failures = 0;
    attempt();
  }

  events.addEventListener("online", retry);
  attempt();
  return { retry, cancel: stop };
}
