export interface PollOptions {
  /** The subscription, as Stripe's webhook has left it. */
  read: () => Promise<{ plan: string }>;
  /** The business, read again; null when it couldn't be read. */
  confirm: () => Promise<{ plan: string } | null>;
  onPro: () => void;
  /** The wait ran out; `unreachable` when the last check couldn't get through. */
  onGiveUp: (result: { unreachable: boolean }) => void;
  intervalMs?: number;
  timeoutMs?: number;
}

/**
 * The wait on `/billing/success`, apart from the page so it can be tested.
 *
 * Asks for the subscription every 2 s, and once it reads Pro asks for the
 * business too, handing over only when that also says Pro. It gives up
 * 30 s after it began, on the clock rather than between tries, because a
 * request can hang with no answer at all; a check still out then, or a
 * business that couldn't be read, counts as one that didn't get through.
 * A try that answers after the wait ended, or after it was cancelled,
 * changes nothing.
 *
 * Returns the cancel.
 */
export function pollForPro({
  read,
  confirm,
  onPro,
  onGiveUp,
  intervalMs = 2_000,
  timeoutMs = 30_000,
}: PollOptions): () => void {
  let over = false;
  let pending = false;
  let lastFailed = false;
  let next: ReturnType<typeof setTimeout> | undefined;

  const deadline = setTimeout(() => {
    if (over) return;
    over = true;
    clearTimeout(next);
    onGiveUp({ unreachable: lastFailed || pending });
  }, timeoutMs);

  async function attempt() {
    pending = true;
    let failed = false;
    try {
      const subscription = await read();
      if (over) return;
      if (subscription.plan === "pro") {
        const business = await confirm();
        if (over) return;
        if (!business) failed = true;
        else if (business.plan === "pro") {
          over = true;
          clearTimeout(deadline);
          onPro();
          return;
        }
      }
    } catch {
      failed = true;
    } finally {
      pending = false;
    }
    if (over) return;
    lastFailed = failed;
    next = setTimeout(attempt, intervalMs);
  }

  void attempt();
  return () => {
    over = true;
    clearTimeout(deadline);
    clearTimeout(next);
  };
}
