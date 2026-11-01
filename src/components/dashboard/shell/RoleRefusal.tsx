import { Trans, useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { Lock } from "lucide-react";
import type { Role } from "../../../api/team";
import { useAuth } from "../../../auth/useAuth";
import { useBusiness } from "../../../business/useBusiness";
import { LinkButton, LitPanel, Loading, Skeleton } from "../../kit";
import { useLightboxPage } from "../../../theme/lightboxPage";
import { pageFor } from "../navigation";
import { usePageTitle } from "./pageTitle";
import { personName } from "./personName";

/**
 * A page above the viewer's role, said out loud where the page would have
 * been rather than bounced somewhere else, because a silent bounce looks
 * like a broken link.
 *
 * Its h1 is the page that refused ("חיוב"), with a lock in ink. Then four
 * short lines: that it isn't open to them, who can open it, who they are,
 * and who to ask. One way out, back to the Overview.
 */
export function RoleRefusal({ minimum }: { minimum: Role }) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const { user } = useAuth();
  const { role } = useBusiness();
  useLightboxPage();
  usePageTitle(t("team.denied.title"));
  const page = pageFor(pathname);

  return (
    <LitPanel as="section" className="mx-auto mt-2 flex max-w-xl flex-col gap-5 p-6 sm:mt-8 sm:p-8">
      {/* With large text on a phone the lock goes above the page's name once
          it can't leave the name 6rem, and a word longer than the line breaks
          rather than widen the page. At 100% the two always share the line. */}
      <h1 className="type-title flex flex-wrap items-center gap-3 text-ink">
        <Lock aria-hidden className="size-7 shrink-0" />
        <span className="min-w-0 max-w-max grow basis-24 [overflow-wrap:anywhere]">
          {page ? t(`dashboard.nav.${page.key}`) : t("team.denied.title")}
        </span>
      </h1>
      <div className="type-body flex flex-col gap-2 break-words text-ink-muted">
        <p className="font-semibold text-ink">{t("team.denied.title")}</p>
        <p>{t(`team.denied.${minimum}`)}</p>
        <p>
          <Trans
            i18nKey="dashboard.account.signedInAs"
            values={{ name: personName(user), role: role ? t(`team.role.${role}`) : "" }}
            components={{ who: <bdi /> }}
          />
        </p>
        <p>{t(minimum === "owner" ? "team.denied.askOwner" : "team.denied.askManager")}</p>
      </div>
      {/* Its words wrap rather than widen the page, as "To the Overview"
          must at 200% text on a phone. */}
      <LinkButton to="/dashboard" variant="secondary" className="max-w-full self-start !whitespace-normal text-center">
        {t("dashboard.toOverview")}
      </LinkButton>
    </LitPanel>
  );
}

/** While the role is still on its way: a status, in a face that sets
 * Hebrew, never a bare "Loading..." in Plex Mono. */
export function RoleLoading() {
  useLightboxPage();
  return (
    <Loading className="mx-auto mt-2 flex max-w-xl flex-col gap-4 sm:mt-8">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </Loading>
  );
}
