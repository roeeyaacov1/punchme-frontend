import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Trans, useTranslation } from "react-i18next";
import type { CardPublic } from "../../../api/loyalty";
import { Button, Skeleton, linkText } from "../../../components/kit";
import { cn } from "../../../lib/cn";
import { PassStage } from "../PassStage";
import { useWalletPass } from "../useWalletPass";
import { WalletButton } from "../WalletButton";
import { cardLine } from "./joinRules";

const LINES = { new: "enroll.card.lineNew", have: "enroll.card.lineHave", full: "enroll.card.lineFull" } as const;

/**
 * The moment the card arrives (the brief's §7.4), and `/c`'s page: the shop
 * named large, one line on where the card stands, the real pass in the
 * sign's light, and the wallet, named by the phone.
 *
 * While the pass is being issued the button's place holds a skeleton and
 * says so; the code on the pass already works at the counter. When the link
 * comes the button takes the skeleton's place and a polite status says the
 * pass is ready; after three minutes it stops and says it is taking longer,
 * with "check again".
 *
 * The heading takes focus when the card arrives: it is what a screen reader
 * hears first, so the live region keeps to what changes after.
 */
export function JoinedCard({
  serial,
  card: initial,
  holderName,
  returning,
  statusLink,
}: {
  serial: string;
  card: CardPublic;
  /** The name just typed, printed on the pass. */
  holderName?: string;
  returning: boolean;
  /** The way back to this card at `/c`, under the join's card. */
  statusLink?: boolean;
}) {
  const { t } = useTranslation();
  const heading = useRef<HTMLHeadingElement>(null);
  const { card, wait, checking, recheck } = useWalletPass(serial, initial);

  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
  }, []);

  const [announcement, setAnnouncement] = useState("");
  const [lastWait, setLastWait] = useState(wait);
  if (wait !== lastWait) {
    setLastWait(wait);
    if (wait === "ready") setAnnouncement(t("enroll.wallet.ready"));
    else if (wait === "slow") setAnnouncement(t("enroll.wallet.slow"));
  }

  const line = cardLine(card);
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <h1 ref={heading} tabIndex={-1} className="type-title text-balance outline-none">
          <Trans
            i18nKey={returning ? "enroll.card.titleReturning" : "enroll.card.titleNew"}
            values={{ business: card.business_name }}
            components={{ shop: <bdi /> }}
          />
        </h1>
        <p className="type-body text-pretty text-ink-muted">
          <Trans
            i18nKey={LINES[line]}
            count={card.stamps_required}
            values={{
              count: card.stamps_required,
              have: card.stamp_count,
              left: Math.max(0, card.stamps_required - card.stamp_count),
              reward: card.reward_description,
            }}
            components={{ n: <bdi dir="ltr" className="type-figure" />, reward: <bdi /> }}
          />
        </p>
      </div>

      <PassStage card={card} serial={serial} holderName={holderName} />

      <div className="flex flex-col gap-3">
        {wait === "ready" && card.wallet_pass_url ? (
          <WalletButton href={card.wallet_pass_url} />
        ) : wait === "waiting" ? (
          <>
            <Skeleton className="h-[3.25rem] w-full !rounded-full" />
            <p className="type-body text-pretty text-ink">{t("enroll.wallet.waiting")}</p>
          </>
        ) : wait === "slow" ? (
          <div className="flex flex-col items-start gap-3">
            <p className="type-body text-pretty text-ink">{t("enroll.wallet.slow")}</p>
            <Button variant="secondary" busy={checking} onClick={recheck}>
              {t("wallet.retry")}
            </Button>
          </div>
        ) : null}
        {wait !== "ready" && <p className="type-body text-pretty text-ink-muted">{t("enroll.wallet.meanwhile")}</p>}
        <p role="status" className="sr-only">
          {announcement}
        </p>
      </div>

      {statusLink && (
        <Link to={`/c/${serial}`} className={cn(linkText, "type-body inline-flex min-h-11 items-center self-center text-center")}>
          {t("enroll.card.toStatus")}
        </Link>
      )}
    </div>
  );
}
