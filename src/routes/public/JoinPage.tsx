import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { enroll, getPublicCard, requestJoinOtp } from "../../api/loyalty";
import { cn } from "../../lib/cn";
import { env } from "../../lib/env";
import { browserStorage, rememberHeldCard } from "../../lib/heldCards";
import { toNameCase } from "../../lib/name";
import { isolate } from "../dashboard/problem";
import { JoinSteps } from "./join/JoinSteps";
import { useJoinFlow } from "./join/useJoinFlow";
import { PublicPage } from "./PublicPage";

/**
 * `/join/:templateId`, where the standee's QR lands: a stranger at a
 * counter with one hand free. The sign over the counter, then the details,
 * an SMS code when the code step is on, and the card.
 *
 * The page knows only the design id, and no call on load says whose card it
 * is (the backend's public face by design id is still to come), so the sign
 * speaks for every card until then; a dead link or a shop not taking
 * customers is found on submit and said on the sign.
 *
 * When `env.otpRequired` is off the code step is skipped and the details
 * join directly: asking for a code anyway would spend the number's
 * allowance on a step that isn't required.
 */
export function JoinPage() {
  const { t } = useTranslation();
  const { templateId = "" } = useParams<{ templateId: string }>();

  const flow = useJoinFlow({
    otpRequired: env.otpRequired,
    requestCode: (phone) => requestJoinOtp(templateId, phone),
    join: async ({ phone, name, birthday, optIn, code }) => {
      const result = await enroll(templateId, {
        phone,
        display_name: toNameCase(name) || undefined,
        birthday: birthday || undefined,
        marketing_opt_in: optIn,
        otp_code: code,
      });
      const card = await getPublicCard(result.card_serial);
      // The person who just joined holds this card: let /p/<token> know.
      rememberHeldCard(browserStorage(), card.public_token, result.card_serial);
      return { serial: result.card_serial, card };
    },
  });

  const { step } = flow;
  const title =
    step.kind === "card"
      ? t("enroll.pageTitleCard", { business: isolate(step.joined.card.business_name) })
      : t("enroll.pageTitle");
  // The sign stands in the middle of the first screen; what follows it reads
  // from the top.
  const centred = step.kind === "sign" || step.kind === "held";

  return (
    <PublicPage variant="customer" title={title} className={cn("items-center", centred ? "justify-center" : "pt-2")}>
      <div className="flex w-full max-w-[30rem] flex-col">
        <JoinSteps flow={flow} />
      </div>
    </PublicPage>
  );
}
