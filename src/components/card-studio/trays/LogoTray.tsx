import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Info } from "lucide-react";
import { Badge } from "../../kit/Badge";
import { Switch } from "../../kit/Switch";
import { googleCut, logoShape } from "../designOptions";
import { fitPicture, readPicture } from "../pictureFiles";
import { UploadTile } from "../UploadTile";

/** A picture's own size, once it has loaded, or null until then (and for none). */
function usePictureSize(src: string | undefined) {
  const [size, setSize] = useState<{ src: string; width: number; height: number } | null>(null);
  useEffect(() => {
    if (!src) return;
    let live = true;
    const image = new Image();
    image.onload = () => {
      if (live) setSize({ src, width: image.naturalWidth, height: image.naturalHeight });
    };
    image.src = src;
    return () => {
      live = false;
    };
  }, [src]);
  return size && size.src === src ? size : null;
}

/** The business's mark: one picture that becomes Apple's wide logo and
 * Google's round badge, held until Save like every other picture; and
 * whether Apple Wallet writes the business's name beside it. Where the wallet
 * draws the design options, that switch shows only beside a logo of one's
 * own that is a mark, narrower than 2:1: a wider one already says the name
 * (brief §6.5). */
export function LogoTray({
  logo,
  ground,
  onPick,
  notKept,
  logoText,
  onLogoText,
  hasLogo,
  shapeOf,
  name = "",
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
  /** The picture Apple draws, to read its shape by: the held one, or the
   * saved Apple logo. */
  shapeOf?: string;
  /** The name the pass writes beside the logo. */
  name?: string;
}) {
  const { t } = useTranslation();
  // The error's key, not its sentence, so that it follows a switch of language.
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const size = usePictureSize(hasLogo ? shapeOf : undefined);
  const shape = logoShape(hasLogo, size);
  const long = !!googleCut(name);
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
      {onLogoText && shape === "wide" && (
        <p className="flex items-start gap-1.5 text-sm leading-snug text-ink-muted">
          <Info aria-hidden className="mt-px size-4 shrink-0" />
          <span>{t("studio.logoText.wide")}</span>
        </p>
      )}
      {/* A wide logo that already has the name beside it keeps the switch, so
          it can be turned off. */}
      {onLogoText && (shape === "mark" || (shape === "wide" && logoText)) && (
        <Switch
          checked={logoText}
          onChange={onLogoText}
          label={
            <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
              {t("studio.logoText.label")}
              <Badge>{t("studio.iphoneOnly")}</Badge>
            </span>
          }
          description={
            <>
              {t("studio.logoText.hint")}
              {long && <> {t("studio.logoText.long")}</>} {t("studio.logoText.google")}
            </>
          }
        />
      )}
    </div>
  );
}
