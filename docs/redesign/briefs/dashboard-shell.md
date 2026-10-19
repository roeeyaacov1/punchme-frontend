# The dashboard shell

Phase 2, step A of `docs/redesign/guide.md`. Diagnosed on 19 Oct 2026 and
written on 20 Oct with `/impeccable critique`, `/impeccable audit`,
`/mobile-native` and `/impeccable shape` (mode: Operate). No code changed.
Step B builds it on Lightbox (DESIGN.md) and `src/components/kit`, in Plan
mode.

The inputs: CLAUDE.md, "Roles" first; PRODUCT.md; DESIGN.md;
`docs/dashboard-routes.md`; `docs/redesign/briefs/visual-world.md`; the
shell's code; and the shell itself, walked live as the four accounts in
`seed_demo.py` (the owner, manager and staff of Demo Coffee on Pro, and the
owner of Demo Barbershop on Free), Hebrew first at 375px, then at 768px and
1280px, and in English. Two reviewers ran apart for the critique: one read and
walked the shell, the other ran Impeccable's detector and injected its overlay
into the live shell. Five questions went to Roee on the way (§6).

Read "In short" first. Sections 7 to 11 are what step B builds.

1. In short
2. The shell today
3. Critique
4. Audit
5. The phone, as an installed app
6. Decisions made in this step
7. The new shell
8. Lightbox on the frame, the pages in their phases
9. The tour
10. Copy
11. What step B keeps, touches and checks
12. Left for other phases, and still open

---

## 1. In short

- **The structure stays; the frame is rebuilt.** On a phone, a bar at the
  thumb with the raised coral Scan circle in the middle; from 768px a compact
  rail of icons over words; from 1280px the full rail with its group headings
  (Roee, §6). Today a tablet gets the phone's bar floating in the middle of
  the screen.
- **The bar is the counter.** Overview, Customers, Scan and Activity for every
  role, then one slot that depends on the role: Account for staff, More for
  managers and owners. Staff lose today's empty slot, Activity comes out from
  behind More, and Messages moves into More, two taps away, because it is used
  weekly and Activity all day. Scan carries its word under the circle.
- **The groups are the roles.** Counter (everyone), What customers see
  (managers and up: Customer messages, Card Studio, Standee, Refer a friend)
  and The business (the owner: Billing, Team). A hire only ever sees whole
  groups, and Billing stops hiding under "הגדרה" (Roee, §6).
- **The shell's one signature move is the shop's sign.** The masthead's chip
  is the owner's own card at the size of a thumbnail. On Free it is unlit,
  beside "עדיין לא פעיל · הפעלה" for the owner; on Pro it is lit; and on the
  day the owner activates, it switches on, once. Lightbox's own picture, "Pro
  switches the sign on", appears in the product.
- **Lightbox goes on the frame now, and every page keeps its look until its
  own phase** (Roee, §6). The masthead, bar, rails, sheets, the role panel,
  the error panels and the tour wear `.theme-lightbox`; the pages inside stay
  on the old scope until Phases 3 to 7 move them. At night the old navy meets
  the warm street at the frame's edge until then.
- **Five things are broken, and Phase 2 fixes them:**
  - the tour can lock the app on a phone (P0);
  - an unknown URL drops out of the shell to React Router's English developer
    page, and a failed load sends a live shop to onboarding (Roee allowed a
    catch-all route and an error element, §6);
  - the tour still says "no signup", and tells Free owners and hires the Pro
    owner's story;
  - the next person to sign in on a shared phone lands on the last person's
    page;
  - nothing says who is signed in.
- **The tour stays one walk, made true** for each role and plan. It holds back
  on the day of activation, and remembers each person rather than each device
  (Roee, §6). `steps.ts` and its test change with it (§9).
- **The phone becomes an app:**
  - `viewport-fit=cover`, so the safe areas work;
  - the kit's `Sheet`, so the back gesture closes More;
  - pressed states, no stuck hover, no long-press callout, and `dvh`;
  - the status bar and the splash in Lightbox's colours instead of violet (§5).

## 2. The shell today

### What each role sees

| | Phone bar | Behind "עוד" (More) | Desktop rail (from 1024px) | First-arrival tour |
|---|---|---|---|---|
| Owner, Pro | Overview · Customers · Scan · Push · More | Counter: Activity · Marketing: Refer a friend · Setup: Card Studio, Standee, Team, Billing · Account | Counter: Scan, Overview, Customers, Activity · Marketing: Customer messages, Refer a friend · Setup: the four · Account | 5 stops: overview, customers, join, design, scan |
| Owner, Free | the same | the same | the same | 5 stops: overview, customers, join, activate, scan |
| Manager | the same | without Team and Billing | without Team and Billing | 5 on Pro, 4 on Free |
| Staff | Overview · Customers · Scan · *an empty slot* · More | Counter: Activity · Account | Counter · Account | 3 stops: overview, customers, scan |

Typing the URL of a page above one's role shows the "not for your role" panel
inside the shell, and that page makes none of its API calls. That part works,
and stays.

### The three questions

**How does a staff member at the counter get to Scan?** One tap from anywhere
in the dashboard: the raised 74px button in the middle of the phone bar
(`DashboardNav.tsx:362-381`), or the rail's first row on a desktop.
- **Cold launch:** the installed app opens on the Overview
  (`start_url: /dashboard`), so it's one tap there too.
- **Android:** a long press on the icon offers "סריקה" straight to the camera.

It fails in four places:
- an unknown URL leaves the shell, and its Scan button with it;
- the first-arrival tour keeps Scan under its overlay until the last stop;
- for staff on a Free business the tour locks the phone (§3);
- the button shows no word, only an `aria-label`.

