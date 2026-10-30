# The public pages and sign-in

Phase 8, step A of `docs/redesign/guide.md`: `/join/:templateId`,
`/c/:serial`, `/p/:token` (the friend's join, the card's face, "your card"
and the team's stamp screen), `/login` and `/invite/:token`. Diagnosed and
written on 27 Oct 2026 with `/impeccable critique`, `/impeccable audit` and
`/impeccable shape`: Persuade for the customer's pages, Operate for sign-in,
the invitation and the stamp screen. No code changed. Step B builds it on
Lightbox (DESIGN.md) and `src/components/kit`, in Plan mode.

These pages had no contract, so this step wrote one first:
`docs/public-pages.md`, traced from `src/main.tsx` through the imports, with
every state, every call and its wrapper, and what must survive.

This phase runs beside Phase 3 (the card studio, on `redesign/card-studio` in
the main checkout) and before Phase 4 (onboarding). So it decides the sign-in
parts it shares with the wizard (§7.9), and asks of Phase 3 only what §7.10
lists.

The inputs:
- CLAUDE.md, PRODUCT.md, DESIGN.md, `docs/redesign/briefs/visual-world.md`
  and `docs/onboarding-flow.md`;
- `docs/redesign/briefs/dashboard-counter.md` §8.4, the Scan answer the
  stamp screen borrows;
- the pages' code, and the backend's join, card, referral, invitation and
  sign-in code (§5);
- the pages themselves on the local backend's demo data: Demo Coffee (Pro,
  its referral program on, the referrer shown as nothing) and Demo
  Barbershop (Free).

They were walked Hebrew first at 375px, then in English at 1280px, signed
out, as a customer, a friend, Coffee's staff and a hire. Two reviewers ran
apart for the critique, at the same time, each in its own headless Chrome
with its own profile, so neither shared a session with the other, with the
in-app pane, or with Phase 3's tab on 5199:
- **A, design review:** read the code and walked every state live;
- **B, detector:** ran Impeccable's detector over the eleven markup files,
  scanned twelve live states over CDP, injected its overlay, and measured.

Local conditions shaped what could be seen. SMS codes are off on the local
backend, so `/join` has no code step here (the friend's join showed it,
mocked). The wallet provider is fake, so "add to wallet" leads nowhere. The
reviewers wrote one real stamp (עידו סויסה, 4 to 5 of 8) and one real
refusal (a second press inside 45 seconds), joined once with a demo phone
(which writes nothing), and mocked every other outcome. For the invitation's
pending state, two invitations were made on Demo Barbershop and revoked
afterwards.

Four questions went to Roee on the way, and he saw the `/join` structures on
a canvas before picking one. His answers are in §6.

Read "In short" first. Section 7 is what step B builds, and §12 records the
review.

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
12. Review notes for step B

---

## 1. In short

- **Five routes, two audiences, one product.** A stranger at a counter, a
  friend who scanned a pass and a customer who lost theirs meet `/join`,
  `/p` and `/c`; the shop's team meets the stamp screen, `/login` and
  `/invite`. All five still wear the old purple world (`.theme-purple`, a
  violet-to-blue gradient button, fields whose edges fail 3:1), so the first
  screen anyone sees of PunchMe looks like another product. They move to
  Lightbox by day, on the kit, inside one public frame (§7.2).
- **`/join` becomes the sign over the counter** (Roee, from Impeccable's
  roll, §6): a lit sign with the shop, what the card gives, "בלי אפליקציה,
  בלי חשבון, בלי סיסמה" and what it costs, and one coral "הצטרפות"; the form
  then takes the sign's place, phone first. Today the page names nothing
  until the customer has typed a number. The backend is asked for the shop's
  public face so the sign can name it (§6); until then the sign speaks
  without it.
- **The moment the card arrives is the peak:** the shop's name as the
  heading, the real pass in the sign's light, the wallet named by the phone
  ("הוספה ל-Apple Wallet"), and while it is issued, words instead of a
  pulsing monospace line (§7.4).
- **The stamp screen speaks Scan's language:** Scan's lit answer, its 64px
  count, its stamp row and its words, imported from the dashboard unchanged
  (§7.6).
- **Sign-in stops trapping and garbling:** a wrong account can leave
  `/invite` (Roee, §6); the masked address reads in Hebrew; a wrong password
  is answered in the page's language; the Google button sits in a box that
  follows the page (§7.7, §7.8).
- **Eight things say what isn't so, and this phase fixes them:**
  - a customer's own pass prints a stranger's name, "דנה לוי", on every `/c`
    and after any join without a name (Phase 3's part in §7.10);
  - with SMS codes on, as in production, a Free shop's `/join` says "משהו
    השתבש" instead of saying it isn't taking customers;
  - "Your card is ready! Add it to your wallet" with no button to press;
  - "No need to wait — staff can scan" lost its "staff" in Hebrew, so it
    tells the customer to scan;
  - `/c` reads any failure, offline included, as "this card isn't available
    anymore", and never re-checks a pass that is still being issued;
  - `/p`'s failure says "נסו שוב" with nothing to press;
  - a wrong password and a server error answer in English inside Hebrew
    pages;
  - the owner's demo card tells staff it is "your own preview card".
- **The customer's phone stops downloading the dashboard** (Roee, §6): every
  route ships in one 314 kB (gzipped) script today; the dashboard, the
  wizard and admin load on demand (§7.11).
- **What Phase 3 owes these pages** is four lines (§7.10): the preview's
  exports kept, a way to print no name, the 300px slot, and StampGrid's fix
  as it lands.

## 2. The pages today

### What each visitor sees

At 375 in Hebrew, signed out unless the row says otherwise. "The gradient"
is `ctaClasses("gradient")`, violet `#7a3aec` to blue `#2562ea` with a white
label.

| Page and state | What it shows | What is wrong with it |
|---|---|---|
| `/join` | "הצטרפות לכרטיסיית הנאמנות" (24px, Rubik 700); "שם (לא חובה)", "מספר טלפון נייד", "תאריך לידה (רשות)" with its hint; the consent (four lines beside a 13px box); "איך נשמרים הפרטים שלי? (הודעת פרטיות)" (12px); "הוספה לארנק שלי" (the gradient) at y 609–665 | No shop, card or reward; nothing says "no app"; the one required field sits between two optional ones; a dead link or a Free shop looks the same as a live one |
| `/join`, errors | "זה לא נראה כמו מספר נייד ישראלי תקין" at y 609, 280px under the field; every API failure "משהו השתבש. נסו שוב בעוד רגע."; an empty phone gets the browser's own bubble | Not announced, not tied to the field, under the keyboard; three different failures in one sentence |
| `/join`, the notice open | 681 characters at 12px | The button moves to 890–946, off the screen |
| `/join`, the card | "הצטרפתם אל DEMO COFFEE" (12px, violet, uppercased); "הכרטיסייה מוכנה! הוסיפו אותה לארנק"; the pass, rotating in over 800ms; "הוספה לארנק" (the gradient); "הכרטיסייה שלכם" | With no name typed, the pass reads "דנה לוי"; the shop is the smallest text on the screen; under reduced motion the pass's arrival is switched off |
| `/join`, waiting for the wallet | "מכינים את הכרטיסייה שלכם — זה ייקח רק רגע." in IBM Plex Mono (the Hebrew falls back to Times New Roman), pulsing even under reduced motion; "אין צורך לחכות — אפשר לסרוק את הקוד שלמעלה כבר עכשיו." | The heading still says to add it to the wallet; nothing is announced; the button appears without a word |
| `/c` | "הכרטיסייה שלכם"; the pass; "הוספה לארנק" at 532–588 | The pass always reads "דנה לוי"; it never re-checks a pass being issued; any failure says the card is gone |
| `/p`, the card's face | "כרטיסיית נאמנות PUNCHME"; a block in the card's colours; "אוספים 10 ניקובים ומקבלים: תספורת חינם"; "קבלו כרטיסייה משלכם"; "עובדים אצל Demo Barbershop? התחברו כדי להוסיף ניקוב" | No heading; PunchMe leads; the staff line speaks to every stranger; on a Free shop the join it offers refuses after typing |
| `/p`, your card | "Demo Coffee · כרטיסיית קפה"; "זו הכרטיסייה שלך"; "לפתוח את הכרטיסייה שלי" | No card shown; three grammatical persons on one screen |
| `/p`, the friend's join | "DEMO COFFEE" (12px); "הוזמנת להצטרף"; "אוספים 8 ניקובים ומקבלים: קפה חינם"; the `/join` form | The shop is an eyebrow; a returning member reads "הצטרפתם אל" over "כבר יש לך כרטיסייה כאן" |
| `/p`, the stamp screen (Coffee's staff) | "Demo Coffee · כרטיסיית קפה"; "להוסיף ניקוב לכרטיסייה של עידו סויסה"; "4 / 8" (44px); "הוסיפו ניקוב" (the gradient); "לפתוח את הסורק במקום" | After a stamp: "נוקב." at 14px in a mint wash, no light, no snap; the title and button unchanged and the button 68px lower; "reward ready" a violet box shaped like a button; a 500 says "Internal server error"; the full card's "הפרס נמסר — להתחיל את הכרטיסייה מחדש" an 80px two-line button with no "לא עכשיו" |
| `/login` | The logo, "English"; "ברוכים השבים"; email and password (edge 1.57:1); "כניסה" (solid violet); the toggle; "או"; Google; "חדשים כאן? עצבו קודם את הכרטיסייה — בחינם" | A wrong password: "Invalid email or password"; the Google label reads "Google כניסה באמצעות" and overruns the 309px column; no way to recover a password, anywhere |
| `/invite`, pending, signed out | "Demo Barbershop רוצים אותך בצוות"; "בתור עובד/ת. התחברו או פתחו חשבון כדי להצטרף."; what the role does; the form, sign-up first | The best screen in the phase: shop and role before any field. The named address's line is all left to right, so its "ל" detaches |
| `/invite`, signed in | The heading; "מחוברים בתור staff@demo.punchme.test."; "הצטרפות" | The only way out is the logo; the masked address isn't shown; a refusal says "התחברו איתה" with no way to |
| `/invite`, dead | "הקישור הזה לא עובד" and the reason | "כבר השתמשו בו. אם זה הייתם אתם, פשוט התחברו." with no link |

### The questions this step asked

**Does a stranger know, within five seconds, whose card this is, what they
get and what it costs?** No to the first two, half to the third. The page
makes no call on load, so nothing names the shop or the reward. The cost is
partly said: the phone is the one field without "(לא חובה)", and the SMS
code appears only in production's button label. "בלי אפליקציה, בלי חשבון,
בלי סיסמה", the standee's own line, is never said.

**Can they finish one-handed?** Partly. Enter submits where the keyboard has
one, but iOS's number pad has none; the button and any error sit under an
open keyboard. The code step works well: its button stays above the keyboard
and the field takes `one-time-code`.

**Is the moment the pass arrives a peak?** No. The shop's name first appears
in a 12px violet eyebrow, the heading is an instruction, the pass rotates in,
and if no name was typed it reads "דנה לוי".

**Does a staff member see one thing to do, and an answer they can't miss?**
One thing, yes. The answer is the smallest text on the screen, and the title
and the button keep asking for another stamp.

**Does an invitee know whose shop and which role before typing?** Yes. It is
the best thing in the phase. A wrong account can't get out, though.

### Measured

Reviewer B, in headless Chrome at 375, Hebrew unless noted.

| | `/join` | `/join` card, `/c` | `/p` | `/login`, `/invite` |
|---|---|---|---|---|
| Overflow at 375 and 320 | None | None | None | None at 375; at 320 the Google button spans 0–320, past the panel |
| Text under 13px | Birthday hint, privacy summary and notice, 12px | The eyebrow, 12px; the pass's own labels, 11px (frozen, `aria-hidden`) | The eyebrow, 12px | None |
| Monospace on Hebrew | None | "טוען..." and the wallet note (Plex Mono, Hebrew in Times New Roman) | "טוען..." | `/invite`'s "טוען..." |
| Targets under 44px | The checkbox 13×13; the privacy summary 293×23.5 | None | The friend's join as `/join` | The Google button 320×40 (Google's) |
| Field edges and focus | Edge `rgba(14,17,32,.15)` 1.38:1; the fields' focus ring 1.99:1 | | | Edge `#caccee` 1.57:1; violet ring 6.14:1 |
| Contrast of text | All pass | All pass | The count's "/" at 40%: 2.6:1 at 44px, under 3:1 | All pass |
| Landmarks, title | `h1` only; no `main`, no skip link; the title "PunchMe — Digital Loyalty Cards" | The same | The card's face has no heading at all | `main` and `header`; no skip link; the same title |
| Focus after a change | The submit: focus falls to `<body>` and stays | After joining: `<body>` | The stamp: `<body>` | The heading takes focus on load |
| Errors | Plain text, no `role`, no `aria-invalid`, not tied | | The answer's `role="status"` mounts with its first text | `role="alert"` |
| Motion | | The pass: `scale-in` 800ms; under reduced motion, none; the wallet note's pulse runs under reduced motion too | None | None |
| 200% text | The date field hides its year behind its icon | | | The Google label stays 14px |
| Calls | As the contract says | As the contract says, plus four `Image` probes for the art | As the contract says; the stamp refetches `/api/p` | As the contract says |
| Console | React Router's `v7_startTransition` warning; the expected 401s | | | GSI's "initialize() is called multiple times" on every re-mount |

The Google label doesn't follow the app's language: it stayed Hebrew after
a switch to English, and even after a cold English load in an en-US browser,
because `GoogleAuthButton` passes no `locale` and Google chooses for itself.

## 3. Critique

All six in the Acceptable band, and `/join`, the page that matters most,
lowest. Heuristics 7 and 10 don't apply to the three Persuade pages: a
one-time customer path has nothing to accelerate and no place for help. The
scores are A's; the detector added no issue A had missed. The snapshots are
in `.impeccable/critique/` (`2026-10-27T01-26-47Z__*`), one per page group,
for step D's `/impeccable polish`; they are committed with the review, as in
Phase 7.

| # | Heuristic | `/join` + friend's join | `/c` | `/p` face + "your card" | Stamp screen | `/login` | `/invite` |
|---|---|---|---|---|---|---|---|
| 1 | Visibility of status | 2 | 2 | 3 | 2 | 3 | 3 |
| 2 | Match with the real world | 2 | 2 | 3 | 3 | 3 | 3 |
| 3 | User control and freedom | 2 | 2 | 2 | 2 | 3 | 2 |
| 4 | Consistency and standards | 2 | 2 | 2 | 1 | 2 | 2 |
| 5 | Error prevention | 2 | 3 | 2 | 2 | 3 | 2 |
| 6 | Recognition over recall | 3 | 3 | 3 | 3 | 3 | 4 |
| 7 | Flexibility and efficiency | n/a | n/a | n/a | 3 | 3 | 3 |
| 8 | Aesthetic and minimalist design | 2 | 3 | 3 | 2 | 3 | 3 |
| 9 | Error recovery | 2 | 1 | 2 | 3 | 2 | 2 |
| 10 | Help and documentation | n/a | n/a | n/a | 3 | 1 | 3 |
| | **Total** | **17/32** | **18/32** | **20/32** | **24/40** | **26/40** | **27/40** |

**Specificity.** Interchangeable, except where the pass appears. A centred
white card on a lavender wash with a violet-to-blue gradient button could
front any sign-up. What is authored: the real pass with a working QR, the
Israeli legal wording, `/invite`'s role text, the count left to right inside
Hebrew, and refusals said in words. What is missed: the shop never frames
its own customer's pages; the Persuade register (big type, the product in
the light) is nowhere; and Scan's photo snap, the product's signature move,
is a 14px line on the stamp screen.

