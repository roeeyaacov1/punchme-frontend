# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Owners.** A barber, a café owner, a personal trainer, a therapist: usually a
solo operator, not technical, and burned before by software that promised
customers and delivered a monthly charge. Their real question is never "is this
well designed" but "will this bring people back, or am I paying for a dashboard
I'll never open?" They mostly use a phone. Setup happens on a phone or a
laptop. After that the dashboard is installed as a PWA and used one-handed at
the counter, between customers.

**Their team.** An owner can invite managers and staff. Staff work the counter:
scan, redeem, look a customer up, read activity. Managers also run what
customers see: the card, the standee and the messages. The owner alone handles
billing, the team, and the deletes that take a business's worth of rows with
them.

**Their customers.** They meet only the wallet pass and the public pages:
`/join/:templateId` after scanning the QR at the counter, and `/c/:serial` when
they can't find their pass. At `/join` a customer is a stranger standing at a
counter with one hand free. A friend who points a camera at a customer's pass
lands on `/p/:token` and is offered a card of their own; for the shop's
signed-in team the same page is a stamp screen.

**PunchMe staff.** `/admin` curates the ready-made card looks that onboarding
offers for each trade. Internal only.

## Product Purpose

A digital loyalty punch card for small businesses in Israel. The customer scans
a QR code once and a pass lands in their Apple Wallet or Google Wallet. There
is no app to install and no account or password to make. The pass collects a
stamp on every visit, updates by itself, and carries the owner's messages.

Designing the card, previewing it on the owner's own phone and using the whole
dashboard are free. The owner pays ₪99 a month only when they activate the card
for real customers.

Success is an owner whose regulars come back often enough that ₪99 a month pays
for itself, and who can see that without tending a dashboard. The revenue
calculator puts it in one number, worked out from the owner's own figures: how
many regulars cover a year of PunchMe. When the answer is bad, it says so.

## Positioning

The loyalty card a customer doesn't have to install, from a company that will
tell an owner when it isn't worth the money.

- **A wallet pass, not an app and not a paper card.** Nothing to download,
  nothing to lose at the bottom of a bag, no account, no password. Joining
  takes an Israeli mobile number and an SMS code.
- **Free until there are real customers.** The owner designs the card before
  making an account, and pays only on activation.
- **Candour is part of the product.** Every number on the landing page links to
  its source. The calculator runs on the owner's numbers, costs the reward at
  cost of goods, never clamps the result at zero, and tells an owner whose
  economics don't work not to buy.
- **Made for an Israeli counter.** Hebrew first and right to left, consent and
  privacy wording written for Israeli law, links passed around on WhatsApp,
  prices in shekels.

## Operating Context

- **The counter.** The installed dashboard, on a phone, in one hand, between
  customers. Scan is used dozens of times a day: point the camera at the
  customer's pass or type its code, read the result, and hand over the reward
  when the card is full. The team can also stamp from `/p/:token` with the
  phone's own camera.
- **Setup.** On a phone or a laptop. The owner designs first, signed out:
  business and trade, card colour, stamp colour, the stamp, the number of
  stamps and the reward. Every step after the first arrives answered with a
  default for the trade. Then the account, then the owner's own pass in their
  wallet, then Activate or "Not now".
- **Bringing customers in.** A printed standee or a shared link puts the
  `/join` QR in front of them. They give a mobile number (name and birthday
  optional, marketing consent a separate unticked box), confirm an SMS code and
  add the pass.
- **After they leave.** Automatic rules (win-back, birthday, reward waiting)
  and broadcasts reach the pass, and keep running whether or not the owner
  opens the dashboard. On iPhone a message raises a lock-screen alert. On
  Android it appears on the pass without an alert, unless it also gifts a stamp
  (`punchme-backend/CLAUDE.md`).
- **Changing the card.** The owner, or a manager, changes the design in the
  dashboard's Card Studio, before and after launch. It never goes through
  PunchMe.
- **Links travel by WhatsApp.** The product sends no email. A team invitation
  is a link the owner copies and sends, and `/invite/:token` signs the invitee
  in on the page. Owners reach PunchMe on WhatsApp too, though no page links to
  it yet.
