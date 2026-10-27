import { useState } from "react";
import { useTranslation } from "react-i18next";
import { readPicture } from "../pictureFiles";
import { UploadTile } from "../UploadTile";

/** The business's mark: one picture that becomes Apple's wide logo and
 * Google's round badge, held until Save like every other picture. */
export function LogoTray({
  logo,
  ground,
  onPick,
}: {
  /** The logo held or in use. */
  logo?: string;
  ground: string;
  onPick: (dataUrl: string) => void;
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
      onFile={(file) => {
        setError(null);
        readPicture(file)
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