**The detector.**
- **CLI:** 0 findings over the eleven markup files, with and without the
  project's config.
- **Live,** engine 4.7.0 over CDP, 16 findings in twelve states:
  - `ai-color-palette` ×8, real: the old `.grad-cta` gradient
    (`index.css:1368`), on eleven call sites in the four customer files;
  - `nested-cards` ×4: two false, the frozen pass inside its panel, staged on
    purpose; two real, the card's face as a colour block inside the panel
    (`PublicCardPage.tsx:307`);
  - `organic-clip-path` ×4, false: Google's own "G".
  - The element rules (contrast, stragglers, overflow) found nothing.
- **Overlay:** injected into five states of a headless tab; its console
  matched the scans. Headless, so nothing was visible to anyone.

**Priority issues**
1. **[P1] `/join` is anonymous until the customer has given a number**
   (`JoinPage.tsx:287-289`, and no call on load). No shop, card or reward;
   "no app, no account, no password" never said; a dead link or a Free shop
   shows the full form. Fixed by the sign (§7.3) and, once the backend has
   it, the shop's face (§6).
2. **[P1] A stranger's name on the customer's own pass**
   (`publicCard.ts:46` into `CardPreviews.tsx:127,243,357`): "דנה לוי" on
   every `/c` and after any join that skipped the name. §7.4 and §7.10.
3. **[P1] The old purple world, with fields that fail 3:1:** edges at 1.38
   and 1.57:1 and the fields' focus ring at 1.99:1 (WCAG 1.4.11); two button
   styles and two title sizes across five pages; Hebrew set in Plex Mono
   falling back to Times New Roman. §7.2, §7.12.
4. **[P1] The stamp screen's answer is missable and speaks another language
   than Scan** (`PublicCardPage.tsx:166-264`): a 14px answer with no light
   or snap; the title and button unchanged after a stamp and the button 68px
   lower; a 44px count on a phone with a 2.6:1 slash; warm washes for
   refusals; a violet "reward ready"; "Internal server error"; "נוקב." and
   "פרס" where Scan says "נוספה חותמת" and "הטבה". §7.6.
5. **[P2] `/join`'s errors are generic, far from their field, under the
   keyboard, and silent** (`JoinPage.tsx:138-143`, `:343`); focus falls to
   `<body>` after every submit. §7.3.
6. **[P2] The card screen isn't a peak:** "add it to your wallet" with no
   button; the waiting note in monospace, pulsing under reduced motion and
   unannounced; `/c` never polls; the pass squeezed to 295px (240 at 320); an
   800ms rotate, switched off under reduced motion. §7.4.
7. **[P2] Sign-in traps and garbles:** the wrong account can't leave
   `/invite`; the named address detaches its "ל" (`InvitePage.tsx:145`);
   "פשוט התחברו" with no link; the Google label reversed by a forced
   left-to-right box (`AuthFormParts.tsx:98`) and in the browser's language;
   English 401s (`useEmailPasswordAuth.ts:42`). §7.7, §7.8.
8. **[P2] `/p`'s doors:** staff who scan a pass while signed out (the
   default for anyone whose iPhone app keeps its session apart from Safari)
   get the friend's join with no way to the stamp screen, and each such load
   fires the shop's referral rule; a Free shop's face offers a join that
   refuses; "this is your card" shows no card. §7.6.

**Personas**
- **A customer at the counter, Hebrew, one hand:** nothing about the shop
  before typing; the iOS number pad has no Return, and the button and the
  errors sit under the keyboard; no language switch for a Hebrew reader on
  an English phone; four lines of consent beside a 13px box; "דנה לוי" on
  their own card; a pulsing monospace line that contradicts the heading.
- **The friend who scanned a pass:** the shop as a 12px eyebrow; nothing on
  what joining through a friend gives; a returning member told "הצטרפתם אל"
  over "כבר יש לך"; a Free shop's offer that ends in a refusal.
- **A staff member at the counter:** a 44px count and a 14px answer; a
  button that jumps and keeps asking; "reward ready" that looks like a second
  button; an 80px redeem with no "לא עכשיו"; other words than Scan; English
  for a 500; signed out, a customer's form with no way in.
- **A hire opening the link from WhatsApp:** shop and role clear; the masked
  address garbled; Google reading "Google הרשמה באמצעות"; a wrong account
  refused with no way out; the password rule unseen until the server's
  English refusal.
- **Sam, on a screen reader:** errors neither announced nor tied; focus to
  `<body>` after joining; no `main`, skip link or title on the customer's
  pages; the stamp answer's live region mounted with its first words, which
  VoiceOver often skips; the pass's summary leaves out the stamps held.

**Strengths, kept:**
- **The pass is real and works before the wallet does:** `PassStage` stages
  the studio's renderer with the card's own QR, and the page says so.
- **`/invite` puts context before commitment:** the shop and the role, and
  what the role opens, before any field; sign-in on the page; sign-up first.
- **Refusals said out loud, and candid legal text:** the marketing consent a
  separate unticked box, the notice one tap away, slash forms, and phone,
  code and count isolated left to right.

**Minor:** three grammatical persons on one screen; ניקוב and פרס against
the glossary's חותמת and הטבה; "(לא חובה)" and "(רשות)" for the same thing;
the Hebrew `scanMeanwhile` drops "staff"; Latin shop names uppercased by
`t-eyebrow`; no page titles; the code step doesn't submit at six digits;
`wallet.addApple`, `wallet.addGoogle`, `enroll.title`, `enroll.phoneLabel`
and `auth.submitting` exist and nothing reads them.

## 4. Audit

9/20, Poor.

