import type { ReactNode, RefObject } from "react";
import { useTranslation } from "react-i18next";
import { CameraOff } from "lucide-react";
import { Button } from "../../../components/kit/Button";
import { useReducedMotion } from "../../../components/kit/motion";
import { SnapFlash } from "../../../components/kit/Snap";
import { cn } from "../../../lib/cn";
import type { ScannerStatus } from "./useQrScanner";

/**
 * The camera, framed: the one surface in the dashboard that is neither a
 * panel nor the wall but a hole cut in it, so it is the camera's dark glass
 * in both themes and never lit. What sits on it is Panel Light (17.97:1).
 *
 * When the camera isn't running it folds to a short band that holds the
 * camera's state and its one way out, and the typed field opens under it;
 * an answer then lights in the band, right above the field.
 *
 * The `<video>` is mounted for every status, folded or not. The hook hands it
 * the stream the moment permission lands, and unmounting it while a prompt is
 * open would drop a stream that had already been granted.
 */
export function ScannerViewport({
  videoRef,
  status,
  folded,
  answering,
  snap,
  onRetry,
  children,
}: {
  videoRef: RefObject<HTMLVideoElement>;
  status: ScannerStatus;
  /** The camera isn't running: blocked, missing, refused, failed, or slow. */
  folded: boolean;
  /** An answer is lit, so the aiming aids step aside. */
  answering: boolean;
  /** The answer's id, for the photo snap; null for none. */
  snap: number | null;
  onRetry: () => void;
  /** The answer. */
  children?: ReactNode;
}) {
  const { t } = useTranslation();
  const running = status === "running";

  return (
    // A grid of one cell, so the answer sits in it 12px in from every edge.
    // Square while the camera runs, but never clipping: a long reward, a
    // two-line word or 200% text grows the frame instead of cutting the
    // answer off.
    <div
      className={cn(
        "relative grid w-full rounded-glass bg-glass text-light",
        folded ? "min-h-[9rem] content-center" : "aspect-square",
      )}
    >
      <video
        ref={videoRef}
        className={cn(
          "absolute inset-0 h-full w-full rounded-[inherit] object-cover transition-opacity duration-gentle",
          running && !folded ? "opacity-100" : "opacity-0",
        )}
        muted
        playsInline
        // Safari won't start an inline stream without both of these.
        autoPlay
        // The preview is the counter's aiming aid; a screen reader hears the
        // answer from the page's live region instead.
        aria-hidden
      />

      {running && !folded && !answering && (
        <>
          <Reticle />
          <p className="type-label absolute inset-x-0 bottom-0 rounded-b-[inherit] bg-gradient-to-t from-glass/85 to-transparent px-4 pb-4 pt-10 text-center">
            {t("dashboard.scan.aim")}
          </p>
        </>
      )}

      {status === "starting" && !folded && !answering && (
        <p className="type-body absolute inset-0 flex items-center justify-center px-6 text-center">{t("dashboard.scan.starting")}</p>
      )}

      {folded && !answering && <CameraState status={status} onRetry={onRetry} />}

      {children}
      <SnapFlash snap={snap} />
    </div>
  );
}

/** The camera's state on the folded band, and its one way out: try again,
 * or the typed field already open below. */
function CameraState({ status, onRetry }: { status: ScannerStatus; onRetry: () => void }) {
  const { t } = useTranslation();
  const key = status === "starting" || status === "running" ? "slow" : status;
  return (
    // Its sides hold at 24px as the text grows: at 200% on a 320px phone,
    // 1.5rem a side left "again" too little room and widened the frame.
    <div className="relative flex flex-col items-center gap-2 px-[min(1.5rem,24px)] py-6 text-center">
      <CameraOff aria-hidden className="size-7" />
      <p className="type-card-title">{t(`dashboard.scan.${key}.title`)}</p>
      <p className="type-body max-w-sm">{t(`dashboard.scan.${key}.body`)}</p>
      {(status === "denied" || status === "failed" || key === "slow") && (
        // A lit pill on the glass: the day's secondary button in both themes.
        <span className="theme-lit contents">
          <Button variant="secondary" onClick={onRetry} className="mt-1 max-w-full !whitespace-normal text-center">
            {t("dashboard.scan.retry")}
          </Button>
        </span>
      )}
    </div>
  );
}

/**
 * Corner brackets drawn as one symmetric shape, which is its own mirror image
 * in Hebrew, with the sweep running down between them: the reader still
 * looking. With reduced motion the sweep holds still across the middle and
 * breathes instead of travelling.
 */
function Reticle() {
  const reduced = useReducedMotion();
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div className="relative aspect-square h-[68%]">
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
        <div className="absolute inset-x-3 inset-y-2 overflow-hidden">
          {reduced ? (
            <div className="absolute inset-x-0 top-1/2 h-0.5 rounded-full bg-current animate-scan-pulse" />
          ) : (
            <div className="h-full w-full animate-scan-sweep">
              <div className="h-0.5 w-full rounded-full bg-current" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