**How does an owner find Billing?**
- **Phone:** two taps, "עוד" and then "חיוב", the last of six page rows in
  the sheet. It sits under "הגדרה" ("Setup", which in Hebrew also reads as "a
  definition").
- **Desktop:** one click, the last row of Setup.
- **Free owner:** also three one-tap links on the Overview, and the tour's
  Activate stop. The masthead's "חינמי" isn't a link.

An owner who thinks "my subscription is account stuff" looks under Account,
and Billing isn't there.

**What does each role see?** The table above. The navigation is right for
every role: nobody is shown a door that would refuse them. What is wrong is
around it.

### Measured

- **Chrome height and finish:**
  - The masthead is 61px and the bar 72px: 133px of chrome on an 812px phone.
  - Both are 95% opaque over a background blur, which DESIGN.md bans as
    frosted glass.
  - The Scan button wears a halo of its own fill, which DESIGN.md bans as a
    glowing halo.
- **Type:**
  - Tab labels are 11px Assistant; the detector flags it, since DESIGN.md's
    smallest step is 13px.
  - Group headings are 12px, uppercase and tracked, in Hebrew too.
- **The plan:** Pro says it twice ("פרו" under the name, and a "פרו" tag in
  IBM Plex Mono, which has no Hebrew); Free says it once, inert.
- **The More sheet:**
  - It is 690px tall and scrolls; sign out is below its fold, and its close
    button sits 655px above the thumb.
  - It is a `div` with `aria-modal`, not a dialog: Tab walks out of it, and
    Android's back gesture navigates away instead of closing it.
- **The desktop rail:** it is 1017px tall on an 860px screen, so language, the
  tour and sign out are below the fold. Its logo links to the marketing
  landing page.
- **Tablets:** from 768 to 1023px a tablet gets the phone's bar, 512px wide,
  floating in the middle of the screen.
- **Titles and scroll:** every dashboard page is titled "PunchMe — Digital
  Loyalty Cards", in English even in Hebrew. Route changes aren't announced,
  and nothing resets the scroll between pages.
- **Shared devices:** signing out keeps the login page's `from`, so the next
  person to sign in on that device lands on the last person's page. Staff
  landed on the Billing refusal; the Free owner on the Card Studio.
- **Unknown URLs:** `/dashboard/nope` shows React Router's "Unexpected
  Application Error! 404 Not Found … Hey developer", in English, outside the
  shell.
- **Who's signed in:** nothing says who, or as what.

## 3. Critique

22/40, Acceptable. Two reviewers worked apart:
- a design review of the live shell as all four accounts;
- Impeccable's detector, with its overlay injected on four shell views.

The snapshot is in `.impeccable/critique/` (untracked), for step D's
`/impeccable polish`.

| # | Heuristic | Score | Key issue |
|---|---|---|---|
| 1 | Visibility of system status | 3 | Clear active states; one static English title; route changes unannounced; bare "Loading..." at boot |
| 2 | Match with the real world | 2 | "פוש" on the bar against "הודעות ללקוחות" in the rail; Billing under "הגדרה"; the tour says פרס and ניקוב where the product says הטבה and חותמת |
| 3 | User control and freedom | 2 | An unknown URL leaves the shell; the tour can lock the app |
| 4 | Consistency and standards | 2 | The phone and the rail organise pages differently; Scan is the only tab with no word; More claims to be modal and traps nothing; the refusal has no h1 |
| 5 | Error prevention | 2 | Role filtering is right; sign-out hands the next person the last person's page; a failed load sends a live shop to onboarding |
| 6 | Recognition rather than recall | 3 | Everything labelled and grouped; six owner pages behind More |
| 7 | Flexibility and efficiency | 2 | Scan is one tap everywhere; the bar ignores role |
| 8 | Aesthetic and minimalist design | 3 | Calm; the theme switch is the loudest thing in More |
| 9 | Error recognition and recovery | 1 | The refusal names neither the role nor who to ask; the 404 is a developer page |
| 10 | Help and documentation | 2 | A replayable tour on the real pages, wrong for Free owners and hires |

**Specificity.** The structure belongs to this product:
- the groups follow the roles;
- Scan is the counter's one action;
- the chip carries the owner's own colours;
- a page above one's rank says no in place;
- the tour lights the owner's real pages through a real gap in its overlay.

The look doesn't: a white sidebar, grey small caps, violet pills, a violet
floating button. The biggest missed chance is the plan.

The detector agrees the shell carries no generic tells:
- **Files:** of eight files it flagged two things. The 11px tab labels are a
  true finding. Roboto in `index.html` is a false positive: it's the Google
  Wallet preview's face.
- **Overlay:** it found nothing in the masthead, bar, rail, sheet or refusal.
  Its one hit, "nested cards", is the Overview's pass slot: a false positive,
  and Phase 5's page.

**Priority issues**

1. **[P0] The tour can lock the app on a phone.**
   - **Cause:** the step effect resets the card's place
     (`DashboardTour.tsx:173-181`) after the layout effect set it
     (`:303-309`), and nothing places it again until the stop's element is
     found.
   - **Who hits it:** staff on a Free business, always, because the hire panel
     has no `overview-lead` (`DashboardOverview.tsx:296-303`). Also anyone
     whose Overview card fails to load, or takes over five seconds.
   - **Result:** an invisible card sits under a full-screen overlay that takes
     every tap. Only Escape or a rotation frees it, and a reload brings it
     back, because the tour marks itself seen only on close.
2. **[P1] The shell has no error states.**
   - There is no catch-all and no `errorElement` under `/dashboard`
     (`main.tsx:134-175`).
   - A failed `/api/businesses/me` (a 500, or offline) reads as "no business"
     and redirects a live shop to `/onboarding` (`RequireBusiness.tsx:17-19`).
3. **[P1] The tour's copy overclaims.**
   - "no app, no signup" (`tour.steps.join.body`, both languages).
   - Free owners and hires hear the Pro owner's script: "Is it working?",
     "Everyone who has joined", "ready for the first customer".
   - On `?activated=1` it covers "You're live!".
4. **[P2] The phone bar splits the counter.** Staff get an empty `aria-hidden`
   slot, while Activity, a staff page, is the only page in their More. "Push"
   is jargon.
5. **[P2] Nothing says who is signed in, and the hand-off breaks** (§2,
   "Measured").

**Personas**
- **Noa (staff, first week, rush hour):**
  - On a shared phone, her first screen can be the owner's Billing refusal.
  - Her tour asks the owner's question and never covers a full card.
  - On a Free business, the tour locks the phone.
- **Avi (Free barber deciding whether to activate):**
  - "חינמי" is inert.
  - The tour promises customers and "no signup", and ends "the camera opens";
    Scan then says there is nobody to scan.
  - The Activate stop never says ₪99.
- **Sam (screen reader):** Tab walks out of More, the title never changes, the
  refusal has no h1, and the language row has no `lang`.
- **Alex (power user):** no shortcut to Scan, and the rail's sign out is below
  the fold.

## 4. Audit

11/20, Acceptable.

| # | Dimension | Score | Key finding |
|---|---|---|---|
| 1 | Accessibility | 2 | More has no focus trap; one static English title (WCAG 2.4.2); no h1 on the refusal; the "English"/"עברית" row has no `lang` (3.1.2); reduced motion removes the sheet's entrance instead of fading it |
| 2 | Performance | 3 | The shell is light; two fixed bars blur what scrolls under them; every route ships in one 849 KB chunk (260 KB gzipped), which the service worker caches after the first load |
| 3 | Theming | 2 | All on the old scopes: `theme-purple theme-raised` in both `useDashboardTheme.ts:25` and the pre-paint script in `index.html:76-93`, which must change together; theme-color `#ffffff` and `#0f0f23`; the manifests' `#5b41e6`; violet for "selected" |
| 4 | Responsive | 2 | 375px works; 768–1023px gets the floating phone bar; the rail outgrows an 860px screen; `min-h-screen` (100vh) and an 85vh sheet; the safe-area insets resolve to 0 |
| 5 | Implementation integrity | 2 | Three primitive families (`marketing/primitives`, `dashboard/primitives`, a hand-rolled sheet) and nothing from the kit; frosted glass and a halo; `isMorePath` ignores role, so More lights on a refused page it doesn't hold; the tour borrows the Scan page's copy keys |

**Positive, and kept:**
- navigation built from one list and filtered by role;
- the refusal said in place;
- the skip link, and `aria-current` on the active entry;
- 44px targets across the bar, the rail and the sheet;
- the tour's keyboard: arrows that follow the reading direction, Tab cycling
  through the card and the lit element, one live region per stop;
- a status-bar colour read from the ground rather than restated;
- a service worker that never caches `/api`.

## 5. The phone, as an installed app

These findings come from `/mobile-native`. Step B builds the structural fixes
and step C the feel. Rows marked *phone* can only be confirmed on a real
device; emulation reproduces none of them.

| Symptom today | Why | The fix |
|---|---|---|
| The bar's `env(safe-area-inset-bottom)` is 0 (*phone*) | `index.html:9` has no `viewport-fit=cover`, so iOS letterboxes the page and the home-indicator strip shows the page's ground under a floating bar | Add `viewport-fit=cover`; pad the bar, the sheets, the toasts and the tour's card with `env(safe-area-inset-*)` |
| Hover sticks after a tap (*phone*) | Rail rows, sheet rows, the theme buttons and the tour's Skip use plain `hover:` | `hover-fine:` everywhere in the shell; it is already in `tailwind.config.js` |
| A tap gives no feedback until the page changes | No `:active` state on the tabs or on Scan; the tap flash is already off globally (Tailwind's preflight) | Feedback on press: the kit's 0.97 press on Scan, an ink well behind a tab's icon, 120ms; `touch-action: manipulation` on the bar |
| A long press on a tab opens the link callout (*phone*) | The tabs are links | `-webkit-touch-callout: none` and `user-select: none` on the bar's and the rails' controls, never on text |
| Android's back gesture leaves the page while More is open (*phone*) | More is a `div`, not a dialog | The kit's `Sheet`: a native `<dialog>` with a real focus trap, closed by Escape and by back |
| The shell is the wrong height under the browser toolbar | `min-h-screen` is 100vh; the sheet is `max-h-[85vh]` | `min-h-dvh` on the shell; the kit's sheet already stops at 90dvh |
| Pulling past the top reloads the dashboard in a browser tab | No `overscroll-behavior` | `overscroll-behavior-y: none` on `<html>` while the dashboard is mounted; the kit's sheet already contains its own scroll |
| The status bar and the splash are violet or navy (*phone*) | `index.html`'s theme-color metas; the manifests' `#5b41e6` | The shell's own theme-color meta follows the frame's ground (`#f6f2eb` by day, `#16120f` at night); both manifests take the wall, `#f6f2eb` |
| Typing in a field near the bottom (*phone*) | The soft keyboard and a fixed bar share the bottom of the screen | No `interactive-widget=resizes-content`: with a fixed bar it would lift the bar over the field being typed. Let the keyboard cover the bar |

Check on a phone, installed, in Hebrew:
- the bar against the home indicator;
- the status bar, by day and at night;
- the back gesture with More open;
- a long press on Scan;
- the keyboard over Scan's typed code and over the Customers search;
- an older phone.

## 6. Decisions made in this step

| # | Question | Roee's answer (20 Oct) |
|---|---|---|
| 1 | The pages still waiting for their phase | **Frame only.** Lightbox goes on the frame now; each page keeps its look until its own phase, and the seam at night is accepted until Phase 7 (§8) |
| 2 | Grouping | **By who opens it:** Counter, What customers see, The business (§7.3) |
| 3 | `/dashboard/nope` | **Both:** a catch-all under `/dashboard` and an error element, inside the shell. No route is removed or renamed (§7.10) |
| 4 | The tour | **One walk, true copy,** per role and plan, held back on the day of activation, remembered per person (§9) |
| 5 | The structure | **Counter bar and rail.** Impeccable's roll (seed `d85c436b`) dealt three structures: Scan dock, App bar with a Scan button, and this one. The decision page closed before Roee saw it, so the choice was made through the question tool |

## 7. The new shell

### 7.1 What is fixed

- **Every route** in `docs/dashboard-routes.md`, with its role gating.
- **The shell's calls**, the same as today and no others: `GET /api/auth/me`,
  `GET /api/businesses/me`, `GET {biz}/templates` for the chip,
  `POST /api/auth/logout`, and the refresh on any 401. Who is signed in comes
  from the user `/api/auth/me` already returns.
- **`NAV_GROUPS` is the only source of the navigation.** Each item keeps its
  `min` role, and every menu is built from `visibleGroups(role)`: the bar,
  both rails and the More sheet.
- **`RequireRole` says no out loud** inside the shell, wrapping the manager
  and the owner route groups in `main.tsx`.
- **The skip link**, first in the document, to the page area.
- **The tour's anchors:**
  - `nav-<key>` on every navigation entry that leads to a page, the Scan
    control included (`nav-scan`);
  - the pages' own anchors (`overview-lead`, `customers-roster`,
    `standee-sheet`, `design-studio`, `billing-activate`) stay untouched.
- **The account menu's link to `/admin`** for PunchMe staff
  (`user.is_staff`).
- **`npm test` passes**, with the tour's tests updated (§9).
- **Untouched:** `src/api`, `src/auth`, `src/hooks`, `src/config`, `src/lib`,
  the pass previews, and every page's own content.

### 7.2 Three widths

| Width | Navigation | Identity |
|---|---|---|
| Under 768px | The bar, at the bottom | The masthead, at the top |
| 768 to 1279px | The compact rail, at the start edge | The masthead, over the page |
| From 1280px | The full rail, at the start edge | At the top of the rail; no masthead |

The full rail moves up from 1024px to 1280px, so a laptop at 1024–1279px
gives the Card Studio 936px instead of 752px. Everything is laid out with
logical properties and mirrors in Hebrew: the rail is on the right, and
Overview at the right end of the bar.

### 7.3 Groups, and what each role sees

`NAV_GROUPS` is regrouped by who can open each page. Every item in a group
shares the group's floor, so a role sees a whole group or none of it:

| Group | Items, in order | `min` |
|---|---|---|
| Counter · דלפק | Scan, Overview, Customers, Activity | staff |
| What customers see · מה שהלקוחות רואים | Customer messages, Card Studio, Standee, Refer a friend | manager |
| The business · העסק | Billing, Team | owner |

Within a group, pages are ordered by how often they're opened:
- Messages (weekly) comes before the studio and the standee, which are set up
  once and revisited;
- Billing comes before Team, because a Free owner comes for Billing.

| | Phone bar | Fifth slot opens | Tablet rail | Desktop rail |
|---|---|---|---|---|
| Staff | Overview · Customers · **Scan** · Activity · Account | The account sheet | Scan, then the counter pages | Counter |
| Manager | Overview · Customers · **Scan** · Activity · More | More: What customers see, then the person | + What customers see | Counter, What customers see |
| Owner | Overview · Customers · **Scan** · Activity · More | More: What customers see, The business, then the person | + The business | All three |

The three questions, answered again:
- **Scan:** one tap from every page, at every width.
- **Billing:** under "העסק", two taps on a phone and one on a tablet or a
  desktop. A Free owner also has it in the masthead (§7.8).

### 7.4 The phone bar and the Scan button

- **The bar is the Counter group.** The same four slots for every role, Scan
  in the middle. The fifth slot is the role's: "חשבון" (Account) for staff,
  whose More would hold only account rows, and "עוד" (More) for managers and
  owners. No slot is ever empty.
- **The bar:** full width, square, lit acrylic (unlit at night), with a
  hairline along its top. 64px tall plus the bottom safe area. No blur, no
  shadow.
- **A tab:**
  - **Size:** icon over word, at least 64px tall and a fifth of the width.
    The icon is 24px; the word is Assistant 600 at 13px (`type-tag`).
  - **At rest:** ink-muted (7.27:1 on the wall, 7.99:1 on a panel; 10.32:1
    and 9.43:1 at night).
  - **Current page:** ink icon and word, and a 2px ink rule along the bar's
    top edge above the tab. The rule appears at once, with no animation.
    `aria-current="page"`.
  - **Pressed:** an ink well at 6% behind the icon, for 120ms.
- **Scan:**
  - **The circle:** 64px coral, with the ink `ScanLine` icon at 28px
    (5.50:1; at night `#ff8a5c` with `#1a120d`, 7.95:1).
  - **Raised:** 16px out of the bar, inside a 4px ring of the bar's own
    ground, so it reads as cut out of the bar rather than floating over it.
    No halo, no shadow.
  - **Its word:** "סריקה" sits in the bar's word row under the circle, so the
    one control used dozens of times a day says what it is.
  - **Pressed:** the kit's 0.97 press; with reduced motion, coral-hover
    instead.
  - **Reading order:** it keeps its place in the bar: Overview, Customers,
    Scan, Activity, the fifth slot.
- **Where Messages went.** Off the bar and first in "What customers see". A
  broadcast is capped at two a week, while "did that stamp go through?" gets
  asked all day. "פוש"/"Push" is gone.
- **The keyboard covers the bar** when a field is being typed in; the bar
  never rides up over the field.

### 7.5 The More sheet and the account sheet

- **One sheet at a time.** Both are the kit's `Sheet`:
  - it rises from the bottom on the drawer curve, or crossfades with reduced
    motion;
  - it traps focus;
  - Escape, the back gesture, a tap on the scrim or its close button closes
    it;
  - its trigger carries `aria-expanded`.
- **More** (managers and owners):
  - It holds, under their headings, "What customers see" and, for the owner,
    "The business".
  - Each page is a kit `ListRow`: 56px, its icon at the start, a chevron
    toward the reading end.
  - Below them is one row for the person: their initial, their name and their
    role ("דנה לוי · בעלים"). It closes More and opens the account sheet.
  - The owner's More is about 550px tall, so it doesn't scroll at 812px.
- **The account sheet** opens with who is signed in: name (or email when there
  is no name), and role from `team.role.*`. Names sit in `<bdi>`, because a
  Latin name inside Hebrew must keep its own direction. Then:
  - **Appearance:** the kit's `SegmentedControl`, "יום · לילה · אוטומטי" (Day ·
    Night · Automatic), with one line under it saying Automatic follows the
    device. Selected is drawn in ink, never coral, and Automatic stays the
    default. The stored values (`light`, `dark`, `system`) don't change.
  - **The other language:** its name set in that language, with its own `lang`
    ("English" with `lang="en"`).
  - **Show the tour again.**
  - **PunchMe Admin**, for `is_staff` only.
  - **Sign out.** It leaves no `from` behind, so the next person starts on the
    Overview. `logout()` clears the session synchronously, so the shell can
    call it and then replace the route with `/login` without state, in the
    same handler, with `src/auth` untouched. Step B checks the order against
    the login page's redirect for a visitor who is still signed in.
