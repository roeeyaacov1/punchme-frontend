---
target: Refer a friend
total_score: 17
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 3
target_identity: "file:C:\\Users\\roeey\\Projects\\punchme-frontend\\src\\routes\\dashboard\\ReferralsPage.tsx"
target_fingerprint: "sha256:508dd05455382798bc0baa9975d882bbfd64c3bfbcefbf0caa28f30ac9b1625f"
target_path: "C:\\Users\\roeey\\Projects\\punchme-frontend\\src\\routes\\dashboard\\ReferralsPage.tsx"
timestamp: 2026-10-22T15-55-58Z
slug: src-routes-dashboard-referralspage-tsx
---
Method: dual-agent (A: design review sub-agent · B: detector and overlay sub-agent), run one after the other because browser agents share one session. A walked Refer a friend live as the Free manager, the Free owner, the Pro manager and the Pro owner, Hebrew first at 375px, then English at 1280; B ran the CLI detector and injected the overlay. The main thread then fed the list and the sentences worst-case data at the API boundary, in the browser only (break-ui), which moved two scores down a point (H1, H2).

Phase 6 brief: docs/redesign/briefs/dashboard-manager.md.

## Design Health Score: Refer a friend (/dashboard/referrals)

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 1 | Saves are silent; the flagged referral is last on a 3,007px page; the list is the newest 100 and never says so |
| 2 | Match System / Real World | 1 | "פרס" means a stamp; "לספור / לא לספור"; 13 keys say ניקוב/פרס; a reason the frontend doesn't know prints its raw key ("referrals.list.reason.velocity"); "מישהו הצטרף/ה דרך מישהו" |
| 3 | User Control and Freedom | 2 | Approve and reject are unconfirmed and can't be undone; a refetch wipes an unsaved text |
| 4 | Consistency and Standards | 2 | Some controls save at once, texts on a button; the previews in two languages |
| 5 | Error Prevention | 2 | The filled primary is on the fraud flag; an invalid cap silently reverts |
| 6 | Recognition Rather Than Recall | 2 | What "לספור" does depends on rows 2,000px above |
| 7 | Flexibility and Efficiency | 2 | No status filter; one at a time |
| 8 | Aesthetic and Minimalist Design | 2 | A 3,007px column (6,180px with long texts); each enabled row a full editor; five identical icons |
| 9 | Error Recovery | 1 | One error line at the top of the page, up to 4,500px from the control; "זה לא נשמר. נסו שוב." for a referral already decided elsewhere; the API's slug in "(body_too_long)" |
| 10 | Help and Documentation | 2 | Nothing on cost, or on what a flag means |
| **Total** | | **17/40** | **Poor** |

## Design Specificity Verdict

The rows read as sentences and never say event, recipient or rule; the recommended row explains itself ("זה דורש ניקוב מהיד שלכם, אז אי אפשר לזייף את זה מהבית"). Everything else is a settings page any product could ship: stacked white panels, segmented controls, a tinted review box nested in a panel, five identical handshake icons.

Deterministic scan: the overlay's low-contrast on the "ניקוב ראשון" tag (4.4:1) is true; ai-color-palette on the friend preview's violet gradient button is true but inherited from the real join page (`ReferralJoin.tsx:335`), which Phase 8 owns; nested-cards on the review box is true (a warm fill nested in a panel), on the segmented tracks and the friend's miniature false.

## Priority Issues

- **[P1] The flagged referral is a blind, irreversible decision, buried last.** No consequence stated, no confirmation, the filled primary on "count it". Command: /impeccable clarify
- **[P1] The cost is never stated.** "פרס" for stamps, a cap never put in stamps, "כרטיסייה שלמה" beside "ניקוב אחד" at the same weight. Command: /impeccable clarify
- **[P1] The list is the first page only.** `listReferrals` takes page 1, 100 newest; the queue is filtered from it, so an older flagged referral never reaches the review. Command: /impeccable harden
- **[P2] The cap sentence breaks and errors land off-screen.** `w-full` beats `w-20` and `w-auto` (`cn` is plain `clsx`): fields 309px wide, the sentence four lines; one error line at the top; API slugs shown. Command: /impeccable polish
- **[P2] A long business name pushes the page sideways** through the member preview, as on Messages. Command: /impeccable harden

## Persona Red Flags

**Dana (Pro café owner, phone):** the flag is three screens down under a big violet "לספור", with no word on what counting gives.
**Sam (screen reader):** saves announce nothing; the switches' names leave out their condition ("לתת לחבר מתנת הצטרפות" without "כשחבר מצטרף").
**Avi (Free barber):** "פרסים על הפניות הם חלק ממסלול Pro" and a door to plans, no price, rows editable behind a switch that won't move.

## Minor Observations

"בדיוק מה שהחבר רואה" over banners that say "בערך"; the friend preview in the dashboard's language, the member's in the card's; `window_expired` doesn't say the window is 30 days; a removed member card reads as "מישהו".

## Questions to Consider

- Should a flagged referral be a footnote at the bottom of settings, or a decision with its consequence where the owner looks first?
- What does the program cost this month, in stamps and rewards?
