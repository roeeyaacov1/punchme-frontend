import { useEffect } from "react";
import { useTranslation } from "react-i18next";

/** "{name} — PunchMe" for as long as the page is mounted. */
export function useDocumentTitle(name: string) {
  const { t } = useTranslation();
  const title = `${name} — ${t("app.name")}`;
  useEffect(() => {
    const previous = document.title;
    document.title = title;
    return () => {
      document.title = previous;
    };
  }, [title]);
}