- **Staff's fifth slot opens the account sheet directly:** they have no pages
  in More.

### 7.6 The tablet rail (768 to 1279px)

- **The rail:** 88px wide at the start edge, full height (`dvh`), lit acrylic,
  with a hairline at its end edge. It scrolls on its own if a landscape tablet
  is too short for it.
- **Top to bottom:**
  - the Scan circle, the same as the phone's with its word under it, because a
    tablet on the counter does the phone's job;
  - the counter pages;
  - a hairline, then What customers see;
  - a hairline, then The business;
  - at the foot, the person's initial, which opens the account sheet. From
    768px the kit's sheet comes in from the end edge.
- **Entries:** each is an icon over its word, 56px tall. The current one is
  ink, with a 2px ink rule at its start edge.
- **No group headings:** hairlines divide the groups, since there's no room
  for headings and every entry carries its word.

### 7.7 The desktop rail (from 1280px)

- **Head:** 272px wide at the start edge. At the top is the wordmark, which
  now leads to `/dashboard` instead of the landing page, then the shop's sign
  with the business name and, on Free, the plan's state (§7.8).
- **Groups:** all three, with their headings in Assistant 600 at 14px
  (`type-label`), ink-muted, with no uppercase and no tracking, since Hebrew
  has neither.
- **Rows:**
  - 44px, with a 20px icon and the word in Rubik 500 at 16px;
  - the current row is ink with a 2px ink rule at its start edge, the rest
    ink-muted;
  - Scan is the Counter group's first row, an ordinary row: a desk is not the
    counter.
