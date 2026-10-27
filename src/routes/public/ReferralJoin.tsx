import { Trans, useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { getPublicCard } from "../../api/loyalty";
import { referralJoin, requestReferralOtp, type PublicCardPage } from "../../api/referrals";
import { LitPanel, linkText } from "../../components/kit";
import { cn } from "../../lib/cn";
import { browserStorage, rememberHeldCard } from "../../lib/heldCards";
import { toNameCase } from "../../lib/name";
import { isolate } from "../dashboard/problem";
import { JoinSteps } from "./join/JoinSteps";
import { useJoinFlow } from "./join/useJoinFlow";
import { PublicPage } from "./PublicPage";
import { ShopLine } from "./Shop";

/**
 * The friend's join, on the page behind a member's wallet QR: the sign of
 * `/join`, which here always knows the card (from `/api/p`), then the same
 * form, code step and card, written once in `./join`.
 *
 * Two differences the friend never sees: the requests go to the member's
 * token rather than a design id, with this browser's device id, so the join
 * is attributed to the member; and whether there is a code step comes from
 * the page itself (`otp_required`) rather than from the build, so the API
 * and the page cannot disagree about it.
 *
 * `referral_status` comes back with the card but is not shown: "rejected"
 * and "flagged" are the shop's business, and the friend's card is theirs
 * either way. `already_member` is: they get the card they already hold,
 * as "your card at…" rather than a welcome.
 */
export function ReferralJoin({
  token,
  page,
  deviceId,
  signedIn,
}: {
  token: string;
  page: PublicCardPage;
  deviceId: string | null;
  signedIn: boolean;
}) {
  const { t } = useTranslation();
  const flow = useJoinFlow({
    otpRequired: page.otp_required,
    requestCode: (phone) => requestReferralOtp(token, phone),
    join: async ({ phone, name, birthday, optIn, code }) => {
      const result = await referralJoin(token, {
        phone,
        otp_code: code ?? "",
        display_name: toNameCase(name),
        birthday: birthday || undefined,
        marketing_opt_in: optIn,
        device_id: deviceId ?? undefined,
      });
      const card = await getPublicCard(result.card_serial);
      rememberHeldCard(browserStorage(), card.public_token, result.card_serial);
      return { serial: result.card_serial, card, alreadyMember: result.already_member };
    },
  });

  const { step } = flow;
  const lineShop = (
    <Trans
      i18nKey="enroll.sign.lineShop"
      count={page.stamps_required}
      values={{ count: page.stamps_required, reward: page.reward_description }}
      components={{ n: <bdi dir="ltr" className="type-figure" />, reward: <bdi /> }}
    />
  );
  const title =
    step.kind === "card"
      ? t("enroll.pageTitleCard", { business: step.joined.card.business_name })
      : t("enroll.pageTitle");
  const onSign = step.kind === "sign" || step.kind === "held";

  return (
    <PublicPage variant="customer" title={title} className={cn("items-center", onSign ? "justify-center" : "pt-2")}>
      <div className="flex w-full max-w-[30rem] flex-col">
        <JoinSteps
          flow={flow}
          sign={{
            lead: (
              <div className="flex flex-col items-center gap-3">
                <p className="type-label text-ink-muted">
                  {page.referrer_display
                    ? t("publicCard.join.invitedBy", { name: isolate(page.referrer_display) })
                    : t("publicCard.join.invited")}
                </p>
                <ShopLine shop={page} />
              </div>
            ),
            line: lineShop,
            notTakingLine: (
              <Trans
                i18nKey="enroll.notTakingShop"
                values={{ business: page.business_name }}
                components={{ shop: <bdi className="[overflow-wrap:anywhere]" /> }}
              />
            ),
          }}
          band={
            <LitPanel light="band" className="flex flex-col items-center gap-2 p-4 text-center">
              <ShopLine shop={page} />
              <p className="type-body text-ink">{lineShop}</p>
            </LitPanel>
          }
        />
        {step.kind === "sign" && (
          <>
            <p className="type-body mt-4 text-center text-ink-muted">{t("enroll.sign.under")}</p>
            <StaffDoor token={token} business={page.business_name} signedIn={signedIn} className="mt-6" />
          </>
        )}
      </div>
    </PublicPage>
  );
}

/**
 * The one line on these pages that speaks to the shop's own team: a
 * member who scanned a pass while signed out (an installed iPhone app keeps
 * its session apart from Safari) is one sign-in from the stamp screen, and
 * comes back here. Signed in to another shop, it says so instead.
 */
export function StaffDoor({
  token,
  business,
  signedIn,
  className,
}: {
  token: string;
  business: string;
  signedIn: boolean;
  className?: string;
}) {
  const { t } = useTranslation();
  if (signedIn) {
    return <p className={cn("type-body text-center text-ink-muted", className)}>{t("publicCard.card.notYourShop")}</p>;
  }
  return (
    <p className={cn("type-body text-center text-ink-muted", className)}>
      <Trans i18nKey="publicCard.card.staffHint" values={{ business }} components={{ shop: <bdi className="[overflow-wrap:anywhere]" /> }} />{" "}
      <Link
        to="/login"
        state={{ from: { pathname: `/p/${token}` } }}
        className={cn(linkText, "inline-flex min-h-11 items-center align-middle")}
      >
        {t("publicCard.card.signIn")}
      </Link>
    </p>
  );
}
