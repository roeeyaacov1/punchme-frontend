import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPublicCard, type CardPublic } from "../../api/loyalty";
import { WALLET_CHECK_MS, WALLET_WAIT_MS, walletWait } from "./wallet";

/**
 * The card while its wallet pass is being issued: the same read of the
 * public card every 3 s until the link appears, for three minutes at most,
 * then it stops and says so (`slow`). `recheck` is one more of the same
 * read. `/join`, the friend's join and `/c` all wait this way.
 */
export function useWalletPass(serial: string, initial: CardPublic) {
  const [startedAt] = useState(() => Date.now());
  const [now, setNow] = useState(startedAt);

  const query = useQuery({
    queryKey: ["card", serial],
    queryFn: () => getPublicCard(serial),
    initialData: initial,
    retry: false,
    refetchInterval: (q) =>
      walletWait(q.state.data ?? initial, Date.now() - startedAt) === "waiting" ? WALLET_CHECK_MS : false,
  });

  const card = query.data ?? initial;
  const wait = walletWait(card, now - startedAt);

  // Turns "waiting" into "slow" at three minutes even when no answer comes
  // in to re-render the page.
  useEffect(() => {
    if (wait !== "waiting") return;
    const timer = window.setTimeout(() => setNow(Date.now()), WALLET_WAIT_MS - (Date.now() - startedAt) + 50);
    return () => window.clearTimeout(timer);
  }, [wait, startedAt]);

  return {
    card,
    wait,
    checking: query.isFetching,
    recheck: () => void query.refetch(),
  };
}