- **Foot:** one row for the person, which opens the account sheet.
- **Height:** the rail fits an 860px screen with room to spare.

### 7.8 The masthead and the shop's sign

- **The masthead** (under 1280px): 56px, sticky, on a solid wall ground with a
  hairline under it, and no blur. From the start edge:
  - the chip;
  - the business name in Rubik 500 at 16px, truncating at the end edge;
  - on Free, the plan's state.

  Nothing sits at its end: the person lives in the fifth slot or at the rail's
  foot.
- **The chip is the shop's sign:** the owner's card at the size of a thumbnail
  (36 by 24), in the card's real colours, with the initial set the way the
  pass sets the name. While the templates load it shows the wall with a
  hairline, not navy.
  - **Pro:** the sign is lit, at full strength, and nothing else is said. The
    masthead no longer prints "פרו" at all, let alone twice.
  - **Free, the owner:** the sign is unlit, at half strength, beside "עדיין לא
    פעיל · הפעלה" (Not live yet · Activate). "הפעלה" is an ink, underlined
    link to `/dashboard/billing` with a 44px target.
  - **Free, a hire:** the unlit sign and "עדיין לא פעיל", as plain text, since
    they can't activate.
  - **The day it switches on:** arriving with `?activated=1`, the sign lights
    once, from half strength to full in 600ms (DESIGN.md's activation
    ceremony); with reduced motion, a 150ms fade.
