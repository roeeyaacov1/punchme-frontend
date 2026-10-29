import { useMemo } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "../../api/errors";
import { getPublicCardPage, type PublicCardPage as PublicCardPageData } from "../../api/referrals";
import { useAuth } from "../../auth/useAuth";
import { Button, EmptyState, LinkButton, Loading, Skeleton } from "../../components/kit";
import { currentDeviceId } from "../../lib/deviceId";
import { browserStorage, heldCardSerial } from "../../lib/heldCards";
import { isolate } from "../dashboard/problem";
import { PublicPage } from "./PublicPage";
import { ReferralJoin, StaffDoor } from "./ReferralJoin";
import { CardChip } from "./Shop";
import { StampScreen } from "./StampScreen";

/**
 * The page behind the wallet QR: `/p/:token`.
 *
 * The same QR serves three people. The shop's own staff, phone signed in,
 * pointed a plain camera at a customer's pass because the dashboard was not
 * open — they get one thing to do, add the stamp, and nothing to read first.
 * With the shop's referral program on, anyone else is a friend of the
 * member whose card it is: they get a join attributed to that member. With
 * it off, the card's public face — whose design this is and how to get one.
 * Which of the three is decided by the server from the bearer token and
 * the program, so the request waits for the session to bootstrap — on a
 * fresh tab the access token is only in memory once AuthProvider has
 * refreshed it.
 *
 * The device id is this browser's own random value (lib/deviceId): sent
 * with the page so a scan today and a join next week can be told to be the
 * same person. Absent in a chat app's browser, which is allowed.
 *
 * A fourth person the server cannot see: the holder, scanning their own
 * pass. This browser may know (lib/heldCards) — it was shown the card when
 * they joined or opened it — and then says so instead of inviting them to
 * join their own card. The counter's stamp screen still wins when the
 * server has identified the shop's own staff.
 */

export function PublicCardPage() {
  const { t } = useTranslation();
  const { token } = useParams<{ token: string }>();
  const auth = useAuth();
  const queryClient = useQueryClient();
  const deviceId = useMemo(() => currentDeviceId(), []);
  const heldSerial = useMemo(() => heldCardSerial(browserStorage(), token), [token]);

  const { data: page, isLoading, error, refetch, isFetching } = useQuery({
    // The session is part of the key: the answer changes when it does.
    queryKey: ["publicCard", token, auth.isAuthenticated],
    queryFn: () => getPublicCardPage(token!, deviceId),
    enabled: !!token && !auth.isLoading,
    retry: false,
  });

  const pending = auth.isLoading || isLoading;
  const notFound = error instanceof ApiError && error.status === 404;

  if (page?.view === "stamp" && page.stamp && token) {
    return (
      <StampScreen
        token={token}
        page={page}
        stamp={page.stamp}
        onChanged={() => void queryClient.invalidateQueries({ queryKey: ["publicCard", token] })}
      />
    );
  }

  if (pending || !page || !token) {
    return (
      <PublicPage variant="customer" title={t("publicCard.pageTitle")} className="items-center pt-2">
        <div className="flex w-full max-w-[30rem] flex-col">
          {pending ? (
            <Loading className="flex flex-col items-center gap-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-28 w-full !rounded-panel" />
              <Skeleton className="h-4 w-2/3" />
            </Loading>
          ) : notFound ? (
            <EmptyState titleAs="h1" title={t("publicCard.notFoundTitle")} body={t("publicCard.notFound")} />
          ) : (
            <EmptyState
              titleAs="h1"
              title={t("enroll.status.failedTitle")}
              // The cause, when it is known: no connection.
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

  if (heldSerial) return <YourCard page={page} serial={heldSerial} />;
  if (page.view === "join") {
    return <ReferralJoin token={token} page={page} deviceId={deviceId} signedIn={auth.isAuthenticated} />;
  }
  return <CardFace token={token} page={page} signedIn={auth.isAuthenticated} />;
}

/** The holder, recognised by this browser: their own card, one tap away,
 * and — while the shop's program is on — what showing it to a friend does. */
function YourCard({ page, serial }: { page: PublicCardPageData; serial: string }) {
  const { t } = useTranslation();
  return (
    <PublicPage
      variant="customer"
      title={t("enroll.pageTitleCard", { business: isolate(page.business_name) })}
      className="items-center justify-center"
    >
      <div className="flex w-full max-w-[30rem] flex-col items-center gap-5 text-center">
        <h1 className="type-title text-balance">
          <Trans i18nKey="publicCard.yours.title" values={{ business: page.business_name }} components={{ shop: <bdi className="[overflow-wrap:anywhere]" /> }} />
        </h1>
        <CardChip shop={page} />
        {page.view === "join" && <p className="type-body text-pretty text-ink-muted">{t("publicCard.yours.hint")}</p>}
        <LinkButton to={`/c/${serial}`} size="lg" className="w-full !whitespace-normal text-center">
          {t("publicCard.yours.open")}
        </LinkButton>
      </div>
    </PublicPage>
  );
}

/** Whose card this is, and how to get one. Nothing about the holder.
 * PunchMe signs at the foot, as everywhere a customer stands. */
function CardFace({
  token,
  page,
  signedIn,
}: {
  token: string;
  page: PublicCardPageData;
  signedIn: boolean;
}) {
  const { t } = useTranslation();
  return (
    <PublicPage variant="customer" title={isolate(page.business_name)} className="items-center justify-center">
      <div className="flex w-full max-w-[30rem] flex-col items-center gap-5 text-center">
        <h1 dir="auto" className="type-title text-balance [overflow-wrap:anywhere]">
          {page.business_name}
        </h1>
        <CardChip shop={page} />
        <p className="type-body text-pretty text-ink">
          <Trans
            i18nKey="publicCard.card.collect"
            count={page.stamps_required}
            values={{ count: page.stamps_required, reward: page.reward_description }}
            components={{ n: <bdi dir="ltr" className="type-figure" />, reward: <bdi /> }}
          />
        </p>
        <LinkButton to={page.join_path} size="lg" className="w-full !whitespace-normal text-center">
          {t("publicCard.card.join")}
        </LinkButton>
        <StaffDoor token={token} business={page.business_name} signedIn={signedIn} className="mt-2" />
      </div>
    </PublicPage>
  );
}
