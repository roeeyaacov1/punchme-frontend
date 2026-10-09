# PunchMe redesign guide

How to rework the whole UX and UI with four design skills: Impeccable, UI UX
Pro Max, Taste and Emil Kowalski's skills. That covers the landing page,
onboarding, the card studio, the dashboard and the pages between them.
Written 8 Oct 2026, from each skill's own instructions and the code as it
stands.

Read §1–§4 once, then work through the phases in §5–§8 in order. Each phase
is one git branch. Each step is one fresh Claude Code session: paste the
step's prompt, read what it produces, then go to the next step. Steps hand
work to each other through files in `docs/redesign/`, not through chat
history. Replace anything in [square brackets] before you paste.

1. Are we ready?
2. The four skills
3. Decisions only you can make
4. Install
5. Phase 0: ground rules
6. Phase 1: direction and foundation
7. Phases 2–9: the page groups
8. Phase 10: cleanup
9. How to get the best results
10. When something goes wrong
11. Progress checklist
12. Sources

---

## 1. Are we ready?

Not yet. The code and the product context are in good shape, but several
things are still missing:

- the skills themselves, and Python, which one of them needs;
- `PRODUCT.md` and `DESIGN.md`;
- demo data on the local backend;
- your answers to the questions in §3.

### Ready

| What | Where |
|---|---|
| Node 24.19, npm 11.17, git, winget | Installed |
| Chrome and Edge | Installed. Impeccable's detector uses them to scan live pages |
| Product context: who buys it, the brand, roles, RTL, contrast, accessibility | `CLAUDE.md` |
| What every dashboard page must keep | `docs/dashboard-routes.md` |
| What the landing page, onboarding and card studio must keep | Written with this guide: `docs/landing-page.md`, `docs/onboarding-flow.md`, `docs/card-studio.md`. These stop a skill from breaking behaviour while it changes the look. Read them once |
| Fonts that set Hebrew | Rubik and Assistant |
| A browser preview | `.claude/launch.json` starts the frontend. On this PC the backend runs in Docker, not through launch.json |

### Missing

| What | Why it matters | What to do |
|---|---|---|
| The four skills | Nothing is installed: no plugins and no `.claude/skills` | §4. **Done 9 Oct** |
| Python 3 | UI UX Pro Max's search engine is a Python script. This PC only has the Microsoft Store shortcut | §4, step 1. **Done 9 Oct** (3.13) |
| `PRODUCT.md` and `DESIGN.md` | Impeccable reads both before any design work | Phase 0 |
| Your decisions | Eleven questions in §3 change what every session does | §3 |
| An up-to-date CLAUDE.md | It is wrong in five places, and its redesign rules forbid this work (list below) | Phase 0, prompt 0.2 |
| Demo data and test accounts | The backend has no seed command, so a local dashboard starts empty. You can't judge a customer list with no customers, or check role and plan gating without an account for each | Before Phase 2, add a `seed_demo` command to punchme-backend (below). Phase 2 is the first to sign in as each role, and Phase 5 needs the data. Until then, Emil's `break-ui` fakes data in the browser |
| Real assets | The hero's Apple and Google Wallet marks are placeholders (a TODO in `WalletMarks.tsx` says so), and the skills will ask for photos and quotes | Before Phase 9: the official wallet badges, plus any real customer quotes (with permission) and real photos |

The seed command should create enough to show every dashboard state:

- **A Pro business** with:
  - about 300 customers with Hebrew and English names: some at 0 stamps, some
    one stamp away, some with a reward waiting;
  - 60 days of activity;
  - two broadcasts and the three kinds of automation;
  - a few referrals, one of them flagged.
- **An owner, a manager and a staff member** on that business, each with a
  known development password. Keep the passwords in the seed file, so a
  Claude session can sign in as each role without you typing them in chat.
- **A free-plan business** with a card and no customers.

### Where CLAUDE.md no longer matches the code

1. **Emoji stamps** were removed on 18 Aug (`1eb2712`). A stamp is a glyph or
   a picture.
2. **`primary.text #96670d`** doesn't exist. The token is a CSS variable:
   `#8a5d0b` (oat), `#683de8` (purple), `#a78bfa` (night).
3. **"Four test files"**: there are 17.
4. **"Hand-rolled primitives in `src/components/ui`"**: those are the old
   ones. Four primitive sets are in use:
   - `components/ui`
   - `components/dashboard/primitives.tsx`
   - `components/card-studio/studio-primitives.tsx`
   - `components/onboarding`
5. **`useInView` and `useCountUp`** are listed as useful hooks. Neither is
   used, on purpose: sourced numbers don't count up.

A sixth, the price, was corrected on 9 Oct (`7f709bd`): CLAUDE.md now says
₪99, like the code.

Two of its rules also collide with this work:

- **Scope.** CLAUDE.md says landing and onboarding "have shipped". It freezes
  the whole card-studio folder, and it bans touching anything outside "the
  phase".
- **Candour.** CLAUDE.md forbids invented testimonials and unsourced metrics,
  and the landing page has both today:
  - three invented testimonials, shipped on your instruction;
    `Testimonials.tsx` warns about Israeli consumer-protection law;
  - an unsourced stats band.

  Every skill will trip over this until it is settled (§3, D2).

One bug also turned up: the onboarding billing step showed the raw key
`landing.pricing.price` instead of the price, because `35fc9a4` removed that
key. It was fixed on its own on 9 Oct (`b8bc369`).

---

## 2. The four skills

