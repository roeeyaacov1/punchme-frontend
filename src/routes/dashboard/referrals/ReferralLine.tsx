import { Trans } from "react-i18next";
import type { Referral } from "../../../api/referrals";
import { PEOPLE, useReferralPeople } from "./referralPeople";

/** "Noa Cohen joined through Dana Levi", each name isolated. */
export function ReferralLine({ referral }: { referral: Referral }) {
  const people = useReferralPeople(referral);
  return <Trans i18nKey="referrals.list.line" values={people} components={PEOPLE} />;
}
