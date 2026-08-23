import { cn } from "../../lib/cn";

/**
 * A customer, at the size of a letter.
 *
 * A circle, deliberately. `CardChip` is the rounded rectangle that carries the
 * *owner's* card in the masthead, painted in the pair they chose — those
 * colours mean "this is yours", and spending them on a customer would say
 * something untrue. A person is not a card, so this is a different shape in no
 * colour at all: on a roster row the only hue is the one that means somebody
 * is owed a reward.
 */
export function Monogram({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  // Intl-aware, like `CardChip`: a Hebrew name gives a Hebrew letter, and
  // `Array.from` keeps an emoji or a surrogate pair whole where `[0]` would
  // halve it. A card enrolled with a phone and no name has nothing to set.
  const initial = Array.from(name.trim())[0] ?? "•";
  return (
    <span
      // The name it is drawn from sits next to it in the same row, so to a
      // screen reader this is a second reading of a letter it already has.
      aria-hidden="true"
      className={cn(
        "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink/[0.07] font-heading text-sm font-bold uppercase leading-none text-ink-muted",
        className,
      )}
    >
      {initial}
    </span>
  );
}
