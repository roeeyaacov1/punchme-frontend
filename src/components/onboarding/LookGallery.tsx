import { useId } from "react";
import { Check } from "lucide-react";
import { cn } from "../../lib/cn";
import { LookTile } from "./LookTile";
import type { CardLook } from "../../routes/onboarding/looks";

/**
 * The ready-made looks, three across.
 *
 * Not `ChoiceGrid`: that grid is built for one round object per cell and
 * centres it, where a look is a wide card with a name under it. Everything
 * else is the same bargain — native radios, so the group semantics, the
 * arrow-key walk and the single Tab stop come free, and the label is the
 * target so the whole card is tappable.
 */
export function LookGallery({
  looks,
  value,
  onChange,
  legend,
  nameFor,
  className,
}: {
  looks: CardLook[];
  /** The look's `key`, or null when the card no longer matches one. */
  value: string | null;
  onChange: (look: CardLook) => void;
  legend: string;
  nameFor: (look: CardLook) => string;
  className?: string;
}) {
  const id = useId();
  return (
    <fieldset className={cn("min-w-0", className)}>
      <legend className="mb-2 text-sm font-medium text-ink">{legend}</legend>
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {looks.map((look) => {
          const selected = look.key === value;
          const inputId = `${id}-${look.key}`;
          const name = nameFor(look);
          return (
            <label key={look.key} htmlFor={inputId} className="group cursor-pointer">
              <input
                id={inputId}
                type="radio"
                name="look"
                value={look.key}
                checked={selected}
                onChange={() => onChange(look)}
                aria-label={name}
                className="peer sr-only"
              />
              <span
                aria-hidden="true"
                className={cn(
                  "relative block rounded-xl ring-offset-2 ring-offset-surface transition-all",
                  "group-hover:scale-[1.03] motion-reduce:group-hover:scale-100",
                  "peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-primary-text",
                  selected ? "ring-2 ring-ink" : "ring-1 ring-rim/10",
                )}
              >
                <LookTile look={look} className="h-[68px]" />
                {selected && (
                  // A white disc with dark ink, not the other way round: the
                  // looks run from cream to midnight, and this is the one
                  // pairing that reads on every one of them.
                  <span className="absolute end-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-surface ring-1 ring-rim/20">
                    <Check size={11} strokeWidth={3} className="text-ink" />
                  </span>
                )}
              </span>
              <span
                className={cn(
                  "mt-1.5 block truncate text-center text-xs transition-colors",
                  selected ? "font-semibold text-ink" : "text-ink-muted",
                )}
                title={name}
              >
                {name}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
