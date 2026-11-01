import { useState, type RefObject } from "react";
import { useTranslation } from "react-i18next";
import { TriangleAlert } from "lucide-react";
import { StampPicker, TexturePicker } from "../../../../components/card-studio/controls";
import { hashDataUrl } from "../../../../lib/stampArt";
import { useOnboardingDraft } from "../../useOnboardingDraft";

/**
 * The stamp: one of the sixteen symbols, the trade's first, or a picture of
 * one's own, cropped square in the browser and kept on this device until the
 * card is saved; and the texture behind the stamps. A picture the card says
 * it has but this device doesn't is said here, first, where it is chosen
 * again; when the cause is full storage, the notice over the card says so
 * too. Save and closing the tray come back to this line while it stands.
 */
export function StampPanel({
  storageFull,
  lostRef,
  onPick,
}: {
  storageFull: boolean;
  /** The lost picture's line, for the screen to take focus to. */
  lostRef?: RefObject<HTMLParagraphElement>;
  /** A symbol or a picture picked: it lands on the card. */
  onPick?: () => void;
}) {
  const { t } = useTranslation();
  const { resolved, update, setArt, artUrl } = useOnboardingDraft();
  const [notKept, setNotKept] = useState(false);
  const picture = resolved.stamp.kind === "image";
  const lost = picture && !artUrl;

  return (
    <div className="flex flex-col gap-6">
      {lost && (
        <p
          ref={lostRef}
          role="alert"
          tabIndex={-1}
          className="flex items-start gap-1.5 text-sm font-semibold leading-snug text-ink outline-none"
        >
          <TriangleAlert aria-hidden className="mt-px size-4 shrink-0 text-warn" />
          <span>{t("onboarding.stamp.notOnDevice")}</span>
        </p>
      )}
      <div className="flex flex-col gap-3">
        <StampPicker
          glyph={resolved.stamp.kind === "glyph" ? resolved.stamp.glyph : "check"}
          onGlyph={(glyph) => {
            setNotKept(false);
            update({ stamp: { kind: "glyph", glyph } });
            onPick?.();
          }}
          niche={resolved.niche}
          picture={{ url: artUrl ?? null, inUse: picture }}
          onPicture={(dataUrl) => {
            const hash = hashDataUrl(dataUrl);
            setNotKept(!setArt({ hash, dataUrl }));
            update({ stamp: { kind: "image", hash } });
            onPick?.();
          }}
          note={picture ? undefined : t("studio.picture.stays")}
        />
        {notKept && !lost && !storageFull && (
          <p role="status" className="flex items-start gap-1.5 text-sm font-semibold leading-snug text-ink">
            <TriangleAlert aria-hidden className="mt-px size-4 shrink-0 text-warn" />
            <span>{t("onboarding.stamp.artMemoryOnly")}</span>
          </p>
        )}
      </div>
      <TexturePicker
        value={resolved.pattern}
        onChange={(pattern) => update({ pattern })}
        background={resolved.background}
        stampColour={resolved.accent}
      />
    </div>
  );
}
