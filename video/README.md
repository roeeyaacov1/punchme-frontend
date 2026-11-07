# The PunchMe promo video

A 30-second vertical video (1080 × 1920, 30 fps) for Roee to send to
business owners on WhatsApp and post to Stories, in Hebrew (`PromoHe`) and
English (`PromoEn`), rendered by [Remotion](https://www.remotion.dev) from
the app's own components and copy, with sound effects made by a script.
Every word is on screen, so it works on mute. `message.md` has the message
to send with it.

The design, agreed on 7 Nov 2026, is
`docs/superpowers/specs/2026-11-07-promo-video-punch-design.md`, and the
build plan is beside it in `docs/superpowers/plans/`.

## The idea

**The video is a punch card.** Ten empty slots sit across the top. Every
beat ends with a punch: a round die presses into the frame, the camera
jolts, the next beat shows through the hole, and the hole opens out while
the camera goes through it. The punched-out disc arcs up into the next
slot. The tenth is punched on the end card: the card is full, the strip
turns gold (the reward) and comes down into the hole it left as the
"Start free" button.

| # | Beat | Says | Ground |
|---|---|---|---|
| 1 | hook | Your punch card, in Wallet. The hero pass swings in in 3D | wall |
| 2 | promise | No app. No account. No password. A hole punched beside each | coral |
| 3 | join | Scan the sign. A mobile number and a code from a text. The standee's sign, the camera's corners, the flash, the pass out of the code into Apple and Google Wallet | wall |
| 4 | looks | Your card. Your look. The eight published styled looks on a ring that spins onto the hero | panel |
| 5 | stamps | Every visit, a stamp. Ten stamps, faster and faster, each the wallet's own drawing | wall |
| 6 | reward | Card full. Reward ready. The scan's own "Card full!" answer | dark band |
| 7 | winback | Then it reminds them to come back. The kit's lock screen, marked "Sample · iPhone", the win-back message and its free stamp | wall |
| 8 | proof | 6x, its claim and its source | panel |
| 9 | price | ₪99 a month, including VAT. Free to design. You pay once customers can join. | wall |
| 10 | end | The logo, the tenth stamp, Start free, punchmeapp.com | wall |

## Run it

The video imports the app's components from `../src`, and they bring their
own packages from the root's `node_modules`, so install both:

```bash
npm install
```

```bash
cd video && npm install
```

Then, from `video/`:

| | |
|---|---|
| `npm run studio` | Preview both compositions, and the contact sheet, in the browser, frame by frame |
| `npm run render:he`, `npm run render:en` | Render `out/punchme-promo-he.mp4` and `out/punchme-promo-en.mp4` |
| `npx remotion still PromoHe out/punchme-promo-he-poster.png --frame=60` | A poster (the same for `PromoEn`): the hook with its pass. Frame 0 is the opening line, so a thumbnail made from the first frame is never an empty wall |
| `npm run stills` | A still of every beat at its settled frame, both languages, into `out/stills/` (`--lang he`, beat ids, or `--frames 150,412` to narrow it) |
| `npm run stills -- --sheet 75,78,84,91 --cols 4 --name punch` | One contact sheet of those frames at a quarter size, per language: the quickest way to check motion |
| `npm test` | The timing, the punch's geometry, the stamps, the sound cues, the drawing's request and the WAV writer (`node --test`) |
| `npm run typecheck` | TypeScript over the video and the app files it imports |
| `npx remotion ffprobe out/punchme-promo-he.mp4` | Check the codec, the pixel format, the audio and the length |

`out/` is git-ignored. The MP4s are H.264 in yuv420p tagged BT.709 with an
AAC track (`remotion.config.ts`), and should stay under 16 MB each so
WhatsApp sends them as they are.

## The assets, and the scripts that make them

Both are committed, so a render needs neither the backend nor a rerun.

- **`public/looks/`: the new card looks, as the wallet draws them.**
  `node scripts/looks.ts [--api http://localhost:8001]` asks the backend's
  public endpoints the onboarding wizard uses (`GET /api/presets` and
  `POST /api/presets/draw`) for every published styled look's own pictures
  and for the hero look, `barber-gold-scissors`, at every count from 0 to
  10, Apple's strip and Google's hero. It needs a backend whose wallet draws
  the design options (on 7 Nov 2026 that was the local looks stack, backend
  on 8001 and passbox on 8002). `scripts/drawBody.ts` builds the request as
  the wizard does, and the script checks it: the drawing at count 5 must be
  byte for byte the look's published picture.
- **`public/sfx/`: the sounds.** `node scripts/sfx.ts` synthesizes them from
  a fixed seed (a punch, a slam for words, a whoosh, a shutter, a ding, a
  chime and ten stamps a whole tone apart), each peaking at -1 dBFS, then
  mixes the whole video from the cues and prints the mix's peak. It stood at
  -3.0 dBFS on 7 Nov 2026; under 0 is the rule.

## How it is made

- **Every frame is decided by pure functions**, tested with `node --test`:
  `src/timeline.ts` (the beats, the punch's timing and points),
  `src/punch.ts` (the hole, the shake, the disc's flight, the strip's
  slots), `src/stamping.ts` (the run of stamps, its gaps shrinking from
  300ms to 90ms), `src/cues.ts` (every sound on its own frame). The scenes
  in `src/scenes/` and the stage pieces in `src/stage/` only read them.
- **The real pieces.** `AppleCardPreview` and `GoogleCardPreview` made from
  a look exactly as the wizard makes them (`lookPreview` in
  `src/routes/onboarding/looks.ts`), the wallet's drawings as their strips;
  the standee's `StandeeSheet`; the landing page's `SampleAnswer`; the
  kit's `WallpaperStage`. Nothing under `src/` is changed. The passes are
  scaled, tilted and moved as a whole, never redrawn; their pictures are
  plain `<img>`s, so `useImagesReady` holds each frame until they are in.
- **The words.** The app's locale files, read straight from
  `src/i18n/locales`, through the video's own i18next with the language
  fixed per composition (`src/i18n.ts`). What the video says that the site
  doesn't have word for word is in `src/locales/{he,en}.json`.
- **The look.** The app's `src/index.css` and Tailwind config, under
  `theme-lightbox`, day palette only, with `dir`/`lang` per composition.
  Grounds: the wall, the lit panel, coral (with ink on it, 5.50:1) and the
  day palette's dark band (with the panel's cream on it, 14.88:1). Coral is
  only ever a fill; gold only the reward. `webpack-override.ts` keeps the
  logical properties as the app writes them.
- **The faces.** Rubik 500/700 and Assistant 400/600 with their Hebrew and
  Latin files, and Roboto for the Google Wallet preview, through
  `@remotion/google-fonts`. `FontGate` holds every frame until they are in.
- **The motion.** Words slam in from 135% on the overshoot with a small
  kick; passes swing in in a perspective box and sway; the carousel blurs
  with its speed; the staged components' own CSS animations are frozen
  (`src/video.css`) and every movement comes from the frame. Horizontal
  motion mirrors in Hebrew: the strip fills from the right, the discs fly
  right, the ring turns the other way.
- **The safe area.** Words stay 80px from the sides, 220px from the top and
  320px from the bottom, clear of WhatsApp's and Stories' own controls. The
  strip sits just under the top 220px.

## Licence

Remotion is free for individuals and for companies of up to three people,
which PunchMe is ([remotion.dev/license](https://www.remotion.dev/license)).
A company that grows past three needs a company licence.

## The figure on screen, and its source

The video prints one sourced figure, and only that one, with its source on
screen the whole time it is shown (beat 8):

| Figure | Claim | Source as printed | Link |
|---|---|---|---|
| 6x / פי 6 | Regulars generate about six times more annual revenue than one-time customers | Square Local Economy Report, March 2026 (US data) | https://squareup.com/us/en/press/2026-local-economy-report |

The claim and the source are the landing page's own (`landing.proof.stats`,
`src/components/marketing/sources.ts`). Square counted a regular as someone
who visits at least four times a year; that caveat and the link go in the
message sent with the video.

Everything else with a number in it is a picture of the product, not a
claim: the looks' own sample counts, the hero card from 0 to 10, the sample
win-back message's "30 days" (the rule's starter setting), and the price,
₪99 a month including VAT (`PUNCHME_MONTHLY_PRICE`).

## Switches

`src/config.ts`:

- `SMS_CODE`: whether the join's line says "and a code from a text". On,
  since the SMS code will be live when the video goes out (Roee, 6 Nov 2026).
- `SITE_URL`: the address on the end card, and where the sample sign's code
  leads.

## The rules it keeps

CLAUDE.md's "The brand is candour", PRODUCT.md's "Evidence on Hand" and
DESIGN.md's Lightbox. In short: no figure without its source on screen, no
promise of results ("it reminds them to come back", never "it brings them
back"), no "unlimited" or "no signup", no names, logos, photos or drawn
people beyond the landing page's own sample, no official wallet badges, a
sample says it is one, the iPhone lock screen says it is iPhone's, and
coral is only ever a fill.
