import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { List, ListRow, LitPanel, SkeletonRows } from "../../../components/kit";
import { ReadProblem } from "../../../components/dashboard/ReadProblem";
import { formatWhen } from "../../../components/messaging/describe";
import { listDeliveries, type DeliveryOut } from "../../../api/messaging";
import { formatCount } from "../format";

/** The sends a rule's editor shows. */
const LAST = 10;

const SKIP_REASONS = ["no_pass", "void", "card_gone", "stale", "gift_unavailable", "paused", "downgraded", "unsupported"];

/**
 * What a rule last sent, and to whom, from the delivery log. A rule names
 * one customer at a time, so for a rule the log is exact: each row is a
 * person, what became of their message, and when. (A broadcast's rows are
 * every holder of a design, which is why Sent never lists them as names.)
 */
export function RuleSends({ businessId, automationId }: { businessId: string; automationId: string }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage ?? "he";
  const sends = useQuery({
    queryKey: ["deliveries", businessId, automationId],
    queryFn: () => listDeliveries(businessId, automationId, 1, LAST),
  });

  function state(delivery: DeliveryOut): string {
    if (delivery.status === "sent") {
      return delivery.gift_granted > 0
        ? t("messaging.sends.sentWithGift", { count: delivery.gift_granted })
        : t("messaging.sends.sent");
    }
    if (delivery.status === "failed") return t("messaging.sends.failed");
    if (delivery.status === "skipped") {
      const reason = SKIP_REASONS.includes(delivery.skip_reason) ? delivery.skip_reason : "other";
      return t(`messaging.sends.skipped.${reason}`);
    }
    return t("messaging.sends.onTheWay");
  }

  let body;
  if (!sends.data && (sends.isError || sends.fetchStatus === "paused")) {
    body = (
      <ReadProblem
        title={t("messaging.sends.loadFailed")}
        error={sends.error}
        paused={!sends.isError}
        onRetry={() => void sends.refetch()}
      />
    );
  } else if (!sends.data) {
    body = <SkeletonRows rows={3} />;
  } else if (sends.data.items.length === 0) {
    body = <p className="type-body px-5 pb-5 text-ink-muted sm:px-6">{t("messaging.sends.empty")}</p>;
  } else {
    body = (
      <>
        <List>
          {sends.data.items.map((delivery) => (
            <ListRow
              key={delivery.id}
              title={
                delivery.customer_display_name.trim() ? (
                  <bdi>{delivery.customer_display_name}</bdi>
                ) : (
                  t("messaging.sends.noName")
                )
              }
              meta={state(delivery)}
              trailing={
                <time dateTime={delivery.sent_at ?? delivery.created_at} className="text-sm text-ink-muted">
                  {formatWhen(delivery.sent_at ?? delivery.created_at, lang)}
                </time>
              }
            />
          ))}
        </List>
        {sends.data.count > sends.data.items.length && (
          <p className="px-5 pb-5 pt-3 text-sm leading-snug text-ink-muted sm:px-6">
            {t("messaging.sends.latest", { count: sends.data.items.length, total: formatCount(sends.data.count, lang) })}
          </p>
        )}
      </>
    );
  }

  return (
    <LitPanel as="section" aria-labelledby="rule-sends-title" className="overflow-hidden">
      <h2 id="rule-sends-title" className="type-card-title px-5 pb-3 pt-5 text-ink sm:px-6 sm:pt-6">
        {t("messaging.sends.title")}
      </h2>
      {body}
    </LitPanel>
  );
}
