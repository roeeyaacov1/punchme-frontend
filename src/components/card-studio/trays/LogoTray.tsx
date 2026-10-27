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
  const [error, setError] = useState<string | null>(null);
  return (
    <UploadTile
      title={t("studio.logoTitle")}
      hint={t("studio.logoHint")}
      src={logo}
      ground={ground}
      error={error}
      note={notKept ? t("studio.picture.notKept") : undefined}
      onFile={(file) => {
        setError(null);
        readPicture(file)
          .then((dataUrl) => fitPicture(dataUrl, "logo"))
          .then(onPick)
          .catch((err: unknown) =>
            setError(
              err instanceof Error && err.message === "too large"
                ? t("onboarding.stamp.uploadTooLarge")
                : t("onboarding.stamp.uploadUnreadable"),
            ),
          );
      }}
    />
  );
}
