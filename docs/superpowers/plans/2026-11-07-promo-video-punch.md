# The punched promo: implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the 43.5s promo in `video/` with a 30-second punch-through cut that shows the new styled cards, with synthesized sound, in Hebrew and English.

**Architecture:** Pure timing and geometry (`timeline.ts`, `punch.ts`, `stamping.ts`, `cues.ts`) decide every frame and are tested with `node --test`. React scenes read them and stage the app's real components. Two Node scripts produce the committed assets: the wallet's drawings (`scripts/looks.ts`) and the sounds (`scripts/sfx.ts`).

**Tech Stack:** Remotion 4.0.538, React 18.3.1, Tailwind 3.4 through `@remotion/tailwind`, i18next, Node 24 (runs the `.ts` scripts and tests as they are).

**Spec:** `docs/superpowers/specs/2026-11-07-promo-video-punch-design.md`

## Global Constraints

- 1080 × 1920, 30 fps, `DURATION` 900 frames (30.0s); compositions `PromoHe` and `PromoEn`.
- Safe area: words 80px from the sides, 220px from the top, 320px from the bottom (`SAFE` in `pieces.tsx`).
- Words go through `t()`: the app's keys (`common`) where the words are the app's, the video's own in `video/src/locales/{en,he}.json` (`video` namespace), both languages at once.
- Coral `#f67748` only as a fill with ink on it; gold only for the reward; text in ink. Rubik 700/500, Assistant 600/400; Roboto only inside the Google pass.
- `AppleCardPreview`, `GoogleCardPreview`, `StandeeSheet`, `SampleAnswer`, `WallpaperStage` are imported from `../../src` and never copied or edited. Nothing under `src/` changes.
- Every movement is a function of the frame; `video.css` keeps freezing the components' own CSS motion.
- Horizontal motion mirrors in Hebrew (`useHebrew()`).
- No new dependency in either `package.json`.
- The 6x figure only with `landing.proof` source line on screen for the whole beat; ₪99 from `PUNCHME_MONTHLY_PRICE`; the join's second line follows `SMS_CODE`.

## Review Focus

1. **A pass image not decoded when a frame is captured.** `AppleCardPreview` draws the strip with a plain `<img>`, so a render can catch it blank. Expected: no frame ever shows a pass without its strip. Task 4's `useImagesReady` holds the frame; Task 9 checks stills at stamp-change frames.
2. **Hebrew mirroring.** Expected: the strip fills right to left, discs arc to the right-hand slots, the carousel spins the other way, and nothing reads left to right except figures, the price and the address (`Ltr`). Task 2's test pins `slotCenter` for both directions.
3. **Two sounds on one frame, or a cue past the end.** Expected: each cue on its own frame inside [0, 900). Task 3's test pins it.
4. **The drawing's request drifting from what the wizard asks.** Expected: the count-5 strip the script draws equals the look's published picture. Task 5's self-check reports it.
5. **A clipped mix.** Expected: every file's peak at or below -1 dBFS, and the loudest overlap (punch over whoosh) below 0. Task 6's script prints both.

---

### Task 1: Clear the old cut and set up tests

**Files:**
- Delete: `video/src/scenes/` (all), `video/voiceover.md`
- Modify: `video/package.json` (add `"test": "node --test test/"`), `video/src/locales/en.json`, `video/src/locales/he.json` (emptied to `{}`), `video/tsconfig.json` (include `test/` and `scripts/`)
- Create: `video/test/smoke.test.ts`

- [ ] **Step 1:** Delete the old scenes and `voiceover.md`; reduce `Promo.tsx` to the wall and `FontGate` with no beats, so the project still type-checks.
- [ ] **Step 2:** Write `test/smoke.test.ts` asserting `1 + 1 === 2` with `node:test` and `node:assert/strict`.
- [ ] **Step 3:** Run `npm test` in `video/`. Expected: 1 pass.
- [ ] **Step 4:** Run `npm run typecheck` in `video/`. Expected: no errors.
- [ ] **Step 5:** Commit: `video: clear the old cut for the punched one`.

