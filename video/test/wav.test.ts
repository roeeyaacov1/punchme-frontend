import assert from "node:assert/strict";
import { test } from "node:test";
import { encodeWav, mulberry32, peakDb } from "../scripts/wav.ts";

const text = (bytes: Uint8Array, from: number, to: number) => new TextDecoder().decode(bytes.slice(from, to));

test("a 16-bit mono WAV with the right header", () => {
  const wav = encodeWav(new Float32Array([0, 0.5, -1, 2]), 48000);
  const view = new DataView(wav.buffer, wav.byteOffset, wav.byteLength);
  assert.equal(text(wav, 0, 4), "RIFF");
  assert.equal(text(wav, 8, 12), "WAVE");
  assert.equal(text(wav, 36, 40), "data");
  assert.equal(view.getUint16(22, true), 1);
  assert.equal(view.getUint32(24, true), 48000);
  assert.equal(view.getUint16(34, true), 16);
  assert.equal(view.getUint32(40, true), 8);
  assert.equal(wav.byteLength, 44 + 8);
});

test("samples are scaled to 16 bits and clamped at full scale", () => {
  const wav = encodeWav(new Float32Array([0, 0.5, -1, 2]), 48000);
  const view = new DataView(wav.buffer, wav.byteOffset, wav.byteLength);
  assert.equal(view.getInt16(44, true), 0);
  assert.equal(view.getInt16(46, true), 16384);
  assert.equal(view.getInt16(48, true), -32768);
  assert.equal(view.getInt16(50, true), 32767);
});

test("the peak in dBFS", () => {
  assert.ok(Math.abs(peakDb(new Float32Array([0.1, -0.5, 0.2])) + 6.02) < 0.01);
  assert.equal(peakDb(new Float32Array([1])), 0);
});

test("the noise is the same every run", () => {
  const a = mulberry32(7);
  const b = mulberry32(7);
  const first = [a(), a(), a()];
  assert.deepEqual(first, [b(), b(), b()]);
  assert.ok(first.every((x) => x >= 0 && x < 1));
});
