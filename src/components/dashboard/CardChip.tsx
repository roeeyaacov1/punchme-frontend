import { cn } from "../../lib/cn";

/**
 * The owner's own card, at the size of a thumbnail.
 *
 * The wizard's whole argument is that the abstract purchase becomes a
 * concrete object with your name on it, and then the old dashboard dropped
 * the object entirely and showed a generic white app. So the shell keeps a
 * piece of it: the masthead carries the card's real colours, in the real
 * pairing the owner chose, with their initial set in it exactly as the pass
 * sets their name.
 *
 * The pair is theirs, not ours, so it is used only here and only for one
 * letter — never as a ground under running text. The hairline ring is what
 * keeps a white card visible on a white page and a near-black one visible at
 * night.
 */
export function CardChip({
  name,
  backgroundColor,
  foregroundColor,
  size = 36,
  className,
}: {
  name: string;
  backgroundColor?: string | null;
  foregroundColor?: string | null;
  size?: number;
  className?: string;
}) {
  // Intl-aware: a Hebrew name gives a Hebrew letter, and `Array.from` keeps
  // an emoji or a surrogate pair whole where `[0]` would halve it.
  const initial = Array.from(name.trim())[0] ?? "•";
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-[0.5rem] font-heading font-bold leading-none ring-1 ring-inset ring-black/10",
        className,
      )}
      style={{
        width: size,
        height: Math.round(size * 0.68), // a card is wider than it is tall
        backgroundColor: backgroundColor ?? "#0f0f23",
        color: foregroundColor ?? "#ffffff",
        fontSize: Math.round(size * 0.42),
      }}
    >
      {initial}
    </span>
  );
}
