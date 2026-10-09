# PunchMe — frontend

## What this is

A digital loyalty punch card for small businesses. The customer scans a QR code
once and a pass lands in their Apple Wallet or Google Wallet — no app, no signup,
no account. It stamps itself on every visit and updates live on their lock screen.

₪99/month, Israeli market, Hebrew and English. Free to design and preview; you
pay only when you activate the card for real customers.

**Who buys it:** a barber, a café owner, a personal trainer, a therapist. Usually
a solo operator. Not technical. Has been burned by software that promised
customers and delivered a monthly charge. Their real question is never "is this
well designed" — it's "will this bring people back, or am I paying for a
dashboard I'll never open?"

**The brand is candour.** The landing page cites real sources (Square, HBR,
Harris Poll) and the revenue calculator will show a negative number and tell an
owner not to buy if their economics don't work. Never add fake logo walls,
invented testimonials, unsourced metrics, or claims of popularity or results
that nothing backs up. The real numbers are stronger, and undermining that
honesty costs more than any conversion it buys.

Four things on the landing page break this today, and they come off: the three
invented testimonials (`Testimonials.tsx`), the unsourced stats band
(`StatsBand.tsx`), the "Most popular" badge on Pro, and the closing line about
owners "already earning more". Until they are gone, don't copy them. A quote
goes back only when a real customer said it and agreed to its use, and a figure
only with a source in `src/components/marketing/sources.ts`.

## Stack

Vite · React 18 · TypeScript · Tailwind 3.4 · react-router-dom 6 · TanStack Query
· i18next · lucide-react

Hand-rolled primitives — no shadcn, no Radix — in four sets, all in use:
`src/components/ui`, `src/components/dashboard/primitives.tsx`,
`src/components/card-studio/studio-primitives.tsx` and
`src/components/onboarding`. Marketing layout primitives (`Section`,
`Container`, `SectionHeader`, `Eyebrow`, `ctaClasses`, `focusRing`) in
`src/components/marketing/primitives.tsx`. `src/lib` has
`usePrefersReducedMotion` and `cn`. `useInView` and `useCountUp` are there too,
unused on purpose: sourced numbers don't count up.

Do not add UI dependencies without asking.

## Onboarding

`/onboarding` is **public**. The owner designs the card first — business name and
trade, card colour, stamp colour, stamp (glyph or picture), stamps and
reward — and only then makes an account; the wallet and billing steps sit behind
`OnboardingGate`. The draft lives in `localStorage` (`punchme.onboardingDraft`,
pictures under `punchme.onboardingDraft.art`) and is turned into the Business
and CardTemplate by `src/routes/onboarding/commit.ts` in one idempotent pass:
one Business per account (a second POST is a 500, not a 409), so it always
looks before it creates, and a Back-and-change after sign-up patches instead
of duplicating. The pure model in `draft.ts` is unit-tested; keep it that way.
Picture stamps are cropped square client-side and uploaded as `stamp_art` — the
wallet renderer knows only those and the sixteen glyphs in
`src/lib/stampGlyphs.ts`.

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

The whole app is being reworked; `docs/redesign/guide.md` has the plan, the
owner's decisions and the prompts. Phase 1 adds a new theme scope and primitive
set beside the old ones, shown on `/style-guide`, and Phase 10 deletes the old
ones. In between, each page group moves onto the new ones in its own phase,
kept to its contract:

2. Dashboard shell: `docs/dashboard-routes.md`
3. Card studio editor: `docs/card-studio.md`
4. Onboarding: `docs/onboarding-flow.md`
5. Overview, Scan, Customers, Activity: `docs/dashboard-routes.md`
6. Standee, Messages, Referrals: `docs/dashboard-routes.md`
7. Team, Billing and the checkout return pages: `docs/dashboard-routes.md`
8. Public pages and sign-in: `docs/public-pages.md`, which phase 8 writes first
9. Landing page: `docs/landing-page.md`

A phase changes only its own pages, and checks any page that shares code it
touched. Beyond its contract, everything about a page is open, within the
other rules in this file.

**Never modify during the redesign:**