- **Accessibility:** the words carry the state and the light only repeats it,
  so the chip itself stays `aria-hidden`.

### 7.9 The role panel

`RequireRole` keeps saying no in place, inside the shell, rebuilt on the kit:

- **The h1** is the name of the page that refused (for example "חיוב"), with a
  lock icon in ink.
- **Then four short lines:**
  - that it isn't open to them: "הדף הזה לא פתוח בשבילכם";
  - who can open it: "רק הבעלים יכול/ה לפתוח את החיוב ואת הצוות.", or "רק
    מנהל/ת או הבעלים יכולים לשנות את מה שהלקוחות רואים: הכרטיסייה, השילוט,
    ההודעות וחבר מביא חבר.";
  - who they are: "נכנסתם בתור נועה מזרחי, עובד/ת.";
  - what to do: "אם צריך משהו מכאן, פנו לבעלים." on the owner's pages, or "פנו
    למנהל/ת או לבעלים." on a manager's.
- **One way out:** "לסקירה" (To the Overview), the kit's secondary button,
  44px.
- **The navigation:** nothing lights up for a page the viewer can't open, and
  More lights only for a path inside the viewer's own More.
- **While the role loads:** the kit's `Loading` (a status, in a face that sets
  Hebrew), never "Loading..." in Plex Mono.

### 7.10 Missing pages and failures

- **No page here.** A catch-all route under `/dashboard` shows the kit's
  `EmptyState` inside the shell: "אין כאן דף" (h1), "ייתכן שהקישור ישן או שנפלה
  בו טעות.", and "לסקירה". The bar or the rail stays, so Scan is still one tap
  away.
- **A page that didn't load.** The `errorElement` goes on a pathless route
  between `DashboardLayout` and the pages, so a page that throws shows inside
  the shell: "הדף לא נטען" (h1), "נסו שוב, או חזרו לסקירה.", with "נסו שוב"
  (reload) and "לסקירה".
- **The business didn't load.** `RequireBusiness` sends to `/onboarding` only
  on a 404. Any other failure (a 500, or offline) shows a full page without
  the shell, since there's no business to build it from:
  - "לא הצלחנו להתחבר לפאנץ' מי";
  - "בדקו את החיבור לאינטרנט ונסו שוב.";
  - "נסו שוב" (a refetch), and sign out.

  `BusinessProvider` exposes the error for it; `src/business` isn't frozen.
