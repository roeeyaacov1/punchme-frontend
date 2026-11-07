/**
 * The video's sound, made here rather than licensed: `node scripts/sfx.ts`
 * writes 48 kHz mono WAVs into `public/sfx/` (committed) from a fixed seed,
 * so a rerun writes the same files: the effects, each peaking at -1 dBFS,
 * and the track (`music.wav`, from `music.ts`) at -8 dBFS. Then it mixes the
 * whole video, track and cues at their volumes, and prints the mix's peak,
 * which must stay under 0 dBFS.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { cues } from "../src/cues.ts";
import { DURATION } from "../src/timeline.ts";
import { music } from "./music.ts";
import { SR, addAt, bandpass, buffer, envelope, noise, noiseHit, normalise, sine } from "./synth.ts";
import { encodeWav, peakDb } from "./wav.ts";

const FPS = 30;

/** The die: a low thump falling 90 to 45 Hz, its knock an octave up, and the cut's sharp click. */
function thump(seconds: number, pitch: number, withClick: boolean): Float32Array {
  const out = buffer(seconds);
  const fall = (t: number) => pitch * 90 * Math.pow(0.5, Math.min(t, 0.12) / 0.12);
  sine(out, fall, (t) => envelope(t, 0.004, 0.045 * (seconds / 0.22)));
  sine(out, (t) => fall(t) * 2, (t) => 0.3 * envelope(t, 0.002, 0.018));
  if (withClick) addAt(out, noiseHit(0.015, 2000, 0.004), 0, 0.55);
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
  addAt(out, noiseHit(0.008, 1500, 0.002), 0);
  addAt(out, noiseHit(0.008, 1500, 0.002), 0.045, 0.8);
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
  addAt(out, noiseHit(0.003, 3000, 0.001), 0, 0.25);
  return out;
}

const effects: Record<string, Float32Array> = {
  punch: thump(0.22, 1, true),
  slam: thump(0.154, 1.3, false),
  whoosh: whoosh(),
  shutter: shutter(),
  ding: ding(),
  chime: chime(),
};
for (let n = 1; n <= 10; n++) effects[`stamp-${n}`] = stamp(n);

const dir = path.join(process.cwd(), "public", "sfx");
mkdirSync(dir, { recursive: true });
const made: Record<string, Float32Array> = {};
for (const [name, samples] of Object.entries(effects)) {
  made[name] = normalise(samples, -1);
  writeFileSync(path.join(dir, `${name}.wav`), encodeWav(made[name], SR));
  console.log(`${name}.wav  peak ${peakDb(made[name]).toFixed(1)} dBFS  ${(made[name].length / SR).toFixed(3)}s`);
}
const track = normalise(music(), -8);
writeFileSync(path.join(dir, "music.wav"), encodeWav(track, SR));
console.log(`music.wav  peak ${peakDb(track).toFixed(1)} dBFS  ${(track.length / SR).toFixed(2)}s`);

// The whole mix, as the render will sum it.
const mix = new Float32Array(track.length);
mix.set(track);
for (const cue of cues()) addAt(mix, made[cue.sound], cue.frame / FPS, cue.volume);
const peak = peakDb(mix.subarray(0, Math.round((DURATION / FPS) * SR) + SR));
console.log(`the mix peaks at ${peak.toFixed(1)} dBFS${peak >= 0 ? ": IT CLIPS" : ""}`);
