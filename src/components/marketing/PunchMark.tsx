import type { CSSProperties, ReactNode } from "react";
import { cn } from "../../lib/cn";

/**
 * The page's one ornament: a punch.
 *
 * Two objects define this product — the wallet pass and the paper card it
 * replaces — and they share exactly one form, a row of circles waiting to be
 * filled. So the mark always means *one visit*, and it is the only decorative
 * element on the landing page. It stands in for a tick in the trust bullets,
 * numbers the steps in "how it works", and draws the owner's own card in the
 * calculator.
 *
 * `stamped` is an ink impression and is deliberately not round — a rubber
 * stamp never lands twice the same. `empty` is the guide circle printed on
 * card stock, which is truer because a press printed it. `reward` is the same
 * guide in gold: the one at the end of the row that's worth something.
 */

/** The inked impression. Radii vary ±5% around the circle. */
const INK =
  "M12.00 2.10C14.63 2.10 16.78 3.77 18.51 5.49C20.23 7.22 22.10 9.32 22.10 12.00C22.10 14.68 20.41 16.88 18.65 18.65C16.88 20.41 14.60 21.80 12.00 21.80C9.40 21.80 7.17 20.32 5.42 18.58C3.68 16.83 1.80 14.71 1.80 12.00C1.80 9.29 3.50 7.06 5.28 5.28C7.06 3.50 9.37 2.10 12.00 2.10Z";

/** The printed guide circle — nearly true, but printed, not drawn. */
const GUIDE =
  "M12.00 2.40C14.55 2.40 16.88 3.59 18.65 5.35C20.41 7.12 21.70 9.43 21.70 12.00C21.70 14.57 20.50 16.94 18.72 18.72C16.94 20.50 14.55 21.60 12.00 21.60C9.45 21.60 7.12 20.41 5.35 18.65C3.59 16.88 2.30 14.57 2.30 12.00C2.30 9.43 3.50 7.06 5.28 5.28C7.06 3.50 9.45 2.40 12.00 2.40Z";

export type PunchState = "stamped" | "empty" | "reward";

export function PunchMark({
  state = "empty",
  size = 20,
  className,
  style,
  children,
}: {
  state?: PunchState;
  /** Rendered size in px. */
  size?: number;
  className?: string;
  /** Merged over the mark's own box. The hero sets `animationDelay` here to
   * place each bullet's stamp in the load sequence. */
  style?: CSSProperties;
  /** A numeral, knocked out of the ink. Only meaningful when `stamped`. */
  children?: ReactNode;
}) {
  return (
    <span
      className={cn("relative inline-flex shrink-0", className)}
      style={{ width: size, height: size, ...style }}
    >
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        aria-hidden="true"
        focusable="false"
      >
        {state === "stamped" ? (
          <path d={INK} className="fill-primary" />
        ) : (
          <path
            d={GUIDE}
            fill="none"
            strokeWidth={state === "reward" ? 2 : 1.5}
            // The guide is a dashed print; the reward ring is solid gold so
            // the end of the row reads as the thing worth walking back for.
            strokeDasharray={state === "reward" ? undefined : "3 3.2"}
            className={
              state === "reward" ? "stroke-primary" : "stroke-border-strong"
            }
          />
        )}
      </svg>
      {children !== undefined && (
        <span
          // Knocked out of the ink, in whatever colour this theme's fill
          // carries: navy on gold (6.30:1, where white would be 2.96:1) and
          // white on violet (6.28:1, where navy would be 3.00:1).
          className="absolute inset-0 flex items-center justify-center font-heading font-bold leading-none text-primary-on"
          style={{ fontSize: size * 0.42 }}
        >
          {children}
        </span>
      )}
    </span>
  );
}

/**
 * A whole card's worth of punches. `filled` of `total` are inked and the last
 * one is the reward — which is what a paper card looks like, and what the
 * calculator's stamps slider is actually setting.
 */
export function PunchRow({
  total,
  filled = 0,
  size = 20,
  className,
}: {
  total: number;
  filled?: number;
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={cn("flex flex-wrap items-center", className)}
      style={{ gap: Math.round(size * 0.35) }}
      aria-hidden="true"
    >
      {Array.from({ length: total }).map((_, i) => (
        <PunchMark
          key={i}
          size={size}
          state={
            i === total - 1 ? "reward" : i < filled ? "stamped" : "empty"
          }
        />
      ))}
    </div>
  );
}
