import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { focusRing } from "../marketing/primitives";
import { cn } from "../../lib/cn";

/**
 * The wizard's progress: a fixed row of dots and one pill that travels along
 * it.
 *
 * It used to be eight punch marks — the landing page's ornament, borrowed.
 * But a punch means *a visit banked*, and a wizard step is not that; eight of
 * them at 44px apiece also spent the full width of a 375px panel on a thing
 * the owner reads in half a second.
 *
 * **The pill is one object, so it is drawn as one object.** The first pass had
 * each mark own its own width — the old pill shrank while the new one grew,
 * which is two things happening at once and reads as a flicker rather than a
 * move. Now the row never changes shape: every step is a 28px slot holding a
 * 6px dot, and a single 22px capsule slides between slots on top of them,
 * hiding the dot it is parked over. One thing moves, and it moves *forward*.
 *
 * It also *leans*. A pill that changes position without changing shape reads
 * as a jump cut between two resting states; the squash-and-stretch of
 * `pill-travel` is what makes it read as one object crossing a distance. The
 * lean lives on a nested span so that the travel and the stretch are separate
 * transforms that compose, rather than one property two rules are fighting
 * over.
 *
 * Behind it, the dot it just left plays `animate-stamp-in` — the same keyframe
 * a stamp uses when it lands on a card, because that is what has just
 * happened. The capsule glides off; the mark it leaves behind is pressed down.
 * The punch marks are gone; what they meant is not.
 *
 * **The curves are the product's own.** `tailwind.config.js` allows two and
 * says what each means: words *rise* (0.16,1,0.3,1), objects *land*
 * (0.34,1.4,0.64,1) — the overshoot-and-settle of a rubber stamp pressed down
 * and lifted. Both gestures here are landings.
 *
 * Nothing moves under reduced motion.
 */

/** One step's slot. 28px of pitch — comfortably past the 24px a target needs
 * (WCAG 2.5.8), and wide enough that the travelling capsule clears its
 * neighbours' dots by 14px at rest. */
const SLOT = 28;
const CAPSULE = 22;

/** One slot, drawn: 28px square. The dot inside is 6px and the rest is what
 * makes the gaps read as a track. */
const BOX = "relative flex h-7 w-7 items-center justify-center";

/**
 * The 44px pointer target, without spending 44px of a phone screen to draw
 * it.
 *
 * The row used to *be* 44px tall, which is the floor this product holds
 * itself to for anything a thumb has to hit, and a 6px dot is exactly the
 * case that floor exists for. But 44px of panel to render a 6px dot is a
 * sixth of the space between the phone and the question on an SE, and it read
 * as a gap rather than as a target.
 *
 * So the box stays and the row shrinks: an empty pseudo-element, centred on
 * the dot, 44px tall, overhanging the 28px row by 8px at each end. Nothing is
 * drawn and nothing reflows. The overhang is why the step below is `mt-3` —
 * the Back button there carries its own 44px box and the two must not meet.
 */
const HIT = "after:absolute after:inset-x-0 after:top-1/2 after:h-11 after:-translate-y-1/2 after:content-['']";

/** The overshoot curve, spelled out: objects land. */
const LAND = "ease-[cubic-bezier(0.34,1.4,0.64,1)]";

