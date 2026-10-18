/**
 * Where an arrow key sends focus along a row of tabs.
 *
 * The row runs the way the language reads, so in Hebrew the left arrow is
 * "next". It wraps at both ends, and Home and End jump to them. Anything
 * else returns null, so the caller leaves the key alone.
 */
export function nextRovingIndex(
  key: string,
  current: number,
  count: number,
  rtl: boolean,
): number | null {
  if (count <= 0) return null;
  const forward = rtl ? "ArrowLeft" : "ArrowRight";
  const back = rtl ? "ArrowRight" : "ArrowLeft";
  switch (key) {
    case forward:
      return (current + 1) % count;
    case back:
      return (current - 1 + count) % count;
    case "Home":
      return 0;
    case "End":
      return count - 1;
    default:
      return null;
  }
}