- `src/api/` `src/auth/` `src/hooks/` `src/config/` — data, session, and config
- `src/lib/` — shared logic (edit only when the task is specifically about it)
- The pass previews in the first table of `docs/card-studio.md`
  (`AppleCardPreview`, `GoogleCardPreview`, `StampGrid`, `PassBarcode`). They
  mirror what Apple and Google Wallet actually render. They are a spec match,
  not free design. Stage them, frame them, animate them in their 300px slot; do
  not redraw them. The rest of `card-studio/` and `wallet-card/` is open.

**Routes and API calls are fixed.** Every route stays, and each page keeps
making the API calls its contract lists. If the rework seems to need a route
removed or renamed, or a page's call dropped or changed, stop and ask.

## Design skills

Impeccable, UI UX Pro Max, Taste (design-taste-frontend and
redesign-existing-projects) and eight of Emil Kowalski's skills are installed
in `.claude/skills`. They advise. When one disagrees, this file wins, then the
contracts in `docs/`, then PRODUCT.md and DESIGN.md, then the skill the prompt
names. Taste is for the landing page only.

Their defaults that do not apply here:

- A first visit opens in the browser's language, with Hebrew as the fallback.
  `src/i18n/index.ts` still opens in English.
- Fonts may change, but only to faces that set Hebrew, loaded from Google
  Fonts in `index.html`: no Geist, Satoshi, Outfit or Cabinet Grotesk. IBM
  Plex Mono may stay for digits and pass labels, and Roboto stays for the
  Google Wallet preview; neither has Hebrew, so neither sets running text.
- The brand colour is open until Phase 1, which offers three directions with
  today's violet as one of them. After that, DESIGN.md holds it.
- Night is for the dashboard only, the card studio included. The landing
  page, onboarding and the public pages stay light.
- Icons are lucide-react.
- Tailwind 3.4 and hand-rolled components: no shadcn, Radix or Base UI, and
  no new dependency without asking. Animation is CSS first; a phase may ask
  to add `motion` for one gesture, such as a drag-to-dismiss sheet. No GSAP.
- No invented numbers, quotes, logos, names or "realistic" figures, and no
  placeholder photos. Every number on the landing page has a source in
  `sources.ts`.
- Horizontal motion mirrors in Hebrew. Reduced motion is gentler, not none.
- The wallet pass previews are never redrawn.

## Hebrew and RTL

The app ships Hebrew and Hebrew is likely the primary market. This is a design
constraint, not a translation step.

- Logical properties only: `ms-` `me-` `ps-` `pe-` `start-` `end-` `text-start`
  `text-end`. Never `ml-` `mr-` `pl-` `pr-` `text-left` `text-right`.
- Every string goes through `t()`. Reuse existing keys from
  `src/i18n/locales/en/common.json`. New copy means adding the key to **both**
  `en` and `he` — never a literal string in JSX.
- Judge typography and layout in Hebrew, not only in English.

**Faces:** `index.html` loads Rubik (display), Assistant (body), IBM Plex Mono
and Roboto. Rubik and Assistant carry Hebrew and Latin in one family, so the
Hebrew site is set rather than falling back to an OS face. Plex Mono has no
Hebrew — it sets digits and the pass field labels only, never running text.
Roboto has no Hebrew either: it is loaded only for the Google Wallet preview,
and never sets running text.

## Color and contrast

`tailwind.config.js` and the theme scopes in `src/index.css` carry measured
contrast ratios in their comments and they are load-bearing — e.g. gold
`#f0b429` is 2.96:1 on white and fails AA, so it is a fill colour that always
carries navy text. Accent-coloured text uses `primary.text`, a CSS variable
measured per theme: `#8a5d0b` on oat, `#683de8` in `.theme-purple` and
`#a78bfa` at night.

Introducing a colour means measuring it and commenting the ratio the same way.
All text meets AA.

## Accessibility

Already in place and must survive any redesign: skip link, visible focus rings
(`focusRing`), 44px minimum touch targets, heading hierarchy, keyboard paths,
`aria-live` announcements debounced so slider drags don't flood a screen reader.

## Verification

There are **no component or render tests** — the 17 test files cover pure logic
only: the API client, the calculator, the onboarding draft, the tour, the
Overview and Activity logic, and ten helpers in `src/lib`. The browser is the
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