- **Loading,** at every level, is the kit's `Loading` or `Skeleton`, with
  `role="status"`.

### 7.11 Titles, focus and scroll

- **Titles:** each dashboard page is titled by its navigation label and the
  app's name, the way onboarding titles its steps: "סריקה — פאנץ' מי", "Scan —
  PunchMe".
  - Nested pages take their parent's name: a new broadcast is "הודעות
    ללקוחות".
  - The refusal and the catch-all take their own.
- **A route change,** after the first load, is announced: the page's name in a
  polite live region. Focus moves to the page area (`tabIndex={-1}`), so the
  next Tab starts in the page.
- **Scroll:** React Router's `ScrollRestoration` in the shell. A new page opens
  at its top, and back and forward return to where you were.

### 7.12 Colour, type and states

- **The frame wears Lightbox:**
  - **By day:** the wall for the masthead and around the frame, lit acrylic
    for the bar and the rails, ink text, and ink for current and selected.
  - **At night:** the street, unlit panels and night ink, masthead and bar
    included.
- **Coral** fills the Scan circle on the phone bar and on the tablet rail, and
  nothing else in the frame. The tablet's circle is one more place than
  DESIGN.md's list ("the raised Scan button in the phone bar"). Step B adds it
  to DESIGN.md's Primary line, unless §12 overturns it.
- **No new colour.** Every pair here is already measured in DESIGN.md and on
  `/style-guide`; step B adds none without measuring it.
- **Type:**
  - Rubik 500 for the business name, the rail rows and the buttons;
  - Assistant 600 at 13px for the bar's words and at 14px for group headings;
  - nothing below 13px;
  - no Plex Mono anywhere in the frame.
- **Every control:** the kit's outline `focusRing`; 44px or more; hover only
  through `hover-fine:`; disabled at half strength.
- **States the frame must draw:**
  - **Loading:** the role loading; the templates loading (the chip's wall).
  - **Who and what:** Free and Pro; owner, manager and staff; `is_staff`;
    Hebrew and English; day, night and automatic.
  - **Moments:** the first arrival (the tour); the day of activation.
  - **Failures:** a page refused; a page missing; a page that failed; the
    business failing to load.
  - **Offline:** the service worker serves the frame, and the business load
    fails into its retry.
  - **Names:** a business name of one letter and one of 60, truncating.
  - **Context:** the installed app and the browser tab.

### 7.13 Motion (for step C)

Animate by frequency.

- **The bar, Scan and the rails** are used dozens of times a day, so nothing
  moves except the press: 0.97 on Scan in 120ms, and the well behind a tab's
  icon. The current tab's rule appears at once; no indicator slides between
  tabs.
- **The sheets** move the kit's own way: up on the drawer curve in 300ms, out
  in 180ms, and a crossfade with reduced motion. The sheet's grabber has to
  become a real drag-to-dismiss in step C, or go: a grabber that can't be
  grabbed is a lie. D6 allows `motion` for one gesture, and a short pointer
  handler may manage without it.
- **The tour:** each stop's card arrives by light, 240ms on the ease-out, and
  the scrim fades in once. With reduced motion, 150ms fades.
- **The sign:** 600ms, once, on the day of activation.

## 8. Lightbox on the frame, the pages in their phases

Roee chose to leave the waiting pages as they are (§6), which is also the
guide's rule: pages still waiting don't change in the meantime.

- **`<html>` keeps the old scope** through Phases 2 to 7.
  `useDashboardTheme` and the pre-paint script in `index.html` keep putting
  `theme-purple theme-raised` (and `theme-night`) there, so every page that
  hasn't moved renders exactly as today.
- **The frame wears Lightbox on its own elements:**
  - the masthead, the bar, both rails, the sheets, the toast region and the
    tour each carry `theme-lightbox`, plus `theme-night` at night;
  - the night rule is a compound class, so both classes go on the same
    element;
  - `.theme-lightbox` sets every variable the kit reads, so nothing of the old
    scope leaks into the frame.
- **A page that moves claims Lightbox for the whole screen:**
  - The shell gives the pages a claim (for example `useLightboxPage()`). While
    a page holding it is mounted, `<html>` wears `theme-lightbox` instead of
    the old pair, so the page's ground and overscroll are Lightbox too.
  - In Phase 2 only the shell's own pages hold the claim: the role panel, the
    catch-all, the page that failed and the failed business load.
  - Phases 3 to 7 add their pages one by one. Phase 10 makes Lightbox the
    default and deletes the claim along with the old scopes.
  - Whether the pre-paint script learns which paths have moved is step B's to
    plan. A hard load of a refused page may start for a moment on the old
    ground, and that is acceptable.
- **The status bar follows the frame:** the shell's theme-color meta reads the
  frame's ground, not `<html>`'s.
- **The seam:** by day the wall (`#f6f2eb`) meets the old wash (`#f5f6fe`);
  at night the street (`#16120f`) meets the old navy (`#0f0f23`). It lasts
  until each page moves.
- **Toasts:** the kit's `ToastProvider` goes into the frame now, inside the
  Lightbox scope. On a phone, `--toast-offset` is set to the bar's height plus
  the safe area, so moved pages can toast from Phase 3 on.

## 9. The tour

### Kept

- one walk over the real pages, through a real gap in the overlay, so the lit
  element stays live;
- the stops filtered by role, exactly as the navigation is;
- it only ever starts on the Overview, and never drives to Scan, because that
  opens the camera;
- the last stop lights Scan and waits for a tap;
- the keyboard: Escape, arrows that follow the reading direction, and Tab
  cycling through the card and the lit element;
- one live region per stop;
- replay from the account sheet;
- the card filling up as the walk goes, now with the kit's `StampRow`.

### Fixed

- **It can never lock the app.**
  - The card is always visible: centred while its element is being looked
    for, and centred for good when the search gives up after five seconds.
  - The full-screen scrim never stands without a visible card above it.
  - The card's placement becomes a pure function (for example `placement.ts`:
    no element, or none on screen, means centred), with its own test.
