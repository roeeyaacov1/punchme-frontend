# Landing page: what carries over

What the landing page (`/`) has today that a rework has to keep: the
evidence, the links and the behaviour. Written 8 Oct 2026 from
`src/routes/marketing/LandingPage.tsx` and the components it renders, as the
input for the redesign; updated 15 Oct 2026 when seven of the page's untrue
lines came off or were corrected, 29 Oct 2026 when Phase 9's step B rebuilt
the page on Lightbox (`docs/redesign/briefs/landing.md`), and 30 Oct 2026
when the calculator came off. Like `docs/dashboard-routes.md`, it says
nothing about design on purpose. The list of blocks is here so nothing is
lost by accident, not as a layout to copy.

- Page: `src/routes/marketing/LandingPage.tsx`. Sections and the sources:
  `src/components/marketing/`. The sample card every section shows:
  `samples.ts`, built on `heroTemplates.ts`.
- Copy: `landing.*` in `src/i18n/locales/{en,he}/common.json`, plus a few
  lines the page reuses in the dashboard's own words (`messaging.phones`,
  `messaging.kinds.*`, `messaging.sentence.*`, `dashboard.scan.result.*`,
  `billing.pro.ifCancelTitle`, `billing.pro.ifCancel`, `studio.sampleName`).
- The page makes no API calls of its own. The header reads the session to
  decide between "Sign in" and "Dashboard".

## The rules that make it this page

- **Every printed number has a visible, clickable source.** That is the
  house rule written at the top of `src/components/marketing/sources.ts`:
  if a claim can't be linked to a source, it doesn't go on the page. Each
  source link says, to a screen reader, that it opens a new tab.
- **Sourced figures never count up.** They're printed, not animated.
- **Nothing is tracked.** The site has no analytics.
- **A sample carries its trade, never a business name.** The card is named
  "Barbershop", "Café" or "Studio" ("מספרה", "בית קפה", "סטודיו"), and its
  holder is the studio's own sample name in the page's language. A sample
  message is labelled as one.

## The evidence

URLs live in `sources.ts`, keyed by `id`. The copy lives in
`landing.proof.stats`. The caveats on each line stay on the page.

| id | Figure | Claim | Source as printed | Where it stands |
|---|---|---|---|---|
| `square` | 6x | Regulars generate about six times more annual revenue than one-time customers | Square Local Economy Report, March 2026 (US data) | After they leave |
| `hbr` | 5–25x | Winning a new customer costs five to twenty-five times more than keeping one | Harvard Business Review, 2014 | After they leave |
| `harris` | 58% | 58% are less likely to join a loyalty program that makes them download an app (and 79% more likely to join one with no physical card) | Harris Poll for Wilbur, 2019 | How it works, beside the card |

Harris's caveat also carries the survey's other half: people wary of
programs that collect personal data, and only the mobile number required
here. HBR's says why it is a range. In Hebrew, a range keeps its own
left-to-right run (`פי <ltr>5–25</ltr>`).

## The calculator, taken off

On 30 Oct 2026 Roee took the revenue calculator off the page and put
nothing in its place: the FAQ follows the price. Its section, its copy, the
hero's second link, the header's "What regulars are worth" anchor, the
price's "based on your numbers" line and Billing's "Work it out with your
own numbers" link went with it.

`calculator.ts` and `calculator.test.ts` stay: `PUNCHME_MONTHLY_PRICE` lives
there, and the model (a reward at cost of goods, a net never clamped at
zero) is still tested, should a calculator come back. PRODUCT.md and
CLAUDE.md still describe it; Roee updates those.

## What the page says today

