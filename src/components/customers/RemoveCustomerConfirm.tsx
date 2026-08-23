import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { ctaClasses, focusRing } from "../marketing/primitives";
import { cn } from "../../lib/cn";

/**
 * The confirmation for removing a customer, opened in place of the row it
 * is about.
 *
 * In place, and not a modal, because that is how this app already asks —
 * see the broadcast composer and the automation editor. It also keeps the
 * question beside the person it names, which is the failure a centred
 * dialog invites: an owner who dismissed the menu, read a paragraph, and no
 * longer knows which of forty rows it belongs to.
 *
 * Three sentences rather than one, because two of them are things the owner
 * would otherwise have to discover from a customer:
 *
 *  - the history is gone for good — no undo exists anywhere in this product;
 *  - the pass stays on the customer's phone. Neither Apple nor Google lets
 *    an issuer remove one, so the honest promise is that it stops working,
 *    not that it disappears. An owner who tells a customer "I deleted it"
 *    is going to be asked why it is still there;
 *  - and this is not a block. The join QR is public, so the same person can
 *    enrol again in a minute — at zero stamps, which is the part that
 *    matters when the removal was a mistake.
 */
export function RemoveCustomerConfirm({
  name,
  busy,
  onConfirm,
  onCancel,
}: {
  name: string;
  busy: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const confirmRef = useRef<HTMLButtonElement>(null);
  const title = t("dashboard.customers.remove.title", { name });

  // The menu that opened this has already closed and taken focus with it, so
  // without this a keyboard user is returned to the top of the document with
  // a question on screen they cannot answer.
  useEffect(() => {
    confirmRef.current?.focus();
  }, []);

  return (
    <div
      role="group"
      aria-label={title}
      onKeyDown={(e) => {
        if (e.key !== "Escape" || busy) return;
        e.stopPropagation();
        onCancel();
      }}
      className="flex flex-col gap-3 rounded-xl border border-danger/40 bg-danger-bg p-4"
    >
      <p className="font-semibold text-ink">{title}</p>
      <div className="flex flex-col gap-1.5 text-sm text-ink-muted">
        <p>{t("dashboard.customers.remove.body")}</p>
        <p>{t("dashboard.customers.remove.wallet")}</p>
        <p>{t("dashboard.customers.remove.rejoin")}</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {/* Destructive, so it is built here rather than borrowed from
            `ctaClasses`: the shared variants are all affirmative, and giving
            this one the primary gold would put the brand's most inviting
            colour on the only irreversible button in the dashboard. */}
        <button
          ref={confirmRef}
          type="button"
          disabled={busy}
          onClick={onConfirm}
          className={cn(
            "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-danger px-4 py-2.5 font-body text-sm font-bold text-white transition-all duration-150 active:translate-y-px disabled:pointer-events-none disabled:opacity-50",
            focusRing,
          )}
        >
          {busy ? t("common.loading") : t("dashboard.customers.remove.confirm")}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onCancel}
          className={ctaClasses("secondary", "sm")}
        >
          {t("common.cancel")}
        </button>
      </div>
    </div>
  );
}