- **Every stop says what is true for this role and plan:**
  - Free skips Customers, which is empty;
  - the Free stops say what activation unlocks;
  - the Activate stop gives the price from `PUNCHME_MONTHLY_PRICE`, isolated
    left to right;
  - hires get their own line on the Overview;
  - Join says "no app, no account, no password";
  - the Scan stop gets its own keys, says what to do with a full card, and on
    Free asks for no tap.
- **It holds back on the day of activation.** Arriving with `?activated=1`,
  it doesn't open and isn't marked seen, so "אתם פעילים!" and the sign
  switching on stay uncovered. It opens on the next arrival.
- **It remembers each person, not each device.** The seen key carries the
  user's id, so a new hire on the shop's phone gets their own walk. An
  existing device-wide value counts as seen for the owner, the person most
  likely to have seen it, and is then removed.
- **On Lightbox:**
  - the kit's scrim: ink at 40% by day, black at 60% at night, no blur;
  - the lit element's rim in ink, not coral;
  - the card is a kit panel with kit buttons at 44px;
  - on closing, focus goes back where it was, or to Scan after the last
    stop's tap, never to `<body>`.

### The walks

| | Pro | Free |
|---|---|---|
| Owner | overview, customers, join, design, scan (5) | overview (Free), join (Free), activate, scan (Free) (4) |
| Manager | overview (hire), customers, join, design, scan (5) | overview (Free), join (Free), scan (Free) (3) |
| Staff | overview (hire), customers, scan (3) | overview (Free, hire), scan (Free) (2) |

### `steps.ts` and its test

- **`group` follows the new groups:** overview, customers and scan are
  `counter`; join and design are `facing`; activate is `business`. The test's
  `/^(counter|marketing|setup)$/` becomes `/^(counter|facing|business)$/`.
- **Copy per stop:** each stop carries its copy per plan, and the overview its
  copy per role too. `tourSteps(role, canEnroll)` returns the right keys.
- **The test keeps every case it has:** ends on the scanner, never drives to
  it, five stops or fewer, nothing for no role, and a tap asked only on Scan.
- **It adds:**
  - the walks in the table above;
  - no Free stop uses a Pro key;
  - on Free, no stop asks for a tap;
  - every key the walks use exists in both `en` and `he`;
  - the placement function's "no element means centred".
- **`seen.test.ts`** gains the per-person key and the one-time move of the
  device-wide value.

## 10. Copy

Every string goes through `t()`, in `en` and `he` together. These are drafts in
the product's voice (plural to the reader, slash forms for people, the
glossary's terms); step D's `/impeccable clarify` settles them.

**Reused keys:**
- `dashboard.groups.counter`;
- `dashboard.groups.account`, for the staff tab's "חשבון";
- `billing.activateCta`, for "הפעלה";
- `team.role.*`, `common.retry` and `app.name`;
- the `dashboard.nav.*` labels.

**Keys left unused** (`dashboard.groups.marketing`, `dashboard.groups.setup`,
`dashboard.nav.messagesTab`) wait for Phase 10.

| Key | English | עברית |
|---|---|---|
| `dashboard.groups.facing` (new) | What customers see | מה שהלקוחות רואים |
| `dashboard.groups.business` (new) | The business | העסק |
| `dashboard.plan.notLive` (new) | Not live yet | עדיין לא פעיל |
| `dashboard.theme.light` / `.dark` / `.system` | Day / Night / Automatic | יום / לילה / אוטומטי |
| `dashboard.theme.hint` (new) | Automatic follows your device. | אוטומטי עובר ליום וללילה לפי המכשיר. |
| `dashboard.account.signedInAs` (new) | You're signed in as {{name}}, {{role}}. | נכנסתם בתור {{name}}, {{role}}. |
| `team.denied.title` | This page isn't open to you | הדף הזה לא פתוח בשבילכם |
| `team.denied.manager` | Only a manager or the owner can change what customers see: the card, the standee, the messages and Refer a friend. | רק מנהל/ת או הבעלים יכולים לשנות את מה שהלקוחות רואים: הכרטיסייה, השילוט, ההודעות וחבר מביא חבר. |
| `team.denied.owner` | Only the owner can open billing and the team. | רק הבעלים יכול/ה לפתוח את החיוב ואת הצוות. |
| `team.denied.askOwner` (new) | If you need something here, ask the owner. | אם צריך משהו מכאן, פנו לבעלים. |
| `team.denied.askManager` (new) | If you need something here, ask a manager or the owner. | אם צריך משהו מכאן, פנו למנהל/ת או לבעלים. |
| `team.denied.back` | To the Overview | לסקירה |
| `dashboard.notFound.title` / `.body` (new) | There's no page here / The link may be old or mistyped. | אין כאן דף / ייתכן שהקישור ישן או שנפלה בו טעות. |
| `dashboard.pageError.title` / `.body` (new) | This page didn't load / Try again, or go back to the Overview. | הדף לא נטען / נסו שוב, או חזרו לסקירה. |
| `dashboard.loadFailed.title` / `.body` (new) | We couldn't reach PunchMe / Check the connection and try again. | לא הצלחנו להתחבר לפאנץ' מי / בדקו את החיבור לאינטרנט ונסו שוב. |
| `tour.steps.overview.titleHire` / `.bodyHire` (new) | How the shop is doing / Who came back this month, and what happened this week. | מה קורה בעסק / מי חזר/ה החודש ומה קרה השבוע. |
| `tour.steps.overview.titleFree` / `.bodyFree` (new) | Not live yet / These are the steps between the card you designed and a customer holding it. | עדיין לא פעיל / אלה הצעדים בין הכרטיסייה שעיצבתם ללקוח/ה שמחזיק/ה אותה. |
| `tour.steps.overview.bodyFreeHire` (new) | The card isn't live yet. Once it is, this page shows the shop's day. | הכרטיסייה עדיין לא פעילה. אחרי שתופעל, כאן יופיע היום של העסק. |
| `tour.steps.customers.body` | (unchanged) | כל מי שהצטרף, כמה חותמות יש לכל אחד/ת ומי במרחק חותמת אחת מההטבה. |
| `tour.steps.join.body` | This goes on the counter. They scan it, confirm their mobile number with a text, and your card is in their wallet: no app, no account, no password. | זה מה שעומד על הדלפק. סורקים, מאשרים את מספר הנייד בקוד שמגיע בהודעה, והכרטיסייה נכנסת לארנק: בלי אפליקציה, בלי חשבון, בלי סיסמה. |
| `tour.steps.join.bodyFree` (new) | Once the card is live, this goes on the counter: they scan it, confirm their number with a text, and your card is in their wallet. | כשהכרטיסייה תהיה פעילה, זה מה שיעמוד על הדלפק: סורקים, מאשרים את המספר בקוד שמגיע בהודעה, והכרטיסייה נכנסת לארנק. |
| `tour.steps.design.body` | (unchanged) | צבע, חותמת והטבה משתנים כאן מתי שתרצו. כל כרטיס שכבר נמצא בארנק מתעדכן מעצמו. |
| `tour.steps.activate.body` | Designing and previewing is free. Activating costs ₪{{price}} a month and lets real customers start joining. | לעצב ולראות תצוגה מקדימה זה בחינם. ההפעלה עולה ₪{{price}} לחודש ופותחת את הכרטיסייה ללקוחות אמיתיים. |
| `tour.steps.scan.title` (new) | Scan a card | סריקת כרטיסייה |
| `tour.steps.scan.body` (new) | Hold the customer's pass up to the camera; the stamp lands the moment it reads. When a card is full, hand over the reward and mark it given. | הצמידו את הכרטיס של הלקוח/ה למצלמה, והחותמת נרשמת ברגע שהקוד נקרא. כשכרטיסייה מלאה, נותנים את ההטבה ומסמנים שניתנה. |
| `tour.steps.scan.bodyFree` (new) | Once the card is live, this is where you stamp cards. | אחרי שהכרטיסייה תופעל, כאן מחתימים כרטיסיות. |
| `tour.steps.scan.act` | Tap it and the camera opens. | הקישו והמצלמה נפתחת. |

