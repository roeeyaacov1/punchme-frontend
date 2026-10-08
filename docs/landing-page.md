# Landing page: what carries over

What the landing page (`/`) has today that a rework has to keep: the
evidence, the calculator, the links and the behaviour. Written 8 Oct 2026
from `src/routes/marketing/LandingPage.tsx` and the components it renders, as
the input for the redesign. Like `docs/dashboard-routes.md`, it says nothing
about design on purpose. The list of blocks is here so nothing is lost by
accident, not as a layout to copy.

- Page: `src/routes/marketing/LandingPage.tsx`. Sections, the calculator and
  the sources: `src/components/marketing/`. Reveal-on-scroll:
  `src/components/motion/useReveal.ts`.
- Copy: `landing.*` in `src/i18n/locales/{en,he}/common.json`.
- The page makes no API calls of its own. The header reads the session to
  decide between "Sign in" and "Dashboard".

## The rules that make it this page

- **Every printed number has a visible, clickable source.** That is the
  house rule written at the top of `src/components/marketing/sources.ts`:
  if a claim can't be linked to a source, it doesn't go on the page.
- **Sourced figures never count up.** They're printed, not animated
  (`ProofBand.tsx` explains why).
- **The calculator can show a negative result** and say so.
- **Nothing is tracked.** The calculator promises "nothing you type here
  leaves your browser". That is only true because the site has no
  analytics. Adding any would have to leave the calculator's query string
  out.

## The evidence

URLs live in `sources.ts`, keyed by `id`. The copy lives in
`landing.proof.stats`. The caveats on each line stay on the page.

| id | Figure | Claim | Source as printed |
|---|---|---|---|
| `square` | 6x | Regulars generate about six times more annual revenue than one-time customers | Square Local Economy Report, March 2026 (US data) |
| `hbr` | 5–25x | Winning a new customer costs five to twenty-five times more than keeping one | Harvard Business Review, 2014 |
| `harris` | 58% | 58% are less likely to join a loyalty program that makes them download an app (and 79% more likely to join one with no physical card) | Harris Poll for Wilbur, 2019 |

## The revenue calculator

Files: `RevenueCalculator.tsx` (UI), `calculator.ts` (the arithmetic, pure),
`calculator.test.ts` (keep it passing).

| Input | Range | Default | Café / Barbershop / Studio presets |
|---|---|---|---|
| Average spend per visit (₪) | 20–500, step 5 | 60 | 28 / 70 / 180 |
| Stamps to earn the reward | 5–12 | 10 | 10 / 8 / 6 |
| Customers who become regulars this year | 1–100 | 10 | 25 / 12 / 6 |
| Gross margin (%), under "Fine-tune" | 30–90, step 5 | 65 | 75 / 70 / 60 |

The model in `calculator.ts`:

- A reward is costed at cost of goods (ticket × (1 − margin)), not at shelf
  price.
- The headline number is how many regulars cover a year of PunchMe. It
  doesn't depend on the "regulars" input.
- The net for the year is not clamped at zero.
- The price comes from `PUNCHME_MONTHLY_PRICE` (₪99).

Behaviour to keep:

- Every input is a slider plus a typed number. The typed number is clamped
  and normalised when the field loses focus.
- A negative net turns the total red and shows the "you would need N regulars
  before PunchMe pays for itself" callout.
- `?ticket=&stamps=&regulars=&margin=` restores a result on load, so an
  owner can send one to themselves. The URL is only rewritten after a real
  interaction.
- Screen readers hear one summary, 500 ms after the last change
  (`aria-live`). Each slider has its own `aria-valuetext`.
- On a phone, a bottom bar shows the result while a slider is held.
- The pricing block's "based on your numbers" line appears only after the
  visitor has moved something and only when the result is positive.
- Figures ease for 400 ms, and jump straight to the value under reduced
  motion.

## What the page says today

