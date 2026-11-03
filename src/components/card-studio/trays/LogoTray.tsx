import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Switch } from "../../kit/Switch";
import { fitPicture, readPicture } from "../pictureFiles";
import { UploadTile } from "../UploadTile";

/** The business's mark: one picture that becomes Apple's wide logo and
 * Google's round badge, held until Save like every other picture; and
 * whether Apple Wallet writes the business's name beside it. */
export function LogoTray({
  logo,
  ground,
  onPick,
  notKept,
  logoText,
  onLogoText,
  hasLogo,
}: {
  /** The logo held or in use. */
  logo?: string;
  ground: string;
  onPick: (dataUrl: string) => void;
  /** The held logo didn't fit the tab's storage. */
  notKept?: boolean;
  /** The name beside the logo is on. */
  logoText: boolean;
  /** Without it (a wallet that draws none of the design options), no switch. */
  onLogoText?: (on: boolean) => void;
  /** The card has a logo of the owner's own, held or saved: without one the
   * drawn logo already says the name, and the switch does nothing. */
  hasLogo: boolean;
}) {
  const { t } = useTranslation();
  // The error's key, not its sentence, so that it follows a switch of language.
  const [errorKey, setErrorKey] = useState<string | null>(null);
  return (
    <div className="flex flex-col gap-6">
      <UploadTile
        title={t("studio.logoTitle")}
        hint={t("studio.logoHint")}
        src={logo}
        ground={ground}
        error={errorKey ? t(errorKey) : null}
        note={notKept ? t("studio.picture.notKept") : undefined}
        onFile={(file) => {
          setErrorKey(null);
          readPicture(file)
            .then((dataUrl) => fitPicture(dataUrl, "logo"))
            .then(onPick)
            .catch((err: unknown) =>
              setErrorKey(
                err instanceof Error && err.message === "too large"
                  ? "onboarding.stamp.uploadTooLarge"
                  : "onboarding.stamp.uploadUnreadable",
              ),
            );
        }}
      />
      {onLogoText && (
        <Switch
          checked={logoText}
          onChange={onLogoText}
          label={t("studio.logoText.label")}
          description={hasLogo ? t("studio.logoText.hint") : t("studio.logoText.noLogo")}
        />
      )}
    </div>
  );
}
