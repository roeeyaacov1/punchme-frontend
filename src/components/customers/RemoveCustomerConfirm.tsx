import { useRef, type RefObject } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Button } from "../kit/Button";
import { Dialog } from "../kit/Dialog";

/**
 * The question before a customer is removed, which can't be undone.
 *
 * It opens on "Cancel", never on "Remove", so a keyboard's Enter keeps the
 * customer. Three sentences rather than one, because two of them are things
 * the owner would otherwise learn from the customer:
 *
 *  - the history is gone for good, and nothing in this product undoes it;
 *  - the pass stays on their phone. Neither Apple nor Google lets an issuer
 *    remove one, so the honest promise is that it stops working, not that it
 *    disappears;
 *  - and it isn't a block. The join QR is public, so the same person can
 *    join again in a minute, at zero stamps.
 */
export function RemoveCustomerConfirm({
  open,
  name,
  busy,
  onConfirm,
  onCancel,
  returnFocus,
}: {
  open: boolean;
  name: string;
  busy: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  returnFocus?: RefObject<HTMLElement>;
}) {
  const { t } = useTranslation();
  const cancel = useRef<HTMLButtonElement>(null);
  return (
    <Dialog
      open={open}
      onClose={() => {
        if (!busy) onCancel();
      }}
      title={<Trans i18nKey="dashboard.customers.remove.title" values={{ name }} components={{ who: <bdi /> }} />}
      initialFocus={cancel}
      returnFocus={returnFocus}
      footer={
        <>
          <Button ref={cancel} variant="secondary" disabled={busy} onClick={onCancel}>
            {t("common.cancel")}
          </Button>
          <Button variant="danger" busy={busy} onClick={onConfirm}>
            {t("dashboard.customers.remove.confirm")}
          </Button>
        </>
      }
    >
      <div className="type-body flex flex-col gap-2 text-ink-muted">
        <p>{t("dashboard.customers.remove.body")}</p>
        <p>{t("dashboard.customers.remove.wallet")}</p>
        <p>{t("dashboard.customers.remove.rejoin")}</p>
      </div>
    </Dialog>
  );
}
