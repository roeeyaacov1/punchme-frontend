import { useMemo, useState } from "react";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Clock, Gift, TriangleAlert } from "lucide-react";
import { ApiError } from "../../api/errors";
import { redeemCard, scanCode } from "../../api/loyalty";
import {
  getPublicCardPage,
  type PublicCardPage as PublicCardPageData,
  type PublicCardStamp,
} from "../../api/referrals";
import { useAuth } from "../../auth/useAuth";
import { ctaClasses, focusRing } from "../../components/marketing/primitives";
import { cn } from "../../lib/cn";
import { currentDeviceId } from "../../lib/deviceId";
import { classifyScanError } from "../../lib/scan";
import { ReferralJoin } from "./ReferralJoin";

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
 */

type Outcome =
  | { kind: "stamped"; count: number; total: number; full: boolean }
  | { kind: "redeemed" }
  | { kind: "tooSoon" | "conflict" | "unknownCard" }
  | { kind: "failed"; message: string };

function failureOf(error: unknown, t: TFunction): Outcome {
  const failure = classifyScanError(error);
  if (failure === "failed") {
    return {
      kind: "failed",
      message:
        error instanceof ApiError
          ? error.message
          : t("publicCard.stamp.result.offline"),
    };
  }
  return { kind: failure };
}

export function PublicCardPage() {
  const { t } = useTranslation();
  const { token } = useParams<{ token: string }>();
  const auth = useAuth();
  const queryClient = useQueryClient();
  const deviceId = useMemo(() => currentDeviceId(), []);

  const { data: page, isLoading, error } = useQuery({
    // The session is part of the key: the answer changes when it does.
    queryKey: ["publicCard", token, auth.isAuthenticated],
    queryFn: () => getPublicCardPage(token!, deviceId),
    enabled: !!token && !auth.isLoading,
    retry: false,
  });

  const pending = auth.isLoading || isLoading;
  const notFound = error instanceof ApiError && error.status === 404;

  return (
    <div className="theme-purple theme-raised min-h-screen bg-background px-5 py-10 text-ink sm:py-16">
      <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-6 rounded-2xl border border-border bg-surface px-5 py-8 shadow-card sm:px-8">
        {pending ? (
          <p className="font-mono text-sm text-ink-subtle">{t("common.loading")}</p>
        ) : !page || !token ? (
          <p className="text-center font-body text-ink">
            {t(notFound ? "publicCard.notFound" : "publicCard.failed")}
          </p>
        ) : page.view === "stamp" && page.stamp ? (
          <StampScreen
            token={token}
            page={page}
            stamp={page.stamp}
            onChanged={() =>
              void queryClient.invalidateQueries({ queryKey: ["publicCard", token] })
            }
          />
        ) : page.view === "join" ? (
          <ReferralJoin token={token} page={page} deviceId={deviceId} />
        ) : (
          <CardFace token={token} page={page} signedIn={auth.isAuthenticated} />
        )}
      </div>
    </div>
  );
}

/** One thing to do. The count and the button are the whole screen; the
 * answer lands above them and the count refreshes beneath it. */
