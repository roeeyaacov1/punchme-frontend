import { useId, useState, type RefObject } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, Info, TriangleAlert } from "lucide-react";
import { StampPicker, TexturePicker } from "../../../../components/card-studio/controls";
import { studioMode, withStamp } from "../../../../components/card-studio/designOptions";
import { BehindTray } from "../../../../components/card-studio/trays/BehindTray";
import { StampTray } from "../../../../components/card-studio/trays/StampTray";
import { focusRing } from "../../../../components/kit";
import { cn } from "../../../../lib/cn";
import { hashDataUrl } from "../../../../lib/stampArt";
import { NICHE_GLYPH } from "../../draft";
import { draftPatchOf, studioValueOf } from "../../studioValue";
import { useOnboardingDraft } from "../../useOnboardingDraft";

/**
 * The stamp: one of the sixteen symbols, the trade's first, or a picture of
 * one's own, cropped square in the browser and kept on this device until the
 * card is saved; and the texture behind the stamps. A picture the card says
 * it has but this device doesn't is said here, first, where it is chosen
 * again; when the cause is full storage, the notice over the card says so
 * too. Save and closing the tray come back to this line while it stands.
 *
 * On a card from a look, the studio's own stamp tray (brief §7.4): the
 * trade's stickers first, more stickers with a search, a plain symbol and a
 * picture of one's own, the tint, and in a circle or on its own; and folded
 * at its foot, what stands behind the stamps.
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
  const { draft, resolved, update, setArt, artUrl } = useOnboardingDraft();
  const [notKept, setNotKept] = useState(false);
  const picture = resolved.stamp.kind === "image";
  const lost = picture && !artUrl;

  const takePicture = (dataUrl: string) => {
    const hash = hashDataUrl(dataUrl);
    setNotKept(!setArt({ hash, dataUrl }));
    update({ stamp: { kind: "image", hash } });
    onPick?.();
  };

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
        {draft.look ? (
          <LookStamp picture={picture} onPicture={takePicture} onPick={onPick} />
        ) : (
          <StampPicker
            glyph={resolved.stamp.kind === "glyph" ? resolved.stamp.glyph : "check"}
            onGlyph={(glyph) => {
              setNotKept(false);
              update({ stamp: { kind: "glyph", glyph } });
              onPick?.();
            }}
            niche={resolved.niche}
            picture={{ url: artUrl ?? null, inUse: picture }}
            onPicture={takePicture}
            note={picture ? undefined : t("studio.picture.stays")}
          />
        )}
        {notKept && !lost && !storageFull && (
          <p role="status" className="flex items-start gap-1.5 text-sm font-semibold leading-snug text-ink">
            <TriangleAlert aria-hidden className="mt-px size-4 shrink-0 text-warn" />
            <span>{t("onboarding.stamp.artMemoryOnly")}</span>
          </p>
        )}
      </div>
      {draft.look ? (
        <BehindFold />
      ) : (
        <TexturePicker
          value={resolved.pattern}
          onChange={(pattern) => update({ pattern })}
          background={resolved.background}
          stampColour={resolved.accent}
        />
      )}
    </div>
  );
}

/** The studio's stamp tray over the draft. A picture of one's own can't be
 * drawn by the public drawing, so with one the card shows its circles, and
 * says so. */
function LookStamp({
  picture,
  onPicture,
  onPick,
}: {
  picture: boolean;
  onPicture: (dataUrl: string) => void;
  onPick?: () => void;
}) {
  const { t, i18n } = useTranslation();
  const { resolved, update, artUrl, stickers, templateInput } = useOnboardingDraft();
  const card = studioValueOf(resolved, i18n.resolvedLanguage ?? "en", t, templateInput.name);
  // A picture is the stamp, drawn before any sticker: under one, no sticker
  // reads as chosen, so tapping any of them, the last one included, takes
  // the picture's place. One whose pixels this device lost is chosen again
  // that way too.
  const shown = picture ? withStamp(card, { sticker: "" }) : card;
  return (
    <>
      <StampTray
        value={shown}
        onChange={(next) => {
          update(draftPatchOf(next, shown));
          onPick?.();
        }}
        niche={resolved.niche}
        picture={{ url: artUrl ?? null, inUse: picture }}
        onPicture={(dataUrl) => {
          if (dataUrl) onPicture(dataUrl);
          // A sticker or a symbol in its place: the stamp is the symbol
          // again, which the tray then sets.
          else if (picture) update({ stamp: { kind: "glyph", glyph: shown.design.stamp?.glyph ?? NICHE_GLYPH[resolved.niche] } });
        }}
        note={picture ? undefined : t("studio.picture.stays")}
        mode={studioMode(stickers, shown.design)}
        stickers={stickers.list}
        stickersStatus={stickers.status}
        savedDesign={{}}
      />
      {picture && artUrl && (
        <p className="flex items-start gap-1.5 text-sm leading-snug text-ink-muted">
          <Info aria-hidden className="mt-px size-4 shrink-0" />
          <span>{t("onboarding.look.pictureCircles")}</span>
        </p>
      )}
    </>
  );
}

/** "Ground and pattern", folded at the stamp's foot: the studio's "Behind
 * the stamps", a ground by name and one faint pattern. */
function BehindFold() {
  const { t, i18n } = useTranslation();
  const id = useId();
  const [open, setOpen] = useState(false);
  const { resolved, update, stickers, templateInput } = useOnboardingDraft();
  const shown = studioValueOf(resolved, i18n.resolvedLanguage ?? "en", t, templateInput.name);
  const mode = studioMode(stickers, shown.design);
  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((was) => !was)}
        className={cn(
          "-ms-3 flex min-h-11 w-fit touch-manipulation select-none items-center gap-1.5 rounded-full px-3 type-label text-ink",
          "transition-colors duration-gentle ease-out active:bg-ink/[0.06] hover-fine:bg-ink/5",
          focusRing,
        )}
      >
        {t("onboarding.stamp.behind")}
        <ChevronDown aria-hidden className={cn("size-4 transition-transform duration-gentle", open && "rotate-180")} />
      </button>
      {open && (
        <div id={id}>
          <BehindTray
            value={shown}
            onChange={(next) => update(draftPatchOf(next, shown))}
            stickers={stickers.list}
            stripPicture={false}
            pictureInUse={resolved.stamp.kind === "image"}
            outage={mode === "outage" ? "unread" : mode === "off" ? "off" : undefined}
          />
        </div>
      )}
    </div>
  );
}