### Task 2: The timeline and the punch

**Files:**
- Rewrite: `video/src/motion.ts` (keep `FPS`, `WIDTH`, `HEIGHT`, `ms`, `sec`, `EASE_OUT`, `OVERSHOOT`, `IN_OUT`, `progress`; drop the old beat context and places)
- Create: `video/src/timeline.ts`, `video/src/punch.ts`
- Test: `video/test/timeline.test.ts`, `video/test/punch.test.ts`

**Interfaces:**
- Produces, `timeline.ts`:
  - `type BeatId = "hook" | "promise" | "join" | "looks" | "stamps" | "reward" | "winback" | "proof" | "price" | "end"`
  - `BEATS: readonly { id: BeatId; length: number }[]`, with lengths in frames 78, 72, 96, 90, 108, 66, 96, 102, 90, 102
  - `DURATION = 900`; `beatStart(id: BeatId): number`; `beatAt(frame: number): BeatId`
  - `PUNCH = { press: 3, open: 12, flight: 14, openDelay: 3 }` (frames)
  - `interface PunchAt { at: number; cx: number; cy: number; slot: number }` and `PUNCHES: PunchAt[]`, one per boundary (`at` = the next beat's start, `slot` 0–8), each with the point the beat's action ends on (scenes set these through `PUNCH_POINTS: Record<Exclude<BeatId, "hook">, { cx: number; cy: number }>`, keyed by the incoming beat)
  - `FINAL_STAMP = beatStart("end") + 30` (slot 9)
- Produces, `punch.ts`:
  - `DIE_R = 130`; `SLOT = { size: 64, gap: 22, y: 140 }`
  - `slotCenter(i: number, rtl: boolean): { x: number; y: number }`
  - `holeRadius(frame: number, p: PunchAt): number`: 0 before `at`; `DIE_R` from `at` to `at + openDelay`; then to the distance to the farthest frame corner plus 40, over `open` frames on `IN_OUT`
  - `pressScale(frame: number, p: PunchAt): number`: 1 to 0.985 over the `press` frames before `at`, 1 otherwise
  - `shake(frame: number): { x: number; y: number }`: summed over `PUNCHES`; offsets `[14, -9, 4]` px on x and `[-8, 6, -2]` on y for frames `at`, `at+1`, `at+2`; 0 elsewhere
  - `discFlight(frame: number, p: PunchAt, rtl: boolean): { x: number; y: number; scale: number; rotate: number } | null`: null before `at` and from `at + flight`; between them a quadratic Bézier from `(cx, cy)` to `slotCenter(p.slot, rtl)` with the control point at the midpoint's x and `min(cy, slot.y) - 260`, on `EASE_OUT`; `scale` from 1 to `SLOT.size / (2 * DIE_R)`; `rotate` from 0 to 200° (−200° when `rtl`)
  - `stampsLanded(frame: number): number`: the punches whose `at + flight <= frame`, plus 1 from `FINAL_STAMP + PUNCH.flight`

- [ ] **Step 1: Write the failing tests**

```ts
// timeline.test.ts
assert.equal(BEATS.reduce((s, b) => s + b.length, 0), 900);
assert.equal(beatStart("join"), 150);
assert.equal(beatStart("end"), 798);
assert.equal(beatAt(149), "promise");
assert.equal(PUNCHES.length, 9);
assert.deepEqual(PUNCHES.map((p) => p.slot), [0, 1, 2, 3, 4, 5, 6, 7, 8]);
// punch.test.ts
assert.deepEqual(slotCenter(0, false), { x: 153, y: 140 });
assert.deepEqual(slotCenter(0, true), { x: 927, y: 140 });
assert.equal(holeRadius(PUNCHES[0].at - 1, PUNCHES[0]), 0);
assert.equal(holeRadius(PUNCHES[0].at, PUNCHES[0]), 130);
assert.ok(holeRadius(PUNCHES[0].at + 15, PUNCHES[0]) >= Math.hypot(1080, 1920) / 2);
assert.deepEqual(shake(PUNCHES[0].at), { x: 14, y: -8 });
assert.deepEqual(shake(PUNCHES[0].at + 3), { x: 0, y: 0 });
assert.equal(discFlight(PUNCHES[0].at + 14, PUNCHES[0], false), null);
assert.equal(stampsLanded(0), 0);
assert.equal(stampsLanded(DURATION - 1), 10);
```

- [ ] **Step 2:** Run `npm test`. Expected: FAIL, modules not found.
- [ ] **Step 3:** Implement `timeline.ts` and `punch.ts` with the interfaces above; slot 0 is the first in reading order (the 10 slots span 838px, centred).
- [ ] **Step 4:** Run `npm test`. Expected: PASS.
- [ ] **Step 5:** Commit: `video: the beats' timeline and the punch's geometry`.

### Task 3: Stamping times and the sound cues

**Files:**
- Create: `video/src/stamping.ts`, `video/src/cues.ts`
- Test: `video/test/stamping.test.ts`, `video/test/cues.test.ts`

**Interfaces:**
- Consumes: `beatStart`, `PUNCHES`, `PUNCH`, `FINAL_STAMP`, `DURATION` (Task 2).
- Produces:
  - `stampTimes(start: number, count: number, firstMs = 300, lastMs = 90): number[]`: frames of each stamp; gap i of `count - 1` is `firstMs * (lastMs / firstMs) ** (i / (count - 2))`, accumulated unrounded and each time rounded; strictly increasing
  - `STAMPS_FROM = beatStart("stamps") + 30`; `HERO_STAMPS = stampTimes(STAMPS_FROM, 10)`
  - `type Sound = "punch" | "slam" | "whoosh" | "shutter" | "ding" | "chime" | `stamp-${1|2|3|4|5|6|7|8|9|10}``
  - `interface Cue { frame: number; sound: Sound; volume: number }`
  - `SLAMS: Partial<Record<BeatId, number[]>>`: the frames, from each beat's start, at which its words land (scenes read the same table)
  - `cues(): Cue[]`: punch at every `PUNCHES[i].at` and at `FINAL_STAMP`; whoosh at `at + PUNCH.openDelay`; slam at every `SLAMS` frame; `stamp-n` at `HERO_STAMPS[n-1]`; shutter at each scan's flash; ding when the win-back message lands; chime at the reward and at `FINAL_STAMP + PUNCH.flight`. Sorted; a cue landing on a taken frame moves to the next free one.

- [ ] **Step 1: Write the failing tests**

```ts
const s = stampTimes(0, 10);
assert.equal(s.length, 10);
assert.ok(s.every((f, i) => i === 0 || f > s[i - 1]));
assert.equal(s[1] - s[0], 9);            // 300ms
assert.ok(s[9] - s[8] <= 3);             // about 90ms
assert.ok(HERO_STAMPS[9] < beatStart("reward"));
const c = cues();
assert.equal(new Set(c.map((x) => x.frame)).size, c.length);
assert.ok(c.every((x) => x.frame >= 0 && x.frame < DURATION));
assert.equal(c.filter((x) => x.sound === "punch").length, 10);
assert.ok(c.every((x) => x.volume > 0 && x.volume <= 1));
```

- [ ] **Step 2:** Run `npm test`. Expected: FAIL.
- [ ] **Step 3:** Implement `stamping.ts` and `cues.ts`. Volumes: punch 0.9, slam 0.55, whoosh 0.35, stamp-n 0.6, shutter 0.5, ding 0.6, chime 0.7.
- [ ] **Step 4:** Run `npm test`. Expected: PASS.
- [ ] **Step 5:** Commit: `video: when the stamps land and what the video sounds like when`.

### Task 4: The stage pieces

**Files:**
- Create: `video/src/stage/Wall.tsx`, `video/src/stage/Strip.tsx`, `video/src/stage/Punched.tsx`, `video/src/stage/Slam.tsx`, `video/src/stage/Tilt.tsx`, `video/src/stage/useImagesReady.ts`, `video/src/stage/Sounds.tsx`
- Modify: `video/src/pieces.tsx` (keep `SAFE`, `useHebrew`, `FontGate`, `Scaled`, `Tag`, `Logo`, `Ltr`, `Stack`, `Lead`; drop what used the old beat context: `Say`, `Card`)
- Rewrite: `video/src/Promo.tsx`

**Interfaces:**
- Consumes: Tasks 2–3.
- Produces:
  - `<Wall />`: the warm wall (`bg-background`), a soft vignette, and five faint stamp circles (ink at 4% opacity, radii 180–420px) drifting 0.15px per frame, the other way in Hebrew
  - `<Strip />`: the ten slots at `slotCenter`, empty as 4px `border-strong` rings, landed ones coral discs; from `FINAL_STAMP + PUNCH.flight` the whole strip turns gold over 8 frames; it hands over to the end beat, which reads `stripRect(): { x: number; y: number; w: number; h: number }`
  - `<Punched beat={id}>`: wraps a beat; applies `pressScale` toward its punch point before its outro, and clips the incoming beat to `circle(holeRadius px at cx cy)` from its `at`; the outgoing beat stays mounted until its successor's hole covers the frame
  - `<Disc />`: draws every `discFlight` in flight as a coral disc with a 6px ink ring
  - `<Slam text at size? weight? />`: a word or short line landing at frame `at` (beat-relative): scale 1.35 to 1 over 5 frames on `OVERSHOOT`, opacity 0 to 1 over 2 frames, a shake of ±6px over 2 frames; Rubik 700, ink, default 136px
  - `<Tilt from={{ ry, rx, z }} at settle={18}>`: a perspective box (1600px) whose child swings from `from` to flat over `settle` frames on `OVERSHOOT`, then sways ±2.5° on y with a 90-frame period
  - `useImagesReady(ref)`: after every render, a `delayRender` until every `<img>` inside `ref` is `complete` with a `naturalWidth`, so no frame is taken with a strip missing
  - `<Sounds />`: one `<Html5Audio>` from `remotion` per `cues()` entry, in a `<Sequence from={frame}>`, `src={staticFile(`sfx/${sound}.wav`)}`
  - `Promo` renders `Wall`, the beats through `Punched`, then `Strip`, `Disc`, `Sounds`, all inside a box translated by `shake(frame)`

- [ ] **Step 1:** Build the pieces with stub beats (each a big beat-id label), so the punches, the strip and the discs run end to end.
- [ ] **Step 2:** Run `npm run typecheck`. Expected: no errors.
- [ ] **Step 3:** Render stills at `PUNCHES[0].at - 2`, `at`, `at + 1`, `at + 6`, `at + 13`, and frame 899, in both languages: `npx remotion still PromoEn out/check/en-<f>.png --frame=<f>`. Expected, by eye: the scene giving, the hole at 260px, the shake, the hole opening, the disc arriving at slot 0 (left in English, right in Hebrew), a full gold strip.
- [ ] **Step 4:** Commit: `video: the wall, the punch, the strip and the slam`.

### Task 5: The wallet's drawings of the looks

**Files:**
- Create: `video/scripts/looks.ts`, `video/scripts/drawBody.ts`, `video/src/looks.ts`
- Create (output, committed): `video/public/looks/catalog.json`, `video/public/looks/<id>-strip.png`, `video/public/looks/<id>-hero.png` for the eight, `video/public/looks/gold/strip-<n>.png` and `gold/hero-<n>.png` for n = 0–10
- Test: `video/test/drawBody.test.ts`

**Interfaces:**
- Produces, `scripts/drawBody.ts`: `drawBodyFor(preset: CatalogPreset, stamps: number, role: "strip@2x" | "hero"): LookDraw`, mapping `background_color`, `foreground_color`, `label_color`, `design.stamp.color` to `stamp`, `options.panel_color || null` to `panel`, `options.style`, `options.sticker || null`, `design.stamp.glyph` (`"check"` if missing), `options.tint`, `options.wallpaper || null`, `design.pattern ?? "none"`, `stamps_required`.
- Produces, `src/looks.ts`:
  - `CATALOG: Preset[]` (from `catalog.json`, `pictures` pointing at `staticFile` paths)
  - `HERO_ID = "barber-gold-scissors"`
  - `lookPass(preset: Preset, stamps: number | "own", t: TFunction, lang: Lang): CardPreviewValue`: the app's `lookPreview(preset, { ...emptyDraft(), niche: preset.niche, name: t("landing.templates.items.barber.business") }, CATALOG, lang, t)`, with `holderName: t("studio.sampleName")`; for a number, `currentStamps` and `stripStates`/`heroStates` set to the hero's `gold/*-<n>.png` (hero only)
- Script: `node scripts/looks.ts [--api http://localhost:8001]`: `GET /api/presets`, keep the styled ones with `pictures`, download each picture, then `POST /api/presets/draw` for the hero at 0–10 in both roles, 1.2s apart, waiting 10s and retrying up to 3 times on a 429. It then draws the hero at `pictureStamps(10) = 5` and prints whether it byte-matches the published strip.

- [ ] **Step 1: Write the failing test**

```ts
assert.deepEqual(drawBodyFor(GOLD_FIXTURE, 3, "strip@2x"), {
  background: "#0E1120", foreground: "#FFFFFF", label: "#C88A11", stamp: "#C88A11",
  panel: "#1A1F38", style: "badge", sticker: "scissors", glyph: "scissors", tint: false,
  wallpaper: "sparkles", pattern: "none", stamps_required: 10, stamps: 3, role: "strip@2x",
});
```

(`GOLD_FIXTURE` is the `barber-gold-scissors` entry of `GET /api/presets`, copied into the test.)

- [ ] **Step 2:** Run `npm test`. Expected: FAIL.
- [ ] **Step 3:** Implement `drawBody.ts`, the script and `src/looks.ts`.
- [ ] **Step 4:** Run `npm test`. Expected: PASS. Run `node scripts/looks.ts`. Expected: 16 look pictures, 22 hero drawings, and "count 5 matches the published strip" (if it reports a mismatch, view both and say what differs before going on).
- [ ] **Step 5:** Commit: `video: the wallet's own drawings of the new looks`.

### Task 6: The sounds

**Files:**
- Create: `video/scripts/wav.ts`, `video/scripts/sfx.ts`
- Create (output, committed): `video/public/sfx/{punch,slam,whoosh,shutter,ding,chime}.wav`, `video/public/sfx/stamp-{1..10}.wav`
- Test: `video/test/wav.test.ts`

**Interfaces:**
- Produces, `wav.ts`: `encodeWav(samples: Float32Array, sampleRate: number): Uint8Array` (PCM 16-bit mono, samples clamped to ±1); `peakDb(samples: Float32Array): number`; `mulberry32(seed: number): () => number`
- `sfx.ts` writes the files at 48 kHz from seed 7, normalised to a −1 dBFS peak, and prints each one's peak and the punch-over-whoosh sum's peak:
  - punch: sine falling 90 to 45 Hz over 120ms with a 4ms attack and exponential decay, plus a 15ms noise click high-passed (one-pole, 2 kHz)
  - slam: the same thump at 70% length and 1.3× pitch, no click
  - whoosh: 380ms of noise through a band-pass sweeping 600 Hz to 3 kHz, a sine-shaped envelope
  - shutter: two 8ms noise clicks 45ms apart
  - ding: 880 Hz and 1320 Hz sines, 600ms, exponential decay
  - chime: sines at 523, 659, 784 Hz, entering 70ms apart, each 900ms decaying
  - stamp-n: a 70ms woody tock (sine at `220 * 2 ** ((n - 1) / 12 * 2)` Hz, plus its 2.76× partial at 30%), so ten rising whole tones

- [ ] **Step 1: Write the failing test**

```ts
const wav = encodeWav(new Float32Array([0, 0.5, -1, 2]), 48000);
assert.equal(new TextDecoder().decode(wav.slice(0, 4)), "RIFF");
assert.equal(new TextDecoder().decode(wav.slice(8, 12)), "WAVE");
assert.equal(new DataView(wav.buffer).getUint32(24, true), 48000);
assert.equal(new DataView(wav.buffer).getUint32(40, true), 8);
assert.equal(new DataView(wav.buffer).getInt16(50, true), 32767);   // clamped
assert.ok(Math.abs(peakDb(new Float32Array([0.5])) + 6.02) < 0.01);
```

- [ ] **Step 2:** Run `npm test`. Expected: FAIL.
- [ ] **Step 3:** Implement `wav.ts` and `sfx.ts`.
- [ ] **Step 4:** Run `npm test` (PASS), then `node scripts/sfx.ts`. Expected: 16 files, each peak −1.0 dBFS, the overlap sum under 0 dBFS.
- [ ] **Step 5:** Commit: `video: the sounds, made by a script`.

### Task 7: Beats 1–4: hook, promise, join, looks

**Files:**
- Create: `video/src/scenes/Hook.tsx`, `Promise.tsx`, `Join.tsx`, `Looks.tsx`, `video/src/stage/LookCard.tsx`
- Modify: `video/src/locales/{en,he}.json`, `video/src/Promo.tsx` (stubs replaced), `video/src/timeline.ts` (`PUNCH_POINTS` for these beats' ends)

**Interfaces:**
- Consumes: Tasks 2–5.
- Produces: `<LookCard preset stamps platform at={{ cx, top, s }} />` (`Scaled` around the pass at 300px, `useImagesReady` on it), used by the later beats too.

Words (`video` namespace; English / Hebrew):
- `hook.line1` "Your punch card," / "הכרטיסייה שלכם,"; `hook.line2` "in Wallet." / "בארנק."
- `promise.app` "No app." / "בלי אפליקציה."; `promise.account` "No account." / "בלי חשבון."; `promise.password` "No password." / "בלי סיסמה."
- `join.scan` "Scan the sign." / "סורקים את השילוט."; `join.code` "A mobile number and a code from a text." / "מספר נייד וקוד מ-⁠SMS."; `join.codeOff` "A mobile number." / "מספר נייד."
- `looks.line1` "Your card." / "הכרטיסייה שלכם."; `looks.line2` "Your look." / "בעיצוב שלכם."

Motion:
- Hook: the two lines slam (`SLAMS.hook`); the hero pass at 3 stamps swings in under them (`Tilt from={{ ry: -75, rx: 12, z: -400 }}`) at 1.9×.
- Promise: three lines slam a beat apart, each with a small 0.4-scale punch ring behind it.
- Join: the `StandeeSheet` from `sampleSign(tradeTemplate("barber"), t, true)` swings in. Corner brackets (four L-shapes, ink, 10px) close on its code over 10 frames. Then a white flash (opacity 0.8 to 0 over 6 frames, the shutter cue). The pass at 0 stamps rises out of the code, and Google's slides out from behind Apple's, fanned ±6° with the Tag labels "Apple Wallet" and "Google Wallet" (`video:join.apple` / `join.google`; the same words in Hebrew).
- Looks: the eight passes (`stamps: "own"`) on a ring of radius 900px in a perspective box. The ring turns 540° plus the angle that brings the hero to the front, over 70 frames on `EASE_OUT`, with blur `min(8, speed * 0.6)` px and the whoosh cue. The other way in Hebrew.

- [ ] **Step 1:** Add the words to both locale files and build the four scenes.
- [ ] **Step 2:** Run `npm run typecheck`. Expected: clean.
- [ ] **Step 3:** Render stills of each beat's settled frame and one frame mid-motion, both languages (`npm run stills hook promise join looks`). Expected: words inside the safe area, nothing cut, the passes whole with their strips, Hebrew mirrored.
- [ ] **Step 4:** Commit: `video: the hook, the promise, the join and the looks`.

### Task 8: Beats 5–10: stamps, reward, win-back, proof, price, end

**Files:**
- Create: `video/src/scenes/Stamps.tsx`, `Reward.tsx`, `Winback.tsx`, `Proof.tsx`, `Price.tsx`, `End.tsx`
- Modify: `video/src/locales/{en,he}.json`, `video/src/Promo.tsx`, `video/src/timeline.ts` (`PUNCH_POINTS` for these beats)

Words:
- `stamps.line` "Every visit, a stamp." / "כל ביקור, חותמת."
- `reward.line1` "Card full." / "הכרטיסייה מלאה."; `reward.line2` "Reward ready." / "ההטבה מחכה."
- `winback.line` "Then it reminds them to come back." / "ואז היא מזכירה להם לחזור."; `winback.badge` "Sample · iPhone" / "דוגמה · אייפון"
- `price.free` "Free to design. You pay once customers can join." / "העיצוב בחינם. משלמים רק מהרגע שלקוחות יכולים להצטרף."
- Proof, price and end take the app's keys: `landing.proof.stats` (the 6x item, its claim and its source), `landing.pricing` (the price line with `PUNCHME_MONTHLY_PRICE`), `landing.hero.cta`, and `video:end.site` "punchmeapp.com".

Motion:
- Stamps: the hero pass at 1.9× with corner brackets locking on its code, a flash (shutter), then `HERO_STAMPS`. At each stamp the pass swaps to the next drawing, a coral ring (8px) grows from the newest stamp's place over 6 frames and fades, and the card kicks to 1.03 and back over 4 frames.
- Reward: `SampleAnswer` in its "card full" state at the scan's size, bursting from 0.6 to 1 on `OVERSHOOT` (chime), its gold fill carrying ink.
- Win-back: `WallpaperStage` as a lock screen with the hero pass at 0 stamps. The sample message (`landing.after.message`) drops in from above (ding), and the pass then swaps to 1 stamp. The `winback.badge` Tag stays on the stage.
- Proof: "6x" (`Ltr`) slammed at 300px in Rubik 700, the claim under it in Assistant 600 at 54px, and the source line at 40px, all from the beat's first lit frame to its last.
- Price: the price panel (`LitPanel` from the kit, or the old price scene's panel rebuilt with kit classes) switching on in 600ms, `price.free` under it.
- End: the logo lands, the strip's tenth stamp lands (`FINAL_STAMP`), the strip turns gold, then over 14 frames on `IN_OUT` it travels from `stripRect()` to the "Start free" button's box and becomes it (coral fill, ink label), with `punchmeapp.com` under it.

- [ ] **Step 1:** Add the words and build the six scenes.
- [ ] **Step 2:** Run `npm run typecheck`. Expected: clean.
- [ ] **Step 3:** `npm run stills stamps reward winback proof price end`, both languages, plus frames at `HERO_STAMPS[0..9]`. Expected: each stamp frame shows the pass with its strip at that count; the source on screen with 6x; the button's label legible; nothing outside the safe area.
- [ ] **Step 4:** Commit: `video: the stamps, the reward, the win-back, the proof, the price and the end`.

### Task 9: Render, check and write it up

**Files:**
- Modify: `video/scripts/stills.ts` (`SETTLED` per new beat id), `video/README.md`, `video/message.md`, `video/remotion.config.ts` (audio codec AAC if not the default)

- [ ] **Step 1:** Run `npm run render:he` and `npm run render:en`.
- [ ] **Step 2:** Run `npx remotion ffprobe out/punchme-promo-he.mp4` (and en). Expected: h264, yuv420p, bt709, an aac stream, duration 30.0s, size under 16 MB.
- [ ] **Step 3:** Extract frames at 0.5s steps (`npx remotion ffmpeg -i out/punchme-promo-he.mp4 -vf fps=2 out/check/he-%03d.png`) and look at every punch: the hole, the shake, the disc reaching its slot. Also check every stamp frame in both languages.
- [ ] **Step 4:** Rewrite the README (how to run it, the scripts, the figure and its source, the licence note, the rules it keeps) and `message.md` (the WhatsApp message, with the Square caveat and link).
- [ ] **Step 5:** From the root: `npm run lint`. Expected: clean (the video folder is ignored).
- [ ] **Step 6:** Commit: `video: the README and the message follow the punched cut`.
