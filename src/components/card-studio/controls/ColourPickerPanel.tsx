import { useEffect, useRef, useState } from "react";
import { HexColorPicker } from "react-colorful";
import { useTranslation } from "react-i18next";
import { Pipette } from "lucide-react";
import { cn } from "../../../lib/cn";
import { normalizeHex } from "../../../lib/color";
import { Button } from "../../kit/Button";
import { fieldBox } from "../../kit/classes";

type EyeDropperCtor = new () => { open: () => Promise<{ sRGBHex: string }> };

function eyeDropper(): EyeDropperCtor | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as unknown as { EyeDropper?: EyeDropperCtor }).EyeDropper;
}

/**
 * A colour of one's own: the saturation pane and hue rail, a hex field, and
 * the eyedropper where the browser has one. Inline, never a popover, so on a
 * phone it sits inside the tray rather than running under the phone bar.
 *
 * Only a valid hex is ever passed up, so "#12" mid-word leaves the card as
 * it was until the sixth digit lands. The hex is a colour, not a card code:
 * it is set in the page's own face, left to right and isolated, and the
 * picker's two sliders are named in the page's language.
 */
export function ColourPickerPanel({
  label,
  value,
  onChange,
  className,
}: {
  /** What colour this is, for the picker's name. */
  label: string;
  value: string;
  onChange: (hex: string) => void;
  className?: string;
}) {
  const { t } = useTranslation();
  const picker = useRef<HTMLDivElement>(null);
  const colour = normalizeHex(value) ?? "#000000";
  const [typed, setTyped] = useState(() => colour.slice(1));
  const Dropper = eyeDropper();

  // Follow the value when it moves from outside the field (the pane, a
  // swatch), keeping the owner's own casing while they are still typing.
  useEffect(() => {
    setTyped((current) => (normalizeHex(current) === colour ? current : colour.slice(1)));
  }, [colour]);

  // react-colorful names its sliders "Color" and "Hue" in English. The
  // attributes are set once on mount and React leaves them be, since the
  // library passes the same strings on every render.
  useEffect(() => {
    const [shade, hue] = picker.current?.querySelectorAll<HTMLElement>(".react-colorful__interactive") ?? [];
    shade?.setAttribute("aria-label", t("cardControls.picker.shade", { label }));
    hue?.setAttribute("aria-label", t("cardControls.picker.hue", { label }));
  }, [label, t]);

  async function pickFromScreen() {
    if (!Dropper) return;
    try {
      const { sRGBHex } = await new Dropper().open();
      const hex = normalizeHex(sRGBHex);
      if (hex) onChange(hex);
    } catch {
      // Dismissed with Escape: nothing to do.
    }
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* Left to right: the pane places its pointers with a physical
          `left`, so a Hebrew page must not mirror the surface under them. */}
      <div
        ref={picker}
        dir="ltr"
        className={cn(
          "[&_.react-colorful]:h-40 [&_.react-colorful]:w-full [&_.react-colorful]:gap-3",
          "[&_.react-colorful__saturation]:rounded-field [&_.react-colorful__saturation]:border-0 [&_.react-colorful__saturation]:shadow-[inset_0_0_0_1px_rgb(var(--c-field))]",
          "[&_.react-colorful__hue]:h-4 [&_.react-colorful__hue]:rounded-full [&_.react-colorful__hue]:shadow-[inset_0_0_0_1px_rgb(var(--c-field))]",
          "[&_.react-colorful__pointer]:size-6 [&_.react-colorful__pointer]:border-[3px]",
          "[&_.react-colorful__interactive:focus-visible_.react-colorful__pointer]:outline [&_.react-colorful__interactive:focus-visible_.react-colorful__pointer]:outline-2 [&_.react-colorful__interactive:focus-visible_.react-colorful__pointer]:outline-offset-2 [&_.react-colorful__interactive:focus-visible_.react-colorful__pointer]:outline-ink",
        )}
      >
        <HexColorPicker color={colour} onChange={(hex) => onChange(hex.toUpperCase())} />
      </div>

      <div className="flex items-center gap-2">
        {/* The row is left to right too, or Hebrew puts the "#" after the digits. */}
        <div dir="ltr" className="relative min-w-0 flex-1">
          <span aria-hidden className="pointer-events-none absolute inset-y-0 start-4 flex items-center text-ink-muted">
            #
          </span>
          <input
            dir="ltr"
            value={typed}
            aria-label={t("cardControls.picker.hex", { label })}
            // A code, not a word: no autocorrect turning "cafe" into
            // "café", and capitals on the keyboard as in the field.
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="characters"
            autoComplete="off"
            maxLength={7}
            placeholder="000000"
            onChange={(event) => {
              const raw = event.target.value.replace(/^#/, "");
              setTyped(raw);
              const hex = normalizeHex(raw);
              if (hex) onChange(hex);
            }}
            className={cn(fieldBox, "min-h-12 ps-8 uppercase")}
          />
        </div>
        {Dropper && (
          <Button
            variant="secondary"
            size="icon"
            icon={<Pipette aria-hidden />}
            aria-label={t("colorPicker.eyedropper")}
            onClick={() => void pickFromScreen()}
          />
        )}
      </div>
    </div>
  );
}
