/**
 * The sound a scan makes.
 *
 * Not decoration. Whoever is holding the phone is looking at the customer,
 * not at the screen — a barber has scissors in the other hand — so the
 * primary confirmation that a punch landed has to be audible, the way a
 * supermarket scanner's is. The screen carries the detail; the tone carries
 * "done, next".
 *
 * Synthesised rather than shipped as a file: three short tones cost nothing
 * to generate and there is no asset to fetch on the first scan of the day.
 */

const STORAGE_KEY = "punchme.scanSound";

export function soundEnabled(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== "off";
  } catch {
    return true;
  }
}

export function setSoundEnabled(on: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, on ? "on" : "off");
  } catch {
    // Private mode. The preference just won't survive the session.
  }
}

let ctx: AudioContext | null = null;

function context(): AudioContext | null {
  if (ctx) return ctx;
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctor) return null;
  try {
    ctx = new Ctor();
  } catch {
    return null;
  }
  return ctx;
}

/**
 * Wakes the audio context from inside a user gesture.
 *
 * iOS starts every context suspended and only lets a gesture resume it, so
 * the first beep of a session would otherwise be silent — which is the one
 * that has to be heard, because it is the one that teaches the owner the
 * sound means "punched".
 */
export function primeAudio() {
  const audio = context();
  if (audio?.state === "suspended") void audio.resume().catch(() => {});
}

/** One tone, with the ends ramped — a square edge on a 70ms blip is an
 * audible click on a phone speaker. */
function tone(
  audio: AudioContext,
  frequency: number,
  startAt: number,
  durationMs: number,
  peak: number,
) {
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = "triangle";
  osc.frequency.value = frequency;
  const end = startAt + durationMs / 1000;
  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(peak, startAt + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, end);
  osc.connect(gain).connect(audio.destination);
  osc.start(startAt);
  osc.stop(end + 0.02);
}

export type Chime =
  /** A punch landed. The supermarket blip: one bright tone, over fast. */
  | "punch"
  /** The card came up full. Two rising notes — this one you look up for. */
  | "reward"
  /** Nothing was added. Low, and deliberately not alarming: a double-scan
   * is not a mistake anyone made. */
  | "reject";

export function chime(kind: Chime) {
  if (!soundEnabled()) return;
  const audio = context();
  if (!audio) return;
  if (audio.state === "suspended") void audio.resume().catch(() => {});
  const now = audio.currentTime;
  if (kind === "punch") {
    tone(audio, 1760, now, 70, 0.16);
  } else if (kind === "reward") {
    tone(audio, 1174, now, 90, 0.16);
    tone(audio, 1760, now + 0.1, 160, 0.18);
  } else {
    tone(audio, 320, now, 110, 0.13);
    tone(audio, 260, now + 0.14, 150, 0.13);
  }
}

/** Android only — iOS Safari has no vibration API — so it is a bonus on top
 * of the tone, never the only signal. */
export function buzz(kind: Chime) {
  if (typeof navigator.vibrate !== "function") return;
  try {
    navigator.vibrate(
      kind === "punch" ? 35 : kind === "reward" ? [30, 60, 90] : [90, 70, 90],
    );
  } catch {
    // Some browsers throw instead of returning false when it's disallowed.
  }
}
