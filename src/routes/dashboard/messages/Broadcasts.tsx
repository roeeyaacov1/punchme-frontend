import type { ReactNode } from "react";
import { Trans, useTranslation } from "react-i18next";
import { ListRow, Sheet } from "../../../components/kit";
import { MessageStage } from "../../../components/messaging/MessageStage";
import { formatFull, formatWhen } from "../../../components/messaging/describe";
import type { BroadcastOut } from "../../../api/messaging";
import type { CardTemplate } from "../../../api/businesses";
import type { DesignOut } from "../../../api/designs";
import { formatCount } from "../format";

/** A number inside a sentence, in tabular figures with its own direction. */
const figure = <span dir="ltr" className="type-figure" />;

/** What a broadcast didn't deliver, said once: failed and skipped together. */
function notSent(broadcast: BroadcastOut): number {
  return broadcast.failed_count + broadcast.skipped_count;
}

/**
 * A message that went to everyone, as one row that opens it: its title (or
 * the business's name, which is what the lock screen showed), the date with
 * the year whenever it isn't this one, the body to two lines, and what it
 * reached as figures, with what it didn't in words. A broadcast still
 * sending shows its progress; the page polls it until it settles.
 */
export function BroadcastRow({
  broadcast,
  businessName,
  onOpen,
}: {
  broadcast: BroadcastOut;
  businessName: string;
  onOpen: () => void;
}) {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage ?? "he";
  const sending = broadcast.status === "sending";
  const missed = notSent(broadcast);
  return (
    <ListRow
      onClick={onOpen}
      title={
        <span className="flex items-baseline justify-between gap-3">
          <span dir="auto" className="min-w-0 truncate [text-align:-webkit-match-parent] [text-align:match-parent]">
            {broadcast.title.trim() || businessName}
          </span>
          <time dateTime={broadcast.created_at} className="shrink-0 text-sm font-normal text-ink-muted">
            {formatWhen(broadcast.created_at, lang)}
          </time>
        </span>
      }
      meta={
        <span className="flex flex-col gap-0.5 whitespace-normal">
          <span
            dir="auto"
            className="line-clamp-2 [overflow-wrap:anywhere] [text-align:-webkit-match-parent] [text-align:match-parent]"
          >
            {broadcast.body}
          </span>
          <span className="text-ink">
            {sending ? (
              <Trans
                i18nKey="messaging.broadcast.sending"
                values={{ sent: formatCount(broadcast.sent_count, lang), total: formatCount(broadcast.audience_count, lang) }}
                components={{ n: figure }}
              />
            ) : (
              <Trans
                i18nKey="messaging.history.sentOf"
                values={{ sent: formatCount(broadcast.sent_count, lang), total: formatCount(broadcast.audience_count, lang) }}
                components={{ n: figure }}
              />
            )}
            {missed > 0 && <> · {t("messaging.history.notSent", { count: missed, value: formatCount(missed, lang) })}</>}
          </span>
        </span>
      }
    />
  );
}

/**
 * A sent message read whole, in a sheet: as it landed, on the card's own
 * wallpaper, then its gift, who it was kept to, what it reached in words and
 * the date said in full. It is the row's own `BroadcastOut`, so a broadcast
 * still sending keeps counting here while the page polls.
 */
export function BroadcastSheet({
  broadcast,
  open,
  onClose,
  businessName,
  template,
  design,
}: {
  broadcast: BroadcastOut | null;
  open: boolean;
  onClose: () => void;
  businessName: string;
  template: CardTemplate | undefined;
  design: DesignOut | undefined;
}) {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage ?? "he";
  if (!broadcast) return null;
  const count = (value: number) => formatCount(value, lang);
  const facts: ReactNode[] = [];
  if (broadcast.status === "sending") {
    facts.push(
      <Trans
        i18nKey="messaging.broadcast.sending"
        values={{ sent: count(broadcast.sent_count), total: count(broadcast.audience_count) }}
        components={{ n: figure }}
      />,
    );
  } else {
    facts.push(t("messaging.sheet.sentTo", { count: broadcast.sent_count, value: count(broadcast.sent_count) }));
  }
  if (broadcast.failed_count > 0) {
    facts.push(t("messaging.history.failed", { count: broadcast.failed_count, value: count(broadcast.failed_count) }));
  }
  if (broadcast.skipped_count > 0) {
    facts.push(t("messaging.sheet.skipped", { count: broadcast.skipped_count, value: count(broadcast.skipped_count) }));
  }
  if (broadcast.status === "sending" && broadcast.pending_count > 0) {
    facts.push(t("messaging.sheet.pending", { count: broadcast.pending_count, value: count(broadcast.pending_count) }));
  }
  if (broadcast.gift_complete_card) facts.push(t("messaging.sheet.gift", { gift: t("messaging.describe.giftFull") }));
  else if (broadcast.gift_stamps > 0) {
    facts.push(t("messaging.sheet.gift", { gift: t("messaging.describe.gift", { count: broadcast.gift_stamps }) }));
  }
  if (broadcast.opt_in_only) facts.push(t("messaging.sheet.optIn"));

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={<span dir="auto">{broadcast.title.trim() || businessName}</span>}
      description={t("messaging.sheet.when", { when: formatFull(broadcast.created_at, lang) })}
    >
      <div className="flex flex-col gap-5">
        {template && design && (
          // The stage wants 340px; on a phone it runs to the sheet's edges.
          <div className="-mx-6 flex justify-center">
            <MessageStage
              businessName={businessName}
              template={template}
              design={design}
              notification={{ title: broadcast.title.trim() || undefined, body: broadcast.body }}
              summary={t("messaging.sheet.stageSummary")}
            />
          </div>
        )}
        <ul className="flex flex-col gap-2">
          {facts.map((fact, index) => (
            <li key={index} className="type-body text-ink">
              {fact}
            </li>
          ))}
        </ul>
      </div>
    </Sheet>
  );
}
