import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Cake, Gift, Inbox, UserRoundX } from "lucide-react";
import { Badge } from "../../components/kit/Badge";
import { Button } from "../../components/kit/Button";
import { EmptyState } from "../../components/kit/EmptyState";
import { Figure } from "../../components/kit/Figure";
import { LinkButton } from "../../components/kit/LinkButton";
import { LitPanel } from "../../components/kit/LitPanel";
import { List, ListRow } from "../../components/kit/ListRow";
import { Notice } from "../../components/kit/Notice";
import { SkeletonRows } from "../../components/kit/Skeleton";
import { PROOF_SOURCE_URLS } from "../../components/marketing/sources";
import { GuideSection, Specimen, TokenName } from "./GuideSection";
import { RatioList, type PairSpec } from "./Ratio";

// A notice's pairs: the state on its icon and title, ink on its sentence.
const NOTICE: PairSpec[] = [
  { name: "ink · surface", sample: "bg-surface text-ink" },
  { name: "ok · surface", sample: "bg-surface text-ok" },
  { name: "warn · surface", sample: "bg-surface text-warn" },
  { name: "danger · surface", sample: "bg-surface text-danger" },
];

const NOTICE_LIT: PairSpec[] = [
  { name: "ink · lit", sample: "bg-surface text-ink" },
  { name: "ok · lit", sample: "bg-surface text-ok" },
  { name: "warn · lit", sample: "bg-surface text-warn" },
  { name: "danger · lit", sample: "bg-surface text-danger" },
];

/** The guard's own size, and the day such a walk might stop on. */
const GUARD_EVENTS = 1500;
const GUARD_DAYS_BACK = 25;

/** Badges, figures, rows and the empty and loading states, in the product's own copy. */
export function ContentSection({ version }: { version: string }) {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage;
  const guard = {
    shown: new Intl.NumberFormat(language).format(GUARD_EVENTS),
    since: new Date(Date.now() - GUARD_DAYS_BACK * 86_400_000).toLocaleDateString(language, {
      day: "numeric",
      month: "short",
    }),
  };
  const square = {
    value: t("landing.proof.stats.0.value"),
    claim: t("landing.proof.stats.0.claim"),
    context: t("landing.proof.stats.0.context"),
    source: t("landing.proof.stats.0.source"),
  };
  return (
    <GuideSection id="content" title={t("styleGuide.content.title")} lead={t("styleGuide.content.lead")}>
      <Specimen title={t("styleGuide.content.badges")}>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
          <Tagged name="neutral">
            <Badge>{t("dashboard.plan.free")}</Badge>
          </Tagged>
          <Tagged name="brand">
            <Badge tone="brand">{t("dashboard.plan.pro")}</Badge>
          </Tagged>
          <Tagged name="reward">
            <Badge tone="reward">{t("dashboard.customers.filter.ready")}</Badge>
          </Tagged>
          <Tagged name="ok">
            <Badge tone="ok">{t("messaging.automations.on")}</Badge>
          </Tagged>
          <Tagged name="warn">
            <Badge tone="warn">{t("messaging.automations.onHold")}</Badge>
          </Tagged>
          <Tagged name="danger">
            <Badge tone="danger">{t("dashboard.customers.filter.void")}</Badge>
          </Tagged>
        </div>
      </Specimen>

      <Specimen title={t("styleGuide.content.figures")} lead={t("styleGuide.content.figuresLead")}>
        <div className="grid gap-8 sm:grid-cols-3">
          <Figure
            size="stat"
            value={square.value}
            label={square.claim}
            caveat={square.context}
            source={{ label: square.source, href: PROOF_SOURCE_URLS.square }}
          />
          <Figure
            size="stat"
            value={t("landing.pricing.pro.price")}
            label={t("landing.pricing.pro.name")}
          />
          <Figure size="count" value={`${3}/${8}`} label={t("dashboard.scan.result.toGo", { count: 5 })} />
        </div>
      </Specimen>

      <div className="grid gap-6 lg:grid-cols-2">
        <Specimen title={t("styleGuide.content.rows")}>
          <LitPanel className="overflow-hidden">
            <List>
              <ListRow
                leading={<RowIcon><UserRoundX /></RowIcon>}
                title={t("messaging.kinds.inactive")}
                meta={t("messaging.describe.optIn")}
                trailing={<Badge tone="ok">{t("messaging.automations.on")}</Badge>}
                chevron
                onClick={() => {}}
              />
              <ListRow
                leading={<RowIcon><Cake /></RowIcon>}
                title={t("messaging.kinds.birthday")}
                meta={t("messaging.describe.birthdayToday")}
                trailing={<Badge>{t("messaging.automations.off")}</Badge>}
                chevron
                onClick={() => {}}
              />
              <ListRow
                leading={<RowIcon><Gift /></RowIcon>}
                title={t("messaging.kinds.reward_waiting")}
                trailing={<Badge tone="warn">{t("messaging.automations.onHold")}</Badge>}
                chevron
                onClick={() => {}}
              />
            </List>
          </LitPanel>
        </Specimen>

        <Specimen title={t("styleGuide.content.loading")}>
          <LitPanel className="overflow-hidden">
            <SkeletonRows rows={3} />
          </LitPanel>
        </Specimen>
      </div>

      <Specimen title={t("styleGuide.content.empty")}>
        <EmptyState
          icon={<Inbox />}
          title={t("dashboard.customers.title")}
          body={t("dashboard.customers.emptyPro")}
          action={
            <LinkButton to="/dashboard/standee" variant="secondary">
              {t("dashboard.nav.standee")}
            </LinkButton>
          }
          className="max-w-lg"
        />
      </Specimen>

      <Specimen title={t("styleGuide.content.notice")} lead={t("styleGuide.content.noticeLead")}>
        <div className="grid items-start gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-3">
            <Tagged name="ok · lit" wide>
              <Notice tone="ok" lit>
                {t("billing.success.done")}
              </Notice>
            </Tagged>
            <Tagged name="warn" wide>
              <Notice tone="warn">{t("dashboard.activity.truncated", guard)}</Notice>
            </Tagged>
            <Tagged name="danger · action" wide>
              <Notice tone="danger" action={<Button variant="secondary">{t("common.retry")}</Button>}>
                {t("auth.offline")}
              </Notice>
            </Tagged>
          </div>
          <div className="flex flex-col gap-4">
            <RatioList specs={NOTICE} version={version} />
            <div className="theme-lit rounded-panel border border-border bg-surface px-4">
              <RatioList specs={NOTICE_LIT} version={version} />
            </div>
          </div>
        </div>
      </Specimen>
    </GuideSection>
  );
}

function Tagged({ name, children, wide }: { name: string; children: ReactNode; wide?: boolean }) {
  return (
    <span className={wide ? "flex flex-col gap-1.5 [&>code]:self-start" : "flex flex-col items-start gap-1.5"}>
      {children}
      <TokenName>{name}</TokenName>
    </span>
  );
}

function RowIcon({ children }: { children: ReactNode }) {
  return (
    <span aria-hidden className="flex size-9 items-center justify-center rounded-full bg-background text-ink-muted [&_svg]:size-[1.125rem]">
      {children}
    </span>
  );
}
