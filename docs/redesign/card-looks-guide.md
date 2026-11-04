# The card's looks: passbox's design options, native in the studio and the wizard

How to take the card design options passbox-api v0.1.1 draws (stickers,
stamps on their own, a panel, a wallpaper, the count at the top as "6/8")
from controls in Card Studio's trays to something an owner never has to
learn, in the studio and in the onboarding wizard. Written 4 Nov 2026 from
`docs/redesign/card-design-options.md` (the input, copied from passbox's
session notes that day), frontend PR #40 and backend PR #17.

It runs like a phase of the redesign (`guide.md` §7): one fresh session per
step, the prompt below pasted in, the work handed on through files. Step A
writes one brief for both page groups, so the controls they share are
decided once. The build is two branches, one per page group.

## Where it stands

| What | Now |
|---|---|
| passbox | v0.1.1 runs on staging, checked on an iPhone and a Galaxy S25 on 4 Nov. Production is still v0.1.0, which refuses every option. Releasing it is your call |
| Backend PR #17 (`wallet/design-options`) | Open. The design doc's new keys, the sticker list (for managers and up, and for staff), styled cards drawn by passbox, and twelve styled catalog looks seeded as drafts |
| Frontend PR #40 (`studio/design-options`) | Open, on today's `main`. Every option is a control in the studio's trays and the catalog editor, hidden until the sticker list says passbox draws them. A styled card on the stage is passbox's picture |
| The wizard | Leaves styled looks out: it can offer a look only as its colours |
| Waiting on you | PR #40's change to `AppleCardPreview`, a spec-match file: the count at the top, "6/8", and the name beside the logo |

The input's §5 lists what #40 and #17 left open.

## How the skills fit

| Step | Skill | What it does here |
|---|---|---|
| A | Impeccable `critique` | PR #40's studio through an owner's eyes: can they make the bakery card without learning what a tint is? |
| A | Impeccable `audit` | The new trays at 375px, at 200% text, by night, in Hebrew |
| A | `break-ui` | 65 stickers, long names, 12 stamps, and a drawing that is slow or fails |
| A | Impeccable `onboard` | What a new owner's first card could be, and what the public wizard needs from the backend to draw it |
| A | UI UX Pro Max | Patterns for galleries, grouped pickers with search, and progressive disclosure. Raw material, not decisions |
| A | Impeccable `shape` | The brief: one round of questions, the options drawn on a canvas, your picks |
| A or B | `/prototype` (optional, as a message of its own) | For a choice that only touch can settle, such as how a redrawn card takes the last one's place: 3–5 working versions behind a picker on a temporary route |
| B | Impeccable, inside DESIGN.md | The build, in Plan mode |
| C | `find-animation-opportunities`, `animate`, `review-animations`, `mobile-native` | The redraw, a look picked, the phone feel |
| D | Impeccable `harden`, `adapt`, `clarify`, `polish`, `detect` | Edge cases, the copy, CLAUDE.md's checklist |

Taste stays on the landing page.

## Decisions only you can make

