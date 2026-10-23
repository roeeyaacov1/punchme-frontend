import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { ListRow, Sheet } from "../../../components/kit";
import { MessageStage } from "../../../components/messaging/MessageStage";
import { formatFull, formatWhen } from "../../../components/messaging/describe";
import type { DeliveryOut } from "../../../api/messaging";
import type { CardTemplate } from "../../../api/businesses";
import type { DesignOut } from "../../../api/designs";
import { sendState } from "./sentHistory";

/** The customer's name, or that there isn't one. */
function nameOf(send: DeliveryOut, t: TFunction): string {
  return send.customer_display_name.trim() || t("messaging.sends.noName");
}

/** When a send went out, or was settled without going. */
function settledAt(send: DeliveryOut): string {
  return send.sent_at ?? send.created_at;
}

/**
 * A personal send as one row that opens it: who it went to and when, then
 * where it came from (a rule, or a message to one customer) and what
 * became of it. It names one customer, so unlike a broadcast it is said
 * by name.
 */
export function PersonalRow({ send, origin, onOpen }: { send: DeliveryOut; origin: string; onOpen: () => void }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage ?? "he";
  return (
    <ListRow
      onClick={onOpen}
      title={
        <span className="flex items-baseline justify-between gap-3">
          {/* In its own direction, so a Latin name in Hebrew is cut at its
              end, not its start, and still sits at the row's start. */}
          <span dir="auto" className="min-w-0 truncate [text-align:-webkit-match-parent] [text-align:match-parent]">
            {nameOf(send, t)}
          </span>
          <time dateTime={settledAt(send)} className="shrink-0 text-sm font-normal text-ink-muted">
            {formatWhen(settledAt(send), lang)}
          </time>
        </span>
      }
      meta={
        <span className="block whitespace-normal">
          <bdi>{origin}</bdi> · {sendState(send, t)}
        </span>
      }
    />
  );
}

/**
 * A personal send read whole, in a sheet: the row's name and where it came
 * from, the message as it was written for them over their own pass (named,
 * where they gave a name), then what became of it and the date said in full.
 */
export function PersonalSheet({
  send,
  origin,
  open,
  onClose,
  businessName,
  template,
  design,
}: {
  send: DeliveryOut | null;
  origin: string;
  open: boolean;
  onClose: () => void;
  businessName: string;
  template: CardTemplate | undefined;
  design: DesignOut | undefined;
}) {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage ?? "he";
  if (!send) return null;
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={<span dir="auto">{nameOf(send, t)}</span>}
      description={<bdi>{origin}</bdi>}
    >
      <div className="flex flex-col gap-5">
        {template && design && (
          // The stage wants 340px; on a phone it runs to the sheet's edges.
          <div className="-mx-6 flex justify-center">
            <MessageStage
              businessName={businessName}
              template={template}
              design={design}
              notification={{ title: send.title_rendered.trim() || undefined, body: send.body_rendered }}
              holderName={send.customer_display_name.trim() || undefined}
              summary={t("messaging.sheet.stageSummary")}
            />
          </div>
        )}
        <ul className="flex flex-col gap-2">
          <li className="type-body text-ink">{sendState(send, t)}</li>
          <li className="type-body text-ink">{formatFull(settledAt(send), lang)}</li>
        </ul>
      </div>
    </Sheet>
  );
}