- **A lost pass.** A customer who can't find their pass opens `/c/:serial` (the
  link under the join screen leads there), which shows the real card and lets
  them add it again.

## Capabilities and Constraints

- **One business per account, one card per business.**
- **Two plans.** Free designs, previews and uses the dashboard, but takes no
  real customers: `/join` turns them away. Pro, ₪99 a month
  (`PUNCHME_MONTHLY_PRICE`), takes customers and unlocks real sends, printing
  the standee, and referrals. A business that drops back to Free keeps the
  cards it has; new customers can't join.
- **The card.** An Apple Wallet store card and a Google Wallet loyalty card.
  2–12 stamps; a reward of up to 200 characters; a stamp that is one of 16
  glyphs or an uploaded picture; a texture; a logo; up to 10 pass fields. The
  limits come from the wallet renderer (`docs/card-studio.md`).
- **The pass previews are a spec match** for Apple and Google Wallet.
  `AppleCardPreview`, `GoogleCardPreview`, `StampGrid` and `PassBarcode` are
  staged, framed and animated in their 300px slot, and never redrawn.
- **Messages.** Broadcasts to every card holder, automatic rules, a message to
  one customer from the customer list, and a test to the owner's own card.
  Real sends are Pro only and capped: by default two broadcasts a week at least
  20 hours apart, and up to 25 rules. Starter rules come in the card's
  language, Hebrew or English.
- **Referrals.** A friend who scans a customer's pass gets a card of their own,
  credited to that customer. Off until the owner turns it on; the owner sets
  the caps and reviews flagged referrals.
- **Roles.** staff < manager < owner, as CLAUDE.md's "Roles" describes. The
  navigation shows only what the viewer's role can open, and a page above their
  rank says no out loud instead of redirecting.
- **Customer data.** The business controls its customer data and PunchMe
  processes it on the business's behalf. `/join` carries a privacy notice under
  the Israeli Privacy Protection Law and a separate, unticked marketing consent
  under the Spam Law. The mobile number must be Israeli.
- **No tracking.** The site has no analytics. The calculator's promise that
  nothing typed leaves the browser depends on it.
- **Routes and API calls are fixed** through the redesign. Each page group's
  contract is in `docs/`.
- **Open.** The brand colour and the fonts: Phase 1 chooses them, and every
  face must set Hebrew. The WhatsApp support number isn't in the product yet.

Terms the copy uses today:

| English | Hebrew |
|---|---|
| loyalty card, the card | כרטיסיית נאמנות, כרטיסייה |
| stamp | חותמת |
| reward | הטבה |
| regulars | לקוחות קבועים |
| customer club | מועדון לקוחות |
| Card Studio | סטודיו הכרטיסיות |
| Scan | סריקה |
| Standee | שילוט |
| Customer messages | הודעות ללקוחות |
| Automatic rules | כללים אוטומטיים |
| Refer a friend | חבר מביא חבר |

## Brand Commitments

- **Candour.** The landing page cites real sources, and the calculator will
  show a negative number and tell an owner not to buy. No fake logo walls,
  invented testimonials, unsourced metrics, or claims of popularity or results
  that nothing backs. A quote goes back only when a real customer said it and
  agreed to its use, and a figure only with a source in `sources.ts`.
- **Six things on the landing page break this today.** They come off or get
  corrected, and until then nothing copies them:
  1. the three invented testimonials (`Testimonials.tsx`);
  2. the unsourced stats band (`StatsBand.tsx`);
  3. the "Most popular" badge on Pro;
  4. the closing line about owners "already earning more";
  5. "Unlimited push messages", on the push badge and in the Pro list. Sends
     are capped, so "unlimited" goes;
  6. "No signup" in the hero. Joining takes a mobile number and an SMS code, so
     the true line is no app, no account, no password.

  Two FAQ answers are wrong too: owners change the design themselves in the
  dashboard, and "message us" means WhatsApp.