The Scan stop gets its own keys so that Phase 5 can rewrite the Scan page's
`dashboard.scan.*` without changing the tour by accident. Its sentence
describes the full card instead of quoting the button, whose label Phase 5 may
change ("הפרס ניתן" still says פרס).

## 11. What step B keeps, touches and checks

**Keeps** everything in §7.1. The guide adds three things: `NAV_GROUPS` as the
only source of the navigation, the account menu's link to `/admin`, and
`npm test` passing.

**Touches** these, and nothing else:
- `src/routes/dashboard/DashboardLayout.tsx`;
- `src/components/dashboard/DashboardNav.tsx`, `AccountControls.tsx` and
  `CardChip.tsx`, or their replacements beside them;
- `src/business/RequireRole.tsx`, `RequireBusiness.tsx` and
  `BusinessProvider.tsx`;
- `src/theme/useDashboardTheme.ts`;
- `src/components/tour/`;
- `src/main.tsx`, for the catch-all and the error route only;
- `index.html`: the viewport meta, and the pre-paint script only if it learns
  the moved paths;
- the two manifests' colours;
- the keys in §10, in `en` and `he`;
- DESIGN.md's Primary line (§7.12);
- new shell files beside these.

As with the pages, it builds one piece of the frame per commit.

**Doesn't touch:**
- any page's own content;
- `src/api`, `src/auth`, `src/hooks`, `src/config` and `src/lib`;
- the pass previews;
- the kit itself. If the frame needs a primitive the kit lacks, step B asks
  first.

**Checks,** in step D, through the browser:
- **Roles and plans:**
  - owner, manager and staff on Pro;
  - owner, manager and staff on Free. The seed has no hires on the Free
    business, so step D invites one through the Team page on the local
    backend. Staff on Free is the P0 case.
- **Refusals and failures:**
  - a manager typing an owner's URL, and staff typing a manager's;
  - `/dashboard/nope`;
  - a page that throws;
  - the business failing to load (the backend stopped).
- **Hand-off and tour:**
  - sign out, then sign in as someone else on the same device;
  - the tour for each role and plan;
  - `?activated=1`.
- **Rendering:**
  - Hebrew and English;
  - 375, 768, 1024 and 1280px;
  - day and night;
  - reduced motion.
- **The keyboard path:** the skip link, the bar, More's focus trap, the tour.
- **The console:** clean apart from two known lines. The two 401s at every
  cold boot come from `src/auth`'s refresh, and the stub wallet's logo host is
  the local backend's.
- **On a phone:** §5's list.

## 12. Left for other phases, and still open

**Found here, fixed elsewhere:**
- **Phase 5:**
  - the hire panel on a Free Overview carries no `overview-lead`; the tour no
    longer needs it, but a lit stop beats a centred one;
  - the Free checklist links a manager to Billing, which refuses them;
  - the Scan page says "הפרס ניתן" where the glossary says הטבה.
- **Phase 6:** the standee still says "no signup" (CLAUDE.md).
- **Phase 8:** the login page honours `from` for whoever signs in next; the
  shell's sign-out works around it.
- **Outside the redesign:**
  - `src/auth` is frozen: an interrupted boot check signs the device out, and
    every cold boot logs two 401s before the refresh.
  - Every route ships in one bundle. Lazy routes in `main.tsx` would cut the
    first load at the counter; ask before doing it.

**Open, and what this brief assumes until you say otherwise:**
- **The wordmark:** the rail keeps today's logo image until the logo is
  decided (visual-world §9), so the product never shows two logos at once.
  The rail's mark and the PWA icons change together, later.
- **The coral circle on the tablet rail** (§7.12) is a change to DESIGN.md. If
  you overturn it, the tablet's Scan becomes an ink row.
- **The unlit sign on Free** shows the owner's colours at half strength. If
  that reads as "broken" rather than "not yet", the words stay and the chip
  goes back to full strength.
- **Messages leaving the bar for More:** if owners miss it, the fifth slot
  could become Messages, with More moving into the masthead, at the cost of
  More's thumb reach.
