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
 *
 * Its sides hold at their 100% widths on a phone as the text grows (at 200%
 * they left the icon and "Add to wallet" 142px at 320), and so does the gap
 * after the icon: "ל-Google", which the word joiner keeps whole, is 148px
 * there, 6px more than the held sides alone leave beside the icon.
 */
export function WalletButton({ href }: { href: string }) {
  const { t } = useTranslation();
  const wallet = deviceWallet();
  const label =
    wallet === "apple" ? t("wallet.addApple") : wallet === "google" ? t("wallet.addGoogle") : t("wallet.addToWallet");
  return (
    <LinkButton
      href={href}
      size="lg"
      icon={<Wallet aria-hidden />}
      className="w-full !whitespace-normal text-center max-sm:gap-[min(0.5rem,8px)] max-sm:px-[min(1.75rem,28px)]"
    >
      {label}
    </LinkButton>
  );
}
