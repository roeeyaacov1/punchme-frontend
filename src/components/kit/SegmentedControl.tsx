import { useId, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";
import { cn } from "../../lib/cn";
import { noTapFlash } from "./classes";
import { useReducedMotion } from "./motion";

export interface SegmentedOption<T extends string> {
  value: T;
  label: ReactNode;
}

export interface SegmentedControlProps<T extends string> {
  /** What is being chosen. Always said to a screen reader; shown unless `hideLabel`. */
  label: string;
  hideLabel?: boolean;
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (next: T) => void;
  className?: string;
}

/**
 * How the segments stand: side by side, each with its 1rem sides or, for a
 * label on one line, closer to its pill's edges (`inset`, in px); or one
 * under another, where a word too wide for the track beside its sides
 * brings them closer the same way.
 */
interface Fit {
  stacked: boolean;
  inset: number | null;
}

const ROW: Fit = { stacked: false, inset: null };
const STACKED: Fit = { stacked: true, inset: null };

/** A label's longest word, its width on one line, and its words' height. */
function widths(label: HTMLElement): [word: number, line: number, tall: number] {
  const range = document.createRange();
  let word = 0;
  let tall = 0;
  const walker = document.createTreeWalker(label, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    // A break only at a space: a no-break space or a word joiner holds.
    for (const match of (node.nodeValue ?? "").matchAll(/[^ \t\n\r\f]+/g)) {
      range.setStart(node, match.index);
      range.setEnd(node, match.index + match[0].length);
      const rect = range.getBoundingClientRect();
      word = Math.max(word, rect.width);
      tall = Math.max(tall, rect.height);
    }
  }
  const was = label.style.whiteSpace;
  label.style.whiteSpace = "nowrap";
  range.selectNodeContents(label);
  const line = range.getBoundingClientRect().width;
  label.style.whiteSpace = was;
  return [word, line, tall];
}

/**
 * How far in from its pill's end a line of words `tall` high must start so
 * the curve doesn't cut its corners: the line sits halfway down a segment
 * one line tall, and the segment's corners are as drawn.
 */
function curveOf(label: HTMLElement, tall: number): number {
  const box = label.getBoundingClientRect();
  const r = Math.min(parseFloat(getComputedStyle(label).borderTopLeftRadius) || 0, box.height / 2, box.width / 2);
  const half = Math.min(tall / 2, r);
  return r - Math.sqrt(r * r - half * half);
}

/**
 * Whether the segments, each as wide as its share of the room, hold their
 * words. The room is what the control's parent gives it, which doesn't
 * change when the segments stack.
 */
function fitOf(track: HTMLElement, count: number): Fit {
  const parent = track.parentElement?.parentElement;
  if (!parent || count === 0) return ROW;
  const ps = getComputedStyle(parent);
  const room = parent.clientWidth - parseFloat(ps.paddingLeft) - parseFloat(ps.paddingRight);
  const ts = getComputedStyle(track);
  const edges =
    parseFloat(ts.paddingLeft) + parseFloat(ts.paddingRight) + parseFloat(ts.borderLeftWidth) + parseFloat(ts.borderRightWidth);
  const inner = room - edges;
  const share = inner / count;
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  // The labels' `px-4`, both sides.
  const sides = 2 * rem;
  let word = 0;
  let line = 0;
  let curve = 0;
  for (const label of track.querySelectorAll<HTMLElement>(":scope > label")) {
    const [w, l, tall] = widths(label);
    word = Math.max(word, w);
    line = Math.max(line, l);
    curve = Math.max(curve, curveOf(label, tall));
  }
  if (word <= share - sides + 0.5) return ROW;
  if (line <= share - 2) {
    // At the default text size a word that only runs into its padding keeps
    // doing so, as "Other" among five always has on a 320px phone: nothing
    // moves at 100%. With large text the label's sides close in instead,
    // rounded up to layout's 1/64px so the labels are never narrower than
    // their share and the track keeps the room's width; but never so far
    // that the pill's curve cuts the words, as "English" beside "עברית"
    // would on a 320px phone at 200%. Those stand one under another.
    if (rem <= 16) return ROW;
    if (line <= share - 2 * Math.max(1, curve)) {
      return { stacked: false, inset: Math.ceil(((share - line) / 2) * 64) / 64 };
    }
  }
  // Stacked, each segment has the track's whole width. A word too wide for
  // it beside the sides brings them in, rounded down so it never runs into
  // them.
  if (word <= inner - sides) return STACKED;
  return { stacked: true, inset: Math.max(0, Math.floor(((inner - word) / 2) * 64) / 64) };
}

/**
 * The fit, read again as the room or the text size changes (a new text size
 * fires no event of its own, but the track changes size with it) and after
 * every render, which a new language is. It sets state only when the fit
 * differs from the one drawn: measured after every commit, an unconditional
 * update kept a language switch re-rendering until React gave up.
 */
function useFit(track: RefObject<HTMLDivElement>, count: number): Fit {
  const [fit, setFit] = useState<Fit>(ROW);
  const drawn = useRef(fit);
  useLayoutEffect(() => {
    drawn.current = fit;
    const el = track.current;
    const parent = el?.parentElement?.parentElement;
    if (!el || !parent) return;
    const update = () => {
      const next = fitOf(el, count);
      if (next.stacked === drawn.current.stacked && next.inset === drawn.current.inset) return;
      drawn.current = next;
      setFit(next);
    };
    update();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(update);
    observer.observe(parent);
    observer.observe(el);
    return () => observer.disconnect();
  });
  return fit;
}

/**
 * One of a few, side by side. Native radios in a fieldset, so the arrow keys
 * move the choice and a screen reader says "2 of 3", where buttons with
 * `aria-pressed` would make every option its own tab stop.
 *
 * The chosen option is an ink pill with a cream label (14.88:1). Every
 * segment is as wide as the widest, so the pill can slide by its own width:
 * on the in-out, mirrored in Hebrew. With reduced motion there is no pill to
 * slide; the chosen segment's own colour crosses over instead.
 *
 * Each segment is a control: one not yet chosen presses with the kit's 6%
 * ink well, at the press's own pace while its label's colour keeps the
 * pill's, and none waits for a double tap or selects its words on a long
 * press.
 *
 * A value that matches no option chooses nothing, and no pill is drawn
 * over a segment whose radio isn't checked.
 *
 * A segment keeps its sides while its longest word fits inside them; with
 * large text a label on one line may come closer to its pill's edges, as
 * Hebrew's "Other" does among five at 200% on a laptop, but never into its
 * curve. Where neither holds, with large text on a phone, the segments stand
 * one under another at the room's width, and the chosen one's colour crosses
 * over, as with reduced motion. Stacked, a word too wide to keep its sides
 * brings them in the same way, as English's "Automatic" does in the account
 * sheet at 200% on a 320px phone.
 *
 * A segment's corners are half its 44px, which holds two lines, in rem so
 * they grow with the text: one line or two is a full pill at any text size,
 * and a label that wraps further keeps those ends with straight sides
 * between them, where a full pill would turn into an oval whose curve cuts
 * its first and last lines.
 */
export function SegmentedControl<T extends string>({
  label,
  hideLabel,
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  const reduced = useReducedMotion();
  const name = useId();
  const track = useRef<HTMLDivElement>(null);
  const fit = useFit(track, options.length);
  const slide = !reduced && !fit.stacked;
  const index = options.findIndex((option) => option.value === value);
  const pill: CSSProperties = {
    width: `calc((100% - 0.5rem) / ${options.length})`,
    transform: `translateX(calc(var(--kit-dir) * ${index} * 100%))`,
  };
  return (
    <fieldset className={cn("min-w-0", className)}>
      <legend className={hideLabel ? "sr-only" : "type-label mb-2 text-ink"}>{label}</legend>
      <div
        ref={track}
        className={cn(
          "relative border border-border bg-background p-1",
          // Stacked, one column as wide as the track and never wider, as a
          // row's are: an implicit `auto` one would grow to fit a long word
          // and its sides, and the chosen pill with it. Side by side, the
          // track's corners are its segments' with its padding and border
          // round them: a full pill while they are.
          fit.stacked
            ? "grid grid-cols-1 auto-rows-fr rounded-[1.625rem]"
            : "inline-grid grid-flow-col auto-cols-fr rounded-[calc(1.625rem+1px)]",
        )}
      >
        {slide && index >= 0 && (
          <span
            aria-hidden
            className="absolute inset-y-1 start-1 rounded-[1.375rem] bg-ink transition-transform duration-move ease-in-out-strong"
            style={pill}
          />
        )}
        {options.map((option) => {
          const chosen = option.value === value;
          return (
            <label
              key={option.value}
              style={fit.inset === null ? undefined : { paddingInline: fit.inset }}
              className={cn(
                "relative flex min-h-11 cursor-pointer touch-manipulation select-none items-center justify-center rounded-[1.375rem] px-4 text-center font-heading text-base font-medium leading-tight has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink",
                noTapFlash,
                chosen ? "text-surface" : "text-ink-muted active:bg-ink/[0.06] hover-fine:text-ink",
                slide
                  ? "[transition:color_var(--duration-move)_var(--ease-in-out-strong),background-color_var(--duration-press)_var(--ease-out-strong)]"
                  : cn("transition-colors duration-gentle ease-out", chosen && "bg-ink"),
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={chosen}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              {option.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