| # | Dimension | Score | Key finding |
|---|---|---|---|
| 1 | Accessibility | 2 | Field edges and the fields' focus ring under 3:1; a 13px checkbox and a 23.5px privacy toggle; errors neither announced nor tied; focus to `<body>` after submits; no landmarks, skip link or title on the customer's pages; Hebrew in a monospace face; a pulse under reduced motion while the pass's arrival is switched off |
| 2 | Performance | 2 | One 1,026 kB entry script (314 kB gzipped, `vite build` on 27 Oct) holds every route, so a customer's phone downloads the dashboard before `/join` shows a field; `/join`'s wallet poll never gives up |
| 3 | Theming | 1 | All five on the old purple scope and the old primitives (`components/ui`'s `Input`, `ctaClasses`, `Eyebrow`, `t-h3`, `t-stat`, `t-eyebrow`); `text-red-600` and `text-red-700` hard-coded; with no scope on `<html>`, a dark-mode phone shows a navy `#0f0f23` status bar over a light page |
| 4 | Responsive | 2 | No overflow at 375 or 320, but the pass gets 295px at 375 and 240px at 320 instead of its 300px slot; the 320px Google button overruns the column; the stamp count shrinks to 44px on a phone (64px on a desktop); at 200% text the date field hides its year |
| 5 | Implementation integrity | 2 | The whole join (form, code step, card) is written twice (`JoinPage`, `ReferralJoin`); a Free shop's `/join` answers "משהו השתבש" whenever codes are on; English server text in Hebrew pages; five unused keys; the detector's palette finding is real |

**Detailed findings**
- **[P1] A Free shop's `/join` with codes on.** `POST /api/join/{id}/otp`
  refuses a Free shop with no cards with 403 `upgrade_required`, and
  `submitDetails` maps only 404, `otp_throttled` and `invalid_phone`
  (`JoinPage.tsx:107-113`). Local development has codes off, which hides it.
- **[P1] Field edges and the fields' focus ring under 3:1** (WCAG 1.4.11):
  `components/ui/Input.tsx`, `AuthFormParts.tsx:7-10`.
- **[P1] The pass's name** (§3, issue 2).
- **[P2] Focus dropped to `<body>`** after the join's submit, after joining,
  and after a stamp (WCAG 2.4.3); the buttons disable while busy.
- **[P2] Silent changes:** `/join`'s errors, the wallet's arrival and the
  stamp's answer (WCAG 4.1.3).
- **[P2] Monospace Hebrew:** "טוען..." (`CardStatusPage.tsx:35`,
  `PublicCardPage.tsx:90`, `InvitePage.tsx:94`) and `wallet.pending`
  (`WalletAddButtons.tsx:59`).
- **[P2] Reduced motion:** the pulse runs on (`WalletAddButtons.tsx:59`);
  the pass's arrival goes to none (`index.css:1335-1349`), not gentler.
- **[P2] The bundle** (§7.11).
- **[P2] The pass squeezed** under its 300px slot (`JoinPage.tsx:358-366`,
  `PassStage.tsx:79`).
- **[P3] An unbounded poll** on `/join` while the wallet issues
  (`JoinPage.tsx:62-85`), against a 30-a-minute card lookup.
- **[P3] Unused keys** (§3, minor).

**Positive, and kept:** the phone's `inputMode="tel"` and the code field's
`one-time-code`; `dir="ltr"` on phone, birthday, code, email and password;
`role="alert"` on sign-in errors; the heading that takes focus on sign-in;
the pass hidden from screen readers and summarised in a sentence; the
resend countdown readable while disabled; no trap anywhere on the keyboard
path.

## 5. What the backend says

Read from `../punchme-backend`, because these pages are where a stranger
meets the API with no account, and every refusal on them is the backend's.

### Joining (`apps/loyalty`, `apps/referrals`)

- **No call answers "whose card is this?" by design id.** `/join` knows only
  the template id in its URL. `GET /api/p/{token}` answers the question for a
  card's public token and `GET /api/cards/{serial}` for a serial, but nothing
  does for a design (§6, decision 2).
- **The code request is always 204** (`POST /api/join/{id}/otp`,
  `/api/p/{token}/otp`), so it can't be used to learn who is a customer. 10 a
  minute. It refuses only a Free shop that holds no real cards at all, with
  403 `upgrade_required`, so as not to pay for an SMS a join can't use; a
  shop with cards may have a returning customer on the other end, so it
  sends (`assert_business_has_customer_headroom(advisory=True)`).
- **The join is idempotent per phone and design** (`enroll_customer`): a
  returning customer gets their own card back before the cap is checked, so
  a shop that drops to Free never locks out its customers. A blank optional
  field never overwrites a stored one. A new customer on a Free shop is 403
  `upgrade_required` and the transaction rolls back. 5 a minute.
- **The join's answer says nothing about whether the card is new.** It
  carries `stamp_count`, so a card that comes back with stamps on it is
  plainly a returning one.
- **The friend's join** records the referral as joined, rejected or flagged
  and succeeds either way; `already_member` is the one outcome about the
  person. 5 a minute.
- **SMS codes are off locally** (`OTP_REQUIRED`, which `/api/p` reports as
  `otp_required: false`). Production has them on, and `/join` reads the
  build's `VITE_OTP_REQUIRED` instead of asking.

### The card (`GET /api/cards/{serial}`, `/api/p/{token}`)

- **No personal data on the public card,** on purpose: no name, no phone. A
  page showing a customer their own card can't know the name on it.
- **The real pass prints "Member"** for a customer who gave no name
  (`apps/wallet/providers.py:499`, `:572`), in English, on a Hebrew card too.
- **The art is the wallet's own:** `strip_url` and `hero_url` point at
  `/api/cards/{serial}/art/{slot}`, rendered by the code that feeds the
  wallet provider, cached for good per design version. 60 a minute.
- **`/api/p/{token}`** reads a session when there is one. Any member of the
  card's business, staff included, gets the stamp view (`role_in_business`).
  Otherwise the program decides: off, the card's face; on, the friend's
  join, and then **every load records a referral click and fires the
  program's `scanned` rule**, which can send the member's pass a message. An
  unknown token, a removed card, an inactive shop and an inactive design are
  one 404 with one timing. 60 a minute per address and per token.
- **With `WALLET_BARCODE_PUBLIC_URL` on,** a pass's barcode is its `/p` URL;
  the counter's scanner unwraps it to the token, so one QR serves a phone's
  camera and the counter.

### The counter (`POST /api/scan`, `POST /api/cards/{code}/redeem`)

- Signed in only. 60 a minute per person, plus a 45-second cooldown per card
  (429). 404 for a card that isn't this shop's, 409 for one that is full or
  cancelled. The code can be a serial, a PassKit id or the public token.
- Failures carry a status and an English `detail`, and no `code`. The page
  must say them in its own words, as Scan already does
  (`routes/dashboard/scan/answer.ts`).

### Invitations (`apps/businesses`)

- **The preview is public,** in its own throttle bucket (20 a minute): the
  shop, the role, `status` (`pending`, `revoked`, `expired`, `accepted`),
  `expires_at`, and the invited address masked. The token is the credential:
  43 characters, single use, two weeks, kept in the clear on purpose.
  `expires_at` reaches the page and is never shown.
- **Accepting needs an account.** Its refusals: `invitation_email_mismatch`,
  `already_a_member`, `invitation_unusable` with a `reason`.

### Sign-in (`apps/accounts`)

- 10 a minute per address for sign-in, sign-up and Google.
- **Every refusal is English, and only some have a code:** 401 "Invalid email
  or password" for a wrong password and an unknown address alike (with a
  dummy hash, so the timing can't tell them apart); 401 "This account signs
  in with Google or Apple. Use that option instead." for an account with no
  password, with no `code` to tell it from the first; 409
  `email_already_registered`; 422 `weak_password` with Django's English rules
  joined.
- **No password recovery exists,** in the backend or anywhere in the app.

## 6. Decisions made in this step

| # | Question | Roee's answer (27 Oct) |
|---|---|---|
| 1 | How `/join` is laid out | **The sign over the counter.** Impeccable's roll (`concept-seed --scope surface --mode persuade`, seed `160484a1`) dealt positions 5, 6 and 7 of seven ranked structures: the sign over the counter (the dealt lead), the wallet button first, and the shop asks. Roee asked to see them first; they were drawn on a canvas at 375 in Hebrew, in Lightbox, with the real pass ([Join page structures](https://claude.ai/artifact/H7um9RnRJArRSxHmQ8vfb4), private), and he took the lead |
| 2 | Whether `/join` may learn the shop before the customer joins | **Ask the backend for it.** A public read by design id, returning what `/api/p` already returns about the card, plus whether the shop takes new customers (that flag on `/api/p` too). `/join` adds one call on load. It is built in the backend first; step B ships the sign without it and takes it when it exists (§7.3, §10) |
| 3 | Whether a signed-in invitee can switch accounts on `/invite` | **Yes.** "לא אתם? כניסה עם חשבון אחר" signs out (`POST /api/auth/logout`, through `AuthProvider.logout`, the call onboarding's account step already makes) and shows the sign-in form, the invitation still on screen. One call added to `/invite`'s contract |
| 4 | Whether to split the bundle in this phase | **Yes, in this phase,** as its own commit: the dashboard, the wizard and admin load on demand; routes and calls unchanged (§7.11) |

The seven structures for `/join`, ranked in writing before the roll:
1. the standee's second step: its three steps as one row, the second lit
   with the form inside it;
2. the card arrives where the form was: one lit panel, a short form, and the
   same panel switching on with the pass;
3. the thumb sheet: the promise on the wall, the form docked at the bottom;
4. one question at a time;
5. the sign over the counter: a lit sign with the promise and a coral
   "join" that opens the form;
6. the wallet button first: one field welded to one big button, the
   optional fields below;
7. the shop asks: the questions as a short exchange.

The decision page closes unseen in a hidden pane here, so the roll came
through the question tool and the canvas above. The challengers it dealt
were catalog worlds (a mezzotint plate, a teletext weather page, a
cephalopod's skin, a hand-bent neon circuit, a split-flap concourse board,
a HyperCard stack), and were declined: the world is settled, and a neon
circuit is one DESIGN.md forbids by name. One discipline is kept from the
split-flap board, as an answer that every head reads at once: the stamp
screen's answer is the loudest thing on its screen (§7.6). And one from the
HyperCard stack: "back retraces your exact trail", so "עריכת המספר" on the
code step returns to the form with everything still in it (§7.3).

**Decided in this brief,** for the review to overturn:
- **The parts shared with the wizard** (§7.9): `AuthFields` and
  `AuthAlternatives` restyled in place inside their own Lightbox scope;
  `useEmailPasswordAuth` fixed in place; `StepShell` and `TopBar` left to the
  wizard, with a kit-built frame for `/login` and `/invite`.
- **The stamp screen imports Scan's answer unchanged** (`ScanAnswer`,
  `answer.ts`, `feedback.ts`), its words included, and stays light (§7.6).
- **The customer's pages get the language switch** `/login` has, and
  PunchMe signs at their foot, as the standee does (§7.2).
- **The wallet is named by the phone** ("הוספה ל-Apple Wallet",
  "הוספה ל-Google Wallet", or "הוספה לארנק"), as `PassStage` already
  chooses the preview by it; plain buttons, no official badges (they aren't
  on hand, PRODUCT.md).
- **`WalletAddButtons` stays as it is,** for `/dashboard/design`, which is
  Phase 3's page; the public pages build their own wallet button from the
  kit.
- **`/c` re-checks a pass that is still being issued,** with the same call
  `/join` already repeats, and both stop after three minutes and say so.
- **A door for signed-out staff** under the friend's join and the card's
  face: "עובדים ב-{business}? כניסה להחתמה", to `/login` and back.
- **Each page names itself** in `document.title` (§8).

## 7. The new pages

### 7.1 What is fixed

- **The five routes,** public, children of `RootLayout`, outside
  `ProtectedRoute`, `BusinessProvider` and `RequireBusiness`
  (`main.tsx:71-82`).
- **Every call in `docs/public-pages.md`,** and the three it now lists as
  added (§6): the shop's face on `/join` once the backend has it, the
  sign-out on `/invite`, and `/c`'s re-check. A read made again (a retry, the
  wallet's re-check) is the same call.
- **The legal pair on both joins:** the s.11 privacy notice with its full
  text one tap away, and the marketing consent as its own unticked box, from
  `enroll.privacySummary`, `enroll.privacyNotice` and `enroll.marketingOptIn`.
  Step B moves, styles and wires them, and changes no word of either.
- **The code step's switch:** `env.otpRequired` on `/join`, the page's own
  `otp_required` on the friend's join. No code is requested when it is off.
- **What `src/lib` does for these pages,** untouched: the phone check before
  any request, the name cased on the way out of its field, the device id,
  and the held-card memory.
- **The pass:** `PassStage` and `publicCard.ts` stage the studio's real
  renderer, whose barcode is real, in a 300px slot, never redrawn and never
  squeezed (§7.10).
- **`/login`'s redirects** (`from`, the draft check, sign-up to
  `/onboarding`) and **`/invite`'s** invalidation of `["business","me"]`
  before `/dashboard`.
