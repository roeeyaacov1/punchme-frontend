/**
 * The track the video is cut to, made here: 120 BPM in A minor, its kicks
 * the ones the picture pulses with (`src/beat.ts`). A half-time intro, a
 * groove with claps and an eighth-note bass, a build where the kick drops
 * out under a riser while the stamps land, the drop on "Card full", a pluck
 * over the drop, and a last hit as the card fills.
 */
import { BAR, BEAT, KICKS, grooveAt } from "../src/beat.ts";
import { DURATION, beatStart } from "../src/timeline.ts";
import { SR, addAt, bandpass, buffer, envelope, noise, noiseHit, sine } from "./synth.ts";

const FPS = 30;
const at = (frame: number) => frame / FPS;

/** A bar's root, A F C G round again: A minor's i–VI–III–VII. */
const ROOTS = [110, 87.31, 130.81, 98];
const rootAt = (frame: number) => ROOTS[Math.floor(frame / BAR) % ROOTS.length];

function kick(): Float32Array {
  const out = buffer(0.32);
  sine(out, (t) => 48 + 102 * Math.exp(-t / 0.03), (t) => envelope(t, 0.001, 0.16));
  addAt(out, noiseHit(0.006, 3000, 0.0015), 0, 0.35);
  return out;
}

function clap(): Float32Array {
  const out = buffer(0.2);
  for (const delay of [0, 0.011, 0.022]) {
    const burst = buffer(0.15);
    for (let i = 0; i < burst.length; i++) burst[i] = noise() * envelope(i / SR, 0.0005, delay === 0.022 ? 0.06 : 0.008);
    bandpass(burst, () => 1400, 0.9);
    addAt(out, burst, delay);
  }
  return out;
}

const hat = () => noiseHit(0.05, 7000, 0.012);

function bassNote(freq: number, length: number): Float32Array {
  const out = buffer(length + 0.05);
  const amp = (t: number) => envelope(t, 0.005, 0.11);
  sine(out, () => freq, amp);
  sine(out, () => freq * 2, (t) => 0.45 * amp(t));
  sine(out, () => freq * 3, (t) => 0.2 * amp(t));
  return out.map((x) => Math.tanh(1.6 * x));
}

function pluck(freq: number): Float32Array {
  const out = buffer(0.3);
  sine(out, () => freq, (t) => envelope(t, 0.002, 0.09));
  sine(out, () => freq * 2, (t) => 0.3 * envelope(t, 0.002, 0.04));
  return out;
}

function crash(): Float32Array {
  const out = noiseHit(1.4, 4500, 0.55);
  sine(out, () => 55, (t) => 0.8 * envelope(t, 0.003, 0.35));
  return out;
}

/** The whole track, 1.5 seconds longer than the video so its last hit rings out. */
export function music(): Float32Array {
  const out = buffer(DURATION / FPS + 1.5);
  const bass = buffer(out.length / SR);

  const kickSound = kick();
  for (const frame of KICKS) addAt(out, kickSound, at(frame), 1);

  const clapSound = clap();
  const eighth = BEAT / 2;
  for (let frame = 0; frame < DURATION; frame += eighth) {
    const part = grooveAt(frame);
    const beatInBar = Math.floor((frame % BAR) / BEAT);
    const onBeat = frame % BEAT === 0;
    if (part === "groove" && onBeat && beatInBar % 2 === 1) addAt(out, clapSound, at(frame), 0.55);
    if ((part === "groove" || part === "intro") && !onBeat) addAt(out, hat(), at(frame), part === "intro" ? 0.18 : 0.28);
    // Bass on every eighth, root with octave and fifth jumps, but not under the riser.
    const riser = part === "build" && frame >= beatStart("reward") - BAR;
    if (part !== "outro" && !riser) {
      const step = Math.round((frame % BAR) / eighth);
      const lift = [1, 1, 2, 1, 1, 1, 2, 1.5][step];
      addAt(bass, bassNote(rootAt(frame) * lift, 0.22), at(frame));
    }
  }

  // The build: sixteenth hats rising, and a riser of noise sweeping up into the drop.
  const build = beatStart("stamps");
  const drop = beatStart("reward");
  for (let frame = build; frame < drop; frame += BEAT / 4) addAt(out, hat(), at(frame), 0.08 + 0.3 * ((frame - build) / (drop - build)));
  const riserLength = at(BAR);
  const riser = buffer(riserLength);
  for (let i = 0; i < riser.length; i++) riser[i] = noise();
  bandpass(riser, (t) => 500 * Math.pow(7000 / 500, t / riserLength), 1.2);
  for (let i = 0; i < riser.length; i++) riser[i] *= ((i / riser.length) ** 2) * 1.6;
  addAt(out, riser, at(drop - BAR));

  // The drop, and the card full: a crash and a sub boom.
  addAt(out, crash(), at(drop), 0.6);
  const full = beatStart("end") + BAR;
  addAt(out, crash(), at(full), 0.6);
  addAt(bass, bassNote(ROOTS[0], 1.4).map((x, i) => x * Math.exp(-i / SR / 0.6)), at(full));

  // A pluck over the drop: A minor's pentatonic on the offbeats.
  const notes = [440, 523.25, 659.25, 783.99, 659.25, 523.25, 587.33, 523.25];
  for (let frame = drop; frame < beatStart("end"); frame += eighth) {
    const step = Math.round((frame - drop) / eighth);
    if (step % 2 === 1) addAt(out, pluck(notes[(step >> 1) % notes.length]), at(frame), 0.22);
  }

  // The bass ducks under each kick, so the kick stays clear.
  const duck = new Float32Array(bass.length).fill(1);
  for (const frame of KICKS) {
    const from = Math.round(at(frame) * SR);
    for (let i = 0; i < 0.16 * SR && from + i < duck.length; i++) duck[from + i] = Math.min(duck[from + i], 1 - 0.75 * Math.exp(-i / SR / 0.06));
  }
  for (let i = 0; i < out.length; i++) out[i] += bass[i] * duck[i] * 0.5;
  return out;
}
