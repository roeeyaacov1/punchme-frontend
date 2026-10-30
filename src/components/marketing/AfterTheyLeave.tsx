import { Trans, useTranslation } from "react-i18next";
import { Cake, Gift, Send, UserRoundX, type LucideIcon } from "lucide-react";
import { AppleCardPreview } from "../card-studio/CardPreviews";
import { formatHour, uiDays } from "../messaging/describe";
import { Badge, Figure, LitPanel, WallpaperStage } from "../kit";
import { column, section } from "./landingLayout";
import { landedStamps, samplePass, tradeTemplate, type TradeKey } from "./samples";
import { SourceLabel, type ProofStat } from "./SourceLabel";
import { PROOF_SOURCE_URLS } from "./sources";
import { useFirstSight, useLightsOn } from "./useFirstSight";

/**
 * The starter rules as an owner finds them in Messages, read off the
 * backend's recipes (apps/messaging/recipes.py): win-back after 30 days,
 * the birthday, and a reward left waiting 7 days, each at 10:00, the first
 * two with a gift stamp. Settings, not results, and every one editable.
 */
const STARTER = { hour: 10, winBackDays: 30, rewardWaitingDays: 7 } as const;

interface Rule {
  kind: "inactive" | "birthday" | "reward_waiting" | "broadcast";
  /** The Messages page's own mark for the kind. */
  icon: LucideIcon;
  sentence: string;
  gift?: string;
}

/**
 * What brings people back, said as the mechanism and never as a result:
 * the card stays on their phone, and the owner's messages reach it. A
 * sample message on the lock screen, labelled as one, over the card the
 * visitor picked; what each phone does with it, in the dashboard's words;
 * the three automatic rules under the dashboard's names, each with its own
 * sentence of who gets it and when; and the broadcast, with its cap. Then
 * the evidence that regulars are worth keeping, each figure a citation.
 * Whether enough of them come back is never said: nothing here could
 * back it.
 *
 * The sample message arrives once, when the lock screen is in view, its
 * place kept until then, so the visitor sees the card on its own first;
 * the rules' panel lights on as it comes up the screen.
 */
export function AfterTheyLeave({ trade }: { trade: TradeKey }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage ?? "he";
  const template = tradeTemplate(trade);
  const business = t(`landing.templates.items.${trade}.business`);
  const title = t("landing.after.message.title");
  const hour = formatHour(STARTER.hour);
  const giftStamp = t("messaging.sentence.giftStamps", { count: 1 });
  const stats = t("landing.proof.stats", { returnObjects: true }) as ProofStat[];
  const evidence = stats
    .map((stat, index) => ({ stat, index }))
    .filter(({ stat }) => stat.id === "square" || stat.id === "hbr");
  const [stageRef, stageSeen] = useFirstSight<HTMLDivElement>({ share: 0.9 });
  const rulesPanel = useLightsOn<HTMLUListElement>();

  const rules: Rule[] = [
    {
      kind: "inactive",
      icon: UserRoundX,
      sentence: t("messaging.sentence.inactiveCounting", { hour, days: uiDays(STARTER.winBackDays, lang) }),
      gift: giftStamp,
    },
    { kind: "birthday", icon: Cake, sentence: t("messaging.sentence.birthday", { hour }), gift: giftStamp },
    {
      kind: "reward_waiting",
      icon: Gift,
      sentence: t("messaging.sentence.rewardWaiting", { hour, days: uiDays(STARTER.rewardWaitingDays, lang) }),
    },
  ];

  return (
    <section aria-labelledby="after-title" className={section}>
      <div className={column}>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-x-16 lg:gap-y-10">
          <div className="flex min-w-0 flex-col gap-4 lg:col-span-7 lg:row-start-1">
            <h2 id="after-title" className="type-headline max-w-[18ch] text-balance text-ink">
              {t("landing.after.title")}
            </h2>
            <p className="type-lead max-w-[38rem] text-pretty text-ink-muted">{t("landing.after.lead")}</p>
          </div>

          <div
            ref={stageRef}
            className="flex min-w-0 flex-col items-center gap-3 lg:col-span-5 lg:col-start-8 lg:row-span-2 lg:row-start-1 lg:sticky lg:top-28 lg:self-start"
          >
            <Badge>{t("landing.after.sample")}</Badge>
            <WallpaperStage
              cardColor={template.backgroundColor}
              stampColor={template.stampColor}
              foregroundColor={template.foregroundColor}
              notification={{ sender: business, title, body: t("landing.after.message.body") }}
              arrive={stageSeen ? "now" : "waiting"}
              summary={t("landing.after.stageSummary", { title, business })}
            >
              <AppleCardPreview {...samplePass(template, t, landedStamps(template))} />
            </WallpaperStage>
          </div>

          <div className="flex min-w-0 flex-col gap-6 lg:col-span-7 lg:row-start-2">
            <p className="type-prose text-pretty text-ink-muted">{t("messaging.phones")}</p>
            <LitPanel radius="card" arrive={rulesPanel.arrive} className={rulesPanel.dark}>
              <ul ref={rulesPanel.ref} className="divide-y divide-border">
                {rules.map((rule) => (
                  <RuleItem key={rule.kind} rule={rule} />
                ))}
                <RuleItem rule={{ kind: "broadcast", icon: Send, sentence: t("landing.after.broadcast") }} />
              </ul>
              <p className="border-t border-border px-5 py-4 text-sm text-pretty text-ink-muted sm:px-6">
                {t("landing.after.starter")}
              </p>
            </LitPanel>
          </div>
        </div>

        <div className="mt-12 grid gap-10 border-t border-border pt-10 sm:grid-cols-2 sm:gap-8 lg:mt-16 lg:gap-16">
          {evidence.map(({ stat, index }) => (
            <Figure
              key={stat.id}
              size="stat"
              // A range keeps its own left-to-right run inside Hebrew.
              value={<Trans i18nKey={`landing.proof.stats.${index}.value`} components={{ ltr: <bdi dir="ltr" /> }} />}
              label={stat.claim}
              caveat={stat.context}
              source={{ label: <SourceLabel label={stat.source} />, href: PROOF_SOURCE_URLS[stat.id] }}
              className="max-w-[34rem] [&>span]:self-start"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function RuleItem({ rule }: { rule: Rule }) {
  const { t } = useTranslation();
  const Icon = rule.icon;
  return (
    <li className="flex gap-4 px-5 py-5 sm:px-6">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-ink/5 text-ink [&_svg]:size-5">
        <Icon aria-hidden />
      </span>
      <div className="flex min-w-0 flex-col gap-1">
        <h3 className="type-card-title text-ink">{t(`messaging.kinds.${rule.kind}`)}</h3>
        <p className="type-body text-pretty text-ink-muted">{rule.sentence}</p>
        {rule.gift && <p className="type-body text-pretty font-semibold text-ink">{rule.gift}</p>}
      </div>
    </li>
  );
}
