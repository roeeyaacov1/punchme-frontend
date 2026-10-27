---
target: /login (Phase 8 step A)
total_score: 26
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 1
target_identity: "file:C:\\Users\\roeey\\Projects\\punchme-frontend\\.claude\\worktrees\\trusting-knuth-44be37\\src\\routes\\auth\\LoginPage.tsx"
target_fingerprint: "sha256:c9b0bb3b38101111d0a7849ca9cbd4ee5c2684eade3f5f32ef473d2430175e72"
target_path: "C:\\Users\\roeey\\Projects\\punchme-frontend\\.claude\\worktrees\\trusting-knuth-44be37\\src\\routes\\auth\\LoginPage.tsx"
timestamp: 2026-10-27T01-26-47Z
slug: src-routes-auth-loginpage-tsx
---
Method: dual-agent (A: design review · B: detector and measurements), run at the same time in two headless Chromes with their own profiles; A's review was complete before B's findings were read. One report covers all five public routes; this snapshot is filed under each of the three page groups (`src/routes/public`, `LoginPage.tsx`, `InvitePage.tsx`). Phase 8 step A, 27 Oct 2026; the full write-up is `docs/redesign/briefs/public.md` §3–§4.

## Design health

Persuade pages score 7 and 10 as n/a: a one-time customer path has nothing to accelerate and no place for help.

| # | Heuristic | /join + friend's join | /c | /p face + "your card" | Stamp screen | /login | /invite |
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
| | Total | 17/32 | 18/32 | 20/32 | 24/40 | 26/40 | 27/40 |

The `src/routes/public` snapshot records the four customer-and-counter columns together: 79/136 (58%), Acceptable, with 7 and 10 n/a on the three Persuade columns only.

## Design specificity

Interchangeable, except where the pass appears. The frame (a centred white card on a lavender wash, a violet-to-blue gradient button) could front any sign-up. Authored: the real pass with a working QR, the Israeli legal wording, /invite's role text, candid refusals. Missed: the shop never frames its own customer's pages; no Persuade register; Scan's photo snap, the signature move, is a 14px line on the stamp screen.

Detector: CLI, 0 findings over the 11 markup files, with and without the project config. Live (engine 4.7.0 over CDP), 16 findings in 12 states: `ai-color-palette` ×8, real (the old `.grad-cta` gradient, 11 call sites); `nested-cards` ×4, two false (the frozen pass inside its panel, staged on purpose) and two real (the card's face, a colour block inside the panel, `PublicCardPage.tsx:307`); `organic-clip-path` ×4, false (Google's own "G"). Element rules (contrast, stragglers, overflow) found nothing. The overlay was injected into five states of a headless tab and its console matched the scans; no user-visible overlay exists.

## Overall

The pages work and are honest, but they are the old purple product, and /join, the page a stranger meets seconds after scanning, is the least specific screen of all. The biggest opportunity is the moment the card arrives, where today the shop's name is a 12px violet eyebrow and the pass carries someone else's name.

## What's working

1. The pass is real and works before the wallet does (`PassStage`, the renderer's QR, "אין צורך לחכות").
2. /invite puts the shop and the role before any field, and signs the invitee in on the page.
3. Refusals are said out loud and the legal text is candid: a separate unticked consent, the notice one tap away, phone, code and count left to right.

## Priority issues

1. [P1] /join is anonymous until the customer gives a number: no shop, card or reward, no "no app, no account, no password", and a dead or Free shop shows the full form (`JoinPage.tsx:287`). Fix: lead with the promise and its cost; ask the backend for the shop's face. /impeccable onboard, clarify.
2. [P1] A stranger's name on the customer's own pass: "דנה לוי" on every /c and after any join that skipped the name (`publicCard.ts:46`, `CardPreviews.tsx:127`). Fix: a no-name option from Phase 3. /impeccable harden.
3. [P1] The old purple world, with fields that fail 3:1 (edges 1.38 and 1.57:1, ring 1.99:1), two button styles, and Hebrew in Plex Mono falling to Times New Roman. Fix: Lightbox by day and the kit. /impeccable colorize, typeset.
4. [P1] The stamp screen's answer is missable and speaks another language than Scan: 14px, no light or snap, title and button unchanged after a stamp, the button jumps 68px, a 44px count on a phone with a 2.6:1 slash, warm washes, a violet "reward ready", English 500s, ניקוב and פרס (`PublicCardPage.tsx:166-264`). Fix: Scan's answer, words and count. /impeccable bolder, animate.
5. [P2] /join's errors are generic, far from the field, under the keyboard and silent; focus falls to body after submits (`JoinPage.tsx:138-143`, `:343`). /impeccable harden.
6. [P2] The card screen isn't a peak: "add it" with no button, the waiting note in mono and pulsing under reduced motion, unannounced; /c never polls; the pass squeezed to 295px (240 at 320); an 800ms rotate, off under reduced motion. /impeccable animate, typeset.
7. [P2] Sign-in traps and garbles: the wrong account can't leave /invite; the named address detaches its "ל"; "פשוט התחברו" with no link; Google reads "Google כניסה באמצעות" in the cold-load language; English 401s. /impeccable harden, clarify.
8. [P2] /p's doors: signed-out staff get the friend's join with no way to stamp (and each load fires the referral rule); a Free shop's face offers a join that refuses; "this is your card" shows no card. /impeccable onboard.

## Persona red flags

- Customer at the counter (Hebrew, one hand): nothing about the shop before typing; no Return on the iOS number pad, the button and errors under the keyboard; "mm/dd/yyyy"; no language switch; "דנה לוי" on their card.
- The friend: the shop as a 12px eyebrow; "הצטרפתם אל" over "כבר יש לך…"; nothing on what joining through a friend gives.
- Staff at the counter: a 44px count and a 14px answer, a jumping button, an 80px two-line redeem with no "Not now", other words than Scan.
- A hire from WhatsApp: a garbled masked address, a trapped wrong account, the password rule unseen until the server's English refusal.
- Sam (screen reader): errors unannounced, focus to body, no main, skip link or title on the customer pages, a live region mounted with its first answer.

## Minor

Three grammatical persons on one screen; ניקוב and פרס against חותמת and הטבה; "(לא חובה)" and "(רשות)"; the Hebrew "scan meanwhile" drops "staff"; Latin shop names uppercased; no page titles; the code step doesn't submit at six digits; `wallet.addApple` and `wallet.addGoogle` unused.

## Questions to consider

- Why does the main door get less than the friend's door, which already shows the shop?
- Should the stamp screen simply be Scan's answer?
- Should the customer's pages get /login's quiet language switch?