| # | Question | Recommendation | Your answer |
|---|---|---|---|
| L1 | May `AppleCardPreview` show the count at the top as "6/8", and the name beside the logo (PR #40)? | Yes. The file is a spec match, and the iPhone showed both on 4 Nov (the input's §4). Step A asks it, with that evidence | **Yes (4 Nov), and the logo row left to right in Hebrew, as the iPhone draws it** (`briefs/card-looks.md` §5) |
| L2 | Merge #17 and #40 before the looks are built, or with them? | Before step B, once L1 is yes and #40 passes the check on today's `main`. Neither shows anything until passbox production runs v0.1.1, and the looks then stand on `main`, to be reviewed on their own | **Before step B (4 Nov).** Roee merges #17, #40 is checked on today's `main` and merged on his word, then `looks/studio` moves onto `main` |
| L3 | When does passbox production go to v0.1.1? | After `looks/studio` merges, so owners meet the looks and never #40's trays | |
| L4 | Does Phase 10 wait? | Yes. Both would edit both locale files, and `/admin`'s `LookTile` | |

Step A asks the design decisions itself, with the options on a canvas.

## Order

1. Step A: the brief, for the studio and the wizard together.
2. Step B for the studio, on `looks/studio`, then C and D on it. If #40
   has merged by then, `looks/studio` first moves onto `main`: until step
   B its only commits are docs.
3. The backend's part, in a punchme-backend session, if the brief needs
   one for the wizard.
4. Step B for the wizard, on `looks/onboarding`, then C and D on it.
5. Merge #17, #40, `looks/studio`, the backend's part and
   `looks/onboarding`, each checked on today's `main` first. Then passbox
   production, then Phase 10.

Steps C and D use the guide's templates C and D (§7), with the notes at
the end of this file.

## Step A: diagnose and brief

```text
Card looks, step A: diagnose and brief. Don't change any code.

Branch: looks/studio. It stands on frontend PR #40 (studio/design-options),
which puts passbox-api v0.1.1's card design options into Card Studio's
trays. Backend PR #17 (wallet/design-options) is its other half. Neither is
merged.

Read first:
- docs/redesign/card-design-options.md: what the wallet now draws, the
  rules behind each option, what real phones showed, and a proposal for
  the studio (§6) and the wizard (§7). The proposal is a starting point to
  test, not a decision.
- The descriptions of PR #40 and backend PR #17 (gh pr view). Read PR
  #40's code as you need it.
- CLAUDE.md, PRODUCT.md, DESIGN.md, docs/card-studio.md,
  docs/onboarding-flow.md, and /dashboard/design in
  docs/dashboard-routes.md.
- What the earlier steps settled: docs/redesign/briefs/card-studio.md §7,
  §8.1, §8.3–8.5, §8.9 and §8.10; onboarding.md §6, §7.1 and §7.5–7.7;
  onboarding-map.md §1–§4.

The aim: a café owner or a barber, on a phone, ends up with a card like
the four references in the input's §1 without ever meeting the words
"style", "tint" or "wallpaper". Nothing that would draw nothing on the
real pass is offered, and they know that changing the card is safe.

See it working first. A styled card needs the backend from PR #17 and a
passbox at v0.1.1. If the local backend can't draw one, tell me what's
missing and ask before you change the backend container. Sign in as a
manager from the git-ignored demo login. Hebrew first, 375px first, then
English and 1280px.

1. /impeccable critique of PR #40's studio, as the owner: make the bakery
   card and the dark bubble-tea card, starting from a plain card. Count
   the taps, and note where an owner would hesitate and which words would
   mean nothing to them.
2. /impeccable audit of the new trays (the stamp's style, the stickers,
   the background, the count's place, the name beside the logo): at
   375px, at 200% text, by night, in Hebrew.
3. /break-ui on the trays and the stage: all 65 stickers, a 29-character
   Hebrew name beside a logo, an English name on a Hebrew card, 12 stamps,
   a dark card with no panel, a panel a shade off the card, a sticker that
   an uploaded picture hides, a drawing that is slow, one that fails, and
   the sticker list unavailable.
4. /impeccable onboard of the wizard, signed out, from /onboarding/business
   to the map. What would it take for a new owner's first card to be a
   styled look, drawn with their own name and colour? The wizard is public
   and passbox's key never reaches the browser. Say what the backend would
   have to serve (pictures of the published looks, the stickers, a drawing
   of the draft), and what each costs per visitor.
5. Look things up in the ui-ux-pro-max database:
   - --domain ux "template gallery choose a starting point";
   - --domain ux "picker categories search mobile";
   - --domain ux "progressive disclosure advanced settings".
6. /impeccable shape the looks (mode: Operate), the studio and the wizard
   in one brief. Ask through shape, with the canvas: no other skill's
   interview, and no spec outside the brief.
   Fixed:
   - The pass previews. A styled card is the server's picture, staged as
     PR #40 stages it. PR #40's change to AppleCardPreview (the count at
     the top, "6/8", the name beside the logo) still waits for my yes:
     ask me, with the input's §4 as the evidence.
   - Every route, and the calls in docs/dashboard-routes.md and
     docs/onboarding-flow.md. An added or changed call is my decision,
     and the backend's part goes in the brief as requirements for a
     punchme-backend session.
   - The wizard's draft and commit.ts grow by optional fields only, so a
     draft from before reads as having no options.
   - While the sticker list says the options aren't there, the studio and
     the wizard stay as they are today.
   - Save stays on its button, because each save reaches every customer's
     phone.
   - I prefer cards without the check mark.
   Open:
   - whether the studio opens on a gallery of whole looks, and what
     picking one does to a card customers already hold;
   - whether one brand colour sets the rest, and how a change to one shows;
   - the sticker picker;
   - a new card's defaults;
   - where the wizard offers the looks, and how it draws them (the
     input's §7: passbox through the backend, or a second renderer in the
     browser);
   - what the stage does while the server draws;
   - how a control that would draw nothing gets out of the way;
   - what the owner is told about the options only iPhones show, about
     long names, and about quiet updates.
   Ask me too:
   - the input's ten kinds of business, or our five trades;
   - whether the wizard asks for a logo;
   - whether every design keeps a stamp alert message (the input's §3,
     "Alerts"). Check first whether an owner can clear it today.

Before I pick a layout or a flow, draw the options on a Design canvas: one
artboard per option, 375px, Hebrew, Lightbox's tokens. Each card is a real
picture passbox drew, never redrawn. Then ask me with the question tool,
your recommendation first.

Save the brief to docs/redesign/briefs/card-looks.md, in the shape of the
earlier briefs:
- in short;
- today;
- the critique, the audit and the worst cases;
- what the backend says, and what it must add;
- the decisions;
- the new studio, and the new wizard;
- the copy in both languages;
- what each step B keeps, touches and checks;
- open questions.
Commit it on this branch and stop for my review.
```

## Step B: the studio

Run it in Plan mode.

```text
Card looks, step B: the studio. Branch: looks/studio.

Plan first. Before changing any file, show me the plan: the files you'll
create or change, in what order, and anything in the brief you would do
differently. Then wait for my go-ahead.

Build the studio's part of docs/redesign/briefs/card-looks.md on PR #40's
code, with the kit and DESIGN.md.

What you may change:
- the editor files docs/card-studio.md marks open, DesignPage.tsx and the
  /admin catalog pages;
- AppleCardPreview only as far as I agreed in the brief. Never change
  GoogleCardPreview, StampGrid or PassBarcode;
- src/api only as the brief agreed with me, and nothing in src/lib. Rules
  of your own (what draws what, the colours one colour sets, the stickers'
  groups) go in tested modules beside designOptions.ts.

What to keep:
- every call /dashboard/design makes, PR #40's included;
- the 400 ms lint check, Save on its button, and data-tour="design-studio";
- today's studio, exactly, while the sticker list says the options aren't
  there;
- /admin/catalog/:id, checked after each change.

Every string goes through t(), in en and he together, the stickers' names
included. Bring docs/card-studio.md up to date as you go. Check in the
preview as a manager, in Hebrew and English, at 375px and 1280px and at
200% text, as you go. Commit in scoped steps.
```

## The backend's part

Only if the brief asks for one. Start the session in `../punchme-backend`.

```text
Card looks: the backend's part. Branch: from wallet/design-options
(PR #17), or from main if it has merged.

Build what docs/redesign/briefs/card-looks.md (in punchme-frontend, on
branch looks/studio) lists under what the backend must add, and nothing
else. A public endpoint gets the care /api/presets has: passbox's key
never reaches the browser, its answers are cached, and it is throttled so
one visitor can't run up passbox's work.

Write tests for each, then run ruff check, ruff format --check and
makemigrations --check. Open a PR and stop: I merge backend PRs myself.
```

## Step B: the wizard

Run it in Plan mode.

```text
Card looks, step B: the wizard. Branch: looks/onboarding, from
looks/studio, or from main if it has merged.

Plan first. Before changing any file, show me the plan: the files you'll
create or change, in what order, and anything in the brief you would do
differently. Then wait for my go-ahead.

Build the wizard's part of docs/redesign/briefs/card-looks.md, against the
backend's part ([its PR]).

Keep:
- the eight routes, the forward guard, OnboardingGate and the walk;
- the four points where the draft is cleared;
- every call in docs/onboarding-flow.md, adding only the calls the brief
  added;
- the draft's v: 1 and its keys. New fields are optional, a draft from
  before reads as having no options, and draft.test.ts and walk.test.ts
  pass, with new tests beside them;
- commit.ts looking before it creates, and patching after Back-and-change;
- today's wizard, exactly, while the options aren't there.

The card controls are the studio's too: after changing one, check the
studio. Bring docs/onboarding-flow.md up to date as you go. Check every
part signed out and signed in, in Hebrew and English, at 375px and 1280px
and at 200% text. Commit per part.
```

## Steps C and D

- **Step C, both branches:** the moments worth motion are a new drawing
  taking the old one's place, a look being picked, and a stamp landing. A
  redraw never shows a blank, a flash or a jump in height. Choosing a
  sticker or a colour gets nothing beyond its redraw.
- **Step D, the studio:**
  - manager and owner; staff gets "not for your role";
  - `/admin/catalog/:id` as PunchMe staff;
  - the options there and not there;
  - a slow drawing, a failed one, and a v0.1.0 server's 400;
  - a card made before the options;
  - an English name on a Hebrew card.
- **Step D, the wizard:**
  - signed out; signed in with no business; signed in with a business and
    a draft;
  - a draft made before the options;
  - Back-and-change after sign-up, which must PATCH, not create;
  - "Replace" and "Keep" on an account that already has a card;
  - the options there and not there.

## Progress

- [ ] L1–L4 answered (L1 yes and L2 before step B, 4 Nov)
- [x] Step A: the brief (4 Nov, `briefs/card-looks.md`; review notes in its §11)
- [x] The decisions step A made itself, kept, and its open questions 1 and 2, yes (4 Nov)
- [ ] #17 and #40 merged
- [ ] The studio: B · C · D · merged
- [ ] The backend's part (if needed): PR · merged
- [ ] The wizard: B · C · D · merged
- [ ] passbox production on v0.1.1
