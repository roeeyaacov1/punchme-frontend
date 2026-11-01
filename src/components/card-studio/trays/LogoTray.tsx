import { useState } from "react";
import { useTranslation } from "react-i18next";
import { fitPicture, readPicture } from "../pictureFiles";
import { UploadTile } from "../UploadTile";

/** The business's mark: one picture that becomes Apple's wide logo and
 * Google's round badge, held until Save like every other picture. */
export function LogoTray({
  logo,
  ground,
  onPick,
  notKept,
}: {
  /** The logo held or in use. */
  logo?: string;
  ground: string;
  onPick: (dataUrl: string) => void;
  /** The held logo didn't fit the tab's storage. */
  notKept?: boolean;
}) {
  const { t } = useTranslation();
  // The error's key, not its sentence, so that it follows a switch of language.
  const [errorKey, setErrorKey] = useState<string | null>(null);
  return (
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
  );
}