| Block | `id` | What it says |
|---|---|---|
| Header | – | Logo; the three anchors from 1024px; language toggle; "Sign in" and "Start free" when signed out, "Dashboard" and an account menu when signed in; below 1024px a menu with the same |
| The counter | – | "Your punch card, in Wallet": no app, no account, no password, free to design, ₪99 a month including VAT once customers can join; "Start free"; the sign, the real pass (`AppleCardPreview` from `heroTemplates.ts`) and the scan's answer, each labelled; a trade switch |
| How it works | `how-it-works` | The sign (designed free, printed once the code goes live), the card (scan, mobile number and SMS code, Apple Wallet or Google Wallet, the real `GoogleCardPreview`, the 58%), the scan (punched and full answers) |
| After they leave | – | A sample lock-screen message; what each phone does; the three automatic rules with their starter settings (30 days, the birthday, 7 days, 10:00, a gift stamp); broadcasts, two a week, with a gift of one to three stamps or a full card, as the composer offers; 6x and 5–25x |
| The price | `pricing` | Free is the sign with its code not live yet; Pro is ₪99 a month including VAT and what it opens; how to cancel and what cancelling does, in Billing's words |
| FAQ | `faq` | Eight questions in native `<details>`: no app; what customers give; iPhone and Android; changing phones; adding a stamp; changing the design; the cost; how to stop |
| The close | – | "Start with the card. Pay only once customers can join.", "Start free" and the price |
| Footer | – | Logo, the anchors, sign in, language, "© 2026 PunchMe". No Terms/Privacy/Contact links, because those pages don't exist |

Fifteen things on the page weren't true. Seven were fixed on 15 Oct 2026,
in one small change right after Phase 0, outside the phases; the rest in
Phase 9's step B.

- **Removed** (CLAUDE.md, "The brand is candour"; decision D2), with their
  components and keys in both languages:
  1. the invented testimonials (`Testimonials.tsx`, `landing.testimonials`);
  2. the unsourced stats band (`StatsBand.tsx`, `landing.stats`);
  3. the "Most popular" badge;
  4. the line "Join the business owners already earning more"
     (`landing.finalCta.body`);
  5. (Phase 9) the invented dashboard band, with its names and figures
     (`AppShowcase.tsx`, `landing.app`), and the sample notifications that
     greeted customers by name and offered discounts the product can't
     give (`PushBand.tsx`, `landing.push`).
- **Corrected** (CLAUDE.md):
  6. "Unlimited push messages". Sends are capped at two broadcasts in any
     seven days and 25 rules. The Pro list writes the cap out by hand,
     while the dashboard reads it from the API, so if the backend's
     `MESSAGING_BROADCAST_MAX_PER_7D` changes, change the line with it.
  7. "No signup" in the hero. Joining takes a mobile number and an SMS code,
     so it says no app, no account, no password.
  8. (Phase 9) The automations listed a broadcast as an automation, the
     win-back twice and missed the birthday and the reward waiting. The
     page now names the three real rules and the broadcast apart.
  9. (Phase 9) The Pro list claimed unlimited customers, analytics reports
     and branding (free anyway). It now says what activating opens.
  10. (Phase 9) "Send a message. They come back." The page says what the
      messages do, never that people return.
  11. (Phase 9) Offers reach only customers who agreed. The join asks for
      that consent in its own box, but a message can be narrowed to them
      only when the owner asks, and not once two customers hold the card,
      so the page says only that the box exists.
  12. (Phase 9) Setup times ("in a minute", "live in minutes") with no
      source are gone.
- **Wrong FAQ answers** (PRODUCT.md):
  13. **Fixed.** The answer on changing the design after launch said to
      message PunchMe. Owners change it themselves, in Card Studio, and
      saving sends the new design to the cards already in customers'
      wallets.
  14. **Fixed (Phase 9).** "Message us", in the answer on changing phones,
      didn't say how. The card is kept with PunchMe, and joining again with
      the same mobile number brings it back with its stamps
      (`enroll_customer`).
  15. **Fixed (Phase 9).** iPhone and Android "update the same way". They
      are scanned the same way; messages arrive differently
      (`messaging.phones`).

## Links and anchors

- Calls to action go to `/onboarding` (the header, the menu, the counter,
  the price and the close, all "Start free"), `/login`, and `/dashboard`
  when signed in.
- The header, phone menu and footer link to `#how-it-works`, `#pricing` and
  `#faq`, in the page's order. The skip link targets `#main`. Sections
  offset for the sticky header (`scroll-mt-24`), and a link from another
  page to a section (`/#pricing`, say) lands there once the page and its
  fonts are in.
- Only `/onboarding`'s top bar and the dashboard's logo link back to `/`.

## Header behaviour

- It shows neither the signed-in nor the signed-out buttons until the
  session is known, so the buttons never flicker.
