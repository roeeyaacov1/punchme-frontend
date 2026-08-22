import {
  useId,
  type InputHTMLAttributes,
  type LabelHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
} from "react";
import { ImagePlus, type LucideIcon } from "lucide-react";
import { focusRing } from "../marketing/primitives";
import { cn } from "../../lib/cn";

/**
 * The Card Studio's own primitives.
 *
 * Local to this directory for the same reason the marketing and the
 * dashboard ones are: `components/ui`'s Input, Slider and ColorField are
 * hard-coded navy-on-white, and they are still worn by the admin screens,
 * the public join flow and the wizard — none of which this phase may
 * repaint. Everything here is expressed in tokens instead, so one studio
 * reads as paper inside the catalog editor and as a panel on the dashboard's
 * night ground, and the lit stage around the pass gets the light values back
 * for free.
 */

/** A group of controls that answer one question. */
export function StudioPanel({
  title,
  hint,
  children,
  className,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-border bg-surface p-4 shadow-panel sm:p-5",
        className,
      )}
    >
      {/* h2, not h3: the page's h1 is the studio's own title, and the panels
          are its sections. Skipping a level reads as a broken outline. */}
      <h2 className="t-card-title text-ink">{title}</h2>
      {hint && <p className="mt-1 text-sm text-ink-muted">{hint}</p>}
      <div className="mt-4 flex flex-col gap-5">{children}</div>
    </section>
  );
}

/** The label above a control the browser does not label for us — a picker,
 * a grid, a row of buttons. */
export function StudioLabel({
  children,
  className,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={cn("text-sm font-medium text-ink", className)} {...props}>
      {children}
    </label>
  );
}

/** The same words above a group of controls rather than one. A `<span>`,
 * not a `<label>`: a label that points at nothing is a label a screen reader
 * reads out and then strands. The group's own control carries the naming —
 * `ChoiceGrid` has a legend, the colour wells each have their own. */
export function StudioGroupLabel({ children }: { children: ReactNode }) {
  return <span className="text-sm font-medium text-ink">{children}</span>;
}

const controlClasses =
  "w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-ink transition-colors " +
  "placeholder:text-ink-subtle hover:border-border-strong " +
  "focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-text focus:ring-offset-2 focus:ring-offset-surface";

/** A labelled text field. `dir="auto"` throughout: a business name and a
 * reward are the owner's own words, and a Hebrew shop with an English name
 * should keep its own punctuation order. */
export function StudioText({
  label,
  hint,
  className,
  id,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return (
    <div className="flex flex-col gap-1.5">
      <StudioLabel htmlFor={inputId}>{label}</StudioLabel>
      <input id={inputId} dir="auto" className={cn(controlClasses, className)} {...props} />
      {hint && <p className="text-xs text-ink-subtle">{hint}</p>}
    </div>
  );
}

/** A labelled select. `color-scheme` on the root is what makes the native
 * popup follow the theme, so there is nothing to draw here but the well. */
export function StudioSelect({
  label,
  className,
  id,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label: string }) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
      <StudioLabel htmlFor={selectId}>{label}</StudioLabel>
      <select id={selectId} className={cn(controlClasses, className)} {...props}>
        {children}
      </select>
    </div>
  );
}

/**
 * A file picker that looks like a control instead of body copy.
 *
 * The input stays a real `<input type="file">` inside the label, so the whole
 * thing is one native target and the browser keeps its own keyboard path —
 * the old version was already built this way and only looked like a link.
 */
export function UploadButton({
  label,
  busy,
  onFile,
  preview,
  className,
}: {
  label: string;
  busy?: boolean;
  onFile: (file: File) => void;
  /** An existing image to show alongside, when there is one. */
  preview?: string;
  className?: string;
}) {
  return (
    <label
      className={cn(
        "group inline-flex min-h-[44px] w-fit max-w-full cursor-pointer items-center gap-2.5 rounded-xl",
        "border border-border-strong bg-background px-3 py-2 text-sm font-semibold text-ink",
        "transition-colors hover:border-primary hover:bg-surface",
        "focus-within:outline-none focus-within:ring-2 focus-within:ring-primary-text focus-within:ring-offset-2 focus-within:ring-offset-surface",
        busy && "pointer-events-none opacity-60",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface ring-1 ring-border"
      >
        {preview ? (
          <img src={preview} alt="" className="h-full w-full object-contain" />
        ) : (
          <ImagePlus
            size={16}
            className="text-ink-subtle transition-colors group-hover:text-primary-text"
          />
        )}
      </span>
      <span className="min-w-0 flex-1 text-start">{label}</span>
      <input
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          e.target.value = "";
        }}
      />
    </label>
  );
}

/**
 * The studio's one number control: the wizard's slider, unchanged.
 *
 * `.range-accent` is already token-built and already flips its fill in RTL,
 * and an owner who set the stamp count during onboarding should meet the
 * same control when they come back to change it.
 */
