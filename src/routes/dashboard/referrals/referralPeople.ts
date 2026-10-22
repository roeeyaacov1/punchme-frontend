import { createElement } from "react";
import { useTranslation } from "react-i18next";
import type { Referral } from "../../../api/referrals";
import { personOf, type Person } from "./referralFacts";

/** A person's name as a sentence says it: their own, or which kind of
 * missing, in words. */
export function usePersonName(): (person: Person) => string {
  const { t } = useTranslation();
  return (person) =>
    person.kind === "name"
      ? person.name
      : t(person.kind === "noName" ? "referrals.list.noName" : "referrals.list.removedCard");
}

/** The two people in a referral, as its sentences say them. */
export function useReferralPeople(referral: Referral): { friend: string; member: string } {
  const name = usePersonName();
  return {
    friend: name(personOf(referral.friend_display_name, referral.friend_card_id)),
    member: name(personOf(referral.referrer_display_name, referral.referrer_card_id)),
  };
}

/** Each name in a referral's sentence in its own `<bdi>`, so a Latin name
 * keeps its order inside Hebrew and a Hebrew one inside English. */
export const PEOPLE = { f: createElement("bdi"), m: createElement("bdi") };
