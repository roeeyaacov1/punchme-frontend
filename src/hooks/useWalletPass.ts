import { useCallback, useEffect, useState } from "react";
import { getPublicCard } from "../api/loyalty";

const POLL_MS = 3000;
/** ~1 minute of polling before we stop promising "just a moment". */
const MAX_ATTEMPTS = 20;

/** The wallet-ish shape both EnrollOut and CardPublicOut satisfy. */
export interface WalletPassSource {
  card_serial: string;
  wallet_pass_url?: string | null;
  wallet_issue_pending?: boolean;
}

export interface WalletPass {
  passUrl: string | null;
  /** Still waiting on the async issue — show the waiting note. */
  pending: boolean;
  /** Polling gave up; the pass is still being issued server-side. */
  slow: boolean;
  /** Start another polling round (for the slow state's "check again"). */
  retry: () => void;
}

/** Wallet passes are issued asynchronously: enroll/preview can return with
 * wallet_issue_pending and no URL yet. Poll the public card until the URL
 * lands, then stop. Without this the waiting note sits there forever. */
export function useWalletPass(card: WalletPassSource | null | undefined): WalletPass {
  const serial = card?.card_serial ?? null;
  const initialUrl = card?.wallet_pass_url ?? null;

  const [polledUrl, setPolledUrl] = useState<string | null>(null);
  const [gaveUp, setGaveUp] = useState(false);
  const [round, setRound] = useState(0);

  // A different card starts from scratch.
  useEffect(() => {
    setPolledUrl(null);
    setGaveUp(false);
  }, [serial]);

  const passUrl = initialUrl ?? polledUrl;
  const shouldPoll = !!serial && !passUrl && !gaveUp;

  useEffect(() => {
    if (!shouldPoll || !serial) return;
    let attempts = 0;
    let cancelled = false;
    const timer = window.setInterval(async () => {
      attempts += 1;
      try {
        const fresh = await getPublicCard(serial);
        if (cancelled) return;
        if (fresh.wallet_pass_url) {
          setPolledUrl(fresh.wallet_pass_url);
          return;
        }
      } catch {
        /* transient — keep polling until the attempt budget runs out */
      }
      if (!cancelled && attempts >= MAX_ATTEMPTS) setGaveUp(true);
    }, POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [shouldPoll, serial, round]);

  const retry = useCallback(() => {
    setGaveUp(false);
    setRound((r) => r + 1);
  }, []);

  return { passUrl, pending: shouldPoll, slow: gaveUp, retry };
}
