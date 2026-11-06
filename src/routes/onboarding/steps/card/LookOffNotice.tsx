import { useTranslation } from "react-i18next";
import { Button, Notice } from "../../../../components/kit";
import { useLookOff } from "../../useLookOff";

/** Over the card, on every part, where the wallet draws none of the options
 * the card from a look has: what it won't take, and the way on. */
export function LookOffNotice() {
  const { t } = useTranslation();
  const { off, takeOff } = useLookOff();
  if (!off) return null;
  return (
    // On a phone its sides and the button's hold, as the invite's notice
    // does. Where large text leaves the notice under 14rem (375 at 200%; 320
    // at 100% is 16rem), the words go under the icon at its full width, so
    // the button's five words wrap there, not a word to a line beside it.
    <Notice
      tone="warn"
      className="max-sm:px-[min(1rem,16px)] [container-type:inline-size] [@container(max-width:14rem)]:[&>div]:basis-full"
      action={
        <Button
          variant="secondary"
          onClick={takeOff}
          className="max-w-full !whitespace-normal text-center max-sm:px-[min(1.25rem,20px)]"
        >
          {t("studio.options.takeOff")}
        </Button>
      }
    >
      {t("onboarding.look.off")}
    </Notice>
  );
}
