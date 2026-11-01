import {
  findUnknownPlaceholders,
  findUnsupportedPlaceholders,
  mentionsGift,
  renderMessage,
  sampleContext,
  type MessageKind,
  type MessageLanguage,
} from "../../lib/messageTemplate";

/**
 * A message being written, a broadcast's or a rule's: what the composer and
 * the editor share, and what they keep in the tab's session while the owner
 * steps away.
 */
export interface MessageDraft {
  title: string;
  body: string;
  gift_stamps: number;
  gift_complete_card: boolean;
  template_id: string | null;
}

export const EMPTY_MESSAGE: MessageDraft = {
  title: "",
  body: "",
  gift_stamps: 0,
  gift_complete_card: false,
  template_id: null,
};

/** The gift as one choice: none, one to three stamps, or the whole card. */
export type GiftChoice = "1" | "2" | "3" | "full";
export const GIFT_CHOICES: readonly GiftChoice[] = ["1", "2", "3", "full"];

export function hasGift(draft: Pick<MessageDraft, "gift_stamps" | "gift_complete_card">): boolean {
  return draft.gift_complete_card || draft.gift_stamps > 0;
}

export function giftChoiceOf(draft: Pick<MessageDraft, "gift_stamps" | "gift_complete_card">): GiftChoice {
  if (draft.gift_complete_card) return "full";
  const stamps = Math.min(3, Math.max(1, draft.gift_stamps));
  return String(stamps) as GiftChoice;
}

export function giftPatch(choice: GiftChoice | null): Pick<MessageDraft, "gift_stamps" | "gift_complete_card"> {
  if (choice === null) return { gift_stamps: 0, gift_complete_card: false };
  if (choice === "full") return { gift_stamps: 0, gift_complete_card: true };
  return { gift_stamps: Number(choice), gift_complete_card: false };
}

/**
 * What the send or the save would refuse, found while typing, so each is
 * said under the field it's about rather than after the button:
 * - a placeholder nobody knows, in the title or the body;
 * - one this kind can't carry, such as a name in a message to everyone;
 * - a gift the text promises while the gift is off, which is only a warning.
 */
export function messageProblems(draft: MessageDraft, kind: MessageKind) {
  return {
    titleUnknown: findUnknownPlaceholders(draft.title, kind),
    bodyUnknown: findUnknownPlaceholders(draft.body, kind),
    titleUnsupported: [...new Set(findUnsupportedPlaceholders(draft.title, kind))],
    bodyUnsupported: [...new Set(findUnsupportedPlaceholders(draft.body, kind))],
    giftMismatch: !hasGift(draft) && mentionsGift(draft.body),
  };
}

/** Nothing the send would refuse: the warning about a gift doesn't block. */
export function messageReady(draft: MessageDraft, kind: MessageKind): boolean {
  const problems = messageProblems(draft, kind);
  return (
    draft.body.trim().length > 0 &&
    problems.titleUnknown.length === 0 &&
    problems.bodyUnknown.length === 0 &&
    problems.titleUnsupported.length === 0 &&
    problems.bodyUnsupported.length === 0
  );
}

/**
 * The message as a sample customer gets it, in the card's language, exactly
 * as the backend's own sample renders it. An empty title shows as the
 * business's name, which is what the lock screen shows.
 */
export function previewOf(
  draft: MessageDraft,
  {
    kind,
    language,
    businessName,
    rewardText,
    days,
  }: { kind: MessageKind; language: MessageLanguage; businessName: string; rewardText: string; days?: number | null },
): { title?: string; body: string } {
  const context = sampleContext(language, { business: businessName, reward: rewardText, kind, days });
  return {
    title: draft.title.trim() ? renderMessage(draft.title.trim(), context) : undefined,
    body: renderMessage(draft.body, context),
  };
}