| | Impeccable | UI UX Pro Max | Taste | Emil Kowalski |
|---|---|---|---|---|
| What it is | A design workflow: one skill, about two dozen commands, a detector | A searchable design database with a Python search engine | Anti-generic rules for marketing pages | Motion and feel, from the author of Sonner and Vaul |
| Its job here | The backbone: context, briefs, critique, audit, build, harden, polish, final checks | Research: candidate directions, UX guidelines per page, chart choices | The landing page, and an audit for generic patterns | When and how things move, phone feel, worst-case data, side-by-side variants |
| Not for | Motion (Emil's skills are stronger) | Final decisions, or fonts (its pairings are Latin) | The dashboard, onboarding or the card studio: its own rules call dashboards and multi-step forms out of scope | Picking libraries |
| Install | All of it | All of it | 2 of its 13 skills | 8 of its 14 skills |

### Impeccable: the backbone

`github.com/pbakaus/impeccable`, skill version 4.5.0, Apache-2.0.

**How it works**

- You call it as `/impeccable <command>`. With no command it shows a menu.
- It keeps two files at the repo root, and every other command reads them:
  - `PRODUCT.md`, written by `init`: users, purpose, positioning,
    constraints, evidence and principles.
  - `DESIGN.md`, written by `document`: the tokens and the rules of the
    visual system.
- It works in a **mode** chosen per surface: **Persuade** for the landing
  and public pages, **Operate** for onboarding, the card studio and the
  dashboard.

**What suits PunchMe**

- "The brief wins": a palette or a font you pin in `PRODUCT.md`, `DESIGN.md`
  or the prompt is honoured. That is how to hold on to Hebrew fonts and a
  brand colour.
- It asks before replacing factual copy or adding claims, which suits a
  brand built on candour.
- `npx impeccable detect src/...` runs 59 fixed checks: generic AI patterns,
  line length, cramped padding, small touch targets, skipped headings. Its
  installer also adds a hook that runs them after edits.

**What to watch**

- Its floor bans, among others: gradient text, glass as decoration,
  coloured side borders over 1px, an eyebrow label above a heading, the
  "hero metric" template, nested cards, emoji standing in for icons, and a
  modal where none is needed.
- It says nothing about RTL. The house rules below cover that.

| Command | When |
|---|---|
| `init` | Once: writes `PRODUCT.md` |
| `document` | Writes `DESIGN.md` from the code. Run in Phase 0 and again after the foundation |
| `shape` | Plans a page or flow before any code. Asks a few questions and returns a brief |
| `critique` | UX review: hierarchy, clarity, what the user is trying to get done |
| `audit` | Technical: accessibility, responsiveness, performance |
| `onboard` | First-run flows, empty states, activation. Used in the onboarding phase |
| `harden` | Errors, i18n, text overflow, edge cases |
| `adapt` | Other screen sizes |
| `clarify` | Copy that isn't clear |
| `layout`, `typeset`, `colorize`, `bolder`, `quieter`, `distill` | Targeted fixes when one specific thing is off |
| `polish` | The last pass before shipping |
| `extract` | Pulls repeated pieces into the design system |
| `live`, `generate` | Optional: variants of one element in the browser |

### UI UX Pro Max: the research library

`github.com/nextlevelbuilder/ui-ux-pro-max-skill`, installer
`ui-ux-pro-max-cli` 2.15.0.

**What's in it.** A database searched by `scripts/search.py`:

- 192 product types and 192 palettes
- 79 styles
- 74 font pairings
- 119 UX guidelines
- 34 landing-page patterns
- 25 chart types

**How it's searched**

- `--design-system` runs five searches at once and returns a whole
  direction: pattern, style, colours, type, effects, anti-patterns and a
  checklist.
- `--domain` looks up one thing (`ux`, `color`, `typography`,
  `google-fonts`, `chart`, `landing`, …).
- `--stack react` gives advice for React. Never use `--stack shadcn` here.
- `--persist` writes `design-system/<project>/MASTER.md`. Don't use it:
  `DESIGN.md` is the single source of truth.

**What to watch**

- Treat its output as raw material. Its font pairings are mostly Latin-only,
  it says nothing about RTL, and its landing patterns lean on testimonials
  and logo walls.
- It needs Python 3. Its README says the scripts use only the standard
  library and make no network calls.
- One skills registry's scan rated it high risk while others found nothing.
  Read `scripts/search.py` before the first run.

### Taste: for the landing page only

`github.com/Leonxlnx/taste-skill`. Install two of its 13 skills.

**The two to install**

- **`design-taste-frontend`** (version 2, marked experimental). It states a
  one-line "Design Read", then builds to three dials from 1 to 10. Set them
  in words in the prompt.
  - `DESIGN_VARIANCE`: symmetric → asymmetric. Default 8.
  - `MOTION_INTENSITY`: still → cinematic. Default 6.
  - `VISUAL_DENSITY`: airy → packed. Default 4.
- **`redesign-existing-projects`**: audits first, then makes targeted fixes.
  It is told "do not rewrite from scratch", so use it to **audit** the
  landing page, not to rebuild it.

**Its scope.** Landing pages, portfolios and redesigns. It calls dashboards,
data tables and multi-step forms "out of scope", so keep it away from the
dashboard, onboarding and the card studio.

**Defaults that clash with PunchMe** (the house rules override them):

| Area | Taste's default | PunchMe |
|---|---|---|
| Fonts | Geist, Outfit, Cabinet Grotesk or Satoshi | None of these has Hebrew |
| Icons | Discourages Lucide, prefers Phosphor | lucide-react |
| Motion | Motion (`motion/react`) and GSAP | Neither is installed |
| Tailwind | v4 | 3.4 |
| Font loading | Self-hosted | Google Fonts |
| Themes | Light and dark on every page | Decided in D8 |
| Numbers and images | The redesign skill swaps round numbers for "organic" ones like 47.2% and fills gaps with picsum.photos images | Both would be fabrication on this site |

**Defaults that suit PunchMe:** no em dashes; no "elevate", "seamless" or
"unleash"; no fake-precise numbers without real data; no generic row of
three cards.

### Emil Kowalski: motion and feel

`github.com/emilkowalski/skills`. Install 8 of its 14 skills:

| Skill | When |
|---|---|
| `emil-design-eng` | The philosophy and the numbers. Ask it a question; with none it only says it's ready |
| `find-animation-opportunities` | Where motion helps, and where it must not go |
| `animate` | Builds one animation: curve, duration, properties |
| `review-animations` | A strict review of motion code. Only runs when your message starts with `/review-animations` |
| `improve-animations` | Audits all existing motion and gives a prioritised plan |
| `mobile-native` | Makes the web app feel native on a phone: safe areas, `100dvh`, tap, zoom |
| `break-ui` | Feeds a component worst-case data behind a dev-only toggle and reports what breaks. The data covers long names, non-Latin script, RTL, empty, one item and 1,000 rows |
| `prototype` | Builds 3–5 versions of one piece of UI on a temporary route with a picker. Only runs when you type `/prototype` |

Skip the other six:

- `pick-ui-library`, because it would add dependencies;
- `ask-sonner`, `apple-design` and `animation-vocabulary`;
- `write-swift` and `animate-expo`, which are for Swift and React Native.

**Its rules worth knowing**

- **Animate by frequency.** Anything used 100+ times a day doesn't animate.
  Anything used tens of times barely does. Keyboard actions never do. That
  describes the Scan screen.
- **Timing.** UI motion stays under 300 ms, and entering uses ease-out.
- **Scale.** Nothing grows from `scale(0)`: start at 0.95 and transparent. A
  pressed button goes to `scale(0.97)`.
- **Properties.** Animate only `transform` and `opacity`.
- **Hover.** Hover effects only on devices that hover:
  `@media (hover: hover) and (pointer: fine)`.
- **Reduced motion** means fewer and gentler animations, not none.

**What to watch.** Its examples assume Motion and Base UI, and it never
mentions RTL. Here, use CSS first, and mirror every horizontal movement in
Hebrew.

### Also useful, and already available

- **dataviz**, a skill this Claude already has, for the Overview and
  Activity charts.
- Anthropic's **frontend-design** skill isn't needed. Impeccable grew out of
  it.

### When they disagree

They will. Taste wants Phosphor icons, Impeccable bans eyebrow labels, and UI
UX Pro Max suggests fonts with no Hebrew. Settle it once in CLAUDE.md, in
this order of authority:

1. `CLAUDE.md`
2. The contracts: `docs/dashboard-routes.md`, `docs/landing-page.md`,
   `docs/onboarding-flow.md`, `docs/card-studio.md`
3. `PRODUCT.md` and `DESIGN.md`
4. The skill the prompt names
5. Any other skill

Prompt 0.2 adds this section to CLAUDE.md, adjusted to your answers in §3:

```markdown
## Design skills

Impeccable, UI UX Pro Max, Taste (design-taste-frontend and
redesign-existing-projects) and eight of Emil Kowalski's skills are installed
in `.claude/skills`. They advise. When one disagrees, this file wins, then the
contracts in `docs/`, then PRODUCT.md and DESIGN.md, then the skill the prompt
names.

Their defaults that do not apply here:
- Every face sets Hebrew, and fonts load from Google Fonts in `index.html`.
  No Geist, Satoshi, Outfit or Cabinet Grotesk.
- Icons are lucide-react.
- Tailwind 3.4 and hand-rolled components: no shadcn, Radix, Base UI, Motion
  or GSAP, and no new dependency without asking.
- No invented numbers, quotes, logos, names or "realistic" figures, and no
  placeholder photos. Every number on the landing page has a source in
  `sources.ts`.
- Horizontal motion mirrors in Hebrew. Reduced motion is gentler, not none.
- The wallet pass previews are never redrawn.
```

---

## 3. Decisions only you can make

Answered on 9 Oct 2026. Prompt 0.2 reads this table.

| # | Question | Why it matters | Recommendation | Your answer |
|---|---|---|---|---|
| D1 | May the redesign change the card studio's editor, with only the pass previews frozen? | CLAUDE.md freezes the whole folder, but the code itself draws the line at the card (`docs/card-studio.md`) | Yes. Freeze the files in the first table of `docs/card-studio.md` and open the rest | **Yes.** The editor is open; the pass previews stay frozen |
| D2 | What happens to the invented testimonials, the unsourced stats band, "Most popular" and "already earning more"? | CLAUDE.md forbids them, the code warns about legal exposure, and every skill will either remove them or argue | Replace them with real quotes when you have some; until then, remove them. The sourced proof band and the calculator carry the argument. Either way, write the answer into CLAUDE.md | **Remove them** until there are real ones, used with permission. Done as its own small fix right after Phase 0, outside the phases |
| D3 | Is the price ₪99? | CLAUDE.md says ₪59 and the code says ₪99 | Correct CLAUDE.md to the real price | **₪99** a month |
| D4 | Is violet the brand colour? | Violet runs through the landing page, onboarding, sign-in, the public pages and the dashboard. All four skills treat purple-blue gradients as the most common sign of AI-made design | Let Phase 1 propose. Keep today's violet as one of its three candidates, and decide when you see the prototypes | **Phase 1 proposes**, with violet as one of the three candidates |
| D5 | May the fonts change? | Rubik and Assistant set Hebrew; most fonts the skills suggest don't | Yes, as long as every face has Hebrew. IBM Plex Mono, which has no Hebrew, stays for digits and pass labels only | **Yes**, any face that has Hebrew |
| D6 | May the redesign add a motion library? | Emil's and Taste's examples assume Motion; today everything is CSS | No by default. Allow `motion` for one specific gesture, such as a drag-to-dismiss sheet, when a phase asks for it | **CSS first.** A phase may ask to add `motion` for one gesture |
| D7 | Which icons? | Taste discourages Lucide | Keep lucide-react | **lucide-react** |
| D8 | Where is there a dark theme? | The dashboard has a night theme today; Taste wants both themes everywhere | Night for the dashboard, including the card studio. Light for the landing page, onboarding and public pages | **The dashboard only**, card studio included |
| D9 | In what order? | Each phase builds on the ones before it | The order in §7. If marketing can't wait, move the landing page to right after Phase 1 | **The order in §7**: product first, landing page last |
| D10 | Where do the skills live? | A global install drifts from machine to machine | In the project (`.claude/skills`), committed, so every session and every machine uses the same versions | **In the project**, committed |
| D11 | Which language does a first visit open in? | The site opens in English whatever the browser's language, and Hebrew is likely the main market | Follow the browser's language, with Hebrew as the fallback | **The browser's language**, with Hebrew as the fallback. Done as its own small fix right after Phase 0, outside the phases |

---

## 4. Install

Run these in a terminal at the repo root: the desktop app's Terminal panel,
or PowerShell. Start a branch first:

```
git switch -c redesign/setup
```

1. **Python 3**, for UI UX Pro Max:

   ```
   winget install -e --id Python.Python.3.13
   ```

   - Open a new terminal and check that `py -3 --version` works.
   - If `python` still opens the Microsoft Store, go to Settings → Apps →
     Advanced app settings → App execution aliases and turn off the two
     Python entries.
   - Smart App Control blocked the backend's uv-managed Python. The
     python.org build is signed, so it should be allowed. If it isn't, skip
     Python and ask Claude to read the skill's data files in
     `.claude/skills/ui-ux-pro-max/data` directly.

2. **Impeccable**, the skill plus its hook:

   ```
   npx impeccable install --providers=claude --scope=project
   ```

   Besides the skill, it adds:
   - four helper agents, in `.claude/agents`;
   - its engine, `impeccable.exe` (19 MB, git-ignored);
   - a hook in `.claude/settings.local.json`.

   The hook runs in every Claude session in this folder. It checks each UI
   file Claude edits, and runs a deeper pass (up to 30 seconds) when Claude
   finishes a turn.

3. **UI UX Pro Max**:

   ```
   npx ui-ux-pro-max-cli init --ai claude
   ```

   It also installs six more skills: `banner-design`, `brand`, `design`,
   `design-system`, `slides` and `ui-styling`. Delete those six folders from
   `.claude/skills`. `ui-styling` builds with shadcn and Radix, and
   `design-system` keeps tokens of its own; the other four have no part in
   this work.

4. **Taste**, two of its skills:

   ```
   npx skills add https://github.com/Leonxlnx/taste-skill
   ```

   When it asks, choose:
   - skills: `design-taste-frontend` and `redesign-existing-projects`;
   - agent: **Claude Code**;
   - scope: **Project**;
   - method: **Copy**. Symlinks on Windows can need Developer Mode or admin
     rights.

5. **Emil Kowalski**, eight of his skills:

   ```
   npx skills@latest add emilkowalski/skills
   ```

   Choose these eight: `emil-design-eng`, `find-animation-opportunities`,
   `animate`, `review-animations`, `improve-animations`, `mobile-native`,
   `break-ui` and `prototype`. Then **Claude Code**, **Project**, **Copy**.

6. **Check.** Skills load when a session starts, so start a new Claude Code
   session and ask "Which skills do you have?". You should see:
   - `impeccable` and `ui-ux-pro-max`;
   - `design-taste-frontend` and `redesign-existing-projects`;
   - six of the Emil skills.

   `prototype` and `review-animations` won't be in the list, by design: they
   only run when your message starts with `/prototype` or
   `/review-animations`. Checked on 9 Oct: all ten listed, both hidden ones
   in `.claude/skills`.

7. **Commit** `.claude/skills/`, `.claude/agents/` and `skills-lock.json` as
   their own commit ("tooling: the design skills, pinned in the repo").

Done on 9 Oct. The skills are in the repo, so on another machine only step 2
is needed: it fetches Impeccable's engine and installs the hook, which git
doesn't carry.

To update later, run `npx impeccable update`, `npx ui-ux-pro-max-cli update`
and `npx skills update`. Delete the six extra skills again after the UI UX
Pro Max update, then commit what changed.

---

## 5. Phase 0: ground rules

Branch: `redesign/setup`, the same branch as §4.

### 0.1 Mark the starting point

```
git tag redesign-start
```

Any page can then be compared with, or restored to, how it was.

### 0.2 Bring CLAUDE.md up to date

```text
Phase 0, step 0.2: update CLAUDE.md for the redesign. Branch: redesign/setup.

Read docs/redesign/guide.md §1, §2 and §3. My answers are in §3's last column.
Then edit CLAUDE.md:

1. Fix the five facts listed under "Where CLAUDE.md no longer matches the code"
   in guide §1. Check each against the code first.
2. Rewrite "Redesign rules" for a whole-app rework:
   - the phases and their order from guide §7;
   - the contract for each: docs/dashboard-routes.md, docs/landing-page.md,
     docs/onboarding-flow.md, docs/card-studio.md;
   - routes and API calls stay, and a phase changes only its own pages;
   - the card-studio rule narrowed per my answer to D1;
   - the "Never modify" list kept for src/api, src/auth, src/hooks,
     src/config and src/lib.
3. Add the "Design skills" section drafted in guide §2, adjusted to my
   answers to D4–D8 and D11.
4. Write my answer to D2 into "The brand is candour", so the rule and the
   landing page stop contradicting each other.

Keep CLAUDE.md's voice: plain sentences, and no new section longer than
"Roles". Show me the diff before committing.
```

### 0.3 PRODUCT.md

```text
/impeccable init

Before you ask me anything, read CLAUDE.md ("What this is", "Roles", "Hebrew
and RTL", "Color and contrast", "Accessibility") and docs/landing-page.md
("The rules that make it this page" and "The evidence"). Most of your
questions are answered there; only ask about real gaps.

Record these in PRODUCT.md:
- Platform: web. Owners mostly use a phone. The dashboard installs as a PWA
  and is used one-handed at the counter. Setup happens on a phone or a
  laptop. Customers only meet the wallet pass and the public pages (/join,
  /c/:serial).
- Hebrew first, right to left, with English. Every string goes through t().
- Evidence on hand: the three sourced figures in
  src/components/marketing/sources.ts and the calculator in calculator.ts.
  Nothing else counts as evidence.
- Brand commitments: candour, as CLAUDE.md describes it. [Add your answers to
  D2, D4 and D5 if you pinned anything.]
- The wallet pass previews are a spec match for Apple and Google Wallet and
  are never redrawn.

Write PRODUCT.md at the repo root.
```

### 0.4 DESIGN.md, as things are today

```text
/impeccable document

Scan mode. Record the design system as it is today:
- tailwind.config.js;
- src/index.css: the oat :root values and the theme-purple, theme-raised,
  theme-night and theme-lit scopes;
- the four primitive sets: src/components/ui,
  src/components/dashboard/primitives.tsx,
  src/components/card-studio/studio-primitives.tsx and
  src/components/onboarding.

Keep the contrast ratios from the comments. Say at the top that this is the
system before the redesign and that Phase 1 replaces it.
```

Read `PRODUCT.md` and `DESIGN.md` closely, because they steer everything
after this. Then merge `redesign/setup` into `main`.

---

## 6. Phase 1: direction and foundation

Branch: `redesign/foundation`. This one phase decides how everything looks.

**How the foundation stays safe.** The new look arrives in two parts:

- **A new theme scope.** It works the way `.theme-purple` arrived on 18 Aug:
  the same token names with new values, plus a night variant.
- **A new set of primitives.**

A page only changes when its own phase puts it on. That way each later phase
can be reverted on its own, and pages still waiting don't change in the
meantime. Phase 10 makes the new scope the default and deletes the old ones.

### 1.1 Research

```text
Phase 1, step 1.1: research. Use the ui-ux-pro-max skill. Don't change any
code.

Read PRODUCT.md and CLAUDE.md first. The stack is React 18 with Tailwind 3.4
and hand-rolled components, so use --stack react, never shadcn.
[If you pinned a brand colour in D4: Build every direction around <colour>.]

1. Run the design-system generator three times, with -p "PunchMe" -f
   markdown, from three angles:
     "loyalty punch card small local business barber cafe trainer trust"
     "warm neighbourhood shop friendly honest"
     "calm premium tool for owners minimal confident"
2. Typography: keep only pairings where every face has Hebrew on Google Fonts
   (check with --domain google-fonts). Rubik, Assistant, Heebo, Noto Sans
   Hebrew, IBM Plex Sans Hebrew, Frank Ruhl Libre, Secular One and Varela
   Round are examples that do. Replace any Latin-only face.
3. Colour: for every palette, compute the contrast of its text colours on
   white and on its surface colour with a small node script. Mark anything
   under 4.5:1 for text.
4. UX guidelines: run --domain ux for "mobile dashboard one hand",
   "multi-step onboarding", "data table filters" and "empty states", and
   --domain landing for a page that has to earn trust with sourced evidence.

Write it all to docs/redesign/research.md:
- three candidate directions, each with a palette (hex values and ratios), a
  Hebrew-capable type pairing, a style, a motion character and
  anti-patterns;
- the UX guidelines worth applying, each tagged with the pages it applies
  to.

Don't use --persist. Flag anything that conflicts with CLAUDE.md.
```

### 1.2 The visual world

Before this step, collect three to five products or sites whose feel you
like, as links or screenshots. They are the most useful input you can give.

```text
Phase 1, step 1.2: the visual world. Don't change any code.

/impeccable shape the visual world for all of PunchMe: one family with two
registers. Persuade for the landing page and the public pages; Operate for
onboarding, the card studio and the dashboard.

Inputs:
- PRODUCT.md and CLAUDE.md, including its "Design skills" section;
- docs/redesign/research.md;
- my decisions in docs/redesign/guide.md §3;
- my notes: [3–5 lines on what you like and dislike, and links or
  screenshots of products you want it to feel like].

The wallet pass is the hero object everywhere, and it is never redrawn. The
world has to make it look at home.

Give me three distinct directions. For each, say:
- the palette, type, shapes, density and motion character, for light and
  night;
- what it does to the Scan screen at 375px.

Save the brief to docs/redesign/briefs/visual-world.md and stop.
```

### 1.3 See them before choosing

```text
/prototype the three directions in docs/redesign/briefs/visual-world.md, as
one specimen screen each.

The specimen holds:
- a dashboard header and one customer row;
- a primary and a secondary button;
- an input showing an error;
- the wallet card, staged: the existing AppleCardPreview from
  src/components/card-studio, unchanged, in its 300px slot;
- one landing-page headline block.

Each version must switch between Hebrew (dir="rtl") and English, and between
light and night, and must read well at 375px and at 1280px. Use existing
dependencies only, and Google Fonts that have Hebrew.
```

Look at every version on a real phone if you can. Then tell the session:

> Direction [B] wins. Don't promote anything into the app. Record the choice,
> and what I liked about the others, in
> docs/redesign/briefs/visual-world.md, then delete the prototype route.

### 1.4 Build the foundation

```text
Phase 1, step 1.4: the foundation. Branch: redesign/foundation.

Turn the chosen direction in docs/redesign/briefs/visual-world.md into the
design foundation. Don't restyle any page yet.

1. Theme: add the new values as a new theme scope in src/index.css (the way
   .theme-purple was added in 35fc9a4), with a night variant. Add any tokens
   it needs to tailwind.config.js.
   - Measure every text colour against every ground it can sit on, and write
     the ratio in a comment, the way the file already does.
   - Add type-scale, radius, shadow and motion tokens. For easing use:
     - ease-out: cubic-bezier(0.23, 1, 0.32, 1)
     - ease-in-out: cubic-bezier(0.77, 0, 0.175, 1)
     - drawer: cubic-bezier(0.32, 0.72, 0, 1)
2. Fonts: load them from Google Fonts in index.html, every face with Hebrew.
   Keep Roboto, which the Google Wallet preview needs.
3. Primitives: build one new set in a new folder, such as
   src/components/kit/. It needs: button, link button, input, textarea,
   select, switch, checkbox, radio group, segmented control, slider, panel,
   badge, tabs, dialog and sheet, toast, empty state, skeleton, list row and
   figure.
   - Hand-rolled, with logical properties only.
   - focusRing on every control, and 44px targets.
   - Reduced motion through usePrefersReducedMotion.
   - Every string through t().
4. Rebuild /style-guide so it shows every token and primitive in Hebrew and
   English, in light and night.
5. Run /impeccable document to replace DESIGN.md with the new system. When it
   asks, choose overwrite.
6. Run /impeccable audit on /style-guide. Then verify per CLAUDE.md and
   commit.
```

### 1.5 Check and merge

Run template D from §7 on `/style-guide`, then merge `redesign/foundation`.

---

## 7. Phases 2–9: the page groups

| Phase | Branch | Pages | Contract | Mode | Needs the backend |
|---|---|---|---|---|---|
| 2 | `redesign/dashboard-shell` | The frame around every dashboard page: layout, navigation, the phone bar, the "not for your role" panel, the account menu, the night theme, the tour | `docs/dashboard-routes.md` | Operate | Yes |
| 3 | `redesign/card-studio` | The editor on `/dashboard/design`; `/admin/catalog/:id` uses the same component | `docs/card-studio.md` | Operate | Yes |
| 4 | `redesign/onboarding` | `/onboarding/*` | `docs/onboarding-flow.md` | Operate | For account, wallet and billing |
| 5 | `redesign/dashboard-counter` | Overview, Scan, Customers, Activity | `docs/dashboard-routes.md` | Operate | Yes, plus demo data |
| 6 | `redesign/dashboard-manager` | Standee, Messages (with New broadcast and the automation editor), Referrals | `docs/dashboard-routes.md` | Operate | Yes, plus demo data |
| 7 | `redesign/dashboard-owner` | Team, Billing, `/billing/success`, `/billing/cancel` | `docs/dashboard-routes.md` | Operate | Yes |
| 8 | `redesign/public` | `/login`, `/invite/:token`, `/join/:templateId`, `/c/:serial`, `/p/:token` | Written in step 8A | Persuade, and Operate for sign-in | Partly |
| 9 | `redesign/landing` | `/` | `docs/landing-page.md` | Persuade | No |

**Why this order**

1. **The shell comes first** because it decides how much room every page
   gets, the card studio included.
2. **The card studio comes before onboarding.** Onboarding's design steps
   are second copies of the studio's controls, so the shared controls get
   decided once.
3. **The counter pages come before the manager and owner pages,** because
   they are used most.
4. **The public pages come before the landing page,** because a customer
   meets `/join` right after scanning a QR code.
5. **The landing page comes last,** so it can show the real, finished
   product and pass instead of drawings.

### The loop: four steps per phase

| Step | What happens | Skills | Output |
|---|---|---|---|
| **A. Diagnose and brief** | See the pages as they are, find what breaks, plan the new version | Impeccable `critique`, `audit`, `shape`; Emil `break-ui`; UI UX Pro Max lookups | `docs/redesign/briefs/<phase>.md` |
| **B. Build** | Build the brief on the new foundation, one page per commit | Impeccable, inside DESIGN.md (Taste on the landing page only) | Commits |
| **C. Motion and feel** | Only the motion that earns its place | Emil `find-animation-opportunities`, `animate`, `mobile-native`, `review-animations` | Commits |
| **D. Harden, polish, verify** | Edge cases, copy, the detector, CLAUDE.md's checklist, screenshots | Impeccable `harden`, `adapt`, `clarify`, `polish`, `detect` | Commits, then review and merge |

Read every brief before you start step B. Ten minutes on the brief saves
hours of rework.

### Template B: build

Use this for any phase that doesn't have its own step B below.

```text
Phase [N], [name], step B: build. Branch: redesign/[branch].

Build docs/redesign/briefs/[brief].md with the new system in DESIGN.md. Use
the new theme scope and the new primitives only; no old primitives in new
code.

Keep everything [contract doc] lists for these pages: routes, API calls, role
gating and plan gating. [Add the "Step B also keeps" notes from this phase.]

CLAUDE.md wins over any skill. Every string goes through t(), in en and he
together. Logical properties only. No new dependencies.

Build one page at a time. After each page, check it in the preview in Hebrew
and English at 375px and 1280px, fix what's off, and commit it on its own,
in the style of git log.
```

### Template C: motion and feel

```text
Phase [N], [name], step C: motion and feel.

1. /find-animation-opportunities on [the files of this phase]. Apply the
   frequency rule strictly: [what is used dozens of times a day] gets almost
   no motion; [the rare moments, such as a first card or a reward] can get
   more. Stop and show me the list.
2. Build the ones I pick with /animate:
   - CSS transitions and keyframes only, unless CLAUDE.md allows a library;
   - the motion tokens in tailwind.config.js;
   - transform and opacity only, and under 300 ms for UI;
   - every horizontal movement mirrored in Hebrew;
   - under reduced motion, fewer and gentler animations (motion-reduce: or
     usePrefersReducedMotion), not just switched off.
3. /mobile-native on the phone layouts: safe areas, 100dvh, tap highlight,
   hover only on hover-capable pointers, and inputs that don't zoom the page.

Commit.
```

Then send the review as a message of its own. `review-animations` only runs
when a message starts with it, so it can't sit inside the prompt above:

```text
/review-animations the motion changes on this branch since step B
```

Then ask the session to fix what it flagged, and commit.

### Template D: harden, polish, verify

```text
Phase [N], [name], step D: harden, polish, verify.

1. /impeccable harden. Cover:
   - Hebrew and English strings of very different lengths;
   - Hebrew plurals (_two, _many);
   - numbers, phone numbers and emails isolated with dir="ltr";
   - loading, empty, error and offline states;
   - long names, and exactly one item versus many.
2. /impeccable adapt for 375px. Then /impeccable clarify on the copy: change
   copy only through t(), in en and he together. Then /impeccable polish.
3. Run npx impeccable detect on [this phase's folders]. Fix what it reports,
   or tell me why not.
4. Verify per CLAUDE.md:
   - npm run build, npm run lint and npm test;
   - the preview in Hebrew and English, at 375px and 1280px;
   - a clean console;
   - the keyboard path;
   - reduced motion;
   - [this phase's role and plan checks].
5. Show me a screenshot of each page in both languages at both widths, then
   commit. Don't merge; I'll review.
```

### Phase 2: dashboard shell

```text
Phase 2, dashboard shell, step A: diagnose and brief. Don't change any code.

Read first: CLAUDE.md (especially "Roles"), PRODUCT.md, DESIGN.md,
docs/dashboard-routes.md and docs/redesign/briefs/visual-world.md.

The shell is everything around the pages:
- src/routes/dashboard/DashboardLayout.tsx;
- src/components/dashboard/DashboardNav.tsx (NAV_GROUPS, and the phone bar
  with the raised scan button);
- the "not for your role" panel in src/business/RequireRole.tsx;
- the account menu;
- the night theme (src/theme/useDashboardTheme.ts);
- the tour (src/components/tour).

Look at it signed in as owner, manager and staff, on a Pro and a free
business. Hebrew first, 375px first.

1. /impeccable critique and /impeccable audit of the shell. How does a staff
   member at the counter get to Scan? How does an owner find Billing? What
   does each role see?
2. /mobile-native review of the phone shell. It is installed as a PWA and
   used one-handed.
3. /impeccable shape the new shell (mode: Operate).
   Fixed:
   - every route in docs/dashboard-routes.md;
   - the navigation built from visibleGroups(role), with each item's min
     role;
   - RequireRole saying no out loud instead of redirecting;
   - the skip link;
   - the tour's data-tour anchors, or a plan to update
     src/components/tour/steps.ts and its test along with them.
   Open: the navigation pattern, grouping, header, business chip and theme
   switch.

Save the brief to docs/redesign/briefs/dashboard-shell.md and stop for my
review.
```

- **Step B also keeps:** `NAV_GROUPS` as the only source of the navigation;
  the account menu's link to `/admin` for PunchMe staff; and
  `npm test` (the tour tests) passing.
- **Step C:** the phone bar and the scan button are used constantly, so keep
  their motion minimal. The tour is a rare moment.
- **Step D roles:** owner, manager, staff; Pro and free; a manager typing an
  owner-only URL.

### Phase 3: card studio

```text
Phase 3, card studio, step A: diagnose and brief. Don't change any code.

Read first: CLAUDE.md, PRODUCT.md, DESIGN.md, docs/card-studio.md,
docs/dashboard-routes.md (/dashboard/design),
docs/redesign/briefs/visual-world.md and dashboard-shell.md.

The card studio is the editor on /dashboard/design, for managers and up. The
same CardStudio component also serves /admin/catalog/:id. Sign in as a
manager and look at it in the preview. Hebrew first, 375px first.

1. /impeccable critique: can a barber on a phone change the reward, the
   colours and the stamp in under a minute without reading anything?
2. /impeccable audit of the same.
3. /break-ui on CardStudio: 12 stamps, a 200-character reward, a long Hebrew
   card name, a picture stamp, 10 pass fields, and an upload that fails.
4. /impeccable shape the new studio (mode: Operate).
   - The pass itself is frozen. AppleCardPreview, GoogleCardPreview,
     StampGrid and PassBarcode render in their 300px slot exactly as now.
   - Everything around them is open: how the controls are grouped and
     ordered, where the live preview sits on a phone and on a desktop, how
     saving and uploads work, how lint messages read.
   - Answer in the brief: should onboarding's design steps and the studio
     share one set of controls? Today there are two copies; see the table in
     docs/card-studio.md.
   - Treat the problems listed at the end of docs/card-studio.md as
     requirements.

Save the brief to docs/redesign/briefs/card-studio.md and stop for my review.
```

```text
Phase 3, card studio, step B: build. Branch: redesign/card-studio.

Build docs/redesign/briefs/card-studio.md with the new system in DESIGN.md.

What you may change:
- only the editor files marked open in docs/card-studio.md, plus
  src/routes/dashboard/DesignPage.tsx;
- never AppleCardPreview, GoogleCardPreview, StampGrid or PassBarcode, and
  nothing in src/lib or src/api.

What to keep:
- every call /dashboard/design makes (docs/dashboard-routes.md);
- the 400 ms lint preview;
- uploads saving straight away, unless the brief changed that and I agreed;
- the renderer limits in docs/card-studio.md;
- data-tour="design-studio".

/admin/catalog/:id uses the same CardStudio, so check it still works after
each change. If the brief chose shared controls, build them so onboarding
can use them later, but don't touch onboarding now.

Check in the preview as a manager, in Hebrew and English at 375px and
1280px, as you go. Commit in scoped steps.
```

- **Step C:** the moments worth motion are a stamp landing on the preview
  and a saved change. Colour picking and typing get none.
- **Step D roles:** manager and owner; staff gets the "not for your role"
  panel; `/admin/catalog/:id` as PunchMe staff.

### Phase 4: onboarding

```text
Phase 4, onboarding, step A: diagnose and brief. Don't change any code.

Read first: CLAUDE.md, PRODUCT.md, DESIGN.md, docs/onboarding-flow.md,
docs/card-studio.md, docs/redesign/briefs/visual-world.md and card-studio.md.

Walk the whole wizard in the preview the way a new owner would:
- Signed out, in Hebrew, on a 375px phone: /onboarding/business through
  /onboarding/reward.
- Then create a test account on the local backend and go on through account,
  wallet and billing.
- Then once more in English at 1280px.

1. /impeccable onboard and /impeccable critique of the flow:
   - the time to a finished card;
   - decisions that could be defaults;
   - where an owner hesitates;
   - what the phone preview does for them.
2. /impeccable audit of the steps. Known gaps are listed in
   docs/onboarding-flow.md.
3. /break-ui on the steps: a 60-character Hebrew business name, an English
   name inside the Hebrew UI, a 200-character reward, 2 and 12 stamps, a
   lost picture, and full storage.
4. /impeccable shape the new onboarding (mode: Operate; it is also where an
   owner decides whether PunchMe is worth it).
   - Fixed: the eight routes, design first and account last, the draft and
     its localStorage keys, commit.ts and its calls, the gate, and the four
     points where the draft is cleared.
   - Open: what each screen shows, how the preview is staged, the progress
     indicator, the copy.
   - If the brief wants more or fewer screens than routes, put it as an open
     question for me. Routes stay unless I agree.
   - If the card-studio brief chose shared controls, use them here.

Save the brief to docs/redesign/briefs/onboarding.md and stop for my review.
```

```text
Phase 4, onboarding, step B: build. Branch: redesign/onboarding.

Build docs/redesign/briefs/onboarding.md with the new system in DESIGN.md.

Don't change:
- draft.ts's model, commit.ts, DraftContext or the localStorage keys.
  npm test (draft.test.ts) must pass with no changes to the test.

Keep:
- the eight routes, the forward guard and OnboardingGate's behaviour;
- the four points where the draft is cleared;
- every call in docs/onboarding-flow.md.

Watch for:
- StepShell, TopBar, AuthFields, AuthAlternatives and useEmailPasswordAuth
  are also used by /login and /invite/:token. After changing any of them,
  check both pages still work.
- The phone preview must not change height while the reward slider is being
  dragged.
- Fix the billing step's missing landing.pricing.price key if it is still
  broken.

Check every step in Hebrew and English at 375px and 1280px, signed out and
signed in. Commit per step.
```

- **Step C:** onboarding happens once per owner, so it can carry more
  motion than the dashboard: the stamp landing on the preview, the finished
  card. Still under 300 ms for controls.
- **Step D checks:**
  - signed out; signed in with no business; signed in with a business and a
    draft;
  - Back-and-change after sign-up, which must PATCH, not create;
  - "Replace" and "Keep" on an account that already has a card.

### Phase 5: the counter pages

```text
Phase 5, the counter pages, step A: diagnose and brief. Don't change any code.

Pages: /dashboard (Overview), /dashboard/scan, /dashboard/customers and
/dashboard/activity.

Read first: CLAUDE.md, PRODUCT.md, DESIGN.md, docs/dashboard-routes.md (the
calls for these four), docs/redesign/briefs/visual-world.md and
dashboard-shell.md.

Look at each page as staff and as owner, on a Pro and a free business,
Hebrew first at 375px. These are the daily pages: Scan is used dozens of
times a day at a counter.

1. /impeccable critique and /impeccable audit of all four.
2. /break-ui on the customer list and the activity feed: 0, 1 and 5,000
   customers; long Hebrew and English names; a customer at 11 of 12 stamps; a
   reward waiting; 60 days of activity.
3. Look things up in the ui-ux-pro-max database:
   - --domain ux "data table search filter mobile";
   - --domain ux "scan feedback success error";
   - --domain chart "visits over time".
   Use the dataviz skill's rules for the activity chart.
4. /impeccable shape the four pages (mode: Operate).
   Fixed: every call in docs/dashboard-routes.md, including:
   - the 60-day activity paging and the 3 s pass polling;
   - the scan refusals (404 unknown card, 429 too soon, 409 full or void);
   - search, filters and the CSV export running in the browser;
   - Pro-only reads not running on free;
   - the stamp buttons only when VITE_STAMP_ADJUST_ENABLED is true;
   - ?activated=1 after checkout.
   Everything else is open.

Save the brief to docs/redesign/briefs/dashboard-counter.md and stop for my
review.
```

- **Step B also keeps:** `activityFilters.ts` and `overviewBrief.ts` with
  their tests passing. If they are replaced, the replacements need tests of
  their own.
- **Step C:** Scan gets almost no motion. The point is to make the result
  impossible to miss: success, already scanned, full card, unknown card.
- **Step D roles:** staff, manager, owner; Pro and free; an empty business.

### Phase 6: the manager pages

```text
Phase 6, the manager pages, step A: diagnose and brief. Don't change any code.

Pages:
- /dashboard/standee;
- /dashboard/messages and /dashboard/messages/new;
- /dashboard/messages/automations/new and
  /dashboard/messages/automations/:automationId;
- /dashboard/referrals.

Read first: CLAUDE.md, PRODUCT.md, DESIGN.md, docs/dashboard-routes.md (these
pages' calls), docs/redesign/briefs/visual-world.md and dashboard-shell.md.

Look at them as a manager, on a Pro and a free business, Hebrew first at
375px.

1. /impeccable critique and /impeccable audit of each. For messages: can an
   owner send a win-back message in under a minute, and understand who will
   get it and when?
2. /break-ui on the broadcast list, the automation editor and the referrals
   list.
3. /impeccable shape the pages (mode: Operate).
   Fixed: every call in docs/dashboard-routes.md for these routes, including:
   - the 350 ms audience count;
   - the 3 s polling while a broadcast sends;
   - 429 messaging_quota with next_allowed_at;
   - 403 upgrade_required when a rule is switched on without Pro;
   - printing the standee through the browser's print dialog, Pro only.
   The five wrappers no page calls yet (last section of
   docs/dashboard-routes.md) may be used if the brief makes the case; list
   them as open questions for me.

Save the brief to docs/redesign/briefs/dashboard-manager.md and stop for my
review.
```

- **Step B also keeps:**
  - The standee print styles in `src/index.css`
    (`html.standee-print-mode`). Check them in print preview.
  - The card's language (`useCardLanguage`) driving how messages read.
- **Step D roles:** manager and owner; staff gets the "not for your role"
  panel; Pro and free.

### Phase 7: the owner pages

```text
Phase 7, the owner pages, step A: diagnose and brief. Don't change any code.

Pages: /dashboard/team, /dashboard/billing, /billing/success and
/billing/cancel.

Read first: CLAUDE.md ("Roles"), PRODUCT.md, DESIGN.md,
docs/dashboard-routes.md and docs/redesign/briefs/dashboard-shell.md.

Look at them as the owner, on a free and a Pro business. Check that a manager
and a staff member get the "not for your role" panel.

1. /impeccable critique and /impeccable audit:
   - Team: does an owner understand that an invitation is a link they send
     themselves? There is no email.
   - Billing: is it plain what is free, what costs ₪99, and how to stop?
2. /impeccable shape them (mode: Operate).
   Fixed:
   - the calls in docs/dashboard-routes.md;
   - the copy-a-link invitation;
   - the checkout and portal redirects;
   - /billing/success polling every 2 s for up to 30 s.

Save the brief to docs/redesign/briefs/dashboard-owner.md and stop for my
review.
```

- **Step B also keeps:** `BillingSettingsPage` reads
  `landing.pricing.pro.price` and `.per`. Keep those keys, or move them in
  both languages.
- **Step D roles:** the owner only; manager and staff are refused out loud.

### Phase 8: public pages and sign-in

```text
Phase 8, public pages and sign-in, step A: contract, diagnose and brief. Don't
change any code.

These pages have no contract yet, so write one first: docs/public-pages.md,
in the style of docs/dashboard-routes.md.
- Pages: /login, /invite/:token, /join/:templateId, /c/:serial and /p/:token,
  including the referral join and the team's stamp screen.
- For each: who can open it, what it shows, every API call on load and on
  action with its src/api wrapper, and what must survive.
- Trace from src/main.tsx through the imports; don't work from memory.

Then:
1. /impeccable critique and /impeccable audit of each page, Hebrew first at
   375px. A customer meets /join seconds after scanning a QR code at a
   counter, so give that page the most weight.
2. /impeccable shape them.
   - Mode: Persuade for /join and /c/:serial; Operate for /login, /invite and
     the team's stamp screen.
   - PassStage stages the pass, and the pass is never redrawn.

Save the brief to docs/redesign/briefs/public.md and stop for my review.
```

- **Step B also keeps:** `/login` and `/invite/:token` share the sign-in
  parts with onboarding. The team's `/p/:token` stamp screen calls
  `POST /api/scan` and the redeem call, so test it as staff.
- **Step D checks:** a customer on a phone with no account; a team member
  signed in; an invitation link opened while signed out.

### Phase 9: the landing page

This is the one phase where Taste leads. Its dials start at a calm,
trust-first setting. Change them if the brief argues for it.

```text
Phase 9, the landing page, step A: diagnose and brief. Don't change any code.

Read first: CLAUDE.md, PRODUCT.md, DESIGN.md, docs/landing-page.md,
docs/redesign/briefs/visual-world.md, and my answer to D2 in
docs/redesign/guide.md §3.

1. Use the redesign-existing-projects skill as an auditor only. Scan / and
   list every generic pattern and weak point, in Hebrew and English, at
   375px and 1280px. Don't fix anything.
2. /improve-animations on the landing page's motion (the hero sequence, the
   reveals, the carousel). Plan only.
3. /impeccable critique (mode: Persuade). Does the page make the argument a
   sceptical barber needs: paper cards are over, the evidence, what brings
   people back, setup, the price, your own arithmetic?
4. /impeccable audit, including the known gaps in docs/landing-page.md.
5. Using design-taste-frontend, write the Design Read for the new page with
   the dials at variance 5, motion 4, density 4. Tell me if you would set
   them differently, and why.
6. /impeccable shape the new landing page (mode: Persuade).
   Fixed:
   - every number keeps its visible source;
   - the calculator's model, tests, URL contract, live region and negative
     result;
   - the anchors #how-it-works, #calculator, #pricing, #faq and #main;
   - every call to action's destination;
   - no tracking.
   Open: structure, order, sections, visuals, motion, and copy (through t(),
   in both languages).

Save the brief to docs/redesign/briefs/landing.md and stop for my review.
```

```text
Phase 9, the landing page, step B: build. Branch: redesign/landing.

Build docs/redesign/briefs/landing.md with design-taste-frontend at the dials
in the brief, inside DESIGN.md's system.

CLAUDE.md's "Design skills" section overrides the taste skill's defaults.
Specifically:
- every face sets Hebrew, and fonts stay on Google Fonts;
- icons are lucide-react;
- Tailwind 3.4;
- no motion library or GSAP;
- no invented numbers, names, logos or quotes, and no placeholder photos;
- the hero's pass is the real AppleCardPreview, unchanged, fed by
  heroTemplates.ts.

Keep calculator.ts and calculator.test.ts as they are; npm test must pass
with no changes to the test.

Build one section at a time, check each in Hebrew and English at 375px and
1280px, and commit each one.
```

- **Step C:** the landing page can carry the most motion in the product,
  but the rules in `docs/landing-page.md` stay:
  - sourced numbers never count up;
  - the hero's stamp lands once;
  - the carousel pauses on hover and focus;
  - reduced motion starts with everything visible.
- **Step D checks:**
  - signed out and signed in (the header changes);
  - a calculator link with a query string;
  - a negative calculator result;
  - Lighthouse on a phone profile.

---

## 8. Phase 10: cleanup

```text
Phase 10, cleanup. Branch: redesign/cleanup.

1. Find everything the redesign left unused:
   - the old primitive sets (src/components/ui,
     src/components/dashboard/primitives.tsx,
     src/components/card-studio/studio-primitives.tsx and the old onboarding
     components);
   - theme scopes and tokens nothing wears any more;
   - unused i18n keys in both languages;
   - WalletCardPreview, if /style-guide no longer uses it.
   List them with evidence (the grep you ran), then delete what I approve.
2. Make the new theme scope the default in :root.
3. /impeccable audit across the whole app, /improve-animations across src,
   and npx impeccable detect src. Fix what's left.
4. /impeccable document to refresh DESIGN.md.
5. Update CLAUDE.md:
   - the redesign has shipped;
   - say in a few lines where the tokens and primitives now live;
   - remove the rules that only applied during the redesign.

Verify per CLAUDE.md and commit.
```

`/admin` is for PunchMe staff only. Give it a light pass here, or leave it
as it is.

---

## 9. How to get the best results

- **Name the skill and the command in the first line.** "/impeccable
  critique …" loads the right instructions. "Make it nicer" makes three
  skills guess.
- **One step per session.** Long sessions drift. Start fresh at each step and
  let the files carry the work.
- **Spend your effort on the briefs.** Each step A ends with a brief and
  stops. That is where you have the most leverage: cut, reorder, push back,
  then say "build".
- **Give references.** Impeccable's `init` deliberately doesn't ask about
  taste. `shape` and Taste do, and they do far better with three real
  examples than with adjectives.
- **Judge in Hebrew on a phone first.** Most of the market is there, and RTL
  bugs hide in English.
- **Ask for proof.** A step isn't done until you have seen screenshots in
  both languages at both widths, and the build, lint and tests pass.
- **When a skill argues against a house rule, decide on purpose.** If its
  case is good, change CLAUDE.md, and the rule changes for every session.
  Don't let one session quietly bend it.
- **Watch the diff.** Before each commit, ask for `git diff --stat`. A phase
  that touches files outside its pages, or anything in `src/api`, `src/auth`,
  `src/hooks`, `src/config` or `src/lib`, should be stopped.
- **Use Plan mode for step B** if you want to see the build plan before any
  file changes.

---

## 10. When something goes wrong

| Problem | What to do |
|---|---|
| A skill doesn't load | Start a new session (skills load at session start). Check that `.claude/skills/<name>/SKILL.md` exists, and name the skill in the prompt |
| Two skills give opposite advice | CLAUDE.md's "Design skills" section decides. If it keeps happening, add "ignore the [x] skill for this step" to the prompt |
| UI UX Pro Max can't find Python | Run `py -3 --version`, and turn off the App execution aliases (§4, step 1). If Smart App Control blocks it, ask Claude to search the files in `.claude/skills/ui-ux-pro-max/data` instead |
| Impeccable's hook flags old code in pages you aren't working on | `/impeccable hooks` adjusts it. Its findings in a page outside the phase can wait for that page's phase |
| A skill named in the middle of a prompt didn't run | `prototype` and `review-animations` only run when the message starts with them. Send them as their own message |
| `/prototype` or `/animate` runs the wrong skill | Don't run `/impeccable pin animate`: the shortcut it creates would clash with Emil's `animate` |
| The dashboard is empty | Add the seed command (§1) |
| The browser preview signs you out | The app clears the session if its start-up check is cut off. After loading a page, wait a few seconds before navigating |
| The backend isn't answering | It runs in Docker on this PC. Ask Claude to start it and check that `http://127.0.0.1:8000/api/auth/me` answers 401 |

---

## 11. Progress checklist

- [x] §3 decisions filled in (9 Oct)
- [x] Billing-step key bug fixed (9 Oct)
- [ ] Seed command and test accounts on the backend
- [x] §4 skills installed, checked, committed (9 Oct)
- [x] 0.1 `redesign-start` tag (9 Oct)
- [x] 0.2 CLAUDE.md updated (9 Oct)
- [ ] 0.3 PRODUCT.md
- [ ] 0.4 DESIGN.md (before)
- [ ] The four unbacked landing claims removed (D2)
- [ ] A first visit opens in the browser's language, Hebrew otherwise (D11)
- [ ] 1.1 Research
- [ ] 1.2 Visual-world brief
- [ ] 1.3 Prototypes, direction chosen
- [ ] 1.4 Foundation built, DESIGN.md replaced
- [ ] Phase 2, dashboard shell: A · B · C · D · merged
- [ ] Phase 3, card studio: A · B · C · D · merged
- [ ] Phase 4, onboarding: A · B · C · D · merged
- [ ] Phase 5, counter pages: A · B · C · D · merged
- [ ] Phase 6, manager pages: A · B · C · D · merged
- [ ] Phase 7, owner pages: A · B · C · D · merged
- [ ] Phase 8, public pages: contract · A · B · C · D · merged
- [ ] Phase 9, landing page: A · B · C · D · merged
- [ ] Phase 10, cleanup

---

## 12. Sources

The skills' own repositories, read 8 Oct 2026:

- Impeccable: https://github.com/pbakaus/impeccable (`SKILL.md`,
  `reference/init.md`, `shape.md`, `document.md`, `craft-floor.md`) and
  https://www.npmjs.com/package/impeccable
- UI UX Pro Max: https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
  (README, `SKILL.md`) and https://www.npmjs.com/package/ui-ux-pro-max-cli
- Taste: https://github.com/Leonxlnx/taste-skill (README,
  `skills/taste-skill/SKILL.md`, `skills/redesign-skill/SKILL.md`)
- Emil Kowalski: https://github.com/emilkowalski/skills (README,
  `emil-design-eng`, `prototype`, `break-ui`)
- The `skills` installer: https://github.com/vercel-labs/skills

Write-ups used for orientation only:

- https://emelia.io/hub/impeccable-ai-design-skill
- https://composio.dev/blog/top-design-skills
- https://www.anavem.com/skills/claude/taste-frontend-skill
- https://claudskills.com/skills/emil-design-eng/
