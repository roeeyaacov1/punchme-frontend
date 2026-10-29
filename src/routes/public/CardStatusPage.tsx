import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ApiError } from "../../api/errors";
import { getPublicCard } from "../../api/loyalty";
import { Button, EmptyState, Loading, Skeleton } from "../../components/kit";
import { browserStorage, rememberHeldCard } from "../../lib/heldCards";
import { isolate } from "../dashboard/problem";
import { JoinedCard } from "./join/JoinedCard";
import { PublicPage } from "./PublicPage";

/**
 * `/c/:serial`: where the QR on a lost pass, and the link under the join's
 * card, both land. Someone who can't find their pass gets it back in one
 * move, and knows it's theirs: the shop named, where the card stands, the
 * real pass (never a mock: this is the page for someone who can't find
 * theirs), and the button that adds this same card again.
 *
 * The pass's stage lights on as it takes the skeleton's place (240ms): a
 * return, not the join's ceremony.
 *
 * A pass still being issued is re-checked here too, the same read every
 * 3 s for three minutes at most. A link that leads to no card says how to
 * get it back; a read that failed says so and offers the same read again,
 * and never claims the card is gone.
 */
export function CardStatusPage() {
  const { t } = useTranslation();
  const { serial = "" } = useParams<{ serial: string }>();
  const { data: card, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["card", serial],
    queryFn: () => getPublicCard(serial),
    enabled: !!serial,
    retry: false,
    // Its own read on every load, even straight after a join that has the
    // same card in the cache.
    refetchOnMount: "always",
  });

  // Whoever opens this page holds the card: remember the token its wallet
  // QR carries, so /p/<token> can greet them as its holder (lib/heldCards).
  useEffect(() => {
    if (card && serial) rememberHeldCard(browserStorage(), card.public_token, serial);
  }, [card, serial]);

  const notFound = error instanceof ApiError && error.status === 404;
  const title = card
    ? t("enroll.pageTitleCard", { business: isolate(card.business_name) })
    : t("enroll.status.pageTitle");

  return (
    <PublicPage variant="customer" title={title} className="items-center pt-2">
      <div className="flex w-full max-w-[30rem] flex-col">
        {isLoading ? (
          // The card screen's own rhythm, so the stage lights on where its
          // placeholder stood: the title's row and the line's, a third row
          // on a phone (where the shop's name or the line usually wraps),
          // then the stage at its height.
          <Loading className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Skeleton className="my-[5px] h-6 w-3/4" />
              <Skeleton className="my-1 h-4 w-full" />
              <Skeleton className="my-1 h-4 w-2/3 sm:hidden" />
            </div>
            <Skeleton className="mx-auto h-[25rem] w-full max-w-[340px] !rounded-card" />
          </Loading>
        ) : card ? (
          <JoinedCard serial={serial} card={card} returning arrival="lights" />
        ) : notFound ? (
          <EmptyState titleAs="h1" title={t("enroll.status.notFoundTitle")} body={t("enroll.status.notFoundBody")} />
        ) : (
          <EmptyState
            titleAs="h1"
            title={t("enroll.status.failedTitle")}
            // The cause, when it is known: no connection. A server's own
            // failure has no sentence a customer could act on.
            body={error instanceof TypeError ? t("enroll.offline") : undefined}
            action={
              <Button variant="secondary" busy={isFetching} onClick={() => void refetch()}>
                {t("common.retry")}
              </Button>
            }
          />
        )}
      </div>
    </PublicPage>
  );
}