- **Untouched:**
  - `src/api`, `src/auth` (the Google button is drawn by Google, from
    there), `src/hooks`, `src/config`, `src/lib`;
  - `src/components/card-studio` and `src/components/wallet-card`, Phase 3's
    (§7.10), and `src/components/wallet-actions`;
  - onboarding's own pages, `StepShell` and `TopBar` (§7.9);
  - the dashboard's Scan, whose answer the stamp screen imports (§7.6).

### 7.2 Lightbox outside the shell, by day only

All five pages stand outside the dashboard's frame, so no claim reaches them
(`lightboxPage.ts`), and the guide's D8 keeps them light. Today each wears
`.theme-purple .theme-raised` on its own root, and `<html>` wears nothing.

- **One frame for all five, `PublicPage`** (new, in `src/routes/public/`):
  - its root wears `theme-lightbox`, never `theme-night`, on the wall,
    `min-h-dvh`, with the 16px gutter;
  - it holds the page's one `<main>`, a skip link to it, and the page's
    title (`document.title`, §8);
  - while it is mounted, `<html>` wears `theme-lightbox` too, so the
    overscroll shows the wall, and a `theme-color` meta of the wall
    (`#f6f2eb`) goes in ahead of `index.html`'s two, so a phone in dark mode
    no longer shows a navy bar over a light page. Both come off on unmount,
    as `useDashboardTheme` does it, without its night;
  - `index.html`'s pre-paint script gives these paths nothing today; giving
    them `theme-lightbox` before paint is step B's to plan, as Phase 7 left it
    for its return pages.
- **The customer's pages** (`/join`, `/c`, `/p`'s customer views) open on a
  slim row with the language switch at its end, a 44px target, and nothing
  else: the shop is the subject, not PunchMe. PunchMe signs at the foot,
  "באמצעות פאנץ' מי" (`standee.poweredBy`), as the standee the customer just
  scanned does.
- **`/login` and `/invite`** open on `PublicTopBar` (new): the mark home and
  the language switch, on the kit. The wizard keeps its own `TopBar` (§7.9).
- **The stamp screen stays light too.** It is reached from a phone's camera,
  in the browser, not from the dashboard, and an installed iPhone app keeps
  its night setting where the browser can't read it, so it couldn't follow
  the dashboard reliably anyway. Its answers are lights, which read the same
  by day.
- **Nothing on the five uses the old sets:** `components/ui`'s `Input`;
  `marketing/primitives.tsx`'s `ctaClasses`, `Eyebrow` and `focusRing`; the
  type classes `t-h3`, `t-stat` and `t-eyebrow`. Nothing sets Hebrew in IBM
  Plex Mono; the code field's digits may stay in it (a code, DESIGN.md).

### 7.3 `/join`: the sign over the counter

Roee's pick (§6). The page is the sign the shop would hang over its counter:
one lit panel that says whose card this is, what it gives and what it costs,
with one thing to press. The customer already chose to scan; the sign
confirms the choice in a glance, and the form follows on the same screen.

