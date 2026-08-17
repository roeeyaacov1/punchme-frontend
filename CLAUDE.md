# PunchMe — frontend

## What this is

A digital loyalty punch card for small businesses. The customer scans a QR code
once and a pass lands in their Apple Wallet or Google Wallet — no app, no signup,
no account. It stamps itself on every visit and updates live on their lock screen.

₪59/month, Israeli market, Hebrew and English. Free to design and preview; you
pay only when you activate the card for real customers.

**Who buys it:** a barber, a café owner, a personal trainer, a therapist. Usually
a solo operator. Not technical. Has been burned by software that promised
customers and delivered a monthly charge. Their real question is never "is this
well designed" — it's "will this bring people back, or am I paying for a
dashboard I'll never open?"

**The brand is candour.** The landing page cites real sources (Square, HBR,
Harris Poll) and the revenue calculator will show a negative number and tell an
owner not to buy if their economics don't work. Never add fake logo walls,
invented testimonials, or unsourced metrics. The real numbers are stronger, and
undermining that honesty costs more than any conversion it buys.

## Stack

Vite · React 18 · TypeScript · Tailwind 3.4 · react-router-dom 6 · TanStack Query
· i18next · lucide-react

Hand-rolled primitives in `src/components/ui` — no shadcn, no Radix. Marketing
layout primitives (`Section`, `Container`, `SectionHeader`, `Eyebrow`,
`ctaClasses`, `focusRing`) in `src/components/marketing/primitives.tsx`.
Useful hooks already exist in `src/lib`: `usePrefersReducedMotion`, `useInView`,
`useCountUp`, `cn`.

Do not add UI dependencies without asking.

## Redesign rules

The frontend is being redesigned page group by page group: landing → onboarding →
dashboard. Each phase is presentation-layer only.

**Never modify during a redesign:**

- `src/api/` `src/auth/` `src/hooks/` `src/config/` — data, session, and config
- `src/lib/` — shared logic (edit only when the task is specifically about it)
- `src/components/wallet-card/` and `src/components/card-studio/` — these mirror
  what Apple and Google Wallet actually render. They are a spec match, not free
  design. Stage them, frame them, animate them; do not redraw them.
- Any route group outside the phase currently being worked on.

**Behavior is frozen.** Routes, hrefs, anchor ids, form field names, event
handlers, prop signatures, query keys, and validation rules all stay exactly as
they are. If a redesign seems to require changing one, stop and ask.

## Hebrew and RTL

The app ships Hebrew and Hebrew is likely the primary market. This is a design
constraint, not a translation step.

- Logical properties only: `ms-` `me-` `ps-` `pe-` `start-` `end-` `text-start`
  `text-end`. Never `ml-` `mr-` `pl-` `pr-` `text-left` `text-right`.
- Every string goes through `t()`. Reuse existing keys from
  `src/i18n/locales/en/common.json`. New copy means adding the key to **both**
  `en` and `he` — never a literal string in JSX.
- Judge typography and layout in Hebrew, not only in English.

**Known issue:** `index.html` loads Inter, Plus Jakarta Sans and IBM Plex Mono.
None of them have Hebrew glyphs, so the Hebrew site currently renders in an OS
fallback face. Any typography work must fix this — the Latin and Hebrew faces
need to be chosen as a pair.

## Color and contrast

`tailwind.config.js` carries measured contrast ratios in its comments and they
are load-bearing — e.g. gold `#f0b429` is 2.96:1 on white and fails AA, so it is
a fill colour that always carries navy text, and `primary.text` `#96670d` exists
for gold-as-text on light.

Introducing a colour means measuring it and commenting the ratio the same way.
All text meets AA.

## Accessibility

Already in place and must survive any redesign: skip link, visible focus rings
(`focusRing`), 44px minimum touch targets, heading hierarchy, keyboard paths,
`aria-live` announcements debounced so slider drags don't flood a screen reader.

## Verification

There are **no component or render tests** — the four test files cover pure logic
only (`api/client`, `calculator`, `csv`, `passBarcode`). The browser is the
safety net, so use it.

Before calling any UI change done:

1. `npm run build` (runs `tsc -b`) and `npm run lint` both pass
2. `npm test` passes
3. Checked in **both** English and Hebrew
4. Checked at 375px and at desktop width
5. Browser console clean
6. Keyboard path and reduced-motion still work

`.claude/launch.json` is configured — use the preview tools, not a shell, to run
the dev server.

## Working style

Work on a branch, one page group per branch, so any phase can be reverted
independently. Commits are scoped and written in plain language — match the
existing history.
