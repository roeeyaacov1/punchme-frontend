import { useState, type ReactNode, type RefObject } from "react";
import { useTranslation } from "react-i18next";
import { Copy, MessageSquare, Trash2 } from "lucide-react";
import type { CustomerListItem } from "../../api/loyalty";
import { Badge } from "../kit/Badge";
import { Button } from "../kit/Button";
import { Sheet } from "../kit/Dialog";
import { Figure } from "../kit/Figure";
import { Notice } from "../kit/Notice";
import { StampRow } from "../kit/StampRow";
import { QuickMessage } from "./QuickMessage";
import { StampAdjuster } from "./StampAdjuster";

export interface SheetProblem {
  tone: "warn" | "danger";
  title: string;
  body?: string;
}

/**
 * One customer, opened from their row: up from the bottom on a phone, in
 * from the end edge from 768px. Everything that used to crowd eight controls
 * onto every row of the roster lives here instead: the number and copying
 * it, the card, a stamp more or fewer, a message, and the removal at the
 * foot, in danger words. What went wrong is said here too, in the page's
 * language, never the server's English.
 */
export function CustomerSheet({
  customer,
  name,
  phone,
  open,
  onClose,
  returnFocus,
  adjustable,
  adjusting,
  onAdjust,
  messageable,
  messaging,
  onMessage,
  removable,
  onRemove,
  onCopy,
  problem,
}: {
  customer: CustomerListItem | null;
  /** How to call them: the name, or the number when they left none. */
  name: string;
  /** The number as it is read, or null. */
  phone: string | null;
  open: boolean;
  onClose: () => void;
  returnFocus?: RefObject<HTMLElement>;
  /** The stamp buttons: only when the build has them switched on. */
  adjustable: boolean;
  adjusting: boolean;
  onAdjust: (delta: number) => void;
  /** Manager and up, when real sends are possible. */
  messageable: boolean;
  messaging: boolean;
  onMessage: (body: string, done: () => void) => void;
  /** Manager and up. */
  removable: boolean;
  onRemove: () => void;
  onCopy: () => void;
  problem: SheetProblem | null;
}) {
  const { t } = useTranslation();
  const [composing, setComposing] = useState(false);
  const [shownFor, setShownFor] = useState(customer?.card_id);
  // A different customer, or the same one opened again: back to their card.
  if (customer?.card_id !== shownFor) {
    setShownFor(customer?.card_id);
    setComposing(false);
  }

  const card = customer && <Card customer={customer} />;

  return (
    <Sheet
      open={open}
      onClose={onClose}
      returnFocus={returnFocus}
      title={
        <span dir={customer?.customer_display_name.trim() ? "auto" : "ltr"} className="[overflow-wrap:anywhere]">
          {name}
        </span>
      }
      footer={
        removable &&
        customer && (
          <Button variant="danger" icon={<Trash2 aria-hidden />} onClick={onRemove}>
            {t("dashboard.customers.menu.remove")}
          </Button>
        )
      }
    >
      {customer && (
        <div className="flex flex-col gap-6">
          {phone && customer.customer_display_name.trim() && (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span dir="ltr" className="type-figure text-lg text-ink">
                {phone}
              </span>
              <Button variant="secondary" icon={<Copy aria-hidden />} onClick={onCopy}>
                {t("dashboard.customers.menu.copyPhone")}
              </Button>
            </div>
          )}
          {phone && !customer.customer_display_name.trim() && (
            <Button variant="secondary" icon={<Copy aria-hidden />} onClick={onCopy} className="self-start">
              {t("dashboard.customers.menu.copyPhone")}
            </Button>
          )}

          {card}

          {adjustable && (
            <StampAdjuster
              stampCount={customer.stamp_count}
              stampsRequired={customer.stamps_required}
              pending={adjusting}
              disabled={customer.status === "void"}
              onAdjust={onAdjust}
            />
          )}

          {problem && (
            <Notice tone={problem.tone} title={problem.title} role="alert">
              {problem.body}
            </Notice>
          )}

          {messageable &&
            (composing ? (
              <QuickMessage
                name={name}
                busy={messaging}
                onSend={(body) => onMessage(body, () => setComposing(false))}
                onCancel={() => setComposing(false)}
              />
            ) : (
              <Button variant="secondary" icon={<MessageSquare aria-hidden />} onClick={() => setComposing(true)} className="self-start">
                {t("dashboard.customers.menu.message")}
              </Button>
            ))}
        </div>
      )}
    </Sheet>
  );
}

/** The card as it stands: the stamps, the count, and what it is waiting for. */
function Card({ customer }: { customer: CustomerListItem }) {
  const { t } = useTranslation();
  const left = Math.max(0, customer.stamps_required - customer.stamp_count);
  let state: ReactNode;
  if (customer.status === "void") state = <Badge tone="warn">{t("dashboard.customers.status.void")}</Badge>;
  else if (left === 0 && customer.stamps_required > 0) state = <Badge tone="reward">{t("dashboard.customers.status.ready")}</Badge>;
  else state = <span className="type-body text-ink-muted">{t("dashboard.scan.result.toGo", { count: left })}</span>;
  return (
    <div className="flex flex-col gap-3">
      {/* As wide as its stamps need and no wider, so a short card sits at
          the start edge with its count instead of floating in the middle. */}
      <div className="w-full max-w-[20rem]" style={{ maxWidth: `min(20rem, ${customer.stamps_required * 2.75}rem)` }}>
        <StampRow total={customer.stamps_required} filled={customer.stamp_count} />
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <span aria-hidden>
          <Figure size="stat" value={`${customer.stamp_count}/${customer.stamps_required}`} />
        </span>
        <span className="sr-only">
          {t("dashboard.customers.countSpoken", { count: customer.stamps_required, filled: customer.stamp_count })}
        </span>
        {state}
      </div>
    </div>
  );
}
