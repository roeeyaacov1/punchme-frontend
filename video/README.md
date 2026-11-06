# The PunchMe promo video

A 43.5-second vertical video (1080 × 1920, 30 fps) for Roee to send to
business owners on WhatsApp, in Hebrew (`PromoHe`) and English (`PromoEn`),
rendered by [Remotion](https://www.remotion.dev) from the app's own components
and copy. Every word is on screen, so it works on mute; `voiceover.md` has the
script and a voiceover timed to it, and `message.md` the message to send with
it.

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
| `npx remotion studio` (`npm run studio`) | Preview both compositions in the browser, frame by frame |
| `npm run render:he`, `npm run render:en` | Render `out/punchme-promo-he.mp4` and `out/punchme-promo-en.mp4` |
| `npx remotion still PromoHe out/punchme-promo-he-poster.png --frame=40` | The poster (the same for `PromoEn`): the first beat, its light on |
| `npm run stills` | A still of every beat at its settled frame, both languages, into `out/stills/` (`--lang he`, beat ids, or `--frames 150,412` to narrow it) |
| `npx remotion ffprobe out/punchme-promo-he.mp4` | Check the codec, the pixel format and the length |
| `npm run typecheck` | TypeScript over the video and the app files it imports |

`out/` is git-ignored. The MP4s are H.264 in yuv420p (`remotion.config.ts`),
and should stay under 16 MB each so WhatsApp sends them as they are.

## Licence

Remotion is free for individuals and for companies of up to three people,
which PunchMe is ([remotion.dev/license](https://www.remotion.dev/license)).
A company that grows past three needs a company licence.

## The figure on screen, and its source

The video prints one sourced figure, and only that one, with its source on
screen the whole time it is shown (beat 5, 0:28–0:33.5):

| Figure | Claim | Source as printed | Link |
|---|---|---|---|
| 6x / פי 6 | Regulars generate about six times more annual revenue than one-time customers | Square Local Economy Report, March 2026 (US data) | https://squareup.com/us/en/press/2026-local-economy-report |

The claim and the source are the landing page's own (`landing.proof.stats`,
`src/components/marketing/sources.ts`). Square counted a regular as someone
who visits at least four times a year, across seven years of US small-business
transactions; that caveat and the link go in the message sent with the video.

Everything else with a number in it is a picture of the product, not a claim:
the sample cards' stamps (the three trades as the landing page shows them,
then one customer's card from 0 to 10, back to 0 and its gift stamp), the
scan's "9 more to the reward", the sample message's "30 days" (the win-back
rule's starter setting), and the price, ₪99 a month including VAT
(`PUNCHME_MONTHLY_PRICE`).

## How it is made

- **The real pieces.** `AppleCardPreview` and `GoogleCardPreview` with the
  landing page's sample card (`samples.ts`, the barbershop), the standee's
  `StandeeSheet`, the landing page's `SampleAnswer`, the kit's
  `WallpaperStage` and `LitPanel`. Nothing under `src/` is changed. The
  passes stand in their 300px slot and are scaled up evenly as a whole
  (`Scaled` in `src/pieces.tsx`), never redrawn; their own small labels stay
  the size the product draws them, scaled with the pass, while every word the
  video adds is 36px or more and every caption 60px or more.
- **The words.** The app's locale files, read straight from
  `src/i18n/locales`, through the video's own i18next with the language fixed
  per composition (`src/i18n.ts`). What the video says that the site doesn't
  have word for word (captions cut from the site's sentences, the iPhone
  label) is in `src/locales/{he,en}.json`.
- **The look.** The app's `src/index.css` and Tailwind config, under
  `theme-lightbox`, day palette only, with `dir`/`lang` per composition. The
  CSS goes through Tailwind and autoprefixer as the app's does; Remotion's
  Tailwind setup also adds postcss-preset-env, which would turn the logical
  properties into `[dir]` pairs, so `webpack-override.ts` takes it out. The
  app's components and Remotion share one React (18.3.1), by alias.
- **The faces.** Rubik 500/700 and Assistant 400/600 with their Hebrew and
  Latin files, and Roboto for the Google Wallet preview, through
  `@remotion/google-fonts`. `FontGate` holds every frame until they are in
  and fails the render if one is missing, so the stand-ins in
  `src/font-fallbacks.css` never reach a frame. The Apple Wallet preview sets
  itself in the system face, as it does on the site.
- **The motion.** Every movement is driven by the frame, on DESIGN.md's
  curves (`src/motion.ts`), and the staged components' own CSS animations
  are frozen at their final state (`src/video.css`). Roee asked on 7 Nov
  2026 for livelier motion than the first cut's lights alone, so:
  - **One card's journey.** From the join to the lock screen the video
    follows one customer's card: it rises out of the sign's code into both
    wallets, the Google card sliding out from behind the Apple one; flies
    into the owner's camera, whose window closes round it; takes its first
    stamp, fills visit by visit, is redeemed back to zero; and leaves the
    camera for the lock screen, which builds round it, where the win-back
    message brings its free stamp. Between those beats the card is handed
    from one to the next (`handoff` in `src/Promo.tsx`), never cut. These
    are things already on screen moving across it, on the in-out.
  - **The sweep.** The other beats change behind a band of bare wall that
    crosses the frame the way the language reads, right to left in Hebrew,
    in about 870ms on the in-out, so two beats' words never overlap.
  - **The rest stays the site's.** Lights on in 240ms with at most 8 site
    pixels of travel (2.7 frame pixels to the site pixel), captions line by
    line 100ms apart, an exit in 180ms that starts 150ms before whatever
    replaces it; the scan's snap at the Scan page's own timing (the flash
    from 0.85 in 220ms, the settle from 1.04 in 180ms, the stamp from 1.45
    in 240ms after 60ms, on the overshoot); the aiming corners locking on;
    activation in 600ms for the field light and the price's panel, which
    switches on as the sign does; a press that sinks to 0.97 for "Give the
    reward" and "Start free"; and the landing page's crossover between
    trades. Two flashes in all, 3.4 seconds apart. Sourced numbers and the
    price are printed, never counted.
- **The safe area.** Words stay 80px from the sides, 220px from the top and
  320px from the bottom, clear of WhatsApp's and Stories' own controls.

## Switches

`src/config.ts`:

- `SMS_CODE`: whether the join's line says "and the code from a text". On,
  since the SMS code will be live when the video goes out (Roee, 6 Nov 2026).
- `SITE_URL`: the address on the end card, and where the sample sign's code
  leads.

## The rules it keeps

CLAUDE.md's "The brand is candour", PRODUCT.md's "Evidence on Hand" and
DESIGN.md's Lightbox, with the brief in `docs/promo-video-prompt.md` (not
committed). In short: no figure without its source on screen, no promise of
results, no "unlimited" or "no signup" or setup times, no names, logos,
photos or drawn people, no official wallet badges, a sample says it is one,
the iPhone lock screen says it is iPhone's, and coral is only ever a fill.
