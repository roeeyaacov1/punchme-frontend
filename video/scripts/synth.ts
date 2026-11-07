/** The building blocks `sfx.ts` and `music.ts` make their sounds from: 48 kHz mono, seeded noise. */
import { mulberry32 } from "./wav.ts";

export const SR = 48_000;

const random = mulberry32(7);
export const noise = () => random() * 2 - 1;

export const buffer = (seconds: number) => new Float32Array(Math.round(seconds * SR));

/** Rises over `attack` seconds, then falls away with time constant `decay`. */
export const envelope = (t: number, attack: number, decay: number) => (t < attack ? t / attack : Math.exp(-(t - attack) / decay));

/** Adds a sine whose frequency follows `freq(t)`, shaped by `amp(t)`, from `start` seconds for `length` seconds (to the end if left out). */
export function sine(out: Float32Array, freq: (t: number) => number, amp: (t: number) => number, start = 0, length?: number) {
  let phase = 0;
  const from = Math.round(start * SR);
  const to = length === undefined ? out.length : Math.min(out.length, from + Math.round(length * SR));
  for (let i = from; i < to; i++) {
    const t = i / SR - start;
    phase += (2 * Math.PI * freq(t)) / SR;
    out[i] += Math.sin(phase) * amp(t);
  }
}

/** A one-pole high-pass, in place. */
export function highpass(samples: Float32Array, cutoff: number) {
  const rc = 1 / (2 * Math.PI * cutoff);
  const a = rc / (rc + 1 / SR);
  let lastIn = 0;
  let lastOut = 0;
  for (let i = 0; i < samples.length; i++) {
    const x = samples[i];
    lastOut = a * (lastOut + x - lastIn);
    lastIn = x;
    samples[i] = lastOut;
  }
}

/** A band-pass whose centre follows `centre(t)` (RBJ's constant-peak biquad), in place. */
export function bandpass(samples: Float32Array, centre: (t: number) => number, q: number) {
  let x1 = 0;
  let x2 = 0;
  let y1 = 0;
  let y2 = 0;
  for (let i = 0; i < samples.length; i++) {
    const w = (2 * Math.PI * centre(i / SR)) / SR;
    const alpha = Math.sin(w) / (2 * q);
    const a0 = 1 + alpha;
    const x = samples[i];
    // b0 = alpha, b1 = 0, b2 = -alpha; a1 = -2cos(w), a2 = 1 - alpha.
    const y = (alpha * x - alpha * x2 + 2 * Math.cos(w) * y1 - (1 - alpha) * y2) / a0;
    x2 = x1;
    x1 = x;
    y2 = y1;
    y1 = y;
    samples[i] = y;
  }
}

/** Adds `part` into `out` from `start` seconds, at `gain`. */
export function addAt(out: Float32Array, part: Float32Array, start: number, gain = 1) {
  const from = Math.round(start * SR);
  for (let i = 0; i < part.length && from + i < out.length; i++) if (from + i >= 0) out[from + i] += part[i] * gain;
}

/** A burst of noise, high-passed, decaying. */
export function noiseHit(length: number, cutoff: number, decay: number): Float32Array {
  const burst = buffer(length);
  for (let i = 0; i < burst.length; i++) burst[i] = noise() * envelope(i / SR, 0.0005, decay);
  highpass(burst, cutoff);
  return burst;
}

/** Scales to a peak of `db` dBFS. */
export function normalise(samples: Float32Array, db = -1): Float32Array {
  let peak = 0;
  for (const sample of samples) peak = Math.max(peak, Math.abs(sample));
  const gain = 10 ** (db / 20) / peak;
  return samples.map((sample) => sample * gain);
}
