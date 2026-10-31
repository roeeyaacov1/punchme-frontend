import { useTranslation } from "react-i18next";
import { Notice } from "../../components/kit";

/** Above the card while this phone isn't keeping the draft: what a reload
 * would lose, and that saving the card keeps it. Words and an icon on a
 * plain panel, as every warning is. */
export function StorageNotice({ full }: { full: boolean }) {
  const { t } = useTranslation();
  if (!full) return null;
  return (
    <Notice tone="warn" role="alert">
      {t("onboarding.storage.full")}
    </Notice>
  );
}
