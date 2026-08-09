export type CardPattern = "none" | "waves" | "dots" | "stripes";

export const CARD_PATTERNS: CardPattern[] = ["none", "waves", "dots", "stripes"];

/** CSS equivalents of the server-side strip patterns (apps/wallet/strips.py
 * tints them from the stamp color at low alpha) — close enough for a live
 * preview; the real pass uses the server-rendered PNGs. */
export function patternCss(pattern: CardPattern, tint: string): string | undefined {
  const color = `${tint}40`; // ~25% alpha, matching the server's 80/255
  switch (pattern) {
    case "waves":
      return `repeating-radial-gradient(circle at 0 0, transparent 0, transparent 9px, ${color} 9px, ${color} 12px)`;
    case "dots":
      return `radial-gradient(${color} 3px, transparent 3.5px)`;
    case "stripes":
      return `repeating-linear-gradient(45deg, ${color} 0, ${color} 6px, transparent 6px, transparent 22px)`;
    default:
      return undefined;
  }
}

export function patternStyle(
  pattern: CardPattern,
  tint: string,
): React.CSSProperties | undefined {
  const image = patternCss(pattern, tint);
  if (!image) return undefined;
  return {
    backgroundImage: image,
    backgroundSize: pattern === "dots" ? "16px 16px" : undefined,
  };
}
