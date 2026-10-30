import { useState } from "react";
import { useTranslation } from "react-i18next";
import { TriangleAlert } from "lucide-react";
import { StampPicker, TexturePicker } from "../../../../components/card-studio/controls";
import { hashDataUrl } from "../../../../lib/stampArt";
import { useOnboardingDraft } from "../../useOnboardingDraft";

/**
 * The stamp: one of the sixteen symbols, the trade's first, or a picture of
 * one's own, cropped square in the browser and kept on this device until the
 * card is saved; and the texture behind the stamps. A picture the card says
 * it has but this device doesn't is said here, where it is chosen again, by
 * its cause: full storage is said over the card already, so here it is the
 * picture not being on this phone at all.
 */
export function StampPanel({ storageFull }: { storageFull: boolean }) {
  const { t } = useTranslation();
  const { resolved, update, setArt, artUrl } = useOnboardingDraft();
  const [notKept, setNotKept] = useState(false);
  const picture = resolved.stamp.kind === "image";
  const lost = picture && !artUrl;

  return (
    <div className="flex flex-col gap-6">
      {/* First, so it is what the owner sent back here reads. */}
      {lost && !storageFull && (
        <p role="alert" className="flex items-start gap-1.5 text-sm font-semibold leading-snug text-ink">
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
          }}
          niche={resolved.niche}
          picture={{ url: artUrl ?? null, inUse: picture }}
          onPicture={(dataUrl) => {
            const hash = hashDataUrl(dataUrl);
            setNotKept(!setArt({ hash, dataUrl }));
            update({ stamp: { kind: "image", hash } });
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
