# The promo video, punched: design

Agreed with Roee on 7 Nov 2026, in session "Make the PunchMe promo video".
It replaces the 43.5-second cut merged as PR #48.

## What it is for

A vertical video (1080 × 1920, 30 fps, about 30 seconds) that Roee sends
to business owners on WhatsApp and posts to Stories, in Hebrew (`PromoHe`)
and English (`PromoEn`). In half a minute an owner on a phone should get
what PunchMe is, how a customer joins, how stamps happen, what it does
after the customer walks out, what it costs and where to start, and it
should feel like a product launch, not a slideshow.

Roee's words: delete the old one; make a more creative and cool one, with
animations and transitions; sound effects made by us; concept "A plus C";
use the newer cards from after the redesign.

## Fixed

- CLAUDE.md's candour: no figure without its source on screen, no promise
  of results, nothing "unlimited", never "no signup" (joining takes a mobile
  number and an SMS code), no invented names, quotes or logos, no
  placeholder photos. A sample says it is one; the iPhone lock screen says
  it is iPhone's.
- Lightbox, day palette: the warm wall, coral only ever as a fill with its
  label in ink, gold only for the reward, ink text. Rubik for display,
  Assistant for body, Plex Mono only for digits.
- The pass previews (`AppleCardPreview`, `GoogleCardPreview`) are the
  app's own, staged, scaled, tilted and moved, never redrawn. A styled
  card is the wallet's drawing, fed to them as the wizard feeds it
  (`stripStates` / `heroStates`).
- Every word on screen, so it works on mute. Words stay 80px from the
  sides, 220px from the top and 320px from the bottom.
- Horizontal motion mirrors in Hebrew.
- Remotion 4.0.538, the video's own `package.json`; no new dependency.

## The concept: punch-through, with the video as a punch card

- **The punch** is the transition between every beat. A round die presses
  into the frame; the scene gives for about 80ms; the hole snaps open with
  a three-frame camera shake and the next beat shows through it; the hole
  opens out to the whole frame in about 400ms.
- **The strip.** Ten empty stamp slots sit across the top of the frame.
  Each punched-out disc arcs up into the next empty slot and lands with a
  small bounce. Nine transitions give nine stamps; the tenth lands on the
  last beat, the strip turns gold (the reward), and becomes the "Start
  free" button.

## The script

| # | Beat | English | Hebrew | What moves | Ends |
|---|---|---|---|---|---|
| 1 | hook | Your punch card, / in Wallet. | הכרטיסייה שלכם, / בארנק. | Words slam in; the hero pass swings in in 3D and lands | 2.6s |
| 2 | promise | No app. / No account. / No password. | בלי אפליקציה. / בלי חשבון. / בלי סיסמה. | Three slams, each with a small punch | 5.0s |
| 3 | join | Scan the sign. + A mobile number and a code from a text. | סורקים את השילוט. + מספר נייד וקוד מ-SMS. | The sign swings in; the camera's corners lock on its code; a flash; the pass rises out of the code into Apple Wallet and Google Wallet, fanned | 8.2s |
| 4 | looks | Your card. / Your look. | הכרטיסייה שלכם. / בעיצוב שלכם. | The eight published styled looks whip past on a 3D carousel and come to rest on the hero | 11.2s |
| 5 | stamps | Every visit, a stamp. | כל ביקור, חותמת. | The camera's corners on the card, a flash; the stamps punch in, faster and faster, each the wallet's drawing at that count | 14.8s |
| 6 | reward | Card full. / Reward ready. | הכרטיסייה מלאה. / ההטבה מחכה. | The gold "Card full" panel bursts open | 17.0s |
| 7 | winback | Then it reminds them to come back. | ואז היא מזכירה להם לחזור. | An iPhone lock screen marked "Sample · iPhone"; the win-back message drops in and its free stamp lands | 20.2s |
| 8 | proof | 6x + Square's sentence + its source | פי 6 + the sentence + its source | The figure printed, never counted; the source on screen the whole time | 23.6s |
| 9 | price | ₪99 a month, including VAT. + Free to design. You pay once customers can join. | the same, from the landing page's keys | The price panel switches on like a sign | 26.6s |
| 10 | end | Start free · punchmeapp.com | the same | The tenth stamp; the strip turns gold and becomes the button | 30.0s |

