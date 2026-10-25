# The owner pages

Phase 7, step A of `docs/redesign/guide.md`: Team (`/dashboard/team`),
Billing (`/dashboard/billing`), and the two pages Stripe's checkout returns
to, `/billing/success` and `/billing/cancel`. Diagnosed and written on 25 Oct
2026 with `/impeccable critique`, `/impeccable audit` and `/impeccable shape`
(mode: Operate). No code changed. Step B builds it on Lightbox (DESIGN.md)
and `src/components/kit`, in Plan mode.

The inputs:
- CLAUDE.md ("Roles"), PRODUCT.md, DESIGN.md and `docs/dashboard-routes.md`;
- in `docs/redesign/briefs`: `visual-world.md`, `dashboard-shell.md` (§7.9,
  the role panel; §8, how a page claims Lightbox), `dashboard-counter.md`
  (the Overview's activation panel, a read that fails saying so) and
  `dashboard-manager.md` (the Free notices with the price, a refusal said
  where it happens);
- the pages' code, and the backend's billing service and team module (§5);
- the pages themselves on the local backend's demo data: Demo Coffee on Pro
  (owner, manager, staff) and Demo Barbershop on Free (its owner, with three
  hires earlier sessions invited).

They were walked as the Free owner, the Pro owner, the Pro manager and the
Pro staff member, Hebrew first at 375px, then in English at 1280px and at
night. Stripe isn't configured locally, so no checkout or portal was reached:
the states Stripe would produce, and every failure, were seen by wrapping
`fetch` in the reviewer's own tab. Two reviewers ran apart for the critique,
one after the other, since browser agents share one session:
- **A, design review:** read the code and walked the four routes live as the
  four accounts;
- **B, detector:** ran Impeccable's detector over the five markup files and
  injected its overlay into the live pages.

Four questions went to Roee on the way; his answers are in §6.

Read "In short" first. Sections 7 and 8 are what step B builds.

1. In short
2. The pages today
3. Critique
4. Audit
5. What the backend says
6. Decisions made in this step
7. The new pages
8. Copy
9. What step B keeps, touches and checks
10. Open questions for Roee
11. Left for other phases, and outside the redesign

---

## 1. In short

- **Four routes, one job: the owner's own business with PunchMe.** Who else
  works here, what it costs, and what happens around paying. Team and Billing
  claim Lightbox with `useLightboxPage()` and are rebuilt on the kit, so the
  seam (lavender by day, navy at night, under the warm frame) closes for the
  owner group. The two return pages, outside the shell, wear Lightbox
  themselves, in the dashboard's day and night (Roee, §6).
- **The invite leads Team, and turns into the link where it was made**
  (Roee, from Impeccable's roll, §6). The link shows in full, with the
  phone's share menu and Copy, says who can use it and until when, and what
  the hire will be asked to do. Today the link is never on screen: it goes to
  a clipboard write that fails silently on an iPhone (and in the preview
  pane), and the only sign that anything happened is a row below the
  screen.
- **Billing says where the business stands, then the one thing to do.**
  - **Free:** ₪99 a month, the four things activating turns on (the
    Overview's own four), what stays free, and that it can be cancelled any
    time, here.
  - **Pro:** what it costs, paid until when, where to change or stop it, and
    what cancelling does to customers' cards, said before the owner does it.
  - **A failed renewal** goes to the portal to fix the card, never to a
    second checkout, which the backend would ignore while Stripe bills it.
- **The return from Stripe never strands the owner.** `/billing/success` says
  what it is waiting for, keeps trying through a failed read, after 30 s says
  there's no need to pay again and gives a way on, and hands off only once the
  business reads Pro, so the shell's sign switches on. `/billing/cancel`
  answers "was I charged?" first.
- **Nine things say what isn't so, and this phase fixes them:**
  - every open invitation reads "פג ב-…" ("expired on"), with a US-format
    date;
  - "בלי מיילים" sits over an email field;
  - the code says the link stays on screen when the clipboard refuses it; it
    was never on screen;
  - Billing prints Stripe's raw word: "סטטוס: none", in Plex Mono;
  - a business whose renewal failed is offered a second subscription;
  - every billing failure says "try again in a moment", a permanent 400
    included;
  - a team that fails to load is drawn as a team of nobody, the owner
    included;
  - `/billing/success` says "completing" for good after one failed read, and
    to a hire;
  - the day of activation opens on "עדיין לא פעיל · הפעלה", and the sign never
    switches on.
- **Two facts to settle before any of it ships** (§10): what Stripe actually
  charges (₪99 in every page, ₪59 in the backend's `DEPLOYMENT.md`), and where
  the portal returns (its default is `/billing`, which the app doesn't route).

## 2. The pages today

### What each role and plan sees

Checked with real sign-ins for every row; the Stripe states and the failures
through a wrapped `fetch` in the reviewer's tab.

| | Team | Billing | `/billing/success` | `/billing/cancel` |
|---|---|---|---|---|
| Free owner | "הזמנה לצוות", "בלי מיילים", then "האימייל שלהם (לא חובה)" under it; a staff and manager switch with its sentence; "יצירת קישור הזמנה". Then "מי בצוות": the owner and three hires as emails, each hire with a violet switch and a trash icon; "הזמנות פתוחות" when there are any | "אתם בתוכנית החינמית" with a "חינמי" tag; "₪99 /חודש"; "הפעלה" (56px); "סטטוס: none". Activate answers 503 here, with no Stripe key: "משהו השתבש. נסו שוב בעוד רגע." | 30 s of "משלימים את המנוי שלכם…", then "זה לוקח קצת יותר מהצפוי — בדקו שוב בקרוב", with no heading, link or button, and no second try | "התשלום בוטל" (h1), "לא בוצע חיוב.", and "חזרה לחיוב", a 58×20 text link; the document's title in English |
| Pro owner | The owner, the manager and the staff member as emails; a tap on a role is an instant PATCH, and nothing is said | "הכרטיסייה שלכם פעילה" with "פרו"; "לקוחות אמיתיים יכולים להצטרף ולאסוף. אפשר לנהל או לבטל את המנוי בכל רגע."; "ניהול חיוב"; "סטטוס: none"; no price. Manage answers 400 here (the demo's Pro has no Stripe customer), and the page says the same "נסו שוב בעוד רגע" | Straight to `/dashboard?activated=1` and "אתם פעילים!", months after activating as on the day | The same "התשלום בוטל", on a business that is Pro |
| Pro manager and staff | The shell's role panel, on Lightbox: "צוות" with a lock, "הדף הזה לא פתוח בשבילכם", who can open it, "נכנסתם בתור Yossi Cohen, מנהל/ת", whom to ask, and "לסקירה" (44px). No call behind it | The same panel, "חיוב" | The poll answers 403, and the page says "משלימים את המנוי שלכם…" for good, with "Uncaught (in promise) ApiError" in the console | "התשלום בוטל" and "חזרה לחיוב", which leads to the refusal |

Neither hire's navigation shows Team or Billing. On Free, the masthead's
"הפעלה" leads to Billing, Billing itself included.

### The three questions

**Does an owner understand that an invitation is a link they send
themselves?** In words, yes. "יוצרים קישור ושולחים אותו איך שאתם כבר מדברים
איתם. בלי מיילים." says it, and the hint under the email field flips between
what a blank and a named address mean, true to the backend. In practice, no:
- **the link is never shown.** Making one writes it to the clipboard after the
  request returns. When the browser refuses (an iPhone after an awaited
  request, an in-app browser, the preview pane), nothing on screen changes but
  "טוען..." on the button for a moment;
- **the new invitation lands below the screen,** at y 1,117 with the screen
  ending at 942, at 375, and focus falls to `<body>`;
- **in Hebrew the fresh invitation reads "פג ב-11/8/2026":** "פג" is
  "expired", and the date is in the browser's US order, so an Israeli reads 11
  August;
- **"בלי מיילים" sits right above "האימייל שלהם (לא חובה)";**
- **a second press,** the natural one when nothing happened, mints a second
  open link.

**Is it plain what is free, what costs ₪99, what activating unlocks, and how
to stop?**
- **What is free:** yes. "עיצוב הכרטיסייה, תצוגה מקדימה בטלפון שלכם והשימוש
  בלוח הבקרה — הכול בחינם."
- **What costs ₪99:** on Free, "₪99 /חודש". On Pro the price never appears,
  and nothing says when the next charge is, though `current_period_end` is in
  the response.
- **What activating unlocks:** "ההפעלה היא מה שמאפשר ללקוחות אמיתיים להצטרף."
  The Overview's activation panel, which links here, names four things, and
  Billing names one.
- **How to stop:** on Free, never said. On Pro, "אפשר לנהל או לבטל את המנוי
  בכל רגע." beside "ניהול חיוב", which doesn't say it opens Stripe. No page
  says what stopping does to the cards customers already hold.
- **The one word for the state is Stripe's, untranslated:** "סטטוס: none", on
  both plans.

**Back from Stripe, does the owner know where they stand and what happens
next?**
- **Cancel:** on the money, yes ("לא בוצע חיוב"). On the plan, no: nothing
  says the card is as it was. The way on is a link 20px tall, and a hire is
  sent from it to a refusal.
- **Success:** no.
  - One centred sentence; after 30 s a dead end, with no link, no button and
    no word on whether they were charged; after one failed read, "completing"
    for good.
  - When the payment does go through (simulated, with the business read held
    700ms), the hand-off shows the Free Overview first: "עדיין לא פעיל" and
    "הפעלה", the very button the owner just paid through, then "אתם פעילים!"
    about 0.7 s later.
  - The shell's sign never switches on. `DashboardLayout` decides it once, as
    it mounts, from the plan it has (`DashboardLayout.tsx:108-110`), and the
    success page doesn't wait for the business before it navigates
    (`BillingSuccessPage.tsx:31-32`).

### Measured

- **Page heights at 375, in Hebrew:** Team on Free 1,175px, 1,432 with one
  open invitation and 1,592 with two; Team on Pro 1,061; Billing and the two
  return pages the height of the viewport. At 1280: Team 907, Billing 900.
- **No horizontal overflow at 375,** a 53-character email included, which
  truncates and loses its domain.
- **Text under 13px:** the role and plan tags at 11px (Plex Mono, uppercase,
  tracked), and each invitation's expiry at 12px.
- **Plex Mono, which has no Hebrew:** every tag ("בעלים", "מנהל/ת", "חינמי",
  "פרו"), "none" at 14px, and Team's "טוען..." (`TeamPage.tsx:202`).
- **Contrast:** no AA failure on the four pages, by day or at night; the
  tightest is the owner tag at night, 4.70:1 at 11px.
- **Under 44px:** "יצירת קישור הזמנה" 159×40, "העתקת קישור" 134×42, the
  removal's "להסיר" 66×40 and "ביטול" 64×42, and the cancel page's link
  58×20.
- **Focus:** after making a link, cancelling an invitation, opening the
  removal's confirmation, cancelling it, and a failed Activate, focus falls to
  `<body>`. Only the role switch keeps it.
- **Live regions:** only the shell's route announcement ("צוות", "חיוב").
  Nothing these pages do is announced, and Team's errors are a warn notice
  without `role="alert"`.
- **Headings:** Team has an h1 and two or three h2s; Billing an h1 and an h2;
  the cancel page an h1; the success page none. The return pages have no
  `<main>` and no skip link.
- **The seam:** `<html>` wears `theme-purple theme-raised` (and `theme-night`)
  on Team and Billing: by day a lavender page under the warm masthead, at
  night a navy page beside the brown rail. The return pages carry no theme at
  all and set fixed `text-navy` (#0e1120) and `text-slate` (#5c6478), so they
  are by day even at night.
- **At 1280,** the email field is about 930px wide, and Billing is a 576px
  card in an empty page.

## 3. Critique

Team 22/40 and Billing 21/40, Acceptable; the two return pages 12/36, Poor.
Heuristic 7 doesn't apply to a page with one job, so the return pages are
scored out of 36. The scores are A's: the detector added no issue A had
missed, and its one real advisory is A's own Plex Mono tags. The snapshots
are in `.impeccable/critique/` (untracked), one per page group, for step D's
`/impeccable polish`.

| # | Heuristic | Team | Billing | Return pages | Key issue |
|---|---|---|---|---|---|
| 1 | Visibility of system status | 2 | 2 | 1 | Making a link changes nothing in view; the raw "סטטוס: none"; no busy state on the redirects; "completing" for good after one failed read |
| 2 | Match with the real world | 2 | 2 | 2 | "פג ב-" on a live link, in the browser's date order; Stripe's word untranslated; "פרו" here and "מסלול Pro" on the landing page; the return pages' title in English |
| 3 | User control and freedom | 3 | 2 | 1 | How to stop never said on Free, and never what stopping does; the success page has no way out, and an installed iPhone app no Back button |
| 4 | Consistency and standards | 2 | 2 | 1 | The violet scope inside Lightbox; the destructive "להסיר" in the primary fill; Billing says less than the Overview that links to it; the return pages outside the shell, unbranded |
| 5 | Error prevention | 2 | 2 | 1 | "dana@" taken as an address; a silent result invites a second open link; a failed renewal offered a second subscription; an unhandled rejection freezes the success page |
| 6 | Recognition rather than recall | 2 | 2 | 2 | The link never shown; people as emails; the unlocks carried from the Overview; the plan unchanged never said on cancel |
| 7 | Flexibility and efficiency | 2 | 3 | n/a | Copy only, with no share menu; an expired link can't be renewed |
| 8 | Aesthetic and minimalist design | 3 | 3 | 2 | Calm but generic; member rows 114px stacks led by a violet pill at 375; the return pages so empty they look broken |
| 9 | Error recovery | 1 | 2 | 1 | Every Team failure lands at the top, often off-screen, in the API's English, and outlives the next success; "נסו שוב בעוד רגע" for a 400 that won't change; nothing after the timeout |
| 10 | Help and documentation | 3 | 1 | 1 | Team says what roles open, but not what the hire will be asked to do; Billing silent on cadence, receipts, VAT, cancelling and customers' cards |
| | **Total** | **22** | **21** | **12/36** | |

**Specificity.** The copy is the authored part:
- links sent "however you already talk to them";
- roles said as what they open;
- the honest cost of a blank address ("כל מי שיפתח את הקישור יוכל להצטרף");
- the price printed before the button;
- a success page that refuses to trust the redirect.

The composition could be any SaaS settings screen: an invite form, a member
list with a role switch and a pending list; a plan card with a tag, a price
and a button. Nothing of the lit sign reaches them. Nor does the product's
own argument: the page where the owner decides is the one place the
calculator's "how many regulars cover ₪99" is missing. The two return pages
are the least authored screens in the product, one sentence on a blank
page.

**The detector.**
- **CLI:** 0 findings and 2 advisories over the five files (the four pages
  and `dashboard/primitives.tsx`), the same with and without the project's
  config.
  - `design-system-font-size` at `primitives.tsx:265`: real. It is the old
    `Tag`, 11px Plex Mono, uppercase and tracked, on the owner's tag and an
    invitation's role (`TeamPage.tsx:313`, `:250`) and on the plan
    (`BillingSettingsPage.tsx:74`).
  - `design-system-font-size` at `primitives.tsx:210`: 10px in `Readouts`,
    which nothing imports, so not on these pages.
- **Overlay:** injected at 375 in Hebrew into Team and Billing as the Free and
  the Pro owner, both return pages as the Free owner (the success page after
  its timeout), and Billing at 1280.
  - `nested-cards` ×7, all on Team: the old `SegmentedControl`'s track inside
    its panel, one per hire plus the invitation's. False: it is a control's
    edge, which DESIGN.md asks for (Field Edge), and the email field beside
    it, drawn the same way, isn't flagged.
  - Everything else clean.
- **No overlay to show:** the pane stayed hidden, so the outlines never drew,
  and the reviewer removed them.

**Priority issues**
1. **[P1] The return from Stripe ends in a dead end, a false "completing", or
   a flash of "not live"** (§2, the third question):
   - the poll has no catch, so one failed read, a hire's 403 included,
     freezes it on "completing" (`BillingSuccessPage.tsx:22-48`);
   - it gives up at 30 s for good (`:36-39`);
   - it has no heading, landmark, live region, link or button (`:50-53`);
   - it navigates before the business reads Pro (`:30-33`).

   `/billing/cancel` is a bare page whose 58×20 link sends a hire to a
   refusal (`BillingCancelPage.tsx:8-14`). Fixed in §7.5 and §7.6.
2. **[P1] The invitation link is never shown,** and getting it depends on a
   silent clipboard write after the request (`TeamPage.tsx:82-87`,
   `:113-124`). The comment at `:119-121` says the link is on screen and
   selectable either way; it isn't anywhere. Fixed in §7.3.
3. **[P1] A business whose renewal failed is offered a second subscription.**
   Billing branches on the plan alone (`BillingSettingsPage.tsx:29`,
   `:71-99`), and the second subscription wouldn't bind (§5). Seen with a
   simulated `past_due`: "אתם בתוכנית החינמית · ₪99 /חודש · הפעלה · סטטוס:
   past_due". Fixed in §7.4.
4. **[P1] Billing doesn't answer the payer's questions,** and prints a raw
   API word (`BillingSettingsPage.tsx:69-114`, `:105-110`):
   - one unlock where the Overview names four;
   - no price and no date on Pro;
   - no way to stop on Free, and nothing anywhere on what stopping does.

   Fixed in §7.4.
5. **[P2] Team's failures are silent, or land far from the action:**
   - one warn notice at the top for every write, without `role="alert"`
     (`TeamPage.tsx:138`);
   - the API's English `detail` for an unknown refusal (`:74`);
   - an error that outlives the next success (`:93`);
   - no `isError` branch, so a failed read draws an empty team and hides an
     open link, which can then not be cancelled (`:55-59`, `:201-222`).

   Fixed in §7.3.
6. **[P2] Hebrew calls every open invitation expired,** and dates follow the
   browser, not the app: "פג ב-{{date}}" (`team.pending.expires`) with
   `toLocaleDateString()` and no locale (`TeamPage.tsx:245`). And `dir="ltr"`
   on whole paragraphs pushes Hebrew ("כל מי שיש לו את הקישור") and every
   email to the left edge of a right-to-left row (`:238`, `:306`). Fixed in
   §7.3 and §8.

**Personas**
- **Avi (Free barber deciding):**
  - Billing names one unlock where the Overview named four;
  - nothing on how to stop, or on what happens to his customers' cards if
    he does;
  - "סטטוס: none";
  - "הפעלה" doesn't say it opens a payment page, and no word on VAT;
  - if he backs out of Stripe, a bare page and a 20px link; if he pays and
    the webhook is slow, one sentence and no way out.
- **Dana (Pro café owner, adding her first hire between customers):**
  - nothing changes in view when she makes the link, and there's no Share;
  - she presses again and makes a second open link;
  - the row says "פג ב-11/8/2026";
  - her manager is "manager@…";
  - a slip on the role switch demotes him at once, with nothing said.
- **Sam (screen reader, keyboard):**
  - focus falls to `<body>` after five different actions;
  - making a link, cancelling one, a role change and a removal announce
    nothing;
  - the address's consequence sentence isn't wired with `aria-describedby`;
  - every cancel button has the same name;
  - the success page has no heading, landmark or live region, so its timeout
    is silent;
  - the tags are Plex Mono, which has no Hebrew.
- **A hire who typed the URL:**
  - Team and Billing: the shell's panel, specific and calm, with no call
    behind it;
  - `/billing/success`: "משלימים את המנוי שלכם…" for good;
  - `/billing/cancel`: "חזרה לחיוב", into a refusal.

**Strengths, kept:**
- **The role panel** (the shell's): the page's name with a lock, who can
  open it, who they are, whom to ask, one way out, and no call behind it.
  It is what the return pages lack.
- **Team's consequence-first copy:** the line under the address changes with
  it, and every sentence matches the backend (single use, two weeks, tied to
  one address).
- **Billing's honest skeleton:** the price before the button; "לא בוצע
  חיוב" first on cancel; a success page that waits for the webhook's plan; a
  confirmation before removing someone; and no remove on the owner's row, so
  a shop can't lose its owner.

## 4. Audit

10/20, Acceptable.

| # | Dimension | Score | Key finding |
|---|---|---|---|
| 1 | Accessibility | 2 | Focus to `<body>` after five actions; nothing announced; Team's errors without `role="alert"`; tags at 11px Plex Mono, Hebrew among them; five targets under 44px; the success page without a heading, landmark or live region; the address's consequence not wired to its field |
| 2 | Performance | 3 | Lean: one read a page, and the success poll bounded at 30 s |
| 3 | Theming | 1 | Team and Billing on the old violet scope with the old primitives (violet fills and "selected", a violet focus on the field); the return pages on no scope at all, with fixed navy and slate and no night |
| 4 | Responsive | 2 | No overflow at 375; the old `sm` buttons 40–42px; a 58×20 link; 114px member rows; a 930px email field at 1280; an email's domain lost to its ellipsis |
| 5 | Implementation integrity | 2 | Old primitives only; a failed read draws an empty team; raw API words in the UI; two unhandled rejections; dates in the browser's locale; a comment that promises what the page doesn't do; a redirect flag never reset |

**Detailed findings**
- **[P1] Focus dropped five times.** After making a link (the button disables,
  `TeamPage.tsx:189`), cancelling an invitation, opening and cancelling the
  removal, and a failed Activate, focus falls to `<body>` (seen). WCAG 2.4.3.
- **[P1] The success poll, the invitation link and the second subscription**
  (§3, issues 1 to 3).
- **[P2] Silent changes.** Making a link, cancelling one, a role change and a
  removal say nothing to a screen reader, and the success page's switch to
  its timeout isn't announced. WCAG 4.1.3.
- **[P2] A failed read draws an empty team** (§3, issue 5). The counter
  pages' rule: a read that fails says so, with "נסו שוב".
- **[P2] Dates and direction** (§3, issue 6).
- **[P2] Type:** the old `Tag` (`primitives.tsx:257-272`) at 11px Plex Mono,
  and an invitation's expiry at 12px (`TeamPage.tsx:241`).
- **[P2] The redirect flag** (`BillingSettingsPage.tsx:30`, `:42-48`) is set
  before leaving for Stripe and reset only on an error, so a page restored
  from the back-forward cache after Back keeps its button disabled.
- **[P2] The address isn't checked:** the API takes any string (§5), and the
  field isn't in a form, so `type="email"` checks nothing. "dana@" made a
  link nobody can use, and `team.error.badEmail` almost never fires.
- **[P3] Facts fetched and never shown:** `current_period_end` (Billing) and
  `joined_at` (Team).
- **[P3] Developer text:** the raw `status`, and `err.message` for an
  unknown refusal, in English.

**Positive, and kept:**
- the role panel, its gating, and no call behind it;
- `role="alert"` on Billing's danger notice;
- the address field's `dir="ltr"` and `inputMode="email"`;
- no remove on the owner's row, and a confirmation before removing anyone
  else;
- a success page that waits for the webhook's plan.

## 5. What the backend says

Read from `../punchme-backend` (`tooling/seed-demo`, `87ee16f`), because a
page about money and access is only as honest as its reading of them.

### Billing (`apps/billing/services.py`)

- **Pro is two of Stripe's words.** A business is Pro while its subscription
  is `active` or `trialing` (`ACTIVE_STATUSES`, line 23), and Free otherwise.
  The webhook is the only writer of `Business.plan`; checkout's redirect back
  is never taken as proof.
- **`GET /api/billing/subscription`** answers:
  - `status`: `none` when there's no subscription, otherwise Stripe's word
    stored as it came (`active`, `trialing`, `past_due`, `unpaid`,
    `canceled`, `incomplete`, `incomplete_expired`, and whatever Stripe adds);
  - `plan`, read in the same response;
  - `current_period_end`, which no page shows today.
- **A failed renewal is Free at once.** `past_due` and `unpaid` aren't in
  `ACTIVE_STATUSES`, so the moment a renewal fails, new customers are turned
  away and messages stop, while Stripe is still retrying the card.
- **A second checkout during a failed renewal is lost.** The business's row
  stays bound to the failing subscription until it is `canceled`
  (`RELEASABLE_STATUSES`, line 33; `_binding_conflicts`, line 199). A new
  checkout in that window makes a second subscription, which Stripe bills
  and the backend ignores: the owner pays again and stays on Free. Billing
  offers exactly that today, because it picks its button from the plan
  alone. Only `none`, `canceled`, `incomplete` and `incomplete_expired` can
  take a new checkout safely. Every other status belongs in the portal.
- **Checkout** is one price (`STRIPE_PRICE_ID`), monthly. It returns to
  `BILLING_SUCCESS_URL` or `BILLING_CANCEL_URL`, by default `/billing/success`
  and `/billing/cancel` on punchmeapp.com.
- **The portal** needs a Stripe customer. Without one it answers 400, "No
  billing has been started for this business yet". It returns to
  `BILLING_PORTAL_RETURN_URL`, by default `https://punchmeapp.com/billing`: a
  path the app has no route for. `main.tsx` routes `/dashboard/billing`,
  `/billing/success` and `/billing/cancel`, so `/billing` is React Router's
  developer page ("Unexpected Application Error! 404 Not Found"), seen.
- **Stripe down or misconfigured:** 503 `billing_unavailable`.
- **Who may call:** all three go through `get_owned_business_or_404`, so a
  manager or staff member gets 403 `insufficient_role`.
- **What the price is:** the app says ₪99 everywhere (`PUNCHME_MONTHLY_PRICE`
  and three literal strings), and Stripe charges whatever `STRIPE_PRICE_ID`
  holds. The backend's `DEPLOYMENT.md:144` says to create "your ₪59/mo
  recurring Price". Nothing in either repo says whether the price includes
  VAT (§10).
- **Locally:** `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID` and the webhook secret
  are empty, so Activate answers 503 and no webhook ever arrives. `seed_demo`
  puts Demo Coffee on Pro directly, with no Stripe customer, so its status
  reads `none` and Manage answers 400.

### The team (`apps/businesses/team.py`)

- **The owner isn't a membership.** `Business.owner` is the only record of
  who owns a business, so the owner's row can't be changed or removed, and a
  shop can't end up with nobody in charge.
- **The link is the credential:** 43 characters, single use, two weeks,
  revocable, and never more than manager. Nothing is emailed.
- **An email ties the link to one account.** Only someone signed in with
  that address can accept it (`InvitationEmailMismatch`), and inviting the
  same address again cancels the earlier link for it. Without an address,
  whoever opens the link first joins.
- **The address isn't checked.** The schema takes any string up to 254
  characters (`apps/businesses/schemas.py:385`), so "dana@" makes a link no
  one can accept.
- **Caps:** 25 people, the owner included (`MAX_MEMBERS`, line 38), and 20
  open invitations (`MAX_PENDING_INVITATIONS`, line 39). Both answer 409
  `team_cap_reached` without saying which; the page can tell from the team it
  holds.
- **`already_a_member`** (409) when the address belongs to someone on the
  team already.
- **The list** holds every invitation not yet accepted or cancelled, the
  expired ones included (`status: "expired"`), newest first. An accepted one
  leaves the list, and its person appears on the team.
- **A person is an email.** `MemberOut` carries `email`, `role`, `joined_at`
  and `is_owner`, and no name.
- **The invitee** opens `/invite/{token}`, sees the business and the role,
  and signs in or makes an account on that page (Phase 8's).

## 6. Decisions made in this step

| # | Question | Roee's answer (25 Oct) |
|---|---|---|
| 1 | How Team is laid out | **The invite first, turning into the link where it was made.** Impeccable's roll (`concept-seed --scope surface --mode operate`, seed `fcfa4ced`) dealt positions 4, 6 and 2 of seven ranked structures: the invite first (the dealt lead), two tabs (Team and Invitations), and the team first with the invite in a sheet. Roee took the lead |
| 2 | How the return pages wear Lightbox | **They follow the dashboard's day and night,** through the dashboard's own theme hook (§7.2) |
| 3 | How a link is handed over | **Share and Copy:** the phone's share menu where the browser has one, Copy everywhere, and the link shown in full. No QR |
| 4 | What Stripe charges | **Not settled yet.** The brief keeps ₪99, from `PUNCHME_MONTHLY_PRICE`, and §10 lists the price to settle against Stripe before Phase 7 ships |

The seven structures for Team, ranked in writing before the roll:
1. the invitation as an object to hand over, the link and a code, leading
   the page;
2. the team first, with the invite in a sheet that ends on the link;
3. the roles as groups, each with what it opens, its people and its own
   invite;
4. the invite first, turning into the link where it was made;
5. the invitation shown as the message the owner will send;
6. two tabs, Team and Invitations;
7. a log of who was invited and who joined.

Billing and the return pages weren't rolled: each has one job, and the
prompt names what it must say.

The decision page closes unseen in a hidden pane here, so the roll came
through the question tool, each structure with a wireframe at 375px. The
challengers the roll dealt were catalog worlds, and were declined: the world
is settled, and in Operate a world lends type, palette, density and one
signature move, never the layout. They were a zoo map, a Crouwel grid
specimen, a boarding pass with its gate board, a vertical video feed, a
centre-rail reference page and a variable-font specimen. One discipline from
the boarding pass is kept, as Phase 6 kept it: a row that changed keeps its
light until it is seen (§7.3, a hire who joined since the last visit).

**Decided in this brief,** for the review to overturn:
- **Billing's state comes from the subscription's `status`,** not the plan
  alone, mirroring the backend's own two sets (§7.4). It is what stops the
  second subscription.
- **Billing names the price as the Overview and the manager pages do,** from
  `PUNCHME_MONTHLY_PRICE`, isolated. The guide's step-B note asks to keep
  `landing.pricing.pro.price` and `.per`, or move them in both languages.
  They stay where they are: the landing's pricing band, onboarding's billing
  step and `/style-guide` read them. Billing stops reading them, and a small
  test ties every literal shekel price in both locale files to the constant
  (§7.7). If the note meant that Billing must keep reading them, its figure
  reads them instead and nothing else changes.
- **Nothing is copied by itself.** The owner presses Share or Copy, so it's
  never a guess what the clipboard holds (§7.3).
- **The device remembers a return from checkout** for a day, so that Billing
  can warn against paying twice while Stripe's word is late (§7.4, §7.5).
- **Billing's Free states link to the calculator,** quietly: "לא בטוחים
  שזה משתלם? חשבו עם המספרים שלכם." to `/#calculator`, which runs on the
  owner's own numbers and can say no (§7.4).

## 7. The new pages

### 7.1 What is fixed

- **The four routes,** and their gating:
  - Team and Billing inside the `RequireRole minimum="owner"` group
    (`main.tsx:176-183`), so a manager and staff get the shell's panel;
  - `/billing/success` and `/billing/cancel` outside the shell, behind the
    same sign-in and business checks (`main.tsx:192-193`).
- **Every call in `docs/dashboard-routes.md`** for these routes, the same as
  today, and no others:

  | Page | Calls |
  |---|---|
  | Team | `getTeam` on load; `createInvitation` `{role, email}`; `revokeInvitation`; `changeMemberRole`; `removeMember` |
  | Billing | `getSubscription` on load; `createCheckoutSession`, then the browser goes to `checkout_url`; `createPortalSession`, then to `portal_url` |
  | `/billing/success` | `getSubscription` every 2 s for up to 30 s, then `GET /api/businesses/me`, then `/dashboard?activated=1` |
  | `/billing/cancel` | none |

  A read made again on "נסו שוב" or "בדיקה נוספת" is the same call, as on the
  earlier phases' pages. Renewing an expired invitation is `createInvitation`
  and, for an open link, `revokeInvitation` on the old one.
- **The copy-a-link invitation.** Nothing is emailed: the API returns
  `accept_path`, the page joins it to its own origin (`inviteUrl`, in
  `src/api`, untouched), and the owner sends the link.
- **The redirects:** checkout and the portal leave the app through
  `window.location`, and Stripe brings the owner back to `/billing/success`,
  `/billing/cancel` or the portal's return URL.
- **The day of activation:** `/billing/success` polls every 2 s for up to
  30 s and hands off to `/dashboard?activated=1`, where the shell's sign
  switches on, the tour holds back and the Overview says "אתם פעילים!", as
  Phases 2 and 5 built them.
- **The price keys.** `landing.pricing.pro.price` and `.per` stay where they
  are, in both languages, for the landing's pricing band, onboarding's billing
  step and `/style-guide`. Billing names the price from
  `PUNCHME_MONTHLY_PRICE`, as the Overview and the manager pages do (§6).
- **The tour's `billing-activate` anchor,** on the Free owner's "הפעלה".
- **Untouched:** `src/api`, `src/auth`, `src/hooks`, `src/config`,
  `src/lib`, the pass previews, the shell, the tour's steps, the kit and the
  public invitation page.

### 7.2 Lightbox, page by page

- **Team and Billing** call `useLightboxPage()` at their top (shell brief
  §8). While either is mounted, `<html>` wears `theme-lightbox` (and
  `theme-night` at night) instead of the old pair, and the seam closes for
  the owner group. Nothing on them uses the old primitives
  (`dashboard/primitives.tsx`; `marketing/primitives.tsx`'s `ctaClasses` and
  `focusRing`; the old `Notice`, `Tag`, `SegmentedControl`, `Panel`,
  `PanelHeader`, `Figure` and `fieldClasses`) or the old type classes
  (`t-h3`, `t-card-title`, `t-figure`).
- **The two return pages** sit outside `DashboardLayout`, so the claim
  doesn't reach them, and today nothing themes them at all. They follow the
  dashboard (§6): each calls `useDashboardTheme({ lightbox: true })` itself.
  - `<html>` wears `theme-lightbox`, with `theme-night` whenever the owner's
    dashboard is at night: their own choice, or the device's on "אוטומטי".
  - The status bar takes the frame's ground.
  - The classes come off when the page unmounts, and the shell puts its own
    on in the same commit, so the hand-off to the Overview doesn't flash.
  - The pre-paint script in `index.html` only knows `/dashboard` paths, so a
    hard load of a return page at night may show the day ground for a moment
    before React mounts. That's the allowance the shell made for a refused
    page (shell brief §8). Teaching the script the two paths is step B's to
    plan.
- **No toast on the return pages:** the kit's `ToastProvider` lives in the
  frame, so they say everything in place.

### 7.3 Team: the invite first, and it becomes the link

Roee took the roll's lead (§6): the invitation leads the page and turns into
the link where it was made, and the team and the open invitations follow.

**At 375px, top to bottom:**
1. **The title,** "צוות", in `type-title`.
2. **The lead,** one line that carries the whole model: "ההזמנות הן קישורים
   שאתם שולחים בעצמכם, בוואטסאפ או איך שאתם מדברים. אנחנו לא שולחים מיילים."
3. **The invitation,** a `LitPanel` labelled by its heading, "הזמנה לצוות"
   (h2): the form, or, once the link exists, the link (below). Kept compact,
   so the team's heading still starts inside the first screen at 375 (the
   roll's honest risk was a form that fills it).
4. **"מי בצוות"** (h2): the owner, then the hires.
5. **"הזמנות פתוחות"** (h2), when there are any.

**From 1024px:** two columns. The invitation stands on the start side (the
right in Hebrew), and the team and the open invitations beside it, so the
form never pushes the lists down. At 768 it is one column, as at 375.

**Making a link:**
- **"מה מותר להם",** the kit's `RadioGroup`, each role with what it opens:
  "עובד/ת" ("סורק/ת כרטיסים, מוסר/ת הטבות ומחפש/ת לקוחות. בלי לשנות את מה
  שהלקוחות רואים.") and "מנהל/ת" ("גם משנה את מה שהלקוחות רואים: הכרטיסייה,
  השילוט, ההודעות וחבר מביא חבר. בלי חיוב ובלי הצוות."). Staff is chosen
  first: the least a hire can open.
- **"רק לכתובת אימייל אחת",** the kit's `Checkbox`, unticked. Under it, while
  unticked, the honest cost kept from today: "בלי כתובת, מי שיפתח/תפתח את
  הקישור ראשון/ה מצטרף/ת." Ticked, it opens "האימייל שלהם" (`dir="ltr"`,
  `type="email"`, `autocomplete="off"`), with its hint wired by
  `aria-describedby`: "רק מי שמחובר/ת עם הכתובת הזו יוכל/תוכל להשתמש בקישור.
  לא נשלח אליה כלום." So the word "email" appears only where the page says
  nothing is sent to it.
- **The address is checked before the link is made:** something, "@",
  something, a dot, something. Otherwise `team.error.badEmail` under the
  field, and no call. The API takes anything (§5).
- **"יצירת קישור",** the coral, busy while the call runs.

**The link, made.** In place of the form, arriving by light, with focus on
its heading and "הקישור מוכן" in a polite live region:
- **"הקישור מוכן"** as the panel's heading in place of "הזמנה לצוות", with
  the role beside it as a neutral badge;
- **the link itself, in full:** a read-only field, left to right, that
  selects itself on focus, so it can always be copied by hand;
- **"שיתוף"** (the coral), where the browser has a share menu
  (`navigator.share`: on a phone, WhatsApp among it). It shares the link
  with one line in the dashboard's language: "{business} מזמינים אותך לצוות
  בפאנץ' מי, בתור {role}:";
- **"העתקת קישור"** (secondary, or the coral where there's no share menu).
  It confirms with the kit's toast, "הועתק!", as the Overview's join link
  does. When the browser refuses the clipboard, the field is selected and one
  line says so in place: "הדפדפן לא איפשר להעתיק. הקישור מסומן, ואפשר להעתיק
  אותו מכאן.";
- **what it is:** "הוא עובד פעם אחת, עד {date}.", then "רק {email} יכול/ה
  להשתמש בו." or "מי שיפתח/תפתח אותו ראשון/ה יצטרף/תצטרף בתור {role}.";
- **what the hire will do:** "הם פותחים את הקישור, מתחברים או פותחים חשבון,
  ונכנסים לצוות.";
- **"הזמנה נוספת"** (quiet) brings the form back, empty.

Nothing is copied by itself any more: the owner presses Share or Copy, so
it's never a guess whether the link is on the clipboard. And there is no
second press to make a second link, because the button is gone the moment
the link exists.

**The team:**
- **The owner first:** their email and "בעלים (אתם)". No chevron; nothing to
  change.
- **Each hire** is the kit's `ListRow`: the email, then "{role} · הצטרף/ה
  ב-{date}" (`joined_at`). The whole row opens the member's sheet.
- **A hire who joined since the owner last opened Team** carries "חדש/ה" (the
  neutral badge) until the page has been seen once. The last visit is kept on
  the device. This is the one discipline kept from the roll's boarding pass
  (§6): a row that changed keeps its light until it is seen, so a link sent
  last week shows up as a person, not as a disappearance.
- **The member's sheet** (the kit's `Sheet`):
  - the email whole, as its heading, and "הצטרף/ה ב-{date}";
  - "התפקיד", the same `RadioGroup` with the same two sentences;
  - "שמירה" (primary), enabled once the role changes. A tap on a role no
    longer saves by itself, so a slip of the thumb can't demote a manager;
  - "הסרה מהצוות" (danger), which asks in a `Dialog`: "להסיר את {email}
    מהצוות?", "הם לא יוכלו יותר לפתוח את הלוח של {business}. אפשר להזמין
    אותם שוב בהמשך.", "הסרה" (danger) and "ביטול", with focus on "ביטול";
  - saved: the sheet closes, focus returns to the row, and the toast says
    "התפקיד של {email} עודכן: {role}.";
  - removed: the dialog and the sheet close, focus goes to the team's
    heading, and the toast says "{email} כבר לא בצוות.".

**Open invitations,** newest first:
- **Each is a row:** the email, or "כל מי שיש לו/ה את הקישור" in the page's
  direction; then "{role} · בתוקף עד {date}", or "{role} · פג ב-{date}" for
  one that has expired.
- **Its sheet** holds the ready link again (Share, Copy, the same lines) and
  "ביטול ההזמנה" (danger, no dialog: a new link undoes it). The toast says
  "ההזמנה בוטלה. הקישור כבר לא עובד.", and focus goes to the list's heading.
- **An expired one's sheet** says "תוקף הקישור הזה פג ב-{date}." and offers
  "קישור חדש" (a new invitation with the same role and address, then the old
  one cancelled; for an address the backend cancels it by itself) and
  "הסרה מהרשימה".

**Refusals, said where they happen,** with `role="alert"`, cleared by the
next success:
- **under "יצירת קישור":**
  - `already_a_member`: "האדם הזה כבר בצוות.";
  - `team_cap_reached` with 25 people on the team: "זה מספר האנשים המרבי
    לעסק אחד. כדי להזמין עוד מישהו, הסירו מישהו מהצוות.";
  - `team_cap_reached` otherwise (20 open invitations): "יש יותר מדי הזמנות
    פתוחות. בטלו אחת כדי ליצור חדשה.";
  - 422: "האימייל הזה לא נראה תקין.";
  - anything else: "זה לא עבר. נסו שוב.", never the API's English `detail`;
- **in a sheet,** under the control that failed, with the sheet left open. A
  404 (changed on another device) says "זה כבר השתנה, אולי במכשיר אחר.
  הרשימה עודכנה." and the team is read again.

**States:**
- **Loading:** the kit's `SkeletonRows` for the lists. The form works at once,
  since making a link needs no list.
- **The read failed:** "הצוות לא נטען" with "נסו שוב" in place of both lists,
  offline included. Never an empty team: an open link nobody can see is one
  nobody can cancel.
- **Only the owner:** the owner's row, and the lead does the rest.
- **Many:** 24 hires and 20 invitations, about 45 rows, with no paging.
- **Free and Pro** are the same page: nothing on Team depends on the plan.

### 7.4 Billing: where the business stands, then the one thing to do

**Which state, from what the page already reads.** The subscription's own
`plan` and `status`, from the page's one load call, decide it. A pure
function beside the page (`billingState.ts`, with its own test) mirrors the
backend's `ACTIVE_STATUSES` and `RELEASABLE_STATUSES` (§5):

| State | When | What leads | The action |
|---|---|---|---|
| Not live | `free`, status `none` | The activation panel | "הפעלה", coral → checkout |
| Not live, last try unfinished | `free`, `incomplete` or `incomplete_expired` | The activation panel, opening on one line: the last payment didn't go through | "הפעלה" → checkout |
| Ended | `free`, `canceled` | What ending means now, then the activation panel | "הפעלה" → checkout |
| Payment failed | `free`, any other status: `past_due`, `unpaid`, `paused`, or a word this frontend doesn't know | A warn notice: what's on hold, what keeps working, how to fix it | "עדכון אמצעי התשלום", coral → portal. Never a checkout |
| Live | `pro`, any status but `none` | What it costs, paid until when, where to change or stop it, what stopping does | "ניהול חיוב", secondary → portal |
| Live, nothing to manage | `pro`, `none` | The card is live, and there's no subscription to manage | none |

When the subscription's `plan` disagrees with the business's (a webhook
landed between the two reads), the page trusts the subscription and reads
the business again, so the shell's sign agrees with it.

**Not live, at 375px, top to bottom:**
1. **The title,** "חיוב", in `type-title`.
2. **The activation panel,** a `LitPanel` on the band, like the Overview's
   own (`FreeLead.tsx`), labelled by its heading:
   - "עדיין לא פעיל" (`dashboard.plan.notLive`, h2): the masthead's words and
     the Overview's;
   - **the price:** "₪99" in the kit's `Figure` at `stat`, with "לחודש"
     beside it, the number from `PUNCHME_MONTHLY_PRICE`, isolated left to
     right;
   - **what it turns on,** "מה ההפעלה פותחת", as four lines with a check in
     ink: לקוחות אמיתיים מצטרפים דרך קוד ה-QR שלכם · ההודעות יוצאות באמת ·
     השילוט מודפס · חבר מביא חבר נפתח. The same four, in the same order, as
     the Overview's `dashboard.overview.activate.body`, and as the manager
     pages' notices say them one at a time;
   - **"הפעלה",** the kit's primary at `lg`, carrying
     `data-tour="billing-activate"`. It is busy while the session is made,
     then "פותחים את Stripe…" in a polite live region as the browser leaves;
   - **under it:** "התשלום בעמוד של Stripe, ואחריו חוזרים לכאן. אפשר לבטל
     בכל רגע, מהדף הזה."
3. **"מה נשאר בחינם",** a plain panel: "עיצוב הכרטיסייה, הניסיון שלה בטלפון
   שלכם, לוח הבקרה והצוות: בחינם, לפני ההפעלה ואחריה."
4. **A quiet link to the calculator,** in the kit's `linkText` (ink,
   underlined): "לא בטוחים שזה משתלם? חשבו עם המספרים שלכם." It goes to
   `/#calculator`, the landing page's calculator, which runs on the owner's
   own numbers, costs the reward at cost and can say no (§6). On every Free
   state but Payment failed.

**The other Free states** change only the top:
- **Last try unfinished:** the panel opens on "התשלום האחרון לא הושלם, אז
  הכרטיסייה עדיין לא פעילה."
- **Ended:** a warn `Notice` above the panel, "המנוי הסתיים", and "הכרטיסיות
  שאצל הלקוחות ממשיכות לאסוף חותמות. לקוחות חדשים לא יכולים להצטרף, וההודעות
  לא יוצאות, עד שתפעילו שוב." The panel's heading becomes "הפעלה מחדש",
  because "עדיין" isn't true of a shop that was live.
- **Back from Stripe recently,** on this device: when `/billing/success`
  opened here less than 24 hours ago and the business is still Free (§7.5
  leaves the mark), a warn `Notice` above the panel says "חזרתם מעמוד התשלום
  של Stripe ב-{time}. אם שילמתם, הכרטיסייה תופעל לבד ברגע ש-Stripe יאשר,
  והפעלה נוספת תחייב פעמיים." "הפעלה" stays: they may not have paid.

**Payment failed:**
1. The title.
2. A warn `Notice`, "התשלום האחרון לא עבר": "עד שיעבור, לקוחות חדשים לא
   יכולים להצטרף וההודעות לא יוצאות. הכרטיסיות שאצל הלקוחות ממשיכות לאסוף
   חותמות. עדכנו את אמצעי התשלום ב-Stripe, והכול חוזר לבד כשהתשלום עובר."
   Its action is "עדכון אמצעי התשלום", the screen's one coral, to the portal.
3. Nothing else. No price to decide on, and no "הפעלה" anywhere on the page.

**Live:**
1. The title.
2. **A plain panel:**
   - the ok badge "פעיל" and "הכרטיסייה שלכם פעילה" (h2);
   - "₪99 לחודש · שולם עד 24 בנוב׳": the price inline, and
     `current_period_end` through `listDay` (`src/routes/dashboard/format.ts`,
     with the year whenever it isn't this one). `trialing` reads "תקופת ניסיון
     עד…", and the date is left out when it's null;
   - "החלפת אמצעי התשלום, הקבלות והביטול נמצאים ב-Stripe.", then "ניהול
     חיוב" (secondary, busy, "פותחים את Stripe…"). Not coral: on Pro nothing
     here asks to be pressed.
3. **"אם תבטלו",** a plain panel, so the loss is said before it happens:
   "הכרטיסיות שאצל הלקוחות ימשיכו לעבוד ולאסוף חותמות. לקוחות חדשים שיסרקו
   את הקוד בדלפק לא יוכלו להצטרף, ההודעות יפסיקו לצאת, וחבר מביא חבר ייסגר,
   עד שתפעילו שוב."

**Live, nothing to manage:** the badge and the heading, then "לעסק הזה אין
מנוי, אז אין כאן מה לנהל או לבטל." No price, no button, no "אם תבטלו".

**Loading:** the title at once, and a `Skeleton` in the panel's shape. No
action until the state is known, because the state decides which redirect
is safe.

**The read failed:** the kit's `Notice`, "החיוב לא נטען", with "נסו שוב" (a
refetch), as the counter pages draw a failed read. Offline included.

**A redirect that fails says so under its button,** with `role="alert"`, and
the button can be pressed again:
- 503 `billing_unavailable`: "אין כרגע חיבור ל-Stripe, ולא בוצע חיוב. נסו שוב
  בעוד כמה דקות.";
- 400, no Stripe customer: "לעסק הזה עדיין אין חיוב לנהל.";
- offline, or anything else: "לא הצלחנו להתחבר לפאנץ' מי. בדקו את החיבור
  לאינטרנט ונסו שוב." (`dashboard.loadFailed.*`).

**Back from Stripe by the browser's Back** restores the page from the
back-forward cache with its button still busy, because the flag is reset only
on an error (`BillingSettingsPage.tsx:30`, `:42-48`). On `pageshow` with
`persisted`, it clears.

**From 1024px:** the same single column, at most 40rem wide, at the page's
start. A decision page reads down; two columns would split the price from
what it buys.

### 7.5 Back from checkout: `/billing/success`

One job: wait for Stripe's word, then hand the owner to the Overview on the
day the card goes live. The mechanism stays; the three ways it fails go.

**At 375px:** a centred lit panel on the wall, at most 28rem wide:
- the business's name, small, above everything, so the owner knows which
  shop (from the provider, no call);
- "מפעילים את הכרטיסייה" (h1);
- "Stripe מעדכן את פאנץ' מי על התשלום. הדף ימשיך לבד.", in a polite live
  region;
- under it, the kit's `Loading` around one `Skeleton` line, which breathes
  while it waits and holds still under reduced motion.

**The poll is the fixed one,** with three changes:
- **A failed try is a try.** A poll that throws (offline, a 500, a timeout)
  counts toward the 30 s, and the page tries again 2 s later.
  Today the first failure rejects unhandled and leaves "completing" on screen
  for good (`BillingSuccessPage.tsx:26-44`).
- **The hand-off waits for the business.** On `plan === "pro"`, the page
  awaits the business's read (`GET /api/businesses/me`), then goes to
  `/dashboard?activated=1`, replacing itself. So the shell mounts on Pro: the
  sign switches on, the tour holds back, and the Overview opens on "אתם
  פעילים!" with no Free frame first. Either the provider's `refetch` returns
  its promise (`src/business` isn't frozen), or the page refetches the
  business query through the query client.
- **It leaves a mark.** On opening, it keeps the time in `localStorage`
  (`punchme.checkoutReturned.{businessId}`), and clears it once the business
  reads Pro. Billing reads it (§7.4) so that a slow webhook can't become a
  second payment on this device.

**Thirty seconds without Pro,** said in place:
- "עדיין מחכים לאישור מ-Stripe" (h1);
- "Stripe עדיין לא אישר לנו את התשלום. אם שילמתם, הכרטיסייה תופעל לבד ברגע
  שיאשר, אז אין צורך לשלם שוב.";
- when the last tries failed: "לא הצלחנו להגיע לפאנץ' מי כדי לבדוק. בדקו את
  החיבור ונסו שוב.";
- "בדיקה נוספת" (coral: the same poll, another 30 s) and "לסקירה" (quiet).

The change is announced, and focus moves to the new heading, so the next
Tab reaches "בדיקה נוספת".

**A hire** (by a typed or forwarded link) gets the refusal's words on the
same panel, and the page makes no call: "הדף הזה לא פתוח בשבילכם", "רק
הבעלים יכול/ה לפתוח את החיוב ואת הצוות.", "אם צריך משהו מכאן, פנו לבעלים.",
and "לסקירה".

**Its title** is Billing's, "חיוב — פאנץ' מי", set by the page itself: the
shell's title context doesn't reach it.

### 7.6 Checkout left: `/billing/cancel`

No calls, as today. It answers the owner's first question first, then where
they stand, then what next. The same centred panel:
- "לא חויבתם" (h1);
- "יצאתם מעמוד התשלום של Stripe לפני התשלום. הכרטיסייה נשארה כמו שהייתה,
  ועדיין לא פעילה." On a business already Pro (from the provider, no call):
  "יצאתם מהעמוד של Stripe לפני התשלום. שום דבר לא השתנה, והכרטיסייה עדיין
  פעילה.";
- "אפשר להפעיל מתי שתרצו, מדף החיוב.";
- "חזרה לחיוב" (secondary, 44px) and "לסקירה" (quiet). No coral: this page
  doesn't push.

A hire gets the same refusal as on the success page. The title is
Billing's.

### 7.7 Pieces the pages share

- **From the kit, as they are:** `Button`, `LinkButton`, `Input`, `Field`,
  `Checkbox`, `RadioGroup`, `LitPanel`, `Badge`, `Notice`, `Figure`, `List`,
  `ListRow`, `EmptyState`, `Loading`, `Skeleton`, `SkeletonRows`, `Dialog`,
  `Sheet`, `useToast`, `focusRing`. `RadioGroup` carries a description per
  option, which is what the two roles need.
- **New beside the pages, not in the kit:**
  - `billingState.ts` and its test (§7.4's table, the statuses as the
    backend reads them);
  - the activation panel, unless step B finds it can share the Overview's
    `FreeLead` without changing what the Overview draws;
  - the ready link (§7.3), shared by the invite and an open invitation's
    sheet;
  - the member sheet and the invitation sheet;
  - the return pages' centred panel, used by both.
- **Nothing new in the kit.** If step B finds it needs a piece the kit lacks,
  it asks first, as the earlier phases did.
- **A guard for the price:** a small test that every literal shekel price in
  both locale files (`₪` followed by digits, not `₪{{…}}`) equals
  `PUNCHME_MONTHLY_PRICE`. Today that is `landing.pricing.pro.price`,
  `onboarding.billing.activateCta` and the landing FAQ's answer, in each
  language. Every other page interpolates the constant already.

### 7.8 Colour, type and states

- **Coral, one per screen:**
  - Team: "יצירת קישור", then "שיתוף" on the ready link (or "העתקת קישור"
    where there's no share menu);
  - Billing: "הפעלה", or "עדכון אמצעי התשלום" when a payment failed. None
    on Live;
  - `/billing/success`: "בדיקה נוספת", after the 30 s;
  - `/billing/cancel`: none.
- **Danger,** red words on a red edge and never a fill: "הסרה מהצוות", the
  dialog's "הסרה", and "ביטול ההזמנה". Today's "להסיר" is the primary fill.
- **Gold:** none. Nothing here is a reward.
- **No new colour.** Every pair is already measured in DESIGN.md and on
  `/style-guide`.
- **Type:**
  - `type-title` for the page titles, `type-card-title` for panels;
  - `type-label` for field labels and legends, `type-tag` for badges;
  - the kit's `Figure` for the price;
  - dates through `listDay` (`src/routes/dashboard/format.ts`) in the page's
    language, with the year whenever it isn't this one, inside a `<bdi>`;
  - nothing under 13px, and no Plex Mono on these pages: the link is a URL,
    not a card code, so it is set in the page's face, left to right.
- **Emails** are `<bdi dir="ltr">` inside a block that follows the page, so in
  Hebrew they start at the right like every other title; a long one
  truncates in its row and reads whole in its sheet (`overflow-wrap:
  anywhere`).
- **States each page draws:**
  - Team: loading; the read failed (offline included); only the owner; one
    hire; 24 hires and 20 invitations; an expired invitation; a link just
    made, named or open; the clipboard refused; each refusal (409 member,
    409 cap of people, 409 cap of invitations, 422, 404, anything else);
  - Billing: loading; the read failed; each of §7.4's six states; back from
    Stripe moments ago; each redirect failing; restored after Back;
  - `/billing/success`: waiting; a failed try; 30 s without Pro; the hand-off;
    a hire;
  - `/billing/cancel`: Free; Pro; a hire;
  - all four: Hebrew and English; day and night; 320, 375, 768, 1024 and
    1280px; reduced motion; 200% text.

### 7.9 Motion (for step C)

Animate by frequency. These pages are opened a few times a year, and the one
moment that earns more, the card switching on, belongs to the shell and the
Overview, which already have it.
- **The ready link** arrives by light where the form was (`LitPanel`'s
  `arrive`, 240ms on the ease-out); with reduced motion, a 150ms fade.
- **Sheets and dialogs:** the kit's own movement, crossfading with reduced
  motion.
- **The success page's wait:** the line of light breathes; under reduced
  motion it holds still, and the words carry the state.
- **Nothing counts up,** the price included.

## 8. Copy

Every string goes through `t()`, in `en` and `he` together. These are drafts
in the product's voice (plural to the reader, slash forms for people, the
glossary's terms); step D's `/impeccable clarify` settles them.

**The voice and glossary pass:**
- "פג ב-" ("expired on") on a live invitation becomes "בתוקף עד", and "פג"
  is kept for an invitation that has.
- `team.roleBody.manager` says "השלט" and "הכרטיס" (and "the poster" in
  English): the glossary's שילוט and כרטיסייה, and Refer a friend joins the
  list, as the role panel already says (`team.denied.manager`).
- "כל מי שיש לו את הקישור" takes the slash form.
- "פרו" goes: Billing says what the plan does ("פעיל", "עדיין לא פעיל"), as
  the shell's sign does, and never names a plan the landing page calls
  "מסלול Pro".
- Stripe keeps its Latin name, with a hyphen after a Hebrew prefix
  ("ב-Stripe").

**Developer text leaves the UI:** the raw `status` goes, and an unknown
refusal says `team.error.generic` rather than the API's English `detail`.

| Key | English | עברית |
|---|---|---|
| `team.lead` (new) | Invitations are links you send yourself, on WhatsApp or however you talk. We don't send emails. | ההזמנות הן קישורים שאתם שולחים בעצמכם, בוואטסאפ או איך שאתם מדברים. אנחנו לא שולחים מיילים. |
| `team.invite.title` | Invite someone | הזמנה לצוות |
| `team.invite.roleLabel` | What they can do | מה מותר להם |
| `team.roleBody.staff` | Scans cards, hands over rewards and looks customers up. Can't change what customers see. | סורק/ת כרטיסים, מוסר/ת הטבות ומחפש/ת לקוחות. בלי לשנות את מה שהלקוחות רואים. |
| `team.roleBody.manager` | Also changes what customers see: the card, the standee, the messages and Refer a friend. Not billing, and not the team. | גם משנה את מה שהלקוחות רואים: הכרטיסייה, השילוט, ההודעות וחבר מביא חבר. בלי חיוב ובלי הצוות. |
| `team.invite.lock` (new) | Only for one email address | רק לכתובת אימייל אחת |
| `team.invite.openHint` (new) | Without an address, whoever opens the link first joins. | בלי כתובת, מי שיפתח/תפתח את הקישור ראשון/ה מצטרף/ת. |
| `team.invite.emailLabel` | Their email | האימייל שלהם |
| `team.invite.lockHint` (new) | Only someone signed in with this address can use the link. Nothing is sent to it. | רק מי שמחובר/ת עם הכתובת הזו יוכל/תוכל להשתמש בקישור. לא נשלח אליה כלום. |
| `team.invite.cta` | Make the link | יצירת קישור |
| `team.ready.title` (new) | The link is ready | הקישור מוכן |
| `team.ready.until` (new) | It works once, until {{date}}. | הוא עובד פעם אחת, עד {{date}}. |
| `team.ready.locked` (new) | Only {{email}} can use it. | רק {{email}} יכול/ה להשתמש בו. |
| `team.ready.open` (new) | Whoever opens it first joins as {{role}}. | מי שיפתח/תפתח אותו ראשון/ה יצטרף/תצטרף בתור {{role}}. |
| `team.ready.next` (new) | They open it, sign in or make an account, and they're on the team. | הם פותחים את הקישור, מתחברים או פותחים חשבון, ונכנסים לצוות. |
| `team.ready.share` (new) | Share | שיתוף |
| `team.ready.shareText` (new) | {{business}} invites you to the team on PunchMe, as {{role}}: | {{business}} מזמינים אותך לצוות בפאנץ' מי, בתור {{role}}: |
| `team.ready.copyFailed` (new) | This browser didn't let us copy. The link is selected, so you can copy it from here. | הדפדפן לא איפשר להעתיק. הקישור מסומן, ואפשר להעתיק אותו מכאן. |
| `team.ready.another` (new) | Invite someone else | הזמנה נוספת |
| `team.members.owner` (new) | Owner (you) | בעלים (אתם) |
| `team.members.meta` (new) | {{role}} · joined {{date}} | {{role}} · הצטרף/ה ב-{{date}} |
| `team.member.remove` (new) | Remove from the team | הסרה מהצוות |
| `team.member.removeTitle` (new) | Remove {{email}} from the team? | להסיר את {{email}} מהצוות? |
| `team.member.removeBody` (new) | They won't be able to open {{business}}'s dashboard any more. You can invite them again later. | הם לא יוכלו יותר לפתוח את הלוח של {{business}}. אפשר להזמין אותם שוב בהמשך. |
| `team.member.saved` (new) | Role saved: {{email}}, {{role}}. | התפקיד של {{email}} עודכן: {{role}}. |
| `team.member.removed` (new) | {{email}} is no longer on the team. | {{email}} כבר לא בצוות. |
| `team.member.new` (new) | New | חדש/ה |
| `team.pending.title` | Open invitations | הזמנות פתוחות |
| `team.pending.anyone` | Anyone with the link | כל מי שיש לו/ה את הקישור |
| `team.pending.until` (new) | {{role}} · until {{date}} | {{role}} · בתוקף עד {{date}} |
| `team.pending.expired` | {{role}} · expired {{date}} | {{role}} · פג ב-{{date}} |
| `team.pending.revoke` | Cancel the invitation | ביטול ההזמנה |
| `team.invitation.cancelled` (new) | Invitation cancelled. The link no longer works. | ההזמנה בוטלה. הקישור כבר לא עובד. |
| `team.invitation.expiredLine` (new) | This link expired on {{date}}. | תוקף הקישור הזה פג ב-{{date}}. |
| `team.invitation.renew` (new) | Make a new link | קישור חדש |
| `team.invitation.remove` (new) | Remove from the list | הסרה מהרשימה |
| `team.loadFailed` (new) | The team didn't load | הצוות לא נטען |
| `team.error.capMembers` (new) | That's as many people as one business can hold. Remove someone to invite another. | זה מספר האנשים המרבי לעסק אחד. כדי להזמין עוד מישהו, הסירו מישהו מהצוות. |
| `team.error.capInvitations` (new) | There are too many open invitations. Cancel one to make another. | יש יותר מדי הזמנות פתוחות. בטלו אחת כדי ליצור חדשה. |
| `team.error.gone` (new) | That already changed, maybe on another device. The list is up to date now. | זה כבר השתנה, אולי במכשיר אחר. הרשימה עודכנה. |
| `billing.unlocks.title` (new) | What activating turns on | מה ההפעלה פותחת |
| `billing.unlocks.join` / `.messages` / `.standee` / `.referrals` (new) | Real customers join with your QR code / Your messages really send / The standee prints / Refer a friend opens | לקוחות אמיתיים מצטרפים דרך קוד ה-QR שלכם / ההודעות יוצאות באמת / השילוט מודפס / חבר מביא חבר נפתח |
| `billing.price` (new) | <ltr>₪{{price}}</ltr> a month | <ltr>₪{{price}}</ltr> לחודש |
| `billing.free.how` (new) | You pay on Stripe's page, then come back here. You can cancel any time, from this page. | התשלום בעמוד של Stripe, ואחריו חוזרים לכאן. אפשר לבטל בכל רגע, מהדף הזה. |
| `billing.free.staysTitle` (new) | What stays free | מה נשאר בחינם |
| `billing.free.stays` (new) | Designing the card, trying it on your own phone, this dashboard and your team: free, before activating and after. | עיצוב הכרטיסייה, הניסיון שלה בטלפון שלכם, לוח הבקרה והצוות: בחינם, לפני ההפעלה ואחריה. |
| `billing.free.calculator` (new) | Not sure it pays? Work it out with your own numbers. | לא בטוחים שזה משתלם? חשבו עם המספרים שלכם. |
| `billing.unfinished` (new) | Your last payment didn't go through, so the card isn't live yet. | התשלום האחרון לא הושלם, אז הכרטיסייה עדיין לא פעילה. |
| `billing.ended.title` / `.body` (new) | Your subscription has ended / The cards your customers hold keep collecting stamps. New customers can't join, and messages don't go out, until you activate again. | המנוי הסתיים / הכרטיסיות שאצל הלקוחות ממשיכות לאסוף חותמות. לקוחות חדשים לא יכולים להצטרף, וההודעות לא יוצאות, עד שתפעילו שוב. |
| `billing.ended.activateTitle` (new) | Activate again | הפעלה מחדש |
| `billing.recent` (new) | You came back from Stripe's payment page at {{time}}. If you paid, the card goes live by itself once Stripe confirms it, and activating again would charge you twice. | חזרתם מעמוד התשלום של Stripe ב-{{time}}. אם שילמתם, הכרטיסייה תופעל לבד ברגע ש-Stripe יאשר, והפעלה נוספת תחייב פעמיים. |
| `billing.failed.title` / `.body` (new) | Your last payment didn't go through / Until it does, new customers can't join and messages don't go out. The cards your customers hold keep collecting stamps. Update the card you pay with on Stripe, and everything comes back by itself once the payment goes through. | התשלום האחרון לא עבר / עד שיעבור, לקוחות חדשים לא יכולים להצטרף וההודעות לא יוצאות. הכרטיסיות שאצל הלקוחות ממשיכות לאסוף חותמות. עדכנו את אמצעי התשלום ב-Stripe, והכול חוזר לבד כשהתשלום עובר. |
| `billing.failed.cta` (new) | Update payment | עדכון אמצעי התשלום |
| `billing.plan.proTitle` | Your card is live | הכרטיסייה שלכם פעילה |
| `billing.pro.badge` (new) | Live | פעיל |
| `billing.pro.paidUntil` / `.trialUntil` (new) | Paid until {{date}} / Trial until {{date}} | שולם עד {{date}} / תקופת ניסיון עד {{date}} |
| `billing.pro.manage` (new) | Changing the card you pay with, receipts and cancelling are on Stripe. | החלפת אמצעי התשלום, הקבלות והביטול נמצאים ב-Stripe. |
| `billing.pro.ifCancelTitle` / `.ifCancel` (new) | If you cancel / The cards your customers hold keep working and collecting stamps. New customers who scan the code on your counter can't join, messages stop going out, and Refer a friend closes, until you activate again. | אם תבטלו / הכרטיסיות שאצל הלקוחות ימשיכו לעבוד ולאסוף חותמות. לקוחות חדשים שיסרקו את הקוד בדלפק לא יוכלו להצטרף, ההודעות יפסיקו לצאת, וחבר מביא חבר ייסגר, עד שתפעילו שוב. |
| `billing.unbilled` (new) | This business has no subscription, so there's nothing to manage or cancel here. | לעסק הזה אין מנוי, אז אין כאן מה לנהל או לבטל. |
| `billing.loadFailed` (new) | Billing didn't load | החיוב לא נטען |
| `billing.leaving` (new) | Opening Stripe… | פותחים את Stripe… |
| `billing.error.unavailable` (new) | Stripe can't be reached right now, and nothing was charged. Try again in a few minutes. | אין כרגע חיבור ל-Stripe, ולא בוצע חיוב. נסו שוב בעוד כמה דקות. |
| `billing.error.noCustomer` (new) | There's no billing to manage for this business yet. | לעסק הזה עדיין אין חיוב לנהל. |
| `billing.success.title` (new) | Switching your card on | מפעילים את הכרטיסייה |
| `billing.success.finalizing` | Stripe is telling PunchMe about the payment. This page moves on by itself. | Stripe מעדכן את פאנץ' מי על התשלום. הדף ימשיך לבד. |
| `billing.success.waitingTitle` (new) | Still waiting for Stripe | עדיין מחכים לאישור מ-Stripe |
| `billing.success.timeout` | Stripe hasn't confirmed the payment to us yet. If you paid, the card goes live by itself once it does, so there's no need to pay again. | Stripe עדיין לא אישר לנו את התשלום. אם שילמתם, הכרטיסייה תופעל לבד ברגע שיאשר, אז אין צורך לשלם שוב. |
| `billing.success.unreachable` (new) | We couldn't reach PunchMe to check. Check the connection and try again. | לא הצלחנו להגיע לפאנץ' מי כדי לבדוק. בדקו את החיבור ונסו שוב. |
| `billing.success.check` (new) | Check again | בדיקה נוספת |
| `billing.cancel.title` | You weren't charged | לא חויבתם |
| `billing.cancel.body` | You left Stripe's payment page before paying. Your card is as you left it, and not live yet. | יצאתם מעמוד התשלום של Stripe לפני התשלום. הכרטיסייה נשארה כמו שהייתה, ועדיין לא פעילה. |
| `billing.cancel.bodyPro` (new) | You left Stripe's page before paying. Nothing changed, and your card is still live. | יצאתם מהעמוד של Stripe לפני התשלום. שום דבר לא השתנה, והכרטיסייה עדיין פעילה. |
| `billing.cancel.next` (new) | You can activate whenever you like, from Billing. | אפשר להפעיל מתי שתרצו, מדף החיוב. |

**Reused:** `billing.title`, `billing.activateCta` ("הפעלה"),
`billing.managePortalCta` ("ניהול חיוב"), `billing.cancel.backCta`,
`dashboard.plan.notLive`, `dashboard.toOverview` ("לסקירה"),
`dashboard.loadFailed.*`, `team.denied.title`, `.owner` and `.askOwner`,
`team.role.*`, `team.error.alreadyMember`, `.badEmail` and `.generic`,
`common.copyLink`, `common.copied`, `common.retry`, `common.save`,
`common.cancel` and `app.name`. The price comes from
`PUNCHME_MONTHLY_PRICE`, isolated.

**Left unused** until Phase 10, as before: `billing.status`,
`billing.plan.freeTitle`, `.freeBody` and `.proBody`, `team.invite.body`,
`.emailNamed` and `.emailBlank`, `team.pending.body`, `.expires` and
`.copy`, `team.members.roleFor` and `.confirmRemove`, and `team.notReady`
(which nothing reads today).

## 9. What step B keeps, touches and checks

**Keeps** everything in §7.1.

**Touches** these, and nothing else:
- `src/routes/dashboard/TeamPage.tsx`, rebuilt, with its pieces beside it (the
  invite, the ready link, the member sheet, the invitation sheet);
- `src/routes/dashboard/BillingSettingsPage.tsx`, rebuilt, with
  `billingState.ts` and its test beside it;
- `src/routes/billing/BillingSuccessPage.tsx` and `BillingCancelPage.tsx`,
  and the centred panel they share;
- `src/business/BusinessProvider.tsx`, only if the provider's `refetch` comes
  to return its promise (§7.5);
- the price test (§7.7);
- the keys in §8, in `en` and `he`.

One page per commit, as in the earlier phases.

**Doesn't touch:**
- `src/api`, `src/auth`, `src/hooks`, `src/config` and `src/lib`;
- the shell, the tour's steps, the kit, the public invitation page and the
  other phases' pages;
- `landing.pricing.pro.*`, `onboarding.billing.*`, `billing.error` (onboarding
  reads it) and `billing.success.done` (the Overview and `/style-guide` read
  it).

**Checks,** in step D, through the browser:
- **Roles and plans:**
  - the owner on Free and on Pro;
  - the manager and staff refused out loud on Team and Billing, and given the
    refusal's words, with no call, on both return pages.
- **Billing's states,** by wrapping `fetch` for the subscription read: `none`,
  `incomplete`, `canceled`, `past_due`, `unpaid`, a word nobody knows,
  `active` with a date, `trialing`, `active` with no date, and Pro with
  `none`. Then:
  - each redirect failing: 503, 400 and offline;
  - the read failing;
  - Back from a real redirect (the back-forward cache);
  - the mark from `/billing/success` an hour ago, and just over a day ago.
- **The return pages:**
  - success: 30 s with no Pro, a failing read for part of it, "בדיקה נוספת",
    and the hand-off with the business read held a second, after which the
    sign switches on and the Overview opens on Pro;
  - cancel: on Free and on Pro.
- **Team:**
  - a link with and without an address, and an address like "dana@";
  - the clipboard refused (the preview pane refuses it), and the share menu
    where it exists;
  - `already_a_member`, both caps, a 404 from another device, and anything
    else;
  - a failed read;
  - 0, 1 and 24 hires with 20 invitations, a 60-character email, and an
    expired invitation, renewed and removed.
- **Rendering:**
  - Hebrew and English;
  - 320, 375, 768, 1024 and 1280px;
  - day and night, the return pages included;
  - reduced motion;
  - 200% text.
- **The keyboard path:** focus never on `<body>` after making a link,
  copying, saving a role, removing someone, cancelling an invitation or a
  failed redirect; the sheets and the dialog return focus where it came
  from, and the dialog opens on "ביטול".
- **The console:** clean apart from the known lines: the two 401s at a cold
  boot, React Router's future-flag warnings, and the fake wallet's host.
- **On a real phone, installed, in Hebrew:**
  - the share menu opening WhatsApp from the installed app;
  - the clipboard on an iPhone;
  - Activate from the installed app on an iPhone: where Stripe's return
    lands (the app's window or a browser sheet), and whether the owner is
    still signed in there. A home-screen app keeps its own storage apart
    from Safari's, and the session is in `localStorage`.

## 10. Open questions for Roee

1. **What Stripe charges.** Every page says ₪99, from `PUNCHME_MONTHLY_PRICE`
   and three literal strings. The backend's `DEPLOYMENT.md:144` says to
   create "your ₪59/mo recurring Price", and nothing in either repo says
   whether the price includes VAT. Billing will print what the constant
   says, so the constant, the strings and `STRIPE_PRICE_ID` have to agree
   before this ships, and if the price is before VAT, every page that names it
   says so.
2. **Where the portal returns.** `BILLING_PORTAL_RETURN_URL` defaults to
   `https://punchmeapp.com/billing`, which the app doesn't route; locally it
   is React Router's developer 404. `DEPLOYMENT.md`'s step 6.4 says to set the
   three URLs once real routes exist. Either production sets it to
   `/dashboard/billing`, or the app gains a `/billing` route that redirects
   there. A new route is yours to approve, so the brief adds none.
3. **A second checkout, refused by the backend.** Billing stops offering one
   during a failed renewal (§7.4), and warns on the device that just paid
   (§7.5). Only the API can close it from every device:
   `POST /api/billing/checkout` could answer 409 while the business holds a
   subscription that isn't releasable, using the backend's own
   `_binding_conflicts` rule. A backend change, outside the redesign.
4. **The invitation's address, checked by the API.** Team checks the shape
   before sending (§7.3); a check in `InvitationCreateIn` would make the 422
   real for every client.
5. **The WhatsApp number.** Billing is where an owner with a money problem
   looks for a person, and there is no one to name. When the number exists,
   the failed-payment notice and "nothing to manage" can carry it.

## 11. Left for other phases, and outside the redesign

**For other phases:**
- **Phase 8, the invitation page.** It says "ההזמנה הזו נשלחה ל-{email}" and
  "ההזמנה נשלחה לכתובת אימייל אחרת" ("sent to"), and nothing is sent; "is
  for" is true. Its title speaks in the singular ("רוצים אותך בצוות"), where
  the voice is plural.
- **Phase 5, the Overview.** Its Free lead says "ההפעלה עולה ₪99 לחודש" to a
  business whose renewal failed or ended as well; Billing tells those states,
  and the lead's button goes there. An old `/billing/success` link replays
  "אתם פעילים!" on the Overview; the sign doesn't replay, being remembered per
  business.
- **Phase 4, onboarding's billing step:** "Activate for ₪99/month" is a
  literal price (the test in §7.7 guards it), and its promise, "ביטול בכל עת
  מלוח הבקרה", is the one Billing now keeps.
- **Phase 2, the shell:** on Free, the masthead's "הפעלה" links to Billing
  from Billing itself.
- **Phase 9, the landing page:** Billing now links to its `#calculator`
  (§7.4), so the anchor stays.

**Outside the redesign:**
- §10's backend items: the second checkout, the address check, and the
  return URL.
- **`DEPLOYMENT.md`'s price,** whichever number is right.
