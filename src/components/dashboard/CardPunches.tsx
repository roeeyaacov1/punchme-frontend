import { PunchMark } from "../marketing/PunchMark";
import { Figure } from "./primitives";
import { cn } from "../../lib/cn";

/**
 * One customer's card, drawn.
 *
 * Not the landing page's `PunchRow`, and the difference matters: that one
 * always keeps the last mark as the empty gold reward ring, because it is
 * illustrating what a card is. Here the row is a real count, and a full card
 * drawn as seven inked marks and a ring reads as one short of the reward —
 * which is exactly the customer an owner must not overlook. So the ring only
 * survives while the card is unfinished.
 *
 * Above `maxMarks` the marks stop being countable and the figure carries it
 * alone with a bar, since nobody reads twenty circles.
 */
export function CardPunches({
  filled,
  total,
  size = 11,
  maxMarks = 10,
  className,
}: {
  filled: number;
  total: number;
  size?: number;
  maxMarks?: number;
  className?: string;
}) {
  const complete = total > 0 && filled >= total;
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Forced LTR: "7 / 8" is two numbers with neutral characters between
          them, and in a Hebrew paragraph the bidi algorithm reorders it to
          "8 / 7" — the card looks full when it is not. */}
      <Figure dir="ltr" className="text-xs text-ink-muted">
        {filled} / {total}
      </Figure>

      {total > 0 && total <= maxMarks ? (
        <div className="flex items-center gap-1" aria-hidden="true">
          {Array.from({ length: total }).map((_, i) => (
            <PunchMark
              key={i}
              size={size}
              state={
                i < filled ? "stamped" : i === total - 1 ? "reward" : "empty"
              }
            />
          ))}
        </div>
      ) : (
        <span
          aria-hidden="true"
          className="h-1.5 w-16 overflow-hidden rounded-full bg-ink/10"
        >
          <span
            className={cn(
              "block h-full rounded-full",
              complete ? "bg-primary" : "bg-ink/40",
            )}
            style={{
              width: `${total > 0 ? Math.min(1, filled / total) * 100 : 0}%`,
            }}
          />
        </span>
      )}
    </div>
  );
}
