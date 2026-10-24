import { createElement } from "react";
import { useTranslation } from "react-i18next";
import type { Referral } from "../../../api/referrals";
import { personOf, prefixJoiner, sentenceStart, type Person } from "./referralFacts";

/** A person's name as a sentence says it: their own, or which kind of
 * missing, in words. */
export function usePersonName(): (person: Person) => string {
  const { t } = useTranslation();
  return (person) =>
    person.kind === "name"
      ? person.name
      : t(person.kind === "noName" ? "referrals.list.noName" : "referrals.list.removedCard");
}

/** The two people in a referral, as its sentences say them: each name, the
 * friend's as a sentence opens on it (`Friend`), and the hyphen a Hebrew
 * prefix takes before each (`fj`, `mj`). */
export function useReferralPeople(referral: Referral): {
  friend: string;
  member: string;
  Friend: string;
  fj: string;
  mj: string;
} {
  const { i18n } = useTranslation();
  const name = usePersonName();
  const friendPerson = personOf(referral.friend_display_name, referral.friend_card_id);
  const friend = name(friendPerson);
  const member = name(personOf(referral.referrer_display_name, referral.referrer_card_id));
  const lang = i18n.resolvedLanguage ?? i18n.language;
  return {
    friend,
    member,
    Friend: sentenceStart(friendPerson, friend),
    fj: prefixJoiner(friend, lang),
    mj: prefixJoiner(member, lang),
  };
}

/** Each name in a referral's sentence in its own `<bdi>`, so a Latin name
 * keeps its order inside Hebrew and a Hebrew one inside English. */
export const PEOPLE = { f: createElement("bdi"), m: createElement("bdi") };
