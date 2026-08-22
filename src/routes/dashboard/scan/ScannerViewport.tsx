import type { ReactNode, RefObject } from "react";
import { useTranslation } from "react-i18next";
import { CameraOff, Flashlight, Volume2, VolumeX } from "lucide-react";
import { ctaClasses, focusRing } from "../../../components/marketing/primitives";
import { cn } from "../../../lib/cn";
import type { ScannerStatus } from "./useQrScanner";

/**
 * The camera, framed.
 *
 * The one surface in the dashboard that is neither a screen nor an object on
 * a lit stage — it is a hole cut in the page — so it is drawn near-black in
 * both themes and the controls on it are white. `theme-lit` would be wrong
 * here: nothing is being handed to anyone.
 *
 * The `<video>` is mounted for every status, including the failures. The
 * hook hands it the stream the moment permission lands, and unmounting it
 * while a prompt is open would drop a stream that has already been granted.
 */

/** Corner brackets, as one symmetric graphic rather than four bordered
 * boxes — a bracket built from `border-s`/`border-t` has to be mirrored for
 * Hebrew, and a shape that is its own mirror image never does. */
function Reticle({ active }: { active: boolean }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
    >
      <div className="relative aspect-square h-[74%] max-h-[74%] max-w-[80%]">
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
        {active && (
          <div className="absolute inset-x-2 inset-y-0 overflow-hidden">
            <div className="h-px w-full bg-current animate-scan-sweep" />
          </div>
        )}
      </div>
    </div>
  );
}

function Overlay({ children }: { children: ReactNode }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-navy-deep/85 px-6 text-center">
      {children}
    </div>
  );
}

export function ScannerViewport({
  videoRef,
  status,
  torchOn,
  torchSupported,
  onToggleTorch,
  soundOn,
  onToggleSound,
  onRetry,
  children,
}: {
  videoRef: RefObject<HTMLVideoElement>;
  status: ScannerStatus;
  torchOn: boolean;
  torchSupported: boolean;
  onToggleTorch: () => void;
  soundOn: boolean;
  onToggleSound: () => void;
  onRetry: () => void;
  /** The result, laid over the frame — see `ScanResult`. */
  children?: ReactNode;
}) {
  const { t } = useTranslation();
  const running = status === "running";

  return (
    <div className="flex flex-col gap-3">
      {/* Square on a phone, because that is the shape of the thing being
          aimed at and it fills a portrait screen that a 4:3 letterbox leaves
          half empty. A desk is the other way round: the camera is above the
          screen and the frame is wider than it is tall. */}
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-navy-deep shadow-panel-lift ring-1 ring-border sm:aspect-[4/3]">
        <video
          ref={videoRef}
          className={cn(
            "h-full w-full object-cover transition-opacity duration-300",
            running ? "opacity-100" : "opacity-0",
          )}
          muted
          playsInline
          // Safari will not start an inline stream without both of these.
          autoPlay
          // The preview is the owner's own aiming aid; a screen reader gets
          // the outcome from the live region instead.
          aria-hidden
        />

        {running && (
          <Reticle active={!children} />
        )}

        {running && !children && (
          <p className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-deep/85 to-transparent px-4 pb-4 pt-8 text-center text-sm font-semibold text-white">
            {t("dashboard.scan.aim")}
          </p>
        )}

        {status === "starting" && (
          <Overlay>
            <p className="text-sm font-semibold text-white/90">
              {t("dashboard.scan.starting")}
            </p>
          </Overlay>
        )}

        {(status === "denied" ||
          status === "noCamera" ||
          status === "unsupported" ||
          status === "failed") && (
          <Overlay>
            <CameraOff size={28} aria-hidden className="text-white/70" />
            <p className="t-card-title text-white">
              {t(`dashboard.scan.${status}.title`)}
            </p>
            <p className="max-w-sm text-sm text-white/75">
              {t(`dashboard.scan.${status}.body`)}
            </p>
            {status !== "unsupported" && (
              <button
                type="button"
                onClick={onRetry}
                className={ctaClasses("primary", "sm", "mt-1")}
              >
                {t("dashboard.scan.retry")}
              </button>
            )}
          </Overlay>
        )}

        {children}
      </div>

      {/* One word per control. `aria-pressed` carries on-or-off to a screen
          reader and the filled state carries it on screen; a label that
          changed too would be a third thing saying the same thing. */}
      <div className="flex items-center justify-center gap-2">
        {torchSupported && (
          <button
            type="button"
            onClick={onToggleTorch}
            aria-pressed={torchOn}
            className={cn(
              "inline-flex min-h-[44px] items-center gap-2 rounded-xl px-3 text-sm font-semibold transition-colors",
              focusRing,
              torchOn
                ? "bg-primary/15 text-primary-text"
                : "text-ink-muted hover:bg-ink/[0.06] hover:text-ink",
            )}
          >
            <Flashlight size={17} aria-hidden />
            {t("dashboard.scan.torch")}
          </button>
        )}
        <button
          type="button"
          onClick={onToggleSound}
          aria-pressed={soundOn}
          className={cn(
            "inline-flex min-h-[44px] items-center gap-2 rounded-xl px-3 text-sm font-semibold transition-colors",
            focusRing,
            soundOn
              ? "bg-primary/15 text-primary-text"
              : "text-ink-muted hover:bg-ink/[0.06] hover:text-ink",
          )}
        >
          {soundOn ? (
            <Volume2 size={17} aria-hidden />
          ) : (
            <VolumeX size={17} aria-hidden />
          )}
          {t("dashboard.scan.sound")}
        </button>
      </div>
    </div>
  );
}
