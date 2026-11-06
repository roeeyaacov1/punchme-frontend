import { useState } from "react";
import { useTranslation } from "react-i18next";
import { TriangleAlert } from "lucide-react";
import { logoShape } from "../../../../components/card-studio/designOptions";
import { fitPicture, pictureSize, readPicture } from "../../../../components/card-studio/pictureFiles";
import { UploadTile } from "../../../../components/card-studio/UploadTile";
import { hashDataUrl } from "../../../../lib/stampArt";
import { useOnboardingDraft } from "../../useOnboardingDraft";

/**
 * "Logo (optional)", on a card from a look (brief §7.4): the studio's upload
 * tile, the picture scaled down as the studio's logo is and kept on this
 * device, under a key of its own, until the card is saved. A mark narrower
 * than 2:1 turns the name beside it on by itself, as its hint says; a wide
 * one, which already says the name, doesn't. The studio has the switch.
 *
 * A logo the draft has but the device doesn't (storage that let it go) is
 * said here. It holds nothing up: the logo is optional, and the card is
 * saved without it.
 */
export function LogoField() {
  const { t } = useTranslation();
  const { draft, resolved, update, setLogo, logoUrl } = useOnboardingDraft();
  // The error's key, not its sentence, so that it follows a switch of language.
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [notKept, setNotKept] = useState(false);
  const lost = !!draft.logo && !logoUrl;

  async function take(file: File) {
    setErrorKey(null);
    try {
      const dataUrl = await fitPicture(await readPicture(file), "logo");
      const size = await pictureSize(dataUrl);
      const hash = hashDataUrl(dataUrl);
      setNotKept(!setLogo({ hash, dataUrl }));
      update({ logo: hash, options: { ...draft.options, logo_text: logoShape(true, size) === "mark" } });
    } catch (err) {
      setErrorKey(
        err instanceof Error && err.message === "too large"
          ? "onboarding.stamp.uploadTooLarge"
          : "onboarding.stamp.uploadUnreadable",
      );
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {lost && (
        <p role="alert" className="flex items-start gap-1.5 text-sm font-semibold leading-snug text-ink">
          <TriangleAlert aria-hidden className="mt-px size-4 shrink-0 text-warn" />
          <span>{t("onboarding.logo.lost")}</span>
        </p>
      )}
      <UploadTile
        title={t("onboarding.logo.label")}
        hint={t("onboarding.logo.hint")}
        src={logoUrl}
        ground={resolved.background}
        error={errorKey ? t(errorKey) : null}
        note={logoUrl ? t(notKept ? "onboarding.logo.notKept" : "onboarding.logo.kept") : undefined}
        onFile={(file) => void take(file)}
        onRemove={
          draft.logo
            ? () => {
                setErrorKey(null);
                setNotKept(false);
                setLogo(null);
                update({ logo: null, options: { ...draft.options, logo_text: false } });
              }
            : undefined
        }
      />
    </div>
  );
}