function StampScreen({
  token,
  page,
  stamp,
  onChanged,
}: {
  token: string;
  page: PublicCardPageData;
  stamp: PublicCardStamp;
  onChanged: () => void;
}) {
  const { t } = useTranslation();
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [busy, setBusy] = useState(false);
  const name = stamp.customer_display_name || t("publicCard.stamp.anonymous");
  const full = stamp.status === "reward_ready";

  async function addStamp() {
    setBusy(true);
    try {
      const out = await scanCode(token);
      setOutcome({
        kind: "stamped",
        count: out.stamp_count,
        total: out.stamps_required,
        full: out.status === "reward_ready",
      });
    } catch (err) {
      setOutcome(failureOf(err, t));
    } finally {
      setBusy(false);
      onChanged();
    }
  }

  async function redeem() {
    setBusy(true);
    try {
      await redeemCard(token);
      setOutcome({ kind: "redeemed" });
    } catch (err) {
      setOutcome(failureOf(err, t));
    } finally {
      setBusy(false);
      onChanged();
    }
  }

  return (
    <>
      <div className="flex flex-col items-center gap-1 text-center">
        <p className="text-sm font-semibold text-ink-muted">
          {page.business_name} · {page.template_name}
        </p>
        <h1 className="text-2xl font-heading font-bold text-ink">
          {t("publicCard.stamp.title", { name })}
        </h1>
        {stamp.is_preview && (
          <p className="text-sm text-ink-subtle">{t("publicCard.stamp.preview")}</p>
        )}
      </div>

      {/* "3 / 8" is two numbers with neutrals between them: inside a Hebrew
          page the bidi algorithm reads it as "8 / 3". */}
      <p dir="ltr" className="t-stat tabular-nums text-ink">
        {stamp.stamp_count} <span className="opacity-40">/</span> {stamp.stamps_required}
      </p>

      {outcome && <OutcomeNote outcome={outcome} />}

      {full ? (
        <>
          <p className="flex items-center gap-2 text-center text-base font-bold text-ink">
            <Gift size={18} aria-hidden className="shrink-0" />
            {t("publicCard.stamp.full", { reward: page.reward_description })}
          </p>
          <button
            type="button"
            disabled={busy}
            onClick={redeem}
            className={ctaClasses("gradient", "lg", "w-full")}
          >
            {t(busy ? "publicCard.stamp.redeeming" : "publicCard.stamp.redeem")}
          </button>
        </>
      ) : (
        <button
          type="button"
          disabled={busy}
          onClick={addStamp}
          className={ctaClasses("gradient", "lg", "w-full")}
        >
          {t(busy ? "publicCard.stamp.working" : "publicCard.stamp.confirm")}
        </button>
      )}

      <Link
        to="/dashboard/scan"
        className={cn(
          "inline-flex min-h-[44px] items-center text-sm font-semibold text-primary-text underline hover:no-underline",
          focusRing,
        )}
      >
        {t("publicCard.stamp.openScanner")}
      </Link>
    </>
  );
}

function OutcomeNote({ outcome }: { outcome: Outcome }) {
  const { t } = useTranslation();
  const tone =
    outcome.kind === "stamped" && outcome.full
      ? "bg-primary text-primary-on"
      : outcome.kind === "stamped" || outcome.kind === "redeemed"
        ? "bg-ok-bg text-ok"
        : outcome.kind === "failed"
          ? "bg-danger-bg text-danger"
          : "bg-warn-bg text-warn";
  const Icon =
    outcome.kind === "stamped" && outcome.full
      ? Gift
      : outcome.kind === "stamped" || outcome.kind === "redeemed"
        ? Check
        : outcome.kind === "tooSoon"
          ? Clock
          : TriangleAlert;
  const text =
    outcome.kind === "failed"
      ? outcome.message
      : outcome.kind === "stamped"
        ? t(outcome.full ? "publicCard.stamp.result.rewardReady" : "publicCard.stamp.result.stamped")
        : t(`publicCard.stamp.result.${outcome.kind}`);

  return (
    <div
      role="status"
      className={cn(
        "flex w-full items-start gap-2 rounded-xl px-4 py-3 text-sm font-semibold",
        tone,
      )}
    >
      <Icon size={18} aria-hidden className="mt-0.5 shrink-0" />
      <p>{text}</p>
    </div>
  );
}

/** Whose card this is, and how to get one. Nothing about the holder. */
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
    <>
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-subtle">
        {t("publicCard.eyebrow")}
      </p>
      {/* The card's own colours, so the page reads as the pass it came from. */}
      <div
        className="w-full rounded-2xl px-5 py-6 text-center shadow-card"
        style={{ backgroundColor: page.background_color, color: page.foreground_color }}
      >
        <p className="text-2xl font-heading font-bold">{page.business_name}</p>
        <p className="mt-1 text-sm font-semibold opacity-80">{page.template_name}</p>
      </div>
      <p className="text-center font-body text-ink">
        {t("publicCard.card.reward", {
          stamps: page.stamps_required,
          reward: page.reward_description,
        })}
      </p>
      <Link to={page.join_path} className={ctaClasses("gradient", "lg", "w-full max-w-[300px]")}>
        {t("publicCard.card.join")}
      </Link>
      <p className="text-center text-sm text-ink-muted">
        {signedIn ? (
          t("publicCard.card.notYourShop")
        ) : (
          <>
            {t("publicCard.card.staffHint", { business: page.business_name })}{" "}
            <Link
              to="/login"
              state={{ from: { pathname: `/p/${token}` } }}
              className={cn(
                "inline-flex min-h-[44px] items-center align-middle font-semibold text-primary-text underline hover:no-underline",
                focusRing,
              )}
            >
              {t("publicCard.card.signIn")}
            </Link>
          </>
        )}
      </p>
    </>
  );
}
