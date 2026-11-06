/**
 * The video's sounds, made here rather than licensed: `node scripts/sfx.ts`
 * writes 48 kHz mono WAVs into `public/sfx/` (committed), each peaking at
 * -1 dBFS, from a fixed seed so a rerun writes the same files. Then it mixes
 * the whole 30 seconds from `cues()` at their volumes and prints the mix's
 * peak, which must stay under 0 dBFS.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { cues } from "../src/cues.ts";
import { DURATION } from "../src/timeline.ts";
import { encodeWav, mulberry32, peakDb } from "./wav.ts";

const SR = 48_000;
const FPS = 30;
const random = mulberry32(7);
const noise = () => random() * 2 - 1;

const buffer = (seconds: number) => new Float32Array(Math.round(seconds * SR));

/** Rises over `attack` seconds, then falls away with time constant `decay`. */
const envelope = (t: number, attack: number, decay: number) => (t < attack ? t / attack : Math.exp(-(t - attack) / decay));

/** Adds a sine whose frequency follows `freq(t)`, shaped by `amp(t)`, from `start` seconds. */
function sine(out: Float32Array, freq: (t: number) => number, amp: (t: number) => number, start = 0) {
  let phase = 0;
  for (let i = Math.round(start * SR); i < out.length; i++) {
    const t = i / SR - start;
    phase += (2 * Math.PI * freq(t)) / SR;
    out[i] += Math.sin(phase) * amp(t);
  }
}

/** A one-pole high-pass, in place. */
function highpass(samples: Float32Array, cutoff: number) {
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
function bandpass(samples: Float32Array, centre: (t: number) => number, q: number) {
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

/** Adds a burst of noise, high-passed, decaying, from `start` seconds. */
function click(out: Float32Array, start: number, length: number, cutoff: number, amp: number, decay: number) {
  const burst = buffer(length);
  for (let i = 0; i < burst.length; i++) burst[i] = noise() * envelope(i / SR, 0.0005, decay);
  highpass(burst, cutoff);
  const from = Math.round(start * SR);
  for (let i = 0; i < burst.length && from + i < out.length; i++) out[from + i] += burst[i] * amp;
}

/** Scales to a -1 dBFS peak. */
function normalise(samples: Float32Array): Float32Array {
  let peak = 0;
  for (const sample of samples) peak = Math.max(peak, Math.abs(sample));
  const gain = 10 ** (-1 / 20) / peak;
  return samples.map((sample) => sample * gain);
}

/** The die: a low thump falling 90 to 45 Hz, its knock an octave up, and the cut's sharp click. */
function thump(seconds: number, pitch: number, withClick: boolean): Float32Array {
  const out = buffer(seconds);
  const fall = (t: number) => pitch * 90 * Math.pow(0.5, Math.min(t, 0.12) / 0.12);
  sine(out, fall, (t) => envelope(t, 0.004, 0.045 * (seconds / 0.22)));
  sine(out, (t) => fall(t) * 2, (t) => 0.3 * envelope(t, 0.002, 0.018));
  if (withClick) click(out, 0, 0.015, 2000, 0.55, 0.004);
  return out;
}

function whoosh(): Float32Array {
  const length = 0.38;
  const out = buffer(length);
  for (let i = 0; i < out.length; i++) out[i] = noise();
  bandpass(out, (t) => 600 * Math.pow(3000 / 600, t / length), 1.4);
  for (let i = 0; i < out.length; i++) out[i] *= Math.pow(Math.sin((Math.PI * i) / out.length), 1.5);
  return out;
}

function shutter(): Float32Array {
  const out = buffer(0.12);
  click(out, 0, 0.008, 1500, 1, 0.002);
  click(out, 0.045, 0.008, 1500, 0.8, 0.002);
  sine(out, () => 120, (t) => 0.25 * envelope(t, 0.001, 0.01));
  return out;
}

function ding(): Float32Array {
  const out = buffer(0.6);
  sine(out, () => 880, (t) => 0.6 * envelope(t, 0.003, 0.18));
  sine(out, () => 1320, (t) => 0.35 * envelope(t, 0.003, 0.12));
  return out;
}

function chime(): Float32Array {
  const out = buffer(1.05);
  [523.25, 659.25, 783.99].forEach((freq, i) => {
    sine(out, () => freq, (t) => envelope(t, 0.004, 0.3), i * 0.07);
    sine(out, () => freq * 2, (t) => 0.2 * envelope(t, 0.004, 0.15), i * 0.07);
  });
  return out;
}

/** A woody tock, a whole tone higher at each stamp. */
function stamp(n: number): Float32Array {
  const out = buffer(0.07);
  const freq = 220 * 2 ** (((n - 1) / 12) * 2);
  sine(out, () => freq, (t) => envelope(t, 0.001, 0.018));
  sine(out, () => freq * 2.76, (t) => 0.3 * envelope(t, 0.001, 0.01));
  click(out, 0, 0.003, 3000, 0.25, 0.001);
  return out;
}

const sounds: Record<string, Float32Array> = {
  punch: thump(0.22, 1, true),
  slam: thump(0.154, 1.3, false),
  whoosh: whoosh(),
  shutter: shutter(),
  ding: ding(),
  chime: chime(),
};
for (let n = 1; n <= 10; n++) sounds[`stamp-${n}`] = stamp(n);

const dir = path.join(process.cwd(), "public", "sfx");
mkdirSync(dir, { recursive: true });
const made: Record<string, Float32Array> = {};
for (const [name, samples] of Object.entries(sounds)) {
  made[name] = normalise(samples);
  writeFileSync(path.join(dir, `${name}.wav`), encodeWav(made[name], SR));
  console.log(`${name}.wav  peak ${peakDb(made[name]).toFixed(1)} dBFS  ${(made[name].length / SR).toFixed(3)}s`);
}

// The whole mix, as the render will sum it.
const mix = new Float32Array(Math.ceil((DURATION / FPS) * SR) + SR);
for (const cue of cues()) {
  const from = Math.round((cue.frame / FPS) * SR);
  made[cue.sound].forEach((sample, i) => (mix[from + i] += sample * cue.volume));
}
const mixPeak = peakDb(mix);
console.log(`the mix peaks at ${mixPeak.toFixed(1)} dBFS${mixPeak >= 0 ? ": IT CLIPS" : ""}`);
