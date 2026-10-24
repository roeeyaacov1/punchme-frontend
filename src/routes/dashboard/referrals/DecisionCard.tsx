import type { ReactNode } from "react";
import { Trans, useTranslation } from "react-i18next";
import { CircleCheck } from "lucide-react";
import { Button, LitPanel, useReducedMotion } from "../../../components/kit";
import type { Referral, ReferralRule } from "../../../api/referrals";
import { cn } from "../../../lib/cn";
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
 * stays and says what happened, and its light goes out: it is settled, so
 * only its edge is left. The referral shows in the list below with its new
 * status, so nothing disappears unsaid.
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
  const reduced = useReducedMotion();
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

  const what = (
    <>
      <p className="type-body font-semibold text-ink">
        <ReferralLine referral={referral} />
      </p>
      <p className="type-body text-ink">
        <Trans i18nKey={flagReasonKey(referral.fraud_reason)} values={people} components={PEOPLE} />
      </p>
    </>
  );

  if (outcome) {
    return (
      <li className="relative isolate flex flex-col gap-3 rounded-panel border border-border p-4 text-ink sm:p-5">
        {/* Its light, as a layer of its own over the edge, going out once
            the dialog that answered it has gone: 180ms after its 180ms
            exit, or 150ms after its 150ms fade with reduced motion. Opacity
            only, so the same in Hebrew. At night it goes out at once: the
            words are night ink from the start, and over the light they read
            1.05:1 until it had gone. */}
        <LitPanel
          light="lit"
          aria-hidden
          className={cn(
            "pointer-events-none absolute -inset-px -z-10 [.theme-night_&]:animate-none [.theme-night_&]:opacity-0",
            reduced ? "animate-gentle-out" : "animate-exit-fade",
          )}
          style={{ animationDelay: reduced ? "var(--duration-gentle)" : "var(--duration-exit)" }}
        />
        {what}
        <p role="status" className="flex items-start gap-2 type-body font-semibold text-ink">
          <CircleCheck aria-hidden className="mt-0.5 size-5 shrink-0 text-ok" />
          <span>{outcome}</span>
        </p>
      </li>
    );
  }

  return (
    <LitPanel as="li" light="lit" className="flex flex-col gap-3 p-4 sm:p-5">
      {what}
      <ul className="flex flex-col gap-1 text-sm leading-snug text-ink-muted">
        <li>
          <Trans i18nKey={countSentenceKey(effects)} values={people} components={PEOPLE} />
        </li>
        <li>
          <Trans i18nKey="referrals.decision.skip" values={people} components={PEOPLE} />
        </li>
      </ul>
      <div className="grid grid-cols-2 gap-3">
        <Button variant="secondary" onClick={() => onAsk("approve")} className="max-w-full !whitespace-normal text-center">
          {t("referrals.list.review.approve")}
        </Button>
        <Button variant="secondary" onClick={() => onAsk("reject")} className="max-w-full !whitespace-normal text-center">
          {t("referrals.list.review.reject")}
        </Button>
      </div>
      {problem}
    </LitPanel>
  );
}