| Block | `id` | What it says |
|---|---|---|
| Header | – | Logo; anchor links; language toggle; "Sign in" and "Design your card" when signed out, "Dashboard" and an account menu when signed in |
| Hero | – | "You deserve a customer club too", the wallet promise, "Start free" and "See what regulars are worth"; a real pass (the card-studio Apple preview, fed by three real presets in `heroTemplates.ts`) taking a stamp |
| Paper cards | `paper-cards` | Paper punch cards are over |
| Proof | `proof` | The three sourced numbers above |
| Push | `push` | Messages bring customers back; three sample notifications |
| How it works | `how-it-works` | Create the card, share a QR, scan and reward |
| App showcase | `dashboard` | The owner's dashboard on a phone, drawn with sample data (`aria-hidden`) |
| Calculator | `calculator` | Your own arithmetic |
| Testimonials | `testimonials` | Three quotes with five stars. **Invented**: `Testimonials.tsx` carries a warning |
| Automations | `automation` | Special offers, smart reminders, automatic win-back |
| Stats | – | "10,000+ active customers", "85% return rate", "<60 seconds to set up". **No sources**: `StatsBand.tsx` says so |
| Pricing | `pricing` | Free to design, preview and use the dashboard; Pro ₪99/month only when you activate. "Most popular" badge |
| FAQ | `faq` | Six questions in native `<details>` |
| Final CTA | – | "Ready to turn one-off customers into regulars?" |
| Footer | – | Product links, language, ©. No Terms/Privacy/Contact links, because those pages don't exist |

The invented testimonials, the unsourced stats, the "Most popular" badge and
the line "Join the business owners already earning more" conflict with
CLAUDE.md's rule against invented testimonials and unsourced metrics. Keeping,
replacing or removing them is the owner's decision, and the redesign guide
asks for it first.

## Links and anchors

- Calls to action go to `/onboarding` (seven of them), `/login`, and
  `/dashboard` when signed in.
- The header, phone menu and footer link to `#how-it-works`, `#calculator`,
  `#pricing` and `#faq`. The skip link targets `#main`. Sections offset for
  the sticky header (`scroll-mt-24`).
- Only `/onboarding`'s top bar and the dashboard's logo link back to `/`.

## Header behaviour

- It shows neither the signed-in nor the signed-out buttons until the
  session is known, so the buttons never flicker.
- The phone menu is a dialog. It locks scrolling and closes on Escape.
- The language toggle stores `i18nextLng` and sets `<html dir lang>`. The
  site defaults to English whatever the browser's language
  (`src/i18n/index.ts`).

## Code other pages depend on

- `src/components/marketing/primitives.tsx` is imported by 45 files across
  onboarding, the dashboard, sign-in, the public pages and admin.
  - Used everywhere: `ctaClasses`, `focusRing`, `Eyebrow`, `cardHover` and
    `ctaArrow`.
  - Landing-only: `Section` and `SectionHeader`.
- `PunchMark` and `PunchRow` (`PunchMark.tsx`) are used by six dashboard and
  onboarding files.
- The `.theme-purple` token scope in `src/index.css` is also used by the
  onboarding wizard and the sign-in page.
- Other pages use these `landing.*` keys:
  - `landing.nav.skipToContent`: `DashboardLayout`, `OnboardingLayout`
  - `landing.nav.signIn`: the onboarding `TopBar`
  - `landing.pricing.pro.price` and `.per`: `BillingSettingsPage`
- `landing.pricing.price` is used by the onboarding billing step, but the
  key no longer exists in either language.

## Accessibility in place

- A skip link, one `h1`, and `h2`s in order with no skipped levels.
- `focusRing` on every control, and 44px targets, including the sliders.
- The calculator's debounced live region.
- Reduced motion is handled in JavaScript as well as CSS: `useReveal` starts
  visible, the carousel starts stamped, and numbers jump.
- Figures, phone numbers and weekday labels carry `dir="ltr"` and bidi
  isolation.
- Decoration is `aria-hidden`.

Known gaps, for the rework to fix:

- The phone menu dialog has no accessible name and no focus trap, and it
  doesn't return focus to the menu button.
- The carousel tabs have no `aria-controls` and no arrow keys.
- Citation links open a new tab without saying so.
- The "Fine-tune" chevron ignores reduced motion.

## Meta

- `<title>` is English only, and there's no meta description or Open Graph.
- The page renders client-side.
- `index.html` loads Rubik, Assistant, IBM Plex Mono and Roboto (Roboto
  draws the Google Wallet preview).

## Translations

- `landing.*` has the same keys in `en` and `he`.
- Hebrew adds the `_two` and `_many` plural forms the calculator needs.
- Nineteen Hebrew strings start with a right-to-left mark (U+200F) that
  keeps figures in place. Keep those marks.
