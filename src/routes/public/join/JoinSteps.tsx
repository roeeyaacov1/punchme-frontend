import type { ReactNode } from "react";
import { toNameCase } from "../../../lib/name";
import { CodeStep } from "./CodeStep";
import { JoinForm } from "./JoinForm";
import { JoinSign } from "./JoinSign";
import { JoinedCard } from "./JoinedCard";
import { isReturning } from "./joinRules";
import type { JoinFlow } from "./useJoinFlow";

/** The join's four places, one at a time, shared by `/join` and the friend's
 * join: what the shop is known to be goes in `sign` and `band`. */
export function JoinSteps({
  flow,
  sign,
  band,
}: {
  flow: JoinFlow;
  sign?: { lead?: ReactNode; line?: ReactNode; notTakingLine?: ReactNode };
  /** Over the form and the code: the shop's line, once the sign gives way. */
  band?: ReactNode;
}) {
  const { step } = flow;
  if (step.kind === "sign" || step.kind === "held") {
    return (
      <JoinSign
        {...sign}
        otpRequired={flow.otpRequired}
        held={step.kind === "held" ? step.answer : undefined}
        focusHeading={step.kind === "held"}
        onJoin={flow.open}
      />
    );
  }
  if (step.kind === "form") return <JoinForm flow={flow} band={band} />;
  if (step.kind === "code") return <CodeStep flow={flow} band={band} />;
  const { joined } = step;
  return (
    <JoinedCard
      serial={joined.serial}
      card={joined.card}
      holderName={toNameCase(flow.name)}
      returning={isReturning({ stampCount: joined.card.stamp_count, alreadyMember: joined.alreadyMember })}
      statusLink
    />
  );
}
