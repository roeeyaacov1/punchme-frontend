import { useTranslation } from "react-i18next";
import { Button, Notice } from "../../components/kit";
import { noticeButton, noticeSides } from "../../components/onboarding/notice";

/**
 * The business, or its card, couldn't be read: a 500, or no connection. Said
 * in words and an icon on a plain panel, with a way to ask again. Never taken
 * for "no business", which would send a saved card back to be saved again.
 */
export function Unreadable({ onRetry, busy = false }: { onRetry: () => void; busy?: boolean }) {
  const { t } = useTranslation();
  return (
    <Notice
      tone="warn"
      role="alert"
      className={noticeSides}
      action={
        <Button variant="secondary" busy={busy} onClick={onRetry} className={noticeButton}>
          {t("common.retry")}
        </Button>
      }
    >
      {t("onboarding.unreadable")}
    </Notice>
  );
}
