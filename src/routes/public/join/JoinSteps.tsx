import { useLayoutEffect, useState, type ReactNode } from "react";
import { useReducedMotion } from "../../../components/kit";
import { toNameCase } from "../../../lib/name";
import { CodeStep } from "./CodeStep";
import { JoinForm } from "./JoinForm";
import { JoinSign } from "./JoinSign";
import { JoinedCard } from "./JoinedCard";
import { isReturning, stepDirection } from "./joinRules";
import type { JoinFlow, JoinStep } from "./useJoinFlow";

const STEP_MOTION = { forward: "animate-step-forward", back: "animate-step-back" } as const;

/**
 * The join's four places, one at a time, shared by `/join` and the friend's
 * join: what the shop is known to be goes in `sign` and `band`.
 *
 * Each place after the first arrives by light from the side the join moved
 * to: on to the next one from the end edge, back to an earlier one from the
 * start edge, 8px at most and mirrored in Hebrew; with reduced motion, a
 * 150ms fade where it stands. The page's first place is simply there. The
 * band comes in once, with the form, and holds still while the form and the
 * code take turns under it, so only what changed moves. The card arrives
 * its own way, with the activation (`PassStage`).
 *
 * Every place after the first opens at the top of the page, before it is
 * painted: the form is taller than a phone with its keyboard up, and after
 * a scrolled form the card would arrive with its heading above the screen,
 * where the heading's focus (`preventScroll`) wouldn't bring it back.
 */
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
  const reduced = useReducedMotion();
  const [shown, setShown] = useState<{ kind: JoinStep["kind"]; moved: "forward" | "back" | null }>({
    kind: step.kind,
    moved: null,
  });
  if (shown.kind !== step.kind) setShown({ kind: step.kind, moved: stepDirection(shown.kind, step.kind) });

  // `instant`: the page's own scroll behaviour is smooth.
  useLayoutEffect(() => {
    if (shown.moved) window.scrollTo({ top: 0, behavior: "instant" });
  }, [shown]);

  let motion: string | undefined;
  if (shown.moved) motion = reduced ? "animate-gentle-in" : STEP_MOTION[shown.moved];

  if (step.kind === "sign" || step.kind === "held") {
    return (
      <Arrive key="sign" motion={motion}>
        <JoinSign
          {...sign}
          otpRequired={flow.otpRequired}
          held={step.kind === "held" ? step.answer : undefined}
          focusHeading={step.kind === "held"}
          onJoin={flow.open}
        />
      </Arrive>
    );
  }
  if (step.kind === "form" || step.kind === "code") {
    return (
      <div className="flex flex-col gap-5">
        {band && <Arrive motion={motion}>{band}</Arrive>}
        <Arrive key={step.kind} motion={motion}>
          {step.kind === "form" ? <JoinForm flow={flow} /> : <CodeStep flow={flow} />}
        </Arrive>
      </div>
    );
  }
  const { joined } = step;
  return (
    <JoinedCard
      serial={joined.serial}
      card={joined.card}
      holderName={toNameCase(flow.name)}
      returning={isReturning({ stampCount: joined.card.stamp_count, alreadyMember: joined.alreadyMember })}
      statusLink
      arrival="activate"
    />
  );
}

/** Plays its arrival once, as it mounts: a later change of direction never
 * restarts it, so the band stays where it is when the join steps back. */
function Arrive({ motion, children }: { motion?: string; children: ReactNode }) {
  const [arrival] = useState(motion);
  return <div className={arrival}>{children}</div>;
}