- **Hebrew first.** Right to left, with English. Every string goes through
  `t()`, in both languages at once. A first visit opens in the browser's
  language with Hebrew as the fallback; `src/i18n/index.ts` still opens in
  English until that fix lands.
- **Hebrew voice.** The copy speaks to the reader in the plural (בחרו, נסו,
  היכנסו) and writes people with slash forms (לקוח/ה, מנהל/ת, מסכים/ה). The
  landing page's "How it works" (צור, בחר, סרוק) breaks this and moves over in
  Phase 9.
- **Not pinned yet.** The brand colour and the fonts. Phase 1 chooses them,
  and every face must set Hebrew.

## Evidence on Hand

Only these count. The URLs live in `src/components/marketing/sources.ts`, keyed
by `id`; the copy is `landing.proof.stats`. Each line keeps its caveat, and its
source stays visible and clickable.

| id | Figure | Claim | Source as printed | Caveat |
|---|---|---|---|---|
| `square` | 6x | Regulars generate about six times more annual revenue than one-time customers | Square Local Economy Report, March 2026 (US data) | US transactions; a regular visits at least four times a year |
| `hbr` | 5–25x | Winning a new customer costs five to twenty-five times more than keeping one | Harvard Business Review, 2014 | Directionally credible, not a controlled study, so always a range |
| `harris` | 58% | 58% are less likely to join a loyalty program that makes them download an app; 79% more likely to join one with no physical card | Harris Poll for Wilbur, 2019 | No published sample size, so the year is printed |

Sourced figures are printed, never counted up.

**The calculator** (`src/components/marketing/calculator.ts`, tested in
`calculator.test.ts`) is the owner's own arithmetic, not evidence about anyone
else. Its headline is how many regulars cover a year of PunchMe at ₪99 a month.
It costs a reward at cost of goods, never clamps the year's net at zero, and
shows a negative result with the number of regulars it would take. Its café,
barbershop and studio presets are starting points, not data.

**Not on hand, so never fabricated:** customer quotes, customer names or logos,
usage, return-rate or setup-time figures, case studies, press, photos, and the
official Apple Wallet and Google Wallet badges (the hero's marks are
placeholders; see `WalletMarks.tsx`). No Terms, Privacy or Contact page exists.
The landing page's illustrations (the sample notifications, the paper-card
examples, the dashboard drawn with sample data) are not evidence either.

## Product Principles

1. **Backed or it doesn't ship.** Every number has a source the reader can
   click, every claim matches what the product does on both wallets, and the
   calculator is allowed to say no. Honesty is worth more than any conversion
   a fake would buy.
2. **The pass is the hero.** Customers never see the dashboard; they see the
   pass. Everything else is staged around it, and the previews are never
   redrawn.
3. **Hebrew, phone, one hand.** Judge every screen in Hebrew at phone width
   first. The counter path (scan, stamp, redeem) is the most frequent, so it
   carries the least and its result is impossible to miss.
4. **Defaults over decisions.** Owners aren't technical and customers have one
   hand free. Choices arrive answered, nothing needs reading first, and
   nothing asks for more than the job needs.
5. **Say no out loud.** A refusal, a limit or a loss is stated plainly, with
   what to do next: the role panel instead of a silent redirect, the named scan
   refusals, the weekly message cap with its next allowed time, the
   calculator's negative result.

## Accessibility & Inclusion

- All text meets WCAG AA contrast. Every colour's ratio is measured and written
  beside it (CLAUDE.md, "Color and contrast").
- Must survive any redesign: the skip link, visible focus rings, 44px touch
  targets, the heading hierarchy, keyboard paths, and `aria-live`
  announcements debounced so slider drags don't flood a screen reader.
- Reduced motion is gentler, not none. Horizontal motion mirrors in Hebrew.
- Figures, phone numbers and emails are isolated left to right inside Hebrew
  text.
- The Hebrew voice above keeps the copy from assuming a gender: plural to the
  reader, slash forms for people.
- Known gaps are listed in `docs/landing-page.md` and `docs/onboarding-flow.md`
  for their phases to fix.
