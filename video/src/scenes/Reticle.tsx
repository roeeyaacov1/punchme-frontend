import { IN_OUT, sec } from "../motion";

/**
 * The Scan page's aiming aid, its four corners and its line, drawn the same
 * way (`ScannerViewport`'s `Reticle` isn't exported), in the colour of what
 * holds it. Its sweep is rebuilt from frames: down and back on the in-out,
 * from the frame given as 0.
 */
export function Reticle({ frame, line = true }: { frame: number; line?: boolean }) {
  const cycle = sec(1.6);
  const phase = (((frame % cycle) + cycle) % cycle) / cycle;
  const across = phase < 0.5 ? IN_OUT(phase * 2) : IN_OUT(2 - phase * 2);
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 h-full w-full"
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
      >
        <path d="M2 22V8a6 6 0 0 1 6-6h14" />
        <path d="M78 2h14a6 6 0 0 1 6 6v14" />
        <path d="M98 78v14a6 6 0 0 1-6 6H78" />
        <path d="M22 98H8a6 6 0 0 1-6-6V78" />
      </svg>
      {line && (
        <div className="absolute inset-x-[6%] inset-y-[4%] overflow-hidden">
          <div className="h-full w-full" style={{ transform: `translateY(${across * 100}%)` }}>
            <div className="h-[3px] w-full rounded-full bg-current" />
          </div>
        </div>
      )}
    </div>
  );
}