- A session stored in the browser that the server can't confirm right now
  (offline, the API down) counts as signed in, as `ProtectedRoute` counts
  it: "Dashboard", whose page says what's wrong and keeps trying, and Sign
  out in the menu. There is no avatar until the server names the owner.
- With large text the bar wraps onto a second row, so the menu and the
  language never leave the screen.
- Its "Start free" is the secondary pill: every section carries its own
  coral button, one per screen.
- The phone menu is the kit's `Sheet`: named, holding focus while open, and
  giving it back to the menu button when it closes. A section chosen in it
  scrolls the page and lands focus there.
- The language toggle stores `i18nextLng` and sets `<html dir lang>`. A
  first visit opens in the browser's language, and in Hebrew when the
  browser asks for neither (`src/i18n/languages.ts`). After that, the stored
  language wins.

## Code other pages depend on

- `src/components/marketing/primitives.tsx` is imported by 17 files across
  onboarding, sign-in and the public pages (`ctaClasses`, `focusRing`,
  `Eyebrow`, `ctaArrow`). The landing page no longer uses it; `Section`,
  `SectionHeader` and `cardHover` are used nowhere, for Phase 10 to delete.
- `PunchMark` (`PunchMark.tsx`) is used by onboarding's billing step.
- `calculator.ts`'s `PUNCHME_MONTHLY_PRICE` is read by ten files outside the
  page: the dashboard's price lines, the tour and `prices.test.ts`.
- `heroTemplates.ts`'s `HERO_TEMPLATES` and `heroDesignDoc` feed
  `/style-guide`'s stage and snap sections as well as the page.
- The page renders the standee's own `StandeeSheet` and the studio's
  `AppleCardPreview` and `GoogleCardPreview`, unchanged.
- Other pages use these `landing.*` keys:
  - `landing.nav.skipToContent`: `DashboardLayout`, `OnboardingLayout`,
    `/style-guide`
  - `landing.nav.signIn`: the onboarding `TopBar`
  - `landing.pricing.pro.price`: the onboarding billing step and
    `/style-guide`. Billing itself reads `PUNCHME_MONTHLY_PRICE`, not
    `landing.pricing.pro.*`.
  - `/style-guide` also samples `landing.hero.headline`, `landing.hero.cta`,
    `landing.pricing.title`, `landing.pricing.body`,
    `landing.pricing.pro.name`, `landing.after.lead`,
    `landing.proof.stats.0.*` and `landing.templates.*`.

## Accessibility in place

- A skip link, one `h1`, and `h2`s in order with no skipped levels.
- `focusRing` on every control, and 44px targets.
- The counter, the scan's answers and the lock screen are each one
  sentence to a screen reader, the objects inside them hidden.
- The trade switch is native radios: one tab stop, the arrow keys moving
  the choice the way the language reads.
- Figures, phone numbers and weekday labels carry `dir="ltr"` and bidi
  isolation, and so does the signed-in address in the account menus.
- Decoration is `aria-hidden`.
- Reduced motion starts with everything in its final state: the panels
  lit, the counter scanned (its answer standing, the stamp on the pass,
  only the answer's glow when it is first seen), the sample message on
  the lock screen. Pro's light alone keeps its 150ms sign-on; every word
  on that panel is there from the start.

The four known gaps from the first version of this file are closed: the
phone menu has a name, a focus trap and a way back; the carousel's tabs
became a segmented control with arrow keys; citation links say they open a
new tab; the "Fine-tune" chevron went with the calculator.

## Meta

- The tab's title follows the page's language (`landing.meta.title`).
  There's still no meta description or Open Graph.
- While the page is mounted, `<html>` wears `theme-lightbox` and a
  wall-coloured `theme-color` goes in ahead of `index.html`'s.
- The page renders client-side.
- `index.html` loads Rubik, Assistant, IBM Plex Mono and Roboto (Roboto
  draws the Google Wallet preview, which the page now shows).

## Translations

- `landing.*` has the same keys in `en` and `he`, and no plural forms: the
  page's counts come from the dashboard's own copy
  (`dashboard.scan.result.toGo`, `messaging.sentence.giftStamps`).
- Hebrew strings that open with a figure or a Latin word start with a
  right-to-left mark (U+200F) that keeps them in place. Keep those marks.
- Figures inside a sentence are wrapped `<ltr>…</ltr>` and rendered as their
  own left-to-right run.
