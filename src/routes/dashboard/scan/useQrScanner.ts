import { useCallback, useEffect, useRef, useState } from "react";
import { createQrDecoder, type QrDecoder } from "../../../lib/qrDecoder";

/**
 * The camera, held open.
 *
 * The whole feature is a latency budget, so the shape of this hook is
 * decided by what has to have already happened before a customer holds up a
 * pass: the stream is live, the decoder is chosen and downloaded, and the
 * loop is already running. Nothing here waits for a tap. The camera opens on
 * mount, the decoder is fetched in parallel with the permission prompt, and
 * the read loop starts on the first frame that has data — so the cost of a
 * scan is the read plus one request, and nothing else.
 *
 * It also stays open between customers. Tearing the stream down after each
 * scan would put a second of camera warm-up in front of every person in the
 * queue, which is the one thing a counter cannot spend.
 */

export type ScannerStatus =
  /** Asking for the camera, or waiting for its first frame. */
  | "starting"
  | "running"
  /** The owner said no — recoverable, and the page says how. */
  | "denied"
  /** Permission is fine; there is no camera behind it. */
  | "noCamera"
  /** No `getUserMedia` at all. In practice: the page is not on https. */
  | "unsupported"
  | "failed";

/** Up to twenty reads a second. Past that the attempts land inside the same
 * camera frame and cost work for an image already rejected. */
const MIN_DECODE_INTERVAL_MS = 50;

/** 720p is the sweet spot: enough detail that a pass fills a fraction of the
 * frame and still reads, small enough that the stream starts quickly and a
 * downscale is cheap. Asking for more slows the open and buys nothing. */
const IDEAL_WIDTH = 1280;
const IDEAL_HEIGHT = 720;

/**
 * Two capabilities every phone browser ships and `lib.dom` still does not
 * describe: the torch behind the rear camera, and the autofocus mode that
 * decides whether a code held 20cm away ever resolves. Declared here rather
 * than cast away at each call site, so the two spots that use them stay
 * type-checked.
 */
declare global {
  interface MediaTrackCapabilities {
    torch?: boolean;
  }
  interface MediaTrackConstraintSet {
    torch?: boolean;
    focusMode?: "none" | "manual" | "single-shot" | "continuous";
  }
}

interface WakeLockish {
  request(type: "screen"): Promise<{ release(): Promise<void> }>;
}

export function useQrScanner(onCode: (raw: string) => void) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<ScannerStatus>("starting");
  const [torchOn, setTorchOn] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);
  /** Bumped by `retry`, which is the whole restart mechanism. */
  const [attempt, setAttempt] = useState(0);

  const streamRef = useRef<MediaStream | null>(null);
  // The loop is started once and must not be rebuilt when the page
  // re-renders around it, so the current handler is read through a ref.
  const onCodeRef = useRef(onCode);
  onCodeRef.current = onCode;

  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia) {
      // `mediaDevices` is undefined on plain http as well as on a browser
      // without a camera API, and from the counter's point of view those are
      // the same problem: this page cannot open a camera here.
      setStatus("unsupported");
      return;
    }

    let cancelled = false;
    let raf = 0;
    let stream: MediaStream | null = null;
    let wakeLock: { release(): Promise<void> } | null = null;

    // Started before the permission prompt, not after it: the download and
    // the owner's decision overlap instead of queueing.
    let decoderPromise = createQrDecoder();

    const start = async () => {
      setStatus("starting");
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: IDEAL_WIDTH },
            height: { ideal: IDEAL_HEIGHT },
          },
          audio: false,
        });
      } catch (error) {
        if (cancelled) return;
        const name = (error as DOMException | undefined)?.name;
        setStatus(
          name === "NotAllowedError" || name === "SecurityError"
            ? "denied"
            : name === "NotFoundError" || name === "OverconstrainedError"
              ? "noCamera"
              : "failed",
        );
        return;
      }

      // The effect can be torn down while the prompt is still open — React's
      // double-mount in development does exactly this — and a stream that
      // arrives after that would leave the camera light on with nothing
      // rendering it.
      if (cancelled || !videoRef.current) {
        stream?.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;
      const track = stream.getVideoTracks()[0];
      setTorchSupported(!!track?.getCapabilities?.().torch);
      // A phone that holds focus at infinity never resolves the modules of a
      // code held 20cm away. Ignored where it isn't supported.
      void track
        ?.applyConstraints({ advanced: [{ focusMode: "continuous" }] })
        .catch(() => {});

      const video = videoRef.current;
      video.srcObject = stream;
      try {
        await video.play();
      } catch {
        // Interrupted by a teardown, or autoplay refused. The loop below
        // reads `readyState`, so a stream that is live anyway still works.
      }
      if (cancelled) return;
      setStatus("running");

      // A counter device is put down between customers, and a screen that
      // sleeps mid-queue costs a tap and a second. Best effort only.
      void (navigator as unknown as { wakeLock?: WakeLockish }).wakeLock
        ?.request("screen")
        .then((sentinel) => {
          if (cancelled) void sentinel.release();
          else wakeLock = sentinel;
        })
        .catch(() => {});

      let decoder: QrDecoder | null = null;
      let lastAt = 0;

      const tick = async () => {
        if (cancelled) return;
        const now = performance.now();
        if (
          now - lastAt >= MIN_DECODE_INTERVAL_MS &&
          video.readyState >= video.HAVE_CURRENT_DATA
        ) {
          lastAt = now;
          try {
            decoder ??= await decoderPromise;
            const raw = await decoder.decode(video);
            if (cancelled) return;
            if (raw) onCodeRef.current(raw);
          } catch {
            if (decoder?.kind === "native") {
              // Some Chrome builds expose BarcodeDetector and then throw from
              // the first real detect. Demote once, for good, rather than
              // failing every frame from here on.
              decoder = null;
              decoderPromise = createQrDecoder(false);
            } else if (!decoder) {
              // The fallback chunk itself didn't arrive — a flaky connection
              // on the first scan of the day. Ask again on the next frame
              // instead of holding a rejected promise and quietly never
              // reading anything for the rest of the shift.
              decoderPromise = createQrDecoder(false);
            }
          }
        }
        raf = requestAnimationFrame(() => void tick());
      };

      raf = requestAnimationFrame(() => void tick());
    };

    void start();

    // The screen lock is dropped by the browser whenever the page is hidden,
    // and is not given back on its own.
    const onVisible = () => {
      if (document.visibilityState !== "visible" || cancelled || wakeLock) return;
      void (navigator as unknown as { wakeLock?: WakeLockish }).wakeLock
        ?.request("screen")
        .then((sentinel) => {
          if (cancelled) void sentinel.release();
          else wakeLock = sentinel;
        })
        .catch(() => {});
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisible);
      void wakeLock?.release().catch(() => {});
      streamRef.current = null;
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [attempt]);

  const toggleTorch = useCallback(() => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track) return;
    setTorchOn((on) => {
      const next = !on;
      void track
        .applyConstraints({ advanced: [{ torch: next }] })
        .catch(() => {});
      return next;
    });
  }, []);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  return { videoRef, status, torchOn, torchSupported, toggleTorch, retry };
}
