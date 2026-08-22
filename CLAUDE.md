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

## Onboarding

`/onboarding` is **public**. The owner designs the card first — business name and
trade, card colour, stamp colour, stamp (icon / emoji / picture), stamps and
reward — and only then makes an account; the wallet and billing steps sit behind
`OnboardingGate`. The draft lives in `localStorage` (`punchme.onboardingDraft`,
pictures under `punchme.onboardingDraft.art`) and is turned into the Business
and CardTemplate by `src/routes/onboarding/commit.ts` in one idempotent pass:
one Business per account (a second POST is a 500, not a 409), so it always
looks before it creates, and a Back-and-change after sign-up patches instead
of duplicating. The pure model in `draft.ts` is unit-tested; keep it that way.
Emoji stamps are rasterised client-side and uploaded as `stamp_art` — the
wallet renderer knows only the sixteen glyphs in `src/lib/stampGlyphs.ts`.

## Roles

A business is no longer one account. `Business.owner` plus `Membership` rows on
the backend give three ranked roles, and the API answers 404 to a stranger but
**403 `insufficient_role`** to a member who is merely ranked too low.

- **staff** — the counter: scan, redeem, look a customer up, read activity.
- **manager** — also what customers see: the card, the standee, the messages.
- **owner** — alone with billing, the team, and the deletes that take a
  business's worth of rows with them.

`GET /businesses/me` carries the caller's own role as `viewer_role`;
`BusinessProvider` exposes it as `role` and `src/business/gating.ts` holds the
ranking (`atLeast` / `canManage` / `isOwner`) mirroring
`businesses/services.py:ROLE_RANK`. A response with **no** role reads as
`owner` on purpose — that is what was true of everyone before memberships
existed, so the app can ship ahead of the backend without locking owners out.

Two things must survive any redesign. `NAV_GROUPS` items carry a `min` role and
the rail is built from `visibleGroups(role)`, so a hire is never shown a door
that would refuse them. And `RequireRole` wraps the manager and owner route
groups in `main.tsx`: it *says no out loud* rather than redirecting, because a
silent bounce is indistinguishable from a broken link. Neither is the security
boundary — the API is — but adding a dashboard route means deciding which of
the two groups it belongs in.

Invitations are a link the owner copies and sends themselves (there is no email
provider in this product). `/invite/:token` is public and signs the invitee in
on the page, so the invitation is still on screen while they type.

## Redesign rules

The frontend is being redesigned page group by page group: landing → onboarding →
dashboard. Landing and onboarding have shipped; the dashboard phase is
presentation-layer only.

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

**Faces:** `index.html` loads Rubik (display), Assistant (body) and IBM Plex
Mono. Rubik and Assistant carry Hebrew and Latin in one family, so the Hebrew
site is set rather than falling back to an OS face. Plex Mono has no Hebrew —
it sets digits and the pass field labels only, never running text.

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