**The first screen at 375:**
- The slim row, its language switch at the end.
- **The sign**: a lit panel in the field light (Bright Light at the centre to
  Edge Light at the edges), the hero's 40px corners, 22px inside, the
  column's width, centred in the first screen's height. In reading order:
  1. **The shop**, once the backend gives its face: its mark (the logo when
     there is one, else its initial on the card's own colour, as the kit's
     `WallpaperStage` draws a notification's icon) beside its name (Rubik
     500, 16px, isolated) and the card's name (14px, ink-muted). Without the
     face, nothing here.
  2. **The heading** (`h1`, DESIGN.md's headline: Rubik 500, 32px at 375,
     line-height 1.2 and no tracking in Hebrew): "כרטיסיית הנאמנות, בארנק של
     הטלפון". The canvas drew it at 34px; the token wins.
  3. **What it gives:** with the face, "{n} חותמות, ואז {reward}." (Assistant
     600, 19px; the number in Rubik's tabular figures). Without it, "חותמת
     בכל ביקור, והטבה כשהכרטיסייה מלאה.", which is true of every card.
  4. **The promise and its cost:** "בלי אפליקציה, בלי חשבון, בלי סיסמה."
     (`standee.noApp`, word for word what the standee says) and "רק מספר נייד
     וקוד ב-SMS." in ink-muted; "רק מספר נייד." when codes are off, from the
     same switch the form reads.
  5. **"הצטרפות"**, the coral button, 52px, the column's width: the screen's
     one coral thing.
- Under the sign, with the face: "חותמת בכל ביקור, ישר לכרטיסייה שבארנק."
  (16px, ink-muted, centred).
- At the foot, "באמצעות פאנץ' מי".

**With the face, before anything is typed:**
- **A dead link** (404): the sign keeps its light and says "הקוד הזה כבר לא
  מוביל לכרטיסייה" and "בקשו מהעסק את הקוד העדכני.", with no button.
- **A shop not taking new customers** (the face's flag): "{business} עוד לא
  מצרפים לקוחות חדשים לכרטיסייה." in place of the promise, and, quiet under
  it, "כבר יש לכם כרטיסייה כאן? קבלו אותה שוב", which opens the same form: a
  returning phone gets its card back (§5), a new one the same refusal.
- Without the face, both are found on submit, as today, but said the same
  way, and the code request's `upgrade_required` reads as not taking
  customers, not "משהו השתבש" (the bug in §4).

**"הצטרפות": the form takes the sign's place,** on the same route, as a
change of state (no navigation; the phone's Back still leaves the page).
- The sign gives way to **a band** at the top (Panel Light to Deep Light,
  24px corners): the shop's mark, its name and "{n} חותמות, ואז {reward}"
  with the face; without it, no band.
- **The heading** "הצטרפות לכרטיסייה" (`type-title`), which takes focus.
- **The form**, one lit panel (24px corners, 20px inside), on the kit:
  1. **"מספר נייד"**, first and the only one required: `Input`, `type="tel"`,
     `inputMode="tel"`, `autoComplete="tel"`, `dir="ltr"`.
  2. **"שם (לא חובה)"**, with the hint "כך הוא יופיע על הכרטיסייה.":
     `autoComplete="name"`, `dir="auto"`, cased on the way out.
  3. **"תאריך לידה (לא חובה)"**, with "רק בשביל הטבת יום הולדת. אפשר
     להצטרף גם בלי.": the native date field in the kit's box. A phone's
     picker is the best one-handed control there is, and on a phone it shows
     no "mm/dd/yyyy" to misread.
  4. **The consent**: the kit's `Checkbox` (a 24px box, the whole label the
     44px target), the text word for word.
  5. **The notice**: "איך נשמרים הפרטים שלי? (הודעת פרטיות)" as a 44px row
     with its chevron (mirrored), opening the full text in the kit's
     `Sheet` at 17px and 1.7, so reading it never moves the form or the
     button; closing it returns focus to the row.
  6. **The coral button**: "שליחת קוד אימות ב-SMS" with codes on, "הוספה
     לארנק שלי" with them off; under it, with codes on, "נשלח קוד בן 6 ספרות
     למספר הזה." (14px, ink-muted).
- **Errors are said where they happen:** the form is `noValidate`, so the
  browser's own bubble never speaks; each field's error sits under it through
  the kit's `Field` (its icon and words, `aria-describedby`, `aria-invalid`),
  and the first takes focus. Empty phone: "צריך מספר נייד כדי להצטרף."; the
  page's own check (`isLikelyIlPhone`) or `invalid_phone`: "זה לא נראה כמו
  מספר נייד ישראלי
  תקין". What belongs to no field is a kit `Notice` (danger) over the button,
  `role="alert"`: `otp_throttled` ("נשלחו יותר מדי קודים — המתינו רגע ונסו
  שוב"), an unreachable API ("אין חיבור. בדקו את הרשת ונסו שוב."), anything
  else (`enroll.genericError`).
- **Busy** is the kit's `Button busy`: it keeps its width and its focus.

**The code step** (codes on), in the same place under the band:
- "הזינו את הקוד" (`type-title`, focused); "שלחנו קוד בן 6 ספרות ל-{phone}",
  the number isolated left to right;
- the code field: six digits, `inputMode="numeric"`,
  `autoComplete="one-time-code"`, `dir="ltr"`, its digits the one place on
  the page in IBM Plex Mono; **it submits by itself at six digits**, once;
- "אישור והצטרפות", coral;
- "עריכת המספר", quiet, back to the form with everything still in it, and
  "שליחת קוד חדש" behind its 60-second countdown, in ink-muted at full
  strength while it counts;
- a wrong code under the field ("הקוד שגוי או שפג תוקפו — נסו שוב או בקשו
  קוד חדש"), focus on the field.

**Not found and not taking customers on submit** (without the face): the
sign comes back holding the answer, as above. Neither is a toast or a line
under a form.

### 7.4 The card screen: shared by `/join` and the friend's join

The peak. One component (`JoinedCard`) for both joins; with it, the form
(`JoinForm`) and the code step (`CodeStep`) are written once and used by
both, where today `JoinPage` and `ReferralJoin` repeat all three.

- **The heading names the shop,** large (`type-title`, 28px): "הצטרפתם
  ל-{business}" for a new card; "הכרטיסייה שלכם ב-{business}" when the card
  comes back with stamps on it, or the friend's join says `already_member`.
  It takes focus, and a live region says it once with the count.
- **One line:** at zero, "{n} חותמות, ואז {reward}. מציגים את הכרטיסייה בקופה
  בכל ביקור."; with stamps, "יש לכם {have} מתוך {n} חותמות. עוד {left} עד
  להטבה: {reward}." Numbers in Rubik's tabular figures, isolated.
- **The pass, in the sign's light:** a lit field panel (32px corners) holding
  `PassStage`, the pass at exactly 300px; on a screen narrower than 340 the
  panel clips the pass's edges rather than squeeze it, as `WallpaperStage`
  does. It arrives with the activation ceremony (§7.13).
- **The name on the pass:** the typed name, or, with none, whatever Phase 3
  gives for "no name" (§7.10). Never "דנה לוי".
- **The wallet**, the coral button: a kit `LinkButton` to `wallet_pass_url`,
  "הוספה ל-Apple Wallet" on an iPhone, "הוספה ל-Google Wallet" on Android,
  "הוספה לארנק" elsewhere, from the same test `PassStage` uses.
- **While the pass is issued** (no link yet), the button's place holds:
  - a skeleton in the button's shape, breathing as the kit's `Skeleton` does
    (still under reduced motion), and "מכינים את הכרטיס לארנק. הכפתור יופיע
    כאן בעוד רגע." in Assistant, `role="status"`;
  - "בינתיים הקוד שעל הכרטיסייה כבר עובד בקופה." (the dropped "staff" put
    back as what is true: the code works at the counter);
  - the heading doesn't ask them to add it until the button exists;
  - it checks every 3 s (the same call); when the link comes, the button
    takes the skeleton's place and the live region says "הכרטיס מוכן
    לארנק"; after three minutes it stops and says "זה לוקח יותר מהרגיל. הקוד
    שעל הכרטיסייה עובד גם בלי הארנק." with "בדיקה שוב" (the same call).
- **Under it,** "אם הכרטיס ייעלם מהארנק, הוא תמיד כאן", an ink link to
  `/c/{serial}`: the page's reason for being, said.

### 7.5 `/c/:serial`: your card, again

Persuade's smallest page: someone who can't find their pass gets it back in
one move, and knows it's theirs.
- The slim row; then "הכרטיסייה שלכם ב-{business}" (`type-title`), the count
  line as in §7.4, the pass in its lit stage (lights on, 240ms: a return, not
  a ceremony), and the coral wallet button, named by the phone.
- **Waiting:** as §7.4, re-checking with the same call (§6).
- **Not found** (404): an `EmptyState` in the panel, "הקישור לא מוביל
  לכרטיסייה", and "סרקו את השילוט בקופה והצטרפו עם אותו מספר נייד: אם
  הכרטיסייה שלכם עדיין קיימת, היא תחזור עם החותמות שלה." True by §5.
- **Failed** (offline, 5xx): "לא הצלחנו לטעון את הכרטיסייה" with "נסו שוב"
  (the same call). Never "the card is gone" for a network fault.
- It still remembers the card in this browser on load.

### 7.6 `/p/:token`: four pages behind one QR

The same frame, the same slim row, and the server's view, decided as today.

**The friend's join** (program on): the sign of §7.3, which here always knows
the card, from `/api/p`.
- The sign's first line: "{name} מזמין/ה אתכם" when the owner allows a name,
  else "הוזמנתם"; then the shop (its mark from the card's colour and
  `logo_url`, its name and the card's), "{n} חותמות, ואז {reward}.", the
  promise and its cost, and "הצטרפות".
- Then `JoinForm`, `CodeStep` and `JoinedCard`, shared with `/join`.
  `referral_status` stays off the screen.
- At the foot, quiet: "עובדים ב-{business}? כניסה להחתמה", to `/login` with
  `from` set to this page. A staff member who scanned while signed out finds
  the stamp screen one sign-in away; nothing else on the page speaks to
  staff.

**The card's face** (program off): the shop's name as the page's `h1`; the
card's chip in its own colours (business and card); "אוספים {n} חותמות
ומקבלים: {reward}"; "קבלו כרטיסייה משלכם" (coral) to its `join_path`; the
staff door at the foot as above, or, signed in to another shop, "אתם
מחוברים, אבל הכרטיסייה הזו לא של העסק שלכם." "כרטיסיית נאמנות PunchMe"
goes: PunchMe signs at the foot. A shop not taking customers (the flag, §6)
shows no join button and says so.

**Your card** (this browser holds it): "זו הכרטיסייה שלכם ב-{business}";
the card's chip; "חברים שסורקים אותה מקבלים כאן כרטיסייה משלהם." while the
program is on; and "לפתיחת הכרטיסייה" (coral) to `/c/{serial}`.

**The stamp screen** (signed in as the shop's team): Scan's answer without
the camera. One thing to do, and the answer the loudest thing on the screen.
- **The head:** "{business} · {card}" (`type-label`, ink-muted); the `h1` is
  the customer's name (`type-title`, isolated), "לקוח/ה ללא שם" without one,
  and "כרטיסיית ההדגמה של {business}" on the owner's demo card, with no
  word about anyone's own preview.
- **The card as it stands:** the kit's `Figure` at `count` (64px Rubik 700,
  tabular, isolated: "4/8", no 40% slash) and its `StampRow`.
- **One action:** "הוספת חותמת", coral, 52px, in the thumb's reach. On a full
  card the gold light (`LitPanel light="full"`): the gift, "הכרטיסייה
  מלאה!", the reward (Assistant 600, 18px), and "מסירת ההטבה" as an ink
  button (the action on gold is ink).
- **The answer:** `ScanAnswer` from `routes/dashboard/scan/`, unchanged, with
  `inset={false}`, under the kit's `SnapFlash`. It takes the card's place and
  the button's while it holds (its own `HOLD_MS`; the clock pauses under a
  pointer or focus), then the card comes back as it now stands. Its states
  come from the answers as Scan builds them: stamped, the last stamp, already
  full (409 on a full card), cancelled (409 otherwise), too soon (429), not
  this shop's (404), redeemed, and failed with Scan's own causes
  (`failureCause`, `CAUSE_KEYS`), never the server's English. Their words are
  Scan's: "נוספה חותמת", "הכרטיסייה מלאה!", "מסירת ההטבה", "ההטבה נמסרה",
  "כבר הוחתמה", "סרקו שוב" (the staff scanned the pass to get here, and
  scanning it again is how a failed stamp is retried).
- **Sound and touch:** Scan's chime and buzz (`feedback.ts`), with Scan's
  own sound setting.
- **The live region** says the answer in words once, as Scan's does: "נוספה
  חותמת: 5 מתוך 8. עוד 3 להטבה."
- At the foot, quiet: "לסורק", to `/dashboard/scan`.

**Not found and failed:** an `EmptyState` with a heading; the failure with
"נסו שוב" (the same call).

### 7.7 `/login`

- `PublicTopBar`; one lit panel (24px corners), the column's width on a
  phone and at most 26rem, centred, from 640px.
- `h1` (`type-title`, focused on load): "ברוכים השבים", or "יצירת חשבון";
  under it "היכנסו ללוח הבקרה שלכם." or "ואז מעצבים כרטיסייה — בחינם.".
- `AuthFields` (restyled, §7.9); in sign-up mode the password's hint "לפחות
  8 תווים." is shown before anything is pressed.
- A failure is a kit `Notice` (danger) over the button, `role="alert"`, in
  the page's words (§8): 401 "האימייל או הסיסמה לא נכונים. נרשמתם עם Google?
  היכנסו עם הכפתור של Google."; 422 "הסיסמה חלשה מדי: לפחות 8 תווים, לא רק
  ספרות, ולא סיסמה נפוצה או דומה לאימייל."; the 409, the throttle and an
  unreachable API as today.
- The coral `Button` (lg, busy): "כניסה" or "יצירת חשבון".
- `AuthAlternatives` (restyled, §7.9).
- Under the panel: "חדשים כאן? מעצבים קודם את הכרטיסייה — בחינם", a
  secondary `LinkButton` to `/onboarding`.

### 7.8 `/invite/:token`

The invitation leads, then the account.
- `PublicTopBar`; one lit panel.
- **The invitation:** `h1` "{business} מזמינים אתכם לצוות" (the shop
  isolated); the role as a neutral `Badge` ("עובד/ת", "מנהל/ת"); what it
  opens (`team.roleBody.*`); "בתוקף עד {date}" from `expires_at`, in
  Hebrew's day and month; and for a named invitation, "ההזמנה נשלחה
  ל-{email}" with only the address isolated left to right, so the "ל" stays
  with the Hebrew.
- **Signed out:** `AuthFields` in sign-up mode, the coral "פתיחת חשבון
  והצטרפות" (or "כניסה והצטרפות"), and `AuthAlternatives`.
- **Signed in:** "מחוברים בתור {email}." (isolated), the coral "הצטרפות
  לצוות", and quiet under it "לא אתם? כניסה עם חשבון אחר", which signs out
  (§6) and shows the sign-in form, the invitation still above it.
- **A refusal on accepting:** a `Notice` (danger) in the panel, in the page's
  words; for the wrong address it names the invited one (masked) and offers
  the switch.
- **A dead link:** the panel says why and what to do: "בקשו מבעל/ת העסק
  קישור חדש." for revoked, expired or unknown; for one already used,
  "אם זה הייתם אתם, פשוט היכנסו." with "כניסה" (a secondary `LinkButton` to
  `/login`).

### 7.9 The parts shared with onboarding

`/login` and `/invite` share five parts with the wizard, which Phase 4
redesigns after this phase. Running first, Phase 8 decides them. The rule
that decides each: a part restyled in place changes every wizard screen that
uses it, and "plan no changes to onboarding's own pages" allows that only
where the change is small, inside the account step, and checked.

| Part | The wizard uses it in | Decision | Why |
|---|---|---|---|
| `useEmailPasswordAuth` | The account step | **Keep it shared; fix it in place.** 401 and 422 get the page's own sentences (§7.7), never the server's English; the mode toggle, the 409 switch that keeps the email, and the Google path stay | It has no look. The account step gains the same fix; step B checks its errors in both languages |
| `AuthFields` | The account step | **Restyle in place,** on the kit: two `Input`s (48px, Field Edge 3.35:1, labels above in Assistant 600, the kit's ink outline), the password's rule as a hint in sign-up mode, `autoComplete` and `dir="ltr"` kept. It wraps itself in `theme-lightbox`, because the kit's field tokens (`--c-field`) exist only in that scope | Today's edge is 1.57:1, under the 3:1 a field's edge needs. Inside the wizard it becomes a small Lightbox island in the old panel until Phase 4 moves the rest; step B checks the account step at 375 and 1280 in both languages |
| `AuthAlternatives` | The account step | **Restyle in place,** in the same scope: the toggle as an ink link on a 44px target, the "או" divider in hairline, and the Google button in a box that follows the page's direction, at the column's width up to 320px | The forced `dir="ltr"` box reverses the Hebrew label, and the 320px button overruns a 309px column at 375 |
| `StepShell` | All eight steps | **Leave it to the wizard.** `/login` and `/invite` stop using it and build their form from the kit (`LitPanel`, a heading that takes focus, `Button`, the kit's errors), for Phase 4 to adopt or not | Restyling it restyles all eight steps, which is Phase 4's whole job |
| `TopBar` | `OnboardingLayout`, every step | **Leave it to the wizard.** The sign-in pages get `PublicTopBar`, on the kit, for Phase 4 to adopt | It heads every wizard screen |

So Phase 4 inherits two kit-built pieces it can take (`PublicTopBar` and the
sign-in panel's pattern) and three shared parts already on Lightbox.
Onboarding's own files are not edited; the account step changes only through
`AuthFields`, `AuthAlternatives` and `useEmailPasswordAuth`.

### 7.10 What the public pages need from Phase 3

Phase 3 owns `src/components/card-studio` and `src/components/wallet-card`
and is building at the same time. The public pages change nothing there, and
need four things from them:

1. **The exports and props stay:** `AppleCardPreview`, `GoogleCardPreview`,
   `type PreviewPlatform` and `type CardPreviewValue` from
   `card-studio/CardPreviews.tsx`, with the props `publicCard.ts` fills
   (`businessName`, `cardName`, `stampsRequired`, `currentStamps`,
   `rewardDescription`, the three colours, `design`, `serial`,
   `barcodeMessage`, `holderName`, `logoUrl`, `appleLogoUrl`, `stripStates`,
   `heroStates`). `PassStage` and `publicCard.ts` import nothing else from
   either folder.
2. **A pass with no name, or a name the page can't know.** Both previews
   print `holderName || SAMPLE_NAME`, so a customer's own card reads "דנה לוי"
   on every `/c` (the public card carries no name) and after any join where
   the optional name was left blank. The public pages need a way to say "no
   name here" that prints what the real pass prints, or nothing. Which one is
   Phase 3's to decide; the backend's English "Member" (§5) is outside both
   phases (§10). Until it lands, step B passes the typed name where there is
   one, and nothing where there isn't, and records the sample name as known.
3. **The 300px slot.** The previews are fluid and built for 300px; today the
   public frame hands them 295px at 375 and 240px at 320. The public stage
   gives them exactly 300px and clips its own edges below 340px, as the kit's
   `WallpaperStage` does. Nothing in the previews changes for that.
4. **StampGrid's glyph ink, as Phase 3 fixes it.** The public pages show
   `StampGrid` only when the published strip doesn't load, and take the fix
   as it lands.

### 7.11 The bundle

Every route ships in one 1,026 kB entry script today (314 kB gzipped), so a
stranger at a counter downloads the dashboard, the wizard, the card studio
and admin before `/join` can draw a field.

- **`main.tsx` loads the dashboard, the wizard, admin and the billing return
  pages on demand,** with the router's own `lazy`, the way it already loads
  `/style-guide`. Every route keeps its path and its element; no call
  changes.
- **The entry keeps** the router, the session and i18n. Whether the landing
  page and the five public pages stay in it or load on demand too is step
  B's to measure, so that neither `/` nor `/join` waits on the other's code.
- **Its own commit,** measured before and after with `vite build`, and
  checked on every page group: the landing page, the wizard from its first
  step to billing, every dashboard page by role, admin, the two billing
  returns, and the installed app (`src/pwa`) opening the dashboard.
- A route that loads on demand shows nothing for the moment its code
  arrives; step B gives the dashboard's and the wizard's groups the frame's
  own loading state, so a slow phone sees the frame, not a blank page.

### 7.12 Colour, type and states

- **Ground and light:** the wall (`#f6f2eb`); lit acrylic panels; the field
  light (Bright Light at the centre to Edge Light) for the sign and the
  card's stage, as the landing hero uses it; the band (Panel Light to Deep
  Light) for the shop's line once the sign gives way.
- **Coral, once a screen:** "הצטרפות"; the form's send; "אישור והצטרפות";
  the wallet; "הוספת חותמת"; "כניסה"; the invitation's join. Never text, never
  a wash.
- **Ink:** links (underlined), "מסירת ההטבה" on gold, the stamps.
- **The answers** are the kit's lights, through `ScanAnswer`: punched, full,
  the refusal's Panel Light, failed. No ok, warn or danger washes anywhere.
- **Type:** Rubik 500 for the sign's heading (the headline, 32px at 375)
  and the titles (28px); Assistant for the rest, at 17px and 1.7 for the
  notice's Hebrew; labels Assistant 600 at 14px; every number Rubik with
  tabular figures and its own direction. Nothing under 13px but the pass's
  own labels.
- **Contrast:** every pair is a kit token, already measured; the card's chip
  carries the card's own foreground on its own background, the owner's pair
  as the pass carries it.
- **Card codes and the SMS code** may be IBM Plex Mono; nothing Hebrew is.

### 7.13 Motion (for step C)

- **The card's arrival:** the activation ceremony DESIGN.md keeps for one
  moment, the stage's light going from unlit to lit in 600ms, once, the pass
  settling with it (no rotation). With reduced motion, a 150ms fade at full
  light, no travel.
- **The sign giving way to the form:** lights on (240ms, at most 8px of
  travel), mirrored in Hebrew; with reduced motion, a 150ms fade.
- **The stamp screen:** Scan's snap through `ScanAnswer` and `SnapFlash`,
  with their own reduced-motion stand-ins.
- **Waiting:** the skeleton's slow breath, still under reduced motion. No
  pulse on text, anywhere.
- `/c`'s pass: lights on, 240ms.

## 8. Copy

In both languages, through `t()`. The Hebrew speaks to the reader in the
plural and writes people with slash forms, and uses the glossary's חותמת and
הטבה throughout. The legal pair (`enroll.privacyNotice`,
`enroll.privacySummary`, `enroll.marketingOptIn`) doesn't change.

| Where | Hebrew | English | Today |
|---|---|---|---|
| `/join`, the sign | "כרטיסיית הנאמנות, בארנק של הטלפון" | "Your loyalty card, in your phone's wallet" | "הצטרפות לכרטיסיית הנאמנות" |
| The sign, with the face | "{count} חותמות, ואז {reward}." | "{count} stamps, then {reward}." | none |
| The sign, without it | "חותמת בכל ביקור, והטבה כשהכרטיסייה מלאה." | "A stamp every visit, and a reward when the card is full." | none |
| The promise | `standee.noApp` | `standee.noApp` | none |
| The cost | "רק מספר נייד וקוד ב-SMS." / "רק מספר נייד." | "Just your mobile number and an SMS code." / "Just your mobile number." | none |
| The sign's button | "הצטרפות" | "Join" | none |
| Under the sign | "חותמת בכל ביקור, ישר לכרטיסייה שבארנק." | "A stamp every visit, straight onto the card in your wallet." | none |
| Dead link | "הקוד הזה כבר לא מוביל לכרטיסייה" / "בקשו מהעסק את הקוד העדכני." | "This code no longer leads to a card" / "Ask the shop for its current code." | "כרטיסיית הנאמנות הזו כבר לא זמינה" |
| Not taking customers | "{business} עוד לא מצרפים לקוחות חדשים לכרטיסייה." / "כבר יש לכם כרטיסייה כאן? קבלו אותה שוב" | "{business} isn't taking new members yet." / "Already have a card here? Get it back" | "העסק הזה לא קולט לקוחות חדשים כרגע" |
| The form's heading | "הצטרפות לכרטיסייה" | "Join the card" | none |
| Phone | "מספר נייד" | "Mobile number" | "מספר טלפון נייד" |
| Name, its hint | "שם (לא חובה)" / "כך הוא יופיע על הכרטיסייה." | "Name (optional)" / "It's how the card will show it." | no hint |
| Birthday | "תאריך לידה (לא חובה)" / "רק בשביל הטבת יום הולדת. אפשר להצטרף גם בלי." | "Birthday (optional)" / "Only for a birthday treat. You can join without it." | "(רשות)", "נועד אך ורק…" |
| Under the send | "נשלח קוד בן 6 ספרות למספר הזה." | "We'll text a 6-digit code to this number." | none |
| Empty phone | "צריך מספר נייד כדי להצטרף." | "A mobile number is needed to join." | the browser's bubble |
| Offline | "אין חיבור. בדקו את הרשת ונסו שוב." | "No connection. Check the network and try again." | "משהו השתבש" |
| The code's heading | "הזינו את הקוד" | "Enter the code" | "הזינו את קוד האימות" |
| The card, new | "הצטרפתם ל-{business}" | "You're in at {business}" | "הכרטיסייה מוכנה! הוסיפו אותה לארנק" under "הצטרפתם אל {business}" |
| The card, returning | "הכרטיסייה שלכם ב-{business}" | "Your card at {business}" | "כבר יש לך כרטיסייה כאן — הנה היא" |
| The line, at zero | "{count} חותמות, ואז {reward}. מציגים את הכרטיסייה בקופה בכל ביקור." | "{count} stamps, then {reward}. Show the card at the counter every visit." | none |
| The line, with stamps | "יש לכם {have} מתוך {count} חותמות. עוד {left} עד להטבה: {reward}." | "You have {have} of {count} stamps. {left} more to the reward: {reward}." | none |
| The wallet | "הוספה ל-Apple Wallet" / "הוספה ל-Google Wallet" / "הוספה לארנק" | "Add to Apple Wallet" / "Add to Google Wallet" / "Add to wallet" | `wallet.addApple` "הוספה לאפל ווליט", unused |
| Waiting | "מכינים את הכרטיס לארנק. הכפתור יופיע כאן בעוד רגע." / "בינתיים הקוד שעל הכרטיסייה כבר עובד בקופה." | "Getting your pass ready. The button will be here in a moment." / "Meanwhile the code on the card already works at the counter." | `wallet.pending` in monospace; `enroll.scanMeanwhile` |
| Ready, and slow | "הכרטיס מוכן לארנק" / "זה לוקח יותר מהרגיל. הקוד שעל הכרטיסייה עובד גם בלי הארנק." | "Your pass is ready" / "This is taking longer than usual. The code on the card works without the wallet too." | none |
| To `/c` | "אם הכרטיס ייעלם מהארנק, הוא תמיד כאן" | "If the pass goes missing from your wallet, it's always here" | "הכרטיסייה שלכם" |
| `/c`, not found | "הקישור לא מוביל לכרטיסייה" / "סרקו את השילוט בקופה והצטרפו עם אותו מספר נייד: אם הכרטיסייה שלכם עדיין קיימת, היא תחזור עם החותמות שלה." | "This link doesn't lead to a card" / "Scan the sign at the counter and join with the same mobile number: if your card still exists, it comes back with its stamps." | `enroll.notFound` |
| `/c` and `/p`, failed | "לא הצלחנו לטעון את הכרטיסייה" / "נסו שוב" | "We couldn't load the card" / "Try again" | "משהו השתבש… נסו שוב." with nothing to press |
| The friend's sign | "{name} מזמין/ה אתכם" / "הוזמנתם" | "{name} invited you" / "You've been invited" | "{name} הזמין/ה אותך", "הוזמנת להצטרף" |
| The reward line | "אוספים {count} חותמות ומקבלים: {reward}" | "Collect {count} stamps and get: {reward}" | "…ניקובים…" |
| The staff door | "עובדים ב-{business}? כניסה להחתמה" | "Working at {business}? Sign in to stamp" | "עובדים אצל {business}? התחברו כדי להוסיף ניקוב" |
| Your card | "זו הכרטיסייה שלכם ב-{business}" / "לפתיחת הכרטיסייה" | "This is your card at {business}" / "Open your card" | "זו הכרטיסייה שלך", "לפתוח את הכרטיסייה שלי" |
| Stamp screen | Scan's keys (`dashboard.scan.result.*`); "הוספת חותמת"; "לקוח/ה ללא שם"; "כרטיסיית ההדגמה של {business}"; "לסורק" | Scan's keys; "Add a stamp"; "A customer with no name"; "{business}'s demo card"; "To the scanner" | `publicCard.stamp.*` (ניקוב, פרס, "זו כרטיסיית התצוגה המקדימה שלכם") |
| `/login`, 401 | "האימייל או הסיסמה לא נכונים. נרשמתם עם Google? היכנסו עם הכפתור של Google." | "That email or password isn't right. Signed up with Google? Use the Google button." | the server's English |
| `/login`, 422 | "הסיסמה חלשה מדי: לפחות 8 תווים, לא רק ספרות, ולא סיסמה נפוצה או דומה לאימייל." | "That password is too weak: at least 8 characters, not only digits, and not a common one or one like your email." | the server's English |
| Sign-up's hint | "לפחות 8 תווים." | "At least 8 characters." | none |
| `/invite`, heading | "{business} מזמינים אתכם לצוות" | "{business} wants you on the team" | "…רוצים אותך בצוות" |
| `/invite`, expiry | "בתוקף עד {date}" | "Valid until {date}" | none |
| `/invite`, named | "ההזמנה נשלחה ל-{email}" (the address alone isolated) | "This invite is for {email}" | the whole line left to right |
| `/invite`, switch | "לא אתם? כניסה עם חשבון אחר" | "Not you? Use another account" | none |
| `/invite`, dead | "בקשו מבעל/ת העסק קישור חדש." / "אם זה הייתם אתם, פשוט היכנסו." with "כניסה" | "Ask the owner for a new link." / "If that was you, just sign in." with "Sign in" | no link |
| Foot | `standee.poweredBy` | `standee.poweredBy` | none |

**Titles** (`document.title`, "… — פאנץ' מי"): "הצטרפות לכרטיסייה", then
"הכרטיסייה שלכם ב-{business}"; "הכרטיסייה שלכם"; "הזמנה לצוות של
{business}"; "כניסה"; and on the stamp screen "חותמת ל-{name}".

**Keys that go:** `enroll.title`, `enroll.phoneLabel`, `auth.submitting`
(nothing reads them), and the `publicCard.stamp.*` keys the stamp screen no
longer reads, once nothing does.

## 9. What step B keeps, touches and checks

**Touches:**
- `src/routes/public/`: `JoinPage.tsx` and `ReferralJoin.tsx` onto the
  shared `JoinSign`, `JoinForm`, `CodeStep` and `JoinedCard`;
  `CardStatusPage.tsx`; `PublicCardPage.tsx`; `PassStage.tsx` (the 300px
  stage, the arrival); `publicCard.ts` (the name); the new `PublicPage` and
  `PublicTopBar`.
- `src/routes/auth/LoginPage.tsx`, `src/routes/invite/InvitePage.tsx`.
- `src/components/auth/AuthFormParts.tsx` and `useEmailPasswordAuth.ts`, in
  place (§7.9).
- `src/main.tsx`, for the bundle only (§7.11), as its own commit.
- `index.html`, if the pre-paint plan needs it (§7.2).
- `src/i18n/locales/{en,he}/common.json`, together, per page (§8).

**Keeps,** from `docs/public-pages.md`: the routes, every call and the three
added ones, the legal pair word for word, the code step's switch, the
redirects, the invalidation, `rememberHeldCard`, the device id, and the pass
staged and never redrawn.

**Doesn't touch:** `src/api`, `src/auth`, `src/hooks`, `src/config`,
`src/lib`; `src/components/card-studio`, `src/components/wallet-card` and
`src/components/wallet-actions`; onboarding's pages, `StepShell` and
`TopBar`; `routes/dashboard/scan/` (imported only).

**Checks,** beyond CLAUDE.md's six:
- **Both languages at 375, 1280 and 320** (the pass's clip), the sign in
  Hebrew first.
- **Onboarding's account step,** signed out, at 375 and 1280 in both
  languages, with its errors: it shares `AuthFields`, `AuthAlternatives` and
  `useEmailPasswordAuth`.
- **Every page group after the bundle split** (§7.11).
- **The join's states:** codes on and off (a build with
  `VITE_OTP_REQUIRED` each way), a Free shop (with codes on it must say "not
  taking customers"), a dead link, a returning phone, a wrong code, the
  throttle, offline, the wallet still issuing and then slow.
- **The stamp screen as staff, manager and owner;** a full card; the owner's
  demo card; every answer by a wrapped `fetch` rather than real stamps.
- **`/p` signed out with the program on and off,** and signed in to another
  shop; remember that a signed-out load with the program on records a
  referral click.
- **`/invite`:** pending open and named, signed out and signed in, the
  switch, each refusal, each dead state.
- **The legal keys unchanged:** a diff of the three in both files.
- **Pacing:** the API allows 30 anonymous requests a minute per address,
  shared with any other session; pace full loads.

## 10. Open questions for Roee

1. **The shop's face, as the backend's to build** (§6, decision 2). Proposed
   shape, for the backend session to settle: `GET /api/join/{template_id}`,
   public, throttled like `/api/cards`, returning `business_name`,
   `template_name`, `stamps_required`, `reward_description`, the three
   colours, `logo_url` and `accepting_new_customers`; the same flag added to
   `/api/p/{token}`. A dead or inactive design answers 404, as `/api/p` does.
2. **"Member" on the real pass.** A customer who gave no name gets a pass
   that says "Member" in English, on a Hebrew card too (§5). Should a Hebrew
   card say "חבר/ה" (or "לקוח/ה"), or nothing? The answer sets what Phase 3's
   preview prints for "no name" (§7.10).
3. **The Google button's language.** It follows the browser, not the app,
   because `GoogleAuthButton` passes no `locale`; the fix is one prop in
   `src/auth`, which the redesign freezes. An exception, or leave it outside
   the redesign?
4. **Password recovery** doesn't exist anywhere, and an owner who forgets
   has no way back and no one to ask on screen (no page carries the WhatsApp
   number yet). Outside this phase; worth a line on the backend's list?

## 11. Left for other phases, and outside the redesign

**Other phases:**
- **Phase 3, the card studio:** the four lines of §7.10.
- **Phase 4, onboarding:** `PublicTopBar` and the sign-in panel to adopt or
  not; the account step's Lightbox island (§7.9) to fold into its own
  redesign; and `docs/onboarding-flow.md`'s "a hire can land in the wizard",
  which `/login`'s draft check still allows.
- **Phase 9, the landing page:** its "Sign in" links land on the new
  `/login`.
- **Phase 10, cleanup:** `WalletAddButtons` (still used by
  `/dashboard/design`), and the old sets the public pages stop using.

**Outside the redesign:**
- **The backend:** the shop's face and its flag (§10, 1); "Member" (§10, 2);
  a `code` on each 401, so a wrong password and a Google-only account can be
  told apart in words; password recovery (§10, 4).
- **`src/auth`:** the Google button's `locale` (§10, 3).

## 12. Review notes for step B

Roee approved the brief as written on 27 Oct, so step B builds §7 to §9 as
they stand, their stand-ins included: the sign without the shop's face
until the backend gives it (§7.3), and the sample name on a nameless pass,
recorded as known, until Phase 3's "no name" lands (§7.10). §10's four
questions stay open: the shop's face, "Member" on the real pass, the Google
button's language, and password recovery. The critique snapshots in
`.impeccable/critique/` are committed with this note, for step D's
`/impeccable polish`.

**After step B** (27 Oct, for steps C and D). Built as §7 to §9 say, in
twelve commits from `3f0ed7f` to `a8d6660`, each page checked in both
languages at 375 and 1280 (320 where the pass stands) in headless Chrome,
with focus, the keyboard path and 200% text there; then five more from a
code review of the whole branch, `6a8bc07` to `871c9c0` (below). Two real
writes: one join with a new number on Demo Coffee through `/join` (named
"בדיקת שלב 8") and one stamp on that card, as staff (now 1/8); one
signed-out load of a Coffee `/p` recorded one referral click. Every other
answer came from a wrapped `fetch`. Where step B departed or decided, for
the review to overturn:
- **Google's button** (§7.9, §10.3 answered): Roee allowed the phase's one
  change to `src/auth`, two optional props on `GoogleAuthButton`. Its
  label takes the language Google's script loads in (its `hl`);
  `renderButton`'s own `locale` does nothing there, so the script reloads
  in the page's language when it changes, taking only `google.accounts`
  with it. Google's "initialize() is called multiple times" console line
  on each re-mount is Google's and stays.
- **The card screen's live region** (§7.4) keeps to what changes after the
  heading's focus has read the arrival out: the button arriving, the slow
  line.
- **A full card coming back** says "הכרטיסייה מלאה: {reward} מחכה לכם
  בקופה." (§8 had no line for it).
- **"Not taking" and "dead" without the face** come back on the sign on
  submit; "כבר יש לכם כרטיסייה כאן? קבלו אותה שוב" waits for the flag.
  `/join` says `enroll.upgradeRequired`, reworded, having no shop name;
  the friend's join names the shop.
- **No motion of its own** (§7.13 is step C's): the 800 ms rotate went, so
  the pass appears in place; only the kit's motion came along (the
  skeleton's breath, the sheet, the press, Scan's snap).
- **The pass's stage reaches into the gutter** on a phone, as `OwnPass`
  stands its wallpaper, so the pass keeps its 300px at 320.
- **Titles §8 left open:** the friend's join "הצטרפות לכרטיסייה", the face
  the shop's name, your card and `/c` "הכרטיסייה שלכם ב-{business}".
- **Signed in to another shop on the friend's join**, the foot says the
  face's "not your shop" line instead of offering a sign-in.
- **The Referrals settings' picture of the friend's join**
  (`ReferralSettings.tsx`) reads `publicCard.join.invitedBy`,
  `.join.invited` and `.card.reward` through `t()`, so those keys stay plain
  strings with their variables, in the page's new words; the face has its
  own tagged `publicCard.card.collect`, and the friend's sign isolates the
  name with the dashboard's `isolate()`.
- **The stamp screen** reads a 409 from the page's own data (cancelled when
  it says so, else full), where Scan looks the card up by serial; its
  spoken line is Scan's `speak()`, copied because `ScanPage.tsx` is left
  alone (Phase 10 can share it).
- **`/p`'s missing card** keeps its own words ("ייתכן שהוסרה, או שהקישור
  שגוי."), not `/c`'s, which tell someone to rejoin.
- **`AuthFields`'s `idPrefix`** is unused now (the kit's `Field` ties
  labels) and kept, because the account step passes it.
- **The copy test** covers `auth`, `invite`, `enroll`, `wallet` and
  `publicCard`, the word joiner rule included.
- **The bundle** (§7.11): the landing page loads on demand as well; the
  five public pages stay in the entry so `/join` draws after one script
  (the numbers are in `92ab4f1`). Vite's `preloadError` reloads a tab left
  open across a release, once.
- **Other people's text breaks where it must** (`a8d6660`): shop, card and
  customer names and addresses wrap anywhere rather than widen the page,
  and the full-width buttons wrap a long label, found at 200% text on
  `/invite`.

The code review read the branch whole and found what the page-by-page
checks hadn't. Each is fixed in its own commit and checked in headless
Chrome, with the group's code held back where the bug lived in that wait:
- The ways into the dashboard and the wizard (signing in on `/login`, the
  redirect for an account with no business, `/billing`'s forward) drew a
  blank page while their code arrived, and `/invite`'s accept could be
  pressed again in that wait. They hold the screen now, and `/login` and
  `/invite` start that code on its way early (`871c9c0`).
- "Not you?" read the invitation again after the sign-out (`e5f6dcf`).
- The wallet wait also read the card on focus and reconnect, and `/c`
  opened just after a join showed the cached card unread (`10c7075`).
  `/c`'s own read still comes again on focus once 30 s old, as it always
  has.
- A code refused while the form shows said nothing (`559bc58`).
- Two quick language switches could leave Google's button in the old one
  (`6a8bc07`).

Left for step C: §7.13 as written: the card's activation, the sign giving
way to the form (mirrored), `/c`'s pass lighting on.

Left for step D:
- The Referrals settings still draw the old friend's join (the reward line
  and a gradient button) where the page now opens on the sign. It is
  Phase 6's page; its picture should follow the sign.
- A nameless pass prints the renderer's sample name, "דנה לוי", on every
  `/c` and after a join without a name: Phase 3's (§7.10), as known.
- The service worker's caching of the new chunks, and the reload on a
  missing chunk, run only in a production build: check them on one.

Outside the redesign, unchanged: the shop's face and its flag (§10.1),
"Member" on the real pass (§10.2), a `code` on each 401, password recovery
(§10.4). §11's `src/auth` line is done (above). Three test files are new
(`authErrors`, `joinRules`, `wallet`): the suite is 39 files and 451 tests.

**After step C** (27 Oct, for step D). §7.13 built in three commits,
`6c02daa` to `546ebca`, and the phone layouts in three more, `ae30ed8` to
`923a4ef`. `/find-animation-opportunities` kept §7.13's list and added
nothing to it. It rejected the sign lighting on at page load, the stamp
screen's card coming back after the answer, the wallet button replacing
its skeleton, a shake on a wrong code, and `/login`'s and `/invite`'s
swaps. Every change was checked in headless Chrome over CDP, in Hebrew
and English at 375 and 1280 and at 320 where the pass stands, with
reduced motion off and on, reading `document.getAnimations()`. Roee
approved the plan and its departures; where step C departed from the
brief:
- **The join's steps** (§7.13's "the sign giving way to the form") all
  arrive the same way, not only the first. Going forward (sign to form,
  form to code), the new step comes in from the end edge; going back
  ("Edit number", a refused phone, the sign coming back holding an
  answer), from the start edge. Each step is lights on, 240ms, 8px,
  mirrored through `--kit-dir`; with reduced motion, a 150ms fade. The
  friend's join's band moved into `JoinSteps`, so it arrives once with
  the form and holds still under the code. `stepDirection` in
  `joinRules.ts` is tested.
- **The activation** warms smoothly, not with the shop sign's tube catch:
  - the stage stands unlit, as the wall with a hairline edge, and its light
    comes up behind the pass over 600ms, linear;
  - the pass's slot settles 8px on the ease-out, with no beat before it;
  - the words and the wallet's place come up in 240ms where they stand.
  The wall is held in `--unlit` outside the stage, where `.theme-lit`
  makes `background` the lit panel's colour.
- **`/c`'s pass** is `LitPanel`'s own `arrive`, after the skeleton.
- **The stamp screen and the waits** needed nothing: Scan's snap (flash
  220ms, settle 180ms, the stamp 240ms after 60ms) and its stand-ins
  (a 0.3 glow, a 150ms fade, the stamp at its size) play as they do on
  Scan, and the skeleton breathes and holds still under reduced motion.
  No looping animation sits on text.
- **The phone:**
  - the tap highlight is off for the whole frame, so the ink links and the
    notice's row no longer flash; the row and the top bar's mark gained a
    press of their own;
  - a long press selects no button's words;
  - the frame is `min-h-svh`, not §7.2's `dvh`, so a centred sign holds
    still while the address bar slides away;
  - the code field's return key says "done".

  The fields were already 16px, with the right keyboards, and the pages
  stay letterboxed in the wall rather than under the notch.
- **No real writes.** Every join, code, stamp and redeem was answered by
  a wrapped `fetch`. The signed-out `/p` loads were wrapped too, so no
  referral click was recorded. The stamp screen ran signed in as the
  demo staff. The step-B test card reads 5/8 now (it was 1/8); none of
  those stamps came from step C.

Left for a phone: the tap flash and the long press, the sign holding
still as the bar slides, the code key's label and the SMS code's
suggestion. Desktop Chrome reports no tap highlight by default and has
no address bar, so none of them shows there.

Left for step D, unchanged: the Referrals settings' picture of the
friend's join, the sample name on a nameless pass, and the service worker
on a production build. The suite is 39 files and 454 tests.

**After step D** (29–30 Oct, for the review). Twenty commits, `e7f0dd0`
to `730b591`, each checked in headless Chrome over CDP in Hebrew and
English at 375 and 1280, and at 320 where the pass stands.

- **The motion review** step C skipped (`review-animations`, read and
  applied as written to step C's motion) blocked on four findings and
  approved once they were fixed: the pass faded on the ceremony's 600ms
  clock and was still see-through at 150ms, so it now lights on in
  240ms and only the stage's light keeps the 600ms (`e7f0dd0`); after a
  scrolled form the card arrived with its heading above the screen, so
  every step now opens at the top (`26f9a54`); `/c`'s stage lit on 46px
  under its skeleton, so the skeleton takes the card screen's rhythm
  (`8e43a75`); the top bar's mark pressed with no transition
  (`4118d07`). Considered and kept: the light's linear 600ms (the
  ceremony, once), the words' fade (it keeps the switch from being a
  cut), and no stagger (the light is the peak; a cascade would compete).
- **Harden**, worst-case data through a wrapped fetch (names at the
  API's limits, a 200-character reward, 12 stamps, long addresses,
  offline, 404, 5xx, 429): no overflow, clipping or text under 13px at
  320, 375 or 1280. What it found, fixed: a birthday the API refuses,
  a bare 429 and a down SMS service all read "something went wrong",
  and a name past 120 characters was a 422 (`be1f20b`); Hebrew `_two`
  printed "2 חותמות" and the countdown jittered (`8acb6cc`); a full
  card's reward was clamped to two lines and "לסורק" was 37px wide
  (`53cd55c`); shop names in tab titles weren't isolated (`9e123d0`);
  a Google button that can't load put "Something went wrong signing
  in" over an untouched form, on `/login`, `/invite` and the account
  step (`ff475c4`); a sign-up address with no domain made an account
  no one could recover (`ac98bb0`); any failed read of an invitation
  called the link dead (`751d1b1`).
- **Adapt** at 375: the countdown lost its spaces inside the resend
  link's flex box (`69b8e0c`); the customer pages' language switch sat
  in a wide window's corner, away from their column (`03abc56`); the
  birthday takes the phone's autofill (`a82cfdb`).
- **Clarify**: an invalid phone says what one is; the code throttle's
  "wait a moment" could be an hour, and says so (`4998ac9`). The Hebrew
  invitation said it was "sent" to an address, and nothing is ever
  sent; a failed read names its cause only when it is known
  (`f56bad0`).
- **Polish**, with the critique snapshots: every P1 and P2 they list
  was closed by steps B to D; the last open P1 was the sample name.
  The detector's one real finding, a wrapped label with 2.5px above and
  below it, is fixed on this phase's buttons (`c05f27b`).
- **The detector** (`npx impeccable detect`, 4.8.0): the file scan of
  the four folders finds nothing; the live scan over CDP finds
  `cream-palette` (the wall, Lightbox's own), `bounce-easing` (the
  stamp's overshoot, the product's one gesture) and `organic-clip-path`
  (Google's own "G"), all kept on purpose, and `cramped-padding`, fixed.
- **§12's three items:** the Referrals settings draw the sign now,
  small, in the card's language (`ad3843a`); a nameless pass prints
  nothing, from `publicCard.ts`, with the previews untouched
  (`fb30b0a`; "Member" against nothing is still §10.2's); and on a
  production build the worker kept the SPA's `index.html` under a
  missing chunk's name, for good, so a route stayed broken in that
  browser after the file came back. It no longer keeps an HTML answer
  under `/assets/`, and its cache is renamed so the next activation
  clears any such entry (`730b591`). The rest held: `/join` draws from
  the entry chunk alone, the chunks `/login` starts are cached, a tab
  left across a release reloads once, and `/join` opens offline.

Checked as well: the stamp screen as staff, manager and owner, signed
in for real (a member's read records no referral click); another
shop's owner on a Coffee pass; an invitation signed out and signed in,
its wrong-account refusal and the switch; the wizard's account step,
which shares the sign-in parts; the keyboard path through the join and
the stamp screen; reduced motion. The console carries only the session
check's 401s on `/api/auth/me` at a signed-out boot (`src/auth`, as
step A measured). No real writes: every join, code, stamp, redeem and
accept was answered by a wrapped fetch.

Found and left:
- The kit's button sizes have no vertical padding, so any label allowed
  to wrap fills its pill; fixed here per call site, but the cause is the
  kit's, for every redesigned page.
- The code request's cap of 10 an hour per address can turn customers
  away on a busy shop's shared Wi-Fi (the backend's).
- `enroll.submit`, "Add to my wallet", shows only with codes off and
  joins rather than adds; production has codes on.

Left for a phone (`npm run dev:phone`; the SMS needs codes on):
1. No grey flash under a finger on the sign's button, the privacy row
   or a link, each showing its own press; a long press selects no
   button's words, while the page's text still selects.
2. On `/join`, the sign holds still while the address bar slides away
   and back.
3. The code field's return key says "Done" on Android; iOS's number pad
   has none.
4. A real SMS code is offered above the keyboard, and taking it joins
   by itself at six digits.
5. The birthday offers the phone's own; the picker offers no day from
   today on.
6. With the keyboard up, scroll the form to its button and send: the
   card opens at its top, heading first.
7. The wallet button names the phone's wallet, Apple or Google.

The suite is 47 files and 586 tests.