export function StepProgress({
  steps,
  current,
  reachable,
  hrefFor,
  labelFor,
  className,
}: {
  steps: readonly string[];
  current: string;
  /** Steps the owner may jump back to (everything they have completed). */
  reachable: (step: string) => boolean;
  hrefFor: (step: string) => string;
  labelFor: (step: string) => string;
  className?: string;
}) {
  const { t, i18n } = useTranslation();
  // Which way "forward" points. The anchor below is a logical offset, so this
  // mirrors the travel alone — the same sign flip `ActivityChart` and `Brief`
  // already make for their own hand-placed geometry.
  const rtl = i18n.dir() === "rtl";
  const index = Math.max(0, steps.indexOf(current));

  // What is mid-animation. Held in state rather than worked out at render
  // time, so a re-render inside those 340ms — a keystroke, a colour tap —
  // cannot cut either animation short by dropping the class again.
  const [stamping, setStamping] = useState<number | null>(null);
  const [travelling, setTravelling] = useState(false);
  const previous = useRef(index);
  useEffect(() => {
    const from = previous.current;
    previous.current = index;
    if (index === from) return;
    // The lean is physics — the pill leans into wherever it is going, so this
    // fires in both directions.
    setTravelling(true);
    // The stamp is an achievement, and only forward is one. Walking back to
    // change an answer is a correction, and gets no ceremony.
    if (index > from) setStamping(from);
    const id = window.setTimeout(() => {
      setTravelling(false);
      setStamping(null);
    }, 400);
    return () => window.clearTimeout(id);
  }, [index]);

  return (
    <nav aria-label={t("onboarding.progress", { n: index + 1, total: steps.length })} className={className}>
      {/* `w-fit` so the capsule's offsets are measured from the row itself and
          not from a full-width list — the row is centred, the maths is not. */}
      <div className="relative mx-auto flex w-fit items-center">
        {/* The travelling pill, in two layers so one gesture cannot overwrite
            the other: the outer span *goes*, the inner span *leans*. Both are
            transforms, and nesting is what lets them compose.

            The travel is a transform and not the `inset-inline-start` it used
            to be. A logical offset needs no negated arithmetic in Hebrew,
            which was the appeal, but it is a layout property: the browser
            reflows the row on every frame of a 300ms glide, which is exactly
            the sixty reflows a phone cannot spare. A transform is composited
            — no layout, no paint, and it is the one animation path Safari has
            never been shaky about. The direction costs one sign flip, which
            the app already does this way in `ActivityChart` and `Brief`.

            The *anchor* stays logical, so only the travel is mirrored: the
            pill starts 3px into the first slot from whichever edge the page
            begins at, and walks one slot per step from there. */}
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute top-1/2",
            "transition-transform duration-300 motion-reduce:transition-none",
            LAND,
          )}
          style={{
            insetInlineStart: (SLOT - CAPSULE) / 2,
            // `-50%` for the vertical centring, because an inline transform
            // replaces the class that used to do it.
            transform: `translate3d(${(rtl ? -1 : 1) * index * SLOT}px, -50%, 0)`,
          }}
        >
          <span
            // Keyed on the step so a second move inside the first one's 340ms
            // gets a fresh element, and therefore a fresh lean — a class that
            // is already on cannot replay an animation by staying on.
            key={index}
            className={cn(
              "block h-1.5 rounded-full bg-primary",
              // A spread-only halo: it costs no layout, so nothing reflows as
              // the pill arrives.
              "shadow-[0_0_0_3px_rgb(var(--c-primary)/0.16)]",
              travelling && "animate-pill-travel motion-reduce:animate-none",
            )}
            style={{ width: CAPSULE }}
          />
        </span>

        <ol className="flex items-center">
          {steps.map((step, i) => {
            const done = i < index;
            const here = i === index;
            const canGo = done && reachable(step);
            const mark = (
              <span
                aria-hidden="true"
                className={cn(
                  "block h-1.5 w-1.5 rounded-full transition-colors duration-300 motion-reduce:transition-none",
                  LAND,
                  // Only ever inside a Link — a 6px dot needs a legible hover
                  // that is not a size change shoving its neighbours along.
                  "group-hover:scale-150",
                  // The current step's dot is under the capsule and never
                  // seen; it is coloured anyway so that mid-flight, when the
                  // capsule has already left, there is no pale gap behind it.
                  done || here ? "bg-primary" : "bg-border-strong",
                  i === stamping && "animate-stamp-in motion-reduce:animate-none",
                )}
              />
            );
            return (
              <li key={step} className="flex items-center">
                {canGo ? (
                  <Link
                    to={hrefFor(step)}
                    aria-label={labelFor(step)}
                    className={cn(BOX, HIT, "group rounded-full", focusRing)}
                  >
                    {mark}
                  </Link>
                ) : (
                  <span
                    className={BOX}
                    aria-current={here ? "step" : undefined}
                    aria-label={labelFor(step)}
                  >
                    {mark}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </div>
      <p className="sr-only" aria-live="polite">
        {t("onboarding.progress", { n: index + 1, total: steps.length })}: {labelFor(current)}
      </p>
    </nav>
  );
}
