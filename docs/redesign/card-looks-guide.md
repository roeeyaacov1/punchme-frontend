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
| passbox | PunchMe production moved onto passbox on 4 Nov (backend PR #18). passbox's own log says PunchMe adopted v0.1.1 that day, so the options are probably live |
| Backend PR #17 (`wallet/design-options`) | Merged and deployed, 4 Nov. The design doc's new keys, the sticker list (for managers and up, and for staff), styled cards drawn by passbox, and twelve styled catalog looks seeded as drafts |
| Frontend PR #40 (`studio/design-options`) | Merged 4 Nov, on top of the opening (#42). Every option is a control in the studio's trays and the catalog editor, shown wherever the sticker list says passbox draws them |
| The false "cards won't update" notice | Fixed on its own by PR #44, merged 4 Nov |
| Backend PR #20 (the backend's part) | Merged 4 Nov: the brief's items 1–7, among them a published look's pictures, the card's own name on the pass and the picture held for Save |
| The studio (`looks/studio`) | Merged 6 Nov as PR #45: steps B, C and D and the motion review. Where the wallet draws the options, the trays offer them in an owner's words |
| The wizard | Still leaves styled looks out: it can offer a look only as its colours |

Brought up to date on 6 Nov, as the studio merged. The input's §5 lists
what #40 and #17 left open.

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
| L2 | Merge #17 and #40 before the looks are built, or with them? | Before step B, once L1 is yes and #40 passes the check on today's `main`. The looks then stand on `main`, to be reviewed on their own. #40 changes one thing at once: the texture moves into a new "הרקע" panel. The rest waits until passbox production runs v0.1.1 (corrected after the check, 4 Nov) | **Before step B (4 Nov).** Roee merges #17. #40 was checked on today's `main` and merges as it is, "הרקע" included. Then `looks/studio` moves onto `main` |
| L3 | When does passbox production go to v0.1.1? | After `looks/studio` merges, so owners meet the looks and never #40's trays | |
| L4 | Does Phase 10 wait? | Yes. Both would edit both locale files, and `/admin`'s `LookTile` | |

Step A asks the design decisions itself, with the options on a canvas.

## Order

1. Step A: the brief, for the studio and the wizard together. Done 4 Nov.
2. Side by side, in two sessions:
   - step B for the studio, on `looks/studio`, then C and D on it;
   - the backend's part, in a punchme-backend session.
3. Step B for the wizard, on `looks/onboarding`, once the backend's PR runs
   locally, then C and D on it.
4. Publish the styled looks in `/admin` (the brief's §10, question 6).
5. Merge each, checked on today's `main` first. Then Phase 10.

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
Card looks, step B: the studio. Branch: looks/studio, which is today's main
plus the plan's docs. Work in a worktree of your own outside the repo.
Other sessions use the main checkout, so never switch its branch.

Plan first. Before changing any file, show me the plan: the files you'll
create or change, in what order, and anything in the brief you would do
differently. Then wait for my go-ahead.

Build the studio's part of docs/redesign/briefs/card-looks.md, with the kit
and DESIGN.md: its §6, the copy in §8 and the list in §9. Its §11 review
notes, and my answers there, win where they differ. PR #40's options and
PR #44's reading of the server's check are already on main: build on them,
and don't redo them.

What you may change:
- the editor files docs/card-studio.md marks open, DesignPage.tsx and the
  /admin catalog pages;
- AppleCardPreview, only as far as the brief records my yes (§5, row 8).
  Never change GoogleCardPreview, StampGrid or PassBarcode;
- src/api, only as the brief agreed with me. Nothing in src/lib: rules of
  your own go in tested modules beside designOptions.ts. That covers what
  draws what, the colours one colour sets, and the stickers' groups.

What to keep:
- every call /dashboard/design makes;
- the 400 ms lint check, Save on its button, and data-tour="design-studio";
- today's studio, exactly, while the sticker list says the options aren't
  there;
- /admin/catalog/:id, checked after each change.

Three parts wait for the backend's part, which another session builds:
- the picture held for Save, drawn on the stage (§4.2, item 7);
- the card's own name on the pass (item 5);
- a published look's pictures in the catalog editor (item 1).
Keep today's behaviour for these until that PR runs locally. Then wire each
in a commit of its own.

To see styled cards, stand up the stack in the brief's appendix, beside
everything that is already running:
- passbox at v0.1.1 (passbox-api f7eb03a), on 8002;
- punchme-backend's origin/main, which has PR #17, on 8001. Build it from
  git archive, not from its checkout, which the backend session uses;
- copies of the databases.
Never touch punchme-web or the shared databases. Keep Chrome's debug ports
out of 9400–9999.

Every string goes through t(), in en and he together, the stickers' names
included. Bring docs/card-studio.md up to date as you go. Check in the
preview as a manager, in Hebrew and English, at 375px and 1280px and at
200% text, as you go. Commit in scoped steps.
```

## The backend's part

Start the session in `../punchme-backend`, in Plan mode. It runs beside the
studio's step B.

```text
Card looks: the backend's part. Branch: wallet/card-looks, from main. PR
#17 is merged and deployed.

Plan first. Before changing any file, show me the plan: the endpoints, the
models and migrations, the throttles and caches, in what order, and
anything in the brief you would do differently. Then wait for my go-ahead.

Read the brief first: docs/redesign/briefs/card-looks.md in
punchme-frontend. It is on the branch looks/studio, not on main:
git -C ../punchme-frontend show looks/studio:docs/redesign/briefs/card-looks.md
Its §4.2 is the list. Its §11 review notes, and my answers there, win where
they differ.

Build §4.2's items 1–7, and nothing else:
1. pictures of each published look, drawn once when it is published or
   saved, and served with GET /api/presets;
2. the sticker list, public;
3. a public drawing of the wizard's draft, from enumerated values only: no
   text and no pictures;
4. every design keeps a stamp alert message;
5. the card's own name on the pass (organization_name), my yes;
6. the seeded looks. PR #17 is merged and deployed, so this is a data
   migration that touches only looks still as seeded (unpublished and
   unedited). It drops the check mark and fixes the latte look's labels;
7. the picture held for Save, drawn by the design preview, my yes.

A public endpoint gets the care /api/presets has:
- passbox's key never reaches the browser;
- its answers are cached;
- it is throttled by the client's address, as the host's proxy passes it,
  with a ceiling for all visitors together over that.
Keep the OpenAPI schema exact: the frontend's types are generated from it.

Open PRs #10 and #11 each add a businesses/0014 migration, as #17 did.
Number yours after main's latest, and say in the PR what they will need.

Write tests for each item. Then run the full suite, ruff check,
ruff format --check and makemigrations --check. Never run two pytest
sessions at once, since they share Redis, and never restart punchme-web.
Say in the PR what deploying needs, and in what order. Open the PR and
stop: I merge backend PRs myself.
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
- [x] #17 and #40 merged (4 Nov). #40 went in on top of the opening (#42). Today's `main` builds, lints and passes its 792 tests, and every key resolves
- [x] The false "cards won't update" notice, fixed on its own: PR #44, merged 4 Nov
- [x] The studio: B (6 Nov, on `looks/studio`, rebuilt from `main` plus the plan's docs against backend `main` with PR #20, so the held picture, the card's own name and a published look's pictures are wired; the first B, of 5 Nov, is kept on `looks/studio-b1`) · C (6 Nov: the stage keeps what it shows while a drawing comes, a new drawing crosses over the last, a failure lights on, the trays on a phone) · D (6 Nov: harden, adapt, clarify, polish and detect; a v0.1.0 wallet's refusal said, with the way to take the options off; the bakery in 13 taps and bubble tea in 7, no hex; `docs/card-studio.md` has what it found) · `/review-animations` (6 Nov, after D: the crossfade in the exit's 180ms on the ease-out, a second drawing under the one going, the bar's slow line only fading up; checked in Hebrew and English) · merged: PR #45, 6 Nov
- [x] The backend's part: backend PR #20, items 1–7, merged 4 Nov
- [ ] The wizard: B (6 Nov, on `looks/onboarding`, cut from `looks/studio` `0f18215` and moved onto `main` after PR #45: the look screen and the fifth stop, the map on the studio's trays, the drawn card, the logo; with the looks refused it is the wizard of before, box for box at 375 in both languages and at 200%, within a pixel of font widths at 1280) · C (6 Nov: a new drawing crosses over the last, the look's own picture until the first drawing comes, only a picture of one's own lands, a new logo lights on; on a phone a held picture offers no "Save image", and the logo says it is loading) · `/review-animations` (6 Nov, after C: the owner's logo stays on the look's picture and lights on only when new) · D (6 Nov: harden, adapt, clarify, polish and detect; a drawing on its way or failed is said at the tray's foot too, with "Draw it again", which the wizard didn't have; a failure says what stands in the drawing's place; the wait for the looks shows the cold load's frame; the logo tile keeps its words in their box at 320px and 200% text. Checked on the stack: signed out, signed in with no business, with a business and a draft, Keep and Replace, Back-and-change PATCHing the one card, the save writing only the options that are on and the logo; with the looks refused, today's wizard box for box against `ea10212` in both languages at 320, 375 and 1280 and at 200%; `docs/onboarding-flow.md` has what it found) · merged
- [ ] passbox production on v0.1.1
