import { useTranslation } from "react-i18next";
import { buttonClasses } from "../ui/Button";

export interface WalletAddButtonsProps {
  /** PassKit's universal add-to-wallet link — one URL, resolved to the
   * right wallet (Apple/Google) by device at click time. */
  passUrl?: string | null;
  /** True while the wallet push is still in flight (EnrollOut.wallet_issue_pending). */
  pending?: boolean;
  /** Issuing is taking unusually long — we stopped waiting on it. */
  slow?: boolean;
  /** Check again now; rendered with the slow note. */
  onRetry?: () => void;
  /** Classes for the add link, replacing the app's own button. The public
   * join and status pages are on the purple theme, where a navy pill is
   * the wrong object — they pass a `ctaClasses` CTA instead. */
  linkClassName?: string;
}

/** One universal button, matching the backend's single wallet_pass_url.
 * A re-enrollment returns the stored URL, so the button stays available;
 * pending=true renders a waiting note — drive pending/slow/onRetry from
 * useWalletPass, which polls until the async issue completes. */
export function WalletAddButtons({
  passUrl,
  pending,
  slow,
  onRetry,
  linkClassName,
}: WalletAddButtonsProps) {
  const { t } = useTranslation();

  if (!passUrl) {
    if (slow) {
      return (
        <div className="flex flex-col items-center gap-1.5">
          <p className="text-sm text-slate font-body">{t("wallet.pendingSlow")}</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="text-sm text-navy underline hover:no-underline"
            >
              {t("wallet.retry")}
            </button>
          )}
        </div>
      );
    }
    if (pending) {
      return (
        <p className="text-sm text-slate font-mono animate-pulse">
          {t("wallet.pending")}
        </p>
      );
    }
    return null;
  }

  return (
    <a href={passUrl} className={linkClassName ?? buttonClasses("primary", "md")}>
      {t("wallet.addToWallet")}
    </a>
  );
}
