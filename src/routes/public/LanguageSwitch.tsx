import { useTranslation } from "react-i18next";
import { Button } from "../../components/kit";

/**
 * The other language, named in itself ("English" on a Hebrew page, "עברית"
 * on an English one) and marked as that language, so a screen reader says
 * the word the way it is written. A 44px quiet button; the kit has no
 * switch of its own, and the dashboard's lives in its account sheet.
 */
export function LanguageSwitch({ className }: { className?: string }) {
  const { t, i18n } = useTranslation();
  const other = i18n.resolvedLanguage === "he" ? "en" : "he";
  return (
    <Button
      variant="quiet"
      lang={other}
      onClick={() => void i18n.changeLanguage(other)}
      className={className}
    >
      {t("language.switch")}
    </Button>
  );
}
