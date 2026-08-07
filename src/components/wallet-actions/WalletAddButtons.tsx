import { useTranslation } from "react-i18next";
import { buttonClasses } from "../ui/Button";

export interface WalletAddButtonsProps {
  appleUrl?: string | null;
  googleUrl?: string | null;
  pending?: boolean;
}

/** Renders whichever wallet links are actually present. Neither link is
 * required — a re-enrollment returns both as null (pass already issued) and
 * a fresh one may briefly have pending=true while the wallet push is still
 * in flight; callers decide what to show around this, not this component. */
export function WalletAddButtons({
  appleUrl,
  googleUrl,
  pending,
}: WalletAddButtonsProps) {
  const { t } = useTranslation();

  if (!appleUrl && !googleUrl) {
    if (pending) {
      return (
        <p className="text-sm text-slate font-mono">
          {t("wallet.pending")}
        </p>
      );
    }
    return null;
  }

  return (
    <div className="flex flex-wrap gap-3">
      {appleUrl && (
        <a href={appleUrl} className={buttonClasses("primary", "md")}>
          {t("wallet.addApple")}
        </a>
      )}
      {googleUrl && (
        <a href={googleUrl} className={buttonClasses("secondary", "md")}>
          {t("wallet.addGoogle")}
        </a>
      )}
    </div>
  );
}
