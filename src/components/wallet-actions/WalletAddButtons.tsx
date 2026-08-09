import { useTranslation } from "react-i18next";
import { buttonClasses } from "../ui/Button";

export interface WalletAddButtonsProps {
  /** PassKit's universal add-to-wallet link — one URL, resolved to the
   * right wallet (Apple/Google) by device at click time. */
  passUrl?: string | null;
  /** True while the wallet push is still in flight (EnrollOut.wallet_issue_pending). */
  pending?: boolean;
}

/** One universal button, matching the backend's single wallet_pass_url.
 * A re-enrollment returns the stored URL, so the button stays available;
 * pending=true renders a waiting note — callers should poll/refetch while
 * pending (the pass URL appears once the async issue completes). */
export function WalletAddButtons({ passUrl, pending }: WalletAddButtonsProps) {
  const { t } = useTranslation();

  if (!passUrl) {
    if (pending) {
      return <p className="text-sm text-slate font-mono">{t("wallet.pending")}</p>;
    }
    return null;
  }

  return (
    <a href={passUrl} className={buttonClasses("primary", "md")}>
      {t("wallet.addToWallet")}
    </a>
  );
}