export function StudioSlider({
  label,
  value,
  min,
  max,
  onChange,
  valueText,
  spoken,
  id,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  /** What the number means, for `aria-valuetext`. */
  valueText: string;
  /** The same string, debounced — dragging must not read out every tick. */
  spoken?: string;
  id?: string;
}) {
  const generatedId = useId();
  const sliderId = id ?? generatedId;
  const progress = max > min ? ((value - min) / (max - min)) * 100 : 0;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between gap-3">
        <StudioLabel htmlFor={sliderId}>{label}</StudioLabel>
        <span className="t-figure text-lg text-ink" aria-hidden="true">
          {value}
        </span>
      </div>
      <input
        id={sliderId}
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-valuetext={valueText}
        className="range-accent"
        style={{ "--range-progress": `${progress}%` } as React.CSSProperties}
      />
      <p className="sr-only" aria-live="polite">
        {spoken ?? valueText}
      </p>
    </div>
  );
}

/**
 * The strip, as something you can hit.
 *
 * The slider it sits under is the real control — that one carries the label,
 * the keyboard, `aria-valuetext` and the RTL arrow behaviour the browser
 * gives for free. This row is a pointer shortcut to the same number and
 * nothing more: `aria-hidden`, every dot out of the tab order, and no focus
 * taken on click, so a screen reader hears one slider rather than twelve
 * buttons all claiming the same value.
 *
 * It is also the only part of the studio that moves. A dot lands with
 * `stamp-in` as it fills — the product's one gesture, on the product's one
 * subject — and holds still once it has.
 */
export function PunchStrip({
  count,
  filled,
  onPick,
  glyph: Glyph,
  stampArtUrl,
  stampColor,
  cardColor,
  offset = 1,
  className,
}: {
  /** How many dots to draw. */
  count: number;
  /** How many of them are punched. */
  filled: number;
  onPick: (value: number) => void;
  glyph: LucideIcon;
  stampArtUrl?: string;
  stampColor: string;
  cardColor: string;
  /** What the first dot stands for — 1 for a punch count, the minimum for a
   * card length, where the shorter cards are not on offer at all. */
  offset?: number;
  className?: string;
}) {
  return (
    // One row, always. The dots share the width and shrink as the card gets
    // longer rather than wrapping — a strip that breaks across two lines
    // stops looking like the strip on the card, which is the whole point of
    // drawing it. `max-w` keeps a short card from producing saucers.
    <div aria-hidden="true" className={cn("flex gap-1", className)}>
      {Array.from({ length: count }, (_, index) => {
        const value = index + offset;
        const on = index < filled;
        return (
          <button
            // The key carries the animation. A dot that flips remounts, so
            // `stamp-in` runs from the top; a dot whose state did not change
            // keeps its identity and holds still, however many times the
            // panel re-renders around it. Deriving this during render instead
            // — a ref holding the previous count — read correct and was not:
            // React renders twice in development, and the second pass saw its
            // own write and cleared the class before it ever painted.
            key={`${index}-${on}`}
            type="button"
            tabIndex={-1}
            // Clicking a dot must not move focus off the slider that owns the
            // value — the ring would land on something a keyboard user can
            // never reach.
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onPick(value)}
            className={cn(
              "flex aspect-square min-w-0 flex-1 items-center justify-center overflow-hidden rounded-full",
              "max-w-[2.25rem] ring-1 ring-inset ring-ink/20",
              "transition-transform duration-150 hover:scale-110 active:scale-95",
              "motion-reduce:transition-none motion-reduce:hover:scale-100",
              on && "animate-stamp-in motion-reduce:animate-none",
            )}
            style={{
              backgroundColor: on ? cardColor : "transparent",
              color: stampColor,
            }}
          >
            {/* Sized in CSS rather than by Lucide's width/height attributes,
                so the glyph shrinks with the dot it sits in. */}
            {on ? (
              stampArtUrl ? (
                <img src={stampArtUrl} alt="" className="h-2/3 w-2/3 object-contain" />
              ) : (
                <Glyph className="h-1/2 w-1/2" strokeWidth={2.4} />
              )
            ) : (
              <span className="h-1.5 w-1.5 rounded-full bg-ink/25" />
            )}
          </button>
        );
      })}
    </div>
  );
}

/** A disclosure for the wallet plumbing: a real button with a real
 * `aria-expanded`, not an underlined word. */
export function StudioDisclosure({
  open,
  onToggle,
  label,
  hint,
  children,
  icon,
}: {
  open: boolean;
  onToggle: () => void;
  label: string;
  hint?: string;
  children: ReactNode;
  icon: ReactNode;
}) {
  const id = useId();
  return (
    <div className="rounded-2xl border border-border bg-surface shadow-panel">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={id}
        className={cn(
          "flex min-h-[44px] w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-start sm:px-5",
          focusRing,
        )}
      >
        <span className="min-w-0 flex-1">
          <span className="t-card-title block text-ink">{label}</span>
          {hint && <span className="mt-0.5 block text-sm text-ink-muted">{hint}</span>}
        </span>
        <span
          aria-hidden="true"
          className={cn(
            "shrink-0 text-ink-subtle transition-transform duration-200 motion-reduce:transition-none",
            open && "rotate-180",
          )}
        >
          {icon}
        </span>
      </button>
      {open && (
        <div id={id} className="flex flex-col gap-5 border-t border-border px-4 py-5 sm:px-5">
          {children}
        </div>
      )}
    </div>
  );
}