The 6x figure is the landing page's (`landing.proof.stats`, Square Local
Economy Report, March 2026, US data, in `sources.ts`). The price is
`PUNCHME_MONTHLY_PRICE`. The join's second line follows `SMS_CODE` in
`video/src/config.ts`, as before. The win-back sample's "30 days" is the rule's
starter setting. Reuse the app's keys where the words are the app's;
the video's own lines go in `video/src/locales/{en,he}.json`.

## The cards

- **The hero:** the Gold Scissors look (`barber-gold-scissors`: badge
  stamps, sparkles wallpaper, the count "3/10" at the top), with the
  landing page's sample customer. It is drawn by the wallet at every count
  from 0 to 10, Apple's strip at 2x and Google's hero.
- **The carousel:** the eight published styled looks' own pictures:
  gold scissors, bakery croissants, café count on top, bubble tea, latte,
  hearts, lotus, trophies.
- `video/scripts/looks.ts` fetches both from the local looks stack
  (backend on 8001, passbox on 8002) through the public endpoints the
  wizard uses (`GET /api/presets`, its `pictures`, and
  `POST /api/presets/draw`), spaced under the throttle, into
  `video/public/looks/`, which is committed so a render never needs the
  stack.

## Motion

- Words: Rubik 700 at 120–150px, each slamming in from 135% in about 160ms
  with a small overshoot and a two-frame shake, about 120ms apart.
- 3D: passes in a perspective box, swinging in from the side, settling on
  an overshoot, swaying a little while on screen. The carousel spins fast
  and slows onto the hero, with a slight blur while fast.
- Stamping: each stamp swaps in the next count's drawing, with a flash ring
  at the slot and a kick of the card. The gaps shrink from 300ms to 90ms.
- Ground: the warm wall with a soft vignette and faint large stamp circles
  drifting behind for depth.
- Every movement is a function of the frame (no CSS animation running on
  its own); the staged components' own CSS animations stay frozen
  (`video.css`).

## Sound

`video/scripts/sfx.ts` synthesizes 48 kHz mono WAVs into
`video/public/sfx/`, committed, with a fixed seed so a rerun gives the same
files: punch (a low thump and a sharp click), slam (a shorter hit, for
words), stamp (a tock whose pitch rises over the ten), whoosh (the
carousel and the hole opening out), shutter (a scan), ding (the
lock-screen message) and chime ("Card full" and the end). No music. The
script prints each file's peak; the render's mix must not clip, and two
sounds never start on the same frame.

## What goes, what stays

- Goes: `video/src/scenes/*`, `voiceover.md` (the old timings), the old
  captions in `video/src/locales`.
- Stays and is reused: `fonts.ts` (`FontGate`), `i18n.ts`, the useful
  parts of `pieces.tsx` and `motion.ts`, `config.ts`,
  `webpack-override.ts`, `remotion.config.ts`, the Tailwind config,
  `scripts/stills.ts` (moved to the new beat ids).
- Rewritten: `Promo.tsx`, the README, `message.md`.

## Done when

- `npm run typecheck` passes in `video/`, and the root's `npm run lint`
  still passes.
- Both languages render: H.264 yuv420p BT.709 with an AAC audio track,
  30.0s ± 0.5, each under 16 MB.
- A still of every beat at its settled frame, in both languages, checked
  by eye: words inside the safe area, nothing clipped, Hebrew read right
  to left with its motion mirrored, the source on screen with 6x.
- Mid-transition frames checked: the hole, the shake, the disc on its way
  to the strip.
- The sound's peaks reported below 0 dBFS in the mix.
