/**
 * A burst of stamp confetti: small discs in gold and coral, thrown out from
 * a point, spinning, falling, gone in 36 frames. The same burst every render
 * (a fixed seed). Pure: `test/confetti.test.ts`.
 */

export interface Bit {
  x: number;
  y: number;
  size: number;
  rotate: number;
  opacity: number;
  gold: boolean;
}

const COUNT = 32;
const LIFE = 36;
const GRAVITY = 2.2;

function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function confetti(frame: number, at: number, origin: { x: number; y: number }, seed = 11): Bit[] {
  const t = frame - at;
  if (t < 0 || t >= LIFE) return [];
  const random = seeded(seed);
  return Array.from({ length: COUNT }, (_, i) => {
    const angle = (i / COUNT) * 2 * Math.PI + random() * 0.5;
    const speed = 26 + random() * 30;
    const drag = (1 - 0.9 ** t) / (1 - 0.9);
    const size = 22 + random() * 30;
    const spin = (random() - 0.5) * 40;
    return {
      x: origin.x + Math.cos(angle) * speed * drag,
      y: origin.y + Math.sin(angle) * speed * drag + 0.5 * GRAVITY * t * t,
      size,
      rotate: spin * t,
      opacity: t < LIFE - 10 ? 1 : (LIFE - t) / 10,
      gold: i % 3 !== 0,
    };
  });
}
