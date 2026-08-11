import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { HexColorPicker } from "react-colorful";
import { useTranslation } from "react-i18next";
import { Check, ChevronDown, Pipette, Sparkles } from "lucide-react";
import { cn } from "../../lib/cn";
import { COLOR_SWATCHES, HEX_RE, normalizeHex, randomSwatch, readableInk } from "../../lib/color";

declare global {
  interface Window {
    /** Chromium-only, hence the optional — the button is hidden elsewhere. */
    EyeDropper?: new () => { open: () => Promise<{ sRGBHex: string }> };
  }
}

interface ColorFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const RECENTS_KEY = "punchme.recentColors";
const RECENTS_MAX = 8;

function readRecents(): string[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(RECENTS_KEY) ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((c): c is string => typeof c === "string" && HEX_RE.test(c)).slice(0, RECENTS_MAX);
  } catch {
    return [];
  }
}

function pushRecent(hex: string): string[] {
  const next = [hex, ...readRecents().filter((c) => c !== hex)].slice(0, RECENTS_MAX);
  try {
    localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
  } catch {
    // Private browsing / storage disabled — recents are a nicety, not state.
  }
  return next;
}

const TOOL_CLASS =
  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-navy/15 text-slate " +
  "transition-colors hover:border-navy/40 hover:bg-navy/5 hover:text-navy " +
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-navy/30";

/** A swatch button that opens a colour panel: saturation/hue area, a hex
 * field with an eyedropper and a surprise-me shuffle, the preset swatch
 * board, and whatever colours were picked recently.
 *
 * Only valid hex is committed upward — typing "#12" leaves the saved design
 * alone until the sixth digit lands, rather than writing junk to the card. */
export function ColorField({ label, value, onChange, className }: ColorFieldProps) {
  const { t } = useTranslation();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(() => value.replace(/^#/, ""));
  const [recents, setRecents] = useState<string[]>([]);
  const [shift, setShift] = useState(0);

  const swatch = normalizeHex(value) ?? "#000000";
  const supportsEyeDropper = typeof window !== "undefined" && !!window.EyeDropper;

  // Follow the value when it changes from *outside* the hex field (a preset,
  // the picker, a palette). The equality check keeps the user's own casing
  // and shorthand intact while they're mid-word.
  useEffect(() => {
    setDraft((current) =>
      normalizeHex(current) === normalizeHex(value) ? current : value.replace(/^#/, ""),
    );
  }, [value]);

  const close = useCallback(() => {
    setOpen(false);
    const hex = normalizeHex(value);
    if (hex) setRecents(pushRecent(hex));
  }, [value]);

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

  // These fields sit in a two-column grid, so the panel is wider than its
  // own cell and the right-hand column would otherwise run off-screen. Nudge
  // it back inside the viewport — works out of the box in RTL because both
  // the measurement and the shift are physical pixels.
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
      // The user dismissed the eyedropper with Escape.
    }
  }

  function swatchButton(hex: string, key?: string) {
    const selected = swatch === hex;
    return (
      <button
        key={key ?? hex}
        type="button"
        title={hex}
        aria-label={hex}
        aria-pressed={selected}
        onClick={() => commit(hex)}
        style={{ backgroundColor: hex }}
        className={cn(
          "relative aspect-square w-full rounded-full ring-inset transition-transform duration-150",
          "hover:z-10 hover:scale-125 focus:outline-none focus-visible:z-10 focus-visible:scale-125",
          selected ? "ring-2 ring-navy" : "ring-1 ring-navy/15",
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
  }

  return (
    <div ref={rootRef} className={cn("relative flex flex-col text-start", className)}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        // Spelled out rather than left to name-from-content: the value is a
        // hex string, and screen readers announce it far better letter by
        // letter than as one run-on word after the label.
        aria-label={`${label}, ${swatch.slice(1).split("").join(" ")}`}
        onClick={() => {
          if (open) {
            close();
          } else {
            setRecents(readRecents());
            setOpen(true);
          }
        }}
        className={cn(
          "group flex w-full items-center gap-3 rounded-2xl border bg-white px-3 py-2.5 text-start transition",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-navy/30",
          open
            ? "border-navy/40 shadow-lift"
            : "border-navy/15 hover:border-navy/30 hover:shadow-card",
        )}
      >
        <span
          aria-hidden
          style={{ backgroundColor: swatch, boxShadow: `0 4px 12px ${swatch}59` }}
          className="h-9 w-9 shrink-0 rounded-xl ring-1 ring-inset ring-navy/15 transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110"
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-navy font-body">{label}</span>
          <span dir="ltr" className="block font-mono text-xs uppercase tracking-wide text-slate">
            {swatch}
          </span>
        </span>
        <ChevronDown
          size={16}
          aria-hidden
          className={cn("shrink-0 text-slate transition-transform duration-200", open && "rotate-180")}
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
            className="w-[17.5rem] max-w-[calc(100vw-1.5rem)] rounded-2xl border border-navy/10 bg-white p-3 shadow-lift animate-pop-in"
          >
            {/* LTR-pinned: the picker positions its pointers with physical
                `left`, so an RTL ancestor must not flip the drag surface. */}
            <div dir="ltr" className="pm-colorful">
              <HexColorPicker color={swatch} onChange={commit} />
            </div>

            <div className="mt-3 flex items-center gap-2">
              {/* LTR on the row, not just the input: in Hebrew an RTL flex
                  row puts the "#" after the digits. */}
              <div
                dir="ltr"
                className="flex flex-1 items-center gap-1 rounded-xl border border-navy/15 bg-white px-2.5 focus-within:border-navy/40 focus-within:ring-2 focus-within:ring-navy/20"
              >
                <span aria-hidden className="font-mono text-sm text-slate/60">
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
                    // The onboarding step wraps the studio in a <form>, where
                    // Enter in a text input submits it. Here Enter means
                    // "that's my colour", so it dismisses the panel instead.
                    if (e.key !== "Enter") return;
                    e.preventDefault();
                    close();
                    triggerRef.current?.focus();
                  }}
                  className="w-full bg-transparent py-2 font-mono text-sm uppercase text-navy placeholder:text-slate/40 focus:outline-none"
                />
              </div>

              {supportsEyeDropper && (
                <button
                  type="button"
                  onClick={() => void pickFromScreen()}
                  title={t("colorPicker.eyedropper")}
                  aria-label={t("colorPicker.eyedropper")}
                  className={TOOL_CLASS}
                >
                  <Pipette size={16} />
                </button>
              )}
              <button
                type="button"
                onClick={() => commit(randomSwatch())}
                title={t("colorPicker.random")}
                aria-label={t("colorPicker.random")}
                className={cn(TOOL_CLASS, "hover:text-gold-dark")}
              >
                <Sparkles size={16} />
              </button>
            </div>

            <p className="mb-1.5 mt-3 text-[11px] font-medium uppercase tracking-wider text-slate/70 font-body">
              {t("colorPicker.presets")}
            </p>
            <div className="grid grid-cols-9 gap-1">
              {COLOR_SWATCHES.map((hex) => swatchButton(hex))}
            </div>

            {recents.length > 0 && (
              <>
                <p className="mb-1.5 mt-3 text-[11px] font-medium uppercase tracking-wider text-slate/70 font-body">
                  {t("colorPicker.recent")}
                </p>
                <div className="grid grid-cols-9 gap-1">
                  {recents.map((hex) => swatchButton(hex, `recent-${hex}`))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
