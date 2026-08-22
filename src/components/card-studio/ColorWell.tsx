import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { HexColorPicker } from "react-colorful";
import { useTranslation } from "react-i18next";
import { Check, ChevronDown, Pipette, Sparkles } from "lucide-react";
import { cn } from "../../lib/cn";
import { COLOR_SWATCHES, normalizeHex, randomSwatch, readableInk } from "../../lib/color";

/**
 * The studio's colour control.
 *
 * `components/ui`'s ColorField does the same job and does it well, but it is
 * drawn in fixed navy-on-white and it is still worn by the wizard, the join
 * flow and the admin screens — repainting it would repaint all three. So the
 * studio keeps its own, expressed in tokens: identical behaviour, and it
 * survives the dashboard's night ground.
 *
 * Only valid hex is committed upward, so typing "#12" leaves the saved design
 * alone until the sixth digit lands rather than writing junk to the card.
 */
export function ColorWell({
  label,
  value,
  onChange,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  const { t } = useTranslation();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(() => value.replace(/^#/, ""));
  const [shift, setShift] = useState(0);

  const swatch = normalizeHex(value) ?? "#000000";
  const supportsEyeDropper = typeof window !== "undefined" && !!window.EyeDropper;

  // Follow the value when it changes from *outside* the hex field — a
  // palette, the picker, the shuffle. The equality check keeps the owner's
  // own casing intact while they are still mid-word.
  useEffect(() => {
    setDraft((current) =>
      normalizeHex(current) === normalizeHex(value) ? current : value.replace(/^#/, ""),
    );
  }, [value]);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) close();
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      close();
      triggerRef.current?.focus();
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  // These wells sit in a two-column grid, so the panel is wider than its own
  // cell and one of the columns would otherwise run off-screen. Nudge it back
  // inside the viewport — this works in RTL out of the box because both the
  // measurement and the shift are physical pixels.
  useLayoutEffect(() => {
    if (!open) {
      setShift(0);
      return;
    }
    const panel = panelRef.current;
    const anchor = panel?.parentElement;
    if (!panel || !anchor) return;

    const margin = 12;
    const { left } = anchor.getBoundingClientRect();
    const overflow = left + panel.offsetWidth - (window.innerWidth - margin);
    setShift(overflow > 0 ? -Math.min(overflow, left - margin) : Math.max(0, margin - left));
  }, [open]);

  function commit(hex: string) {
    onChange(hex.toUpperCase());
  }

  async function pickFromScreen() {
    if (!window.EyeDropper) return;
    try {
      const { sRGBHex } = await new window.EyeDropper().open();
      const hex = normalizeHex(sRGBHex);
      if (hex) commit(hex);
    } catch {
      // The owner dismissed the eyedropper with Escape.
    }
  }

  const toolClasses =
    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border text-ink-muted " +
    "transition-colors hover:border-border-strong hover:bg-background hover:text-ink " +
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-text focus-visible:ring-offset-2 focus-visible:ring-offset-surface";

  return (
    <div ref={rootRef} className={cn("relative flex flex-col text-start", className)}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        // Spelled out rather than left to name-from-content: the value is a
        // hex string, and a screen reader announces it far better letter by
        // letter than as one run-on word after the label.
        aria-label={`${label}, ${swatch.slice(1).split("").join(" ")}`}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "group flex min-h-[44px] w-full items-center gap-3 rounded-xl border bg-background px-3 py-2.5 text-start transition-colors",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-text focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
          open ? "border-primary" : "border-border hover:border-border-strong",
        )}
      >
        <span
          aria-hidden="true"
          style={{ backgroundColor: swatch }}
          className="h-9 w-9 shrink-0 rounded-lg ring-1 ring-inset ring-black/10 transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:rotate-0 motion-reduce:group-hover:scale-100"
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-ink">{label}</span>
          <span dir="ltr" className="block font-mono text-xs uppercase tracking-wide text-ink-subtle">
            {swatch}
          </span>
        </span>
        <ChevronDown
          size={16}
          aria-hidden="true"
          className={cn(
            "shrink-0 text-ink-subtle transition-transform duration-200 motion-reduce:transition-none",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div
          className="absolute start-0 top-full z-50 mt-2"
          style={shift ? { transform: `translateX(${shift}px)` } : undefined}
        >
          <div
            ref={panelRef}
            role="dialog"
            aria-label={label}
            className="w-[17.5rem] max-w-[calc(100vw-1.5rem)] animate-pop-in rounded-2xl border border-border bg-surface p-3 shadow-panel-lift motion-reduce:animate-none"
          >
            {/* LTR-pinned: the picker positions its pointers with physical
                `left`, so an RTL ancestor must not flip the drag surface. */}
            <div dir="ltr" className="pm-colorful">
              <HexColorPicker color={swatch} onChange={commit} />
            </div>

            <div className="mt-3 flex items-center gap-2">
              {/* LTR on the row, not just the input: in Hebrew an RTL flex row
                  puts the "#" after the digits. */}
              <div
                dir="ltr"
                className="flex flex-1 items-center gap-1 rounded-xl border border-border bg-background px-2.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary-text/40"
              >
                <span aria-hidden="true" className="font-mono text-sm text-ink-subtle">
                  #
                </span>
                <input
                  dir="ltr"
                  value={draft}
                  aria-label={t("colorPicker.hex")}
                  spellCheck={false}
                  maxLength={7}
                  placeholder="000000"
                  onChange={(e) => {
                    const raw = e.target.value.replace(/^#/, "");
                    setDraft(raw);
                    const hex = normalizeHex(raw);
                    if (hex) onChange(hex);
                  }}
                  onKeyDown={(e) => {
                    // Enter here means "that's my colour" — it dismisses the
                    // panel rather than submitting whatever form we are in.
                    if (e.key !== "Enter") return;
                    e.preventDefault();
                    close();
                    triggerRef.current?.focus();
                  }}
                  className="w-full bg-transparent py-2 font-mono text-sm uppercase text-ink placeholder:text-ink-subtle focus:outline-none"
                />
              </div>

              {supportsEyeDropper && (
                <button
                  type="button"
                  onClick={() => void pickFromScreen()}
                  title={t("colorPicker.eyedropper")}
                  aria-label={t("colorPicker.eyedropper")}
                  className={toolClasses}
                >
                  <Pipette size={16} />
                </button>
              )}
              <button
                type="button"
                onClick={() => commit(randomSwatch())}
                title={t("colorPicker.random")}
                aria-label={t("colorPicker.random")}
                className={cn(toolClasses, "hover:text-primary-text")}
              >
                <Sparkles size={16} />
              </button>
            </div>

            <p className="mb-1.5 mt-3 text-[11px] font-medium uppercase tracking-wider text-ink-subtle">
              {t("colorPicker.presets")}
            </p>
            <div className="grid grid-cols-9 gap-1">
              {COLOR_SWATCHES.map((hex) => {
                const selected = swatch === hex;
                return (
                  <button
                    key={hex}
                    type="button"
                    title={hex}
                    aria-label={hex}
                    aria-pressed={selected}
                    onClick={() => commit(hex)}
                    style={{ backgroundColor: hex }}
                    className={cn(
                      "relative aspect-square w-full rounded-full ring-inset transition-transform duration-150",
                      "hover:z-10 hover:scale-125 focus:outline-none focus-visible:z-10 focus-visible:scale-125",
                      "motion-reduce:transition-none motion-reduce:hover:scale-100",
                      selected ? "ring-2 ring-ink" : "ring-1 ring-ink/20",
                    )}
                  >
                    {selected && (
                      <Check
                        size={12}
                        strokeWidth={3.5}
                        style={{ color: readableInk(hex) }}
                        className="absolute inset-0 m-auto"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
