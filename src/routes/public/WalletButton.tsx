import { useTranslation } from "react-i18next";
import { Wallet } from "lucide-react";
import { LinkButton } from "../../components/kit";
import { deviceWallet } from "./wallet";

/**
 * The coral button to the pass, named by the wallet this phone has ("Add to
 * Apple Wallet" on an iPhone, "Add to Google Wallet" on Android, "Add to
 * wallet" elsewhere), as the preview above it is chosen. A plain button,
 * not Apple's or Google's badge. The link is one universal URL the provider
 * resolves by device.
 */
export function WalletButton({ href }: { href: string }) {
  const { t } = useTranslation();
  const wallet = deviceWallet();
  const label =
    wallet === "apple" ? t("wallet.addApple") : wallet === "google" ? t("wallet.addGoogle") : t("wallet.addToWallet");
  return (
    <LinkButton href={href} size="lg" icon={<Wallet aria-hidden />} className="w-full !whitespace-normal text-center">
      {label}
    </LinkButton>
  );
}
