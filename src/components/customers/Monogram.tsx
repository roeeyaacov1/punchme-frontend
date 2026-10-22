import { UserRound } from "lucide-react";
import { cn } from "../../lib/cn";

/**
 * A customer, at the size of a letter: a 40px circle in no colour at all,
 * because on a roster row the only colour is the one that means somebody is
 * owed a reward. Intl-aware, so a Hebrew name gives a Hebrew letter and an
 * emoji stays whole. A customer who joined without a name gets a person
 * rather than a stray dot.
 */
export function Monogram({ name, className }: { name: string; className?: string }) {
  const initial = firstLetter(name.trim());
  return (
    <span
      // The name it is drawn from is beside it in the same row, so to a
      // screen reader this would be the same letter read twice.
      aria-hidden
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-full bg-background font-heading text-base font-medium uppercase leading-none text-ink-muted [&_svg]:size-5",
        className,
      )}
    >
      {initial ?? <UserRound />}
    </span>
  );
}

type Segmenter = new (
  locale?: string,
  options?: { granularity: "grapheme" },
) => { segment: (text: string) => Iterable<{ segment: string }> };

/** The first letter as a reader sees it: a flag, a family or a letter with
 * its marks is one grapheme of several code points, and cut at the first
 * code point it turns into a boxed "I" or half a family. Intl.Segmenter
 * knows where a grapheme ends; ES2020's types don't know Intl.Segmenter. */
function firstLetter(text: string): string | undefined {
  if (!text) return undefined;
  const Graphemes = (Intl as unknown as { Segmenter?: Segmenter }).Segmenter;
  if (Graphemes) {
    for (const { segment } of new Graphemes(undefined, { granularity: "grapheme" }).segment(text)) return segment;
  }
  return Array.from(text)[0];
}
