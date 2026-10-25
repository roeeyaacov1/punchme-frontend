import { useEffect, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Lock } from "lucide-react";
import { useBusiness } from "../../business/useBusiness";
import { LinkButton, LitPanel } from "../../components/kit";
import { useDashboardTheme } from "../../theme/useDashboardTheme";

/**
 * The two pages Stripe's checkout returns to, outside the shell: one lit
 * panel in the middle of the wall.
 *
 * They wear the dashboard's own Lightbox, by day or at night as the owner's
 * dashboard is, through its theme hook; the classes come off as they go, in
 * the same commit as the shell puts its own on, so the hand-off doesn't
 * flash. The shell's title doesn't reach them, so they name themselves as
 * Billing. The business's name stands small above everything, so the owner
 * knows which shop. No toast lives out here: they say everything in place.
 *
 * The page's heading carries `id="return-title"`, which labels the panel.
 */
export function ReturnPage({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const { business } = useBusiness();
  useDashboardTheme({ lightbox: true });
  const title = `${t("billing.title")} — ${t("app.name")}`;
  useEffect(() => {
    const previous = document.title;
    document.title = title;
    return () => {
      document.title = previous;
    };
  }, [title]);
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background p-4 text-ink">
      <LitPanel
        as="section"
        aria-labelledby="return-title"
        className="flex w-full max-w-md flex-col items-center gap-3 px-6 py-10 text-center"
      >
        {business?.name && (
          <p dir="auto" className="type-label max-w-full break-words text-ink-muted">
            {business.name}
          </p>
        )}
        {children}
      </LitPanel>
    </main>
  );
}

/**
 * A hire who opened a forwarded or typed link: the shell's refusal, in its
 * words, on the same panel, and no call behind it. Billing is the owner's.
 */
export function ReturnRefusal() {
  const { t } = useTranslation();
  return (
    <>
      <h1 id="return-title" className="type-title flex items-center justify-center gap-3 text-ink">
        <Lock aria-hidden className="size-7 shrink-0" />
        {t("team.denied.title")}
      </h1>
      <p className="type-body text-ink-muted">{t("team.denied.owner")}</p>
      <p className="type-body text-ink-muted">{t("team.denied.askOwner")}</p>
      <LinkButton to="/dashboard" variant="secondary" className="mt-2">
        {t("dashboard.toOverview")}
      </LinkButton>
    </>
  );
}
