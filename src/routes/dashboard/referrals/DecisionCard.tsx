import type { ReactNode } from "react";
import { Trans, useTranslation } from "react-i18next";
import { CircleCheck } from "lucide-react";
import { Button, LitPanel } from "../../../components/kit";
import type { Referral, ReferralRule } from "../../../api/referrals";
import { ReferralLine } from "./ReferralLine";
import { countSentenceKey, decisionEffects, flagReasonKey } from "./referralFacts";
import { PEOPLE, useReferralPeople } from "./referralPeople";

export type Decision = "approve" | "reject";
/** What became of a decision: counted, not counted, or decided elsewhere first. */
export type DecisionResult = "approved" | "rejected" | "decided";

/**
 * A flagged referral, put as a decision: who joined through whom, why it
 * was held back in a sentence, and what each answer does, built from the
 * rules that are on. Two equal answers, neither coral, each confirmed in
 * the page's dialog because neither can be undone. Once answered, the card
 * stays and says what happened; the referral shows in the list below with
 * its new status, so nothing disappears unsaid.
 */
export function DecisionCard({
  referral,
  rules,
  result,
  problem,
  onAsk,
}: {
  referral: Referral;
  rules: readonly ReferralRule[];
  result: DecisionResult | null;
  /** A refusal other than "already decided", said on the card. */
  problem: ReactNode;
  onAsk: (decision: Decision) => void;
}) {
  const { t } = useTranslation();
  const people = useReferralPeople(referral);
  const effects = decisionEffects(rules);

  let outcome: ReactNode = null;
  if (result === "approved") {
    outcome = (
      <Trans
        i18nKey={effects.welcome ? "referrals.decision.countedWelcome" : "referrals.decision.counted"}
        values={people}
        components={PEOPLE}
      />
    );
  } else if (result === "rejected") outcome = t("referrals.decision.notCounted");
  else if (result === "decided") outcome = t("referrals.decision.decided");

  return (
    <LitPanel as="li" light="lit" className="flex flex-col gap-3 p-4 sm:p-5">
      <p className="type-body font-semibold text-ink">
        <ReferralLine referral={referral} />
      </p>
      <p className="type-body text-ink">
        <Trans i18nKey={flagReasonKey(referral.fraud_reason)} values={people} components={PEOPLE} />
      </p>
      {outcome ? (
        <p role="status" className="flex items-start gap-2 type-body font-semibold text-ink">
          <CircleCheck aria-hidden className="mt-0.5 size-5 shrink-0 text-ok" />
          <span>{outcome}</span>
        </p>
      ) : (
        <>
          <ul className="flex flex-col gap-1 text-sm leading-snug text-ink-muted">
            <li>
              <Trans i18nKey={countSentenceKey(effects)} values={people} components={PEOPLE} />
            </li>
            <li>
              <Trans i18nKey="referrals.decision.skip" values={people} components={PEOPLE} />
            </li>
          </ul>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="secondary" onClick={() => onAsk("approve")} className="whitespace-normal">
              {t("referrals.list.review.approve")}
            </Button>
            <Button variant="secondary" onClick={() => onAsk("reject")} className="whitespace-normal">
              {t("referrals.list.review.reject")}
            </Button>
          </div>
          {problem}
        </>
      )}
    </LitPanel>
  );
}
