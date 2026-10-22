---
target: the standee
total_score: 23
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 3
target_identity: "file:C:\\Users\\roeey\\Projects\\punchme-frontend\\src\\routes\\dashboard\\StandeePage.tsx"
target_fingerprint: "sha256:dda1bf943bdbbdcf11e90e27d568ce450fc6d1c4867c02b7a80a2e7b7d863ef7"
target_path: "C:\\Users\\roeey\\Projects\\punchme-frontend\\src\\routes\\dashboard\\StandeePage.tsx"
timestamp: 2026-10-22T15-55-58Z
slug: src-routes-dashboard-standeepage-tsx
---
Method: dual-agent (A: design review sub-agent · B: detector and overlay sub-agent), run one after the other because browser agents share one session. A walked the standee live as the Free manager, the Free owner, the Pro manager and the Pro owner, Hebrew first at 375px, then English at 1280 and night; B ran the CLI detector and injected the overlay. The main thread then fed every design on every paper worst-case and ordinary names and rewards (break-ui), which moved error prevention down a point.

Phase 6 brief: docs/redesign/briefs/dashboard-manager.md.

## Design Health Score: Standee (/dashboard/standee)

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | The preview follows every choice; on Free the sheet says its code isn't live |
| 2 | Match System / Real World | 2 | The sheet prints "בלי הרשמה" and "מצטרפים בחצי דקה"; "נקרא מכל מקום בחדר" overclaims; the design "ההטבה" collides with the glossary's הטבה |
| 3 | User Control and Freedom | 3 | Every choice reversible, nothing saved |
| 4 | Consistency and Standards | 2 | Violet scope in a Lightbox frame; the sheet follows the dashboard's language while messages follow the card's |
| 5 | Error Prevention | 1 | The sheet clips its own text at ordinary lengths: the demo's table-tent poster cuts "powered by PunchMe" and a third of step 3; a 45-character name with a 60-character reward clips the A4 poster, and long ones push the QR off the page; the quiet zone is 2.2 modules where the spec asks 4 |
| 6 | Recognition Rather Than Recall | 3 | Real-sheet thumbnails, a hint per paper |
| 7 | Flexibility and Efficiency | 2 | Four designs, three papers; no copy-link, no file for a print shop |
| 8 | Aesthetic and Minimalist Design | 3 | The sheet is the hero; on a phone Print sits 1,400px above it; on Free the loudest thing is a dead button |
| 9 | Error Recovery | 2 | A failed templates read leaves "טוען..." for good |
| 10 | Help and Documentation | 2 | The printer note is wrong for phones and home printers; A5 is called "half a page" |
| **Total** | | **23/40** | **Acceptable** |

## Design Specificity Verdict

The most product-specific page of the three: four real sheets at thumbnail size in the owner's colours with the live code, a refusal to print a dead code on Free (a dashed slot that says why), a table tent that prints its top half upside down and marks its fold, a print path that survives night mode and the rail. The page around it is generic violet, on the one page where Lightbox's lit sign is literal.

Deterministic scan: the CLI's two hits on `Standee.tsx:193-194` (the locked slot's fixed ink on its white tile) are false positives. The overlay's nested-cards on the thumbnails, the sheet and the paper control are pictures of paper and a segmented track (false); its tiny-text on the preview's 4.8 to 8.6px type is the sheet's own scale (false as type scale; true that the proof can't be read on a phone). "powered by PunchMe" is a literal in JSX (`Standee.tsx:330`).

## Priority Issues

- **[P1] The sheet prints claims the product doesn't keep or can't back.** "בלי אפליקציה. בלי הרשמה." (`standee.noApp`) and "מצטרפים בחצי דקה" (`standee.steps.join`), on paper that stays on the counter for months. Command: /impeccable clarify
- **[P1] The sheet clips its own content.** Fixed type in a fixed-ratio panel with `overflow: hidden`: the tent poster overflows with the demo's own name and reward; ordinary lengths clip the A4 poster and the tent's other designs; the worst case moves the QR past the bottom edge. Command: /impeccable harden
- **[P1] The sheet speaks the dashboard's language, not the card's.** An English dashboard prints English steps around a Hebrew reward. Command: /impeccable harden
- **[P2] On Free, the loudest thing is dead and the live action refuses a manager.** A disabled violet Print, an amber notice telling a manager to activate, a link to Billing's refusal, no price. Command: /impeccable onboard
- **[P2] Print is stranded, and its guidance fails on phones and home printers.** 40px, 1,400px above the preview at 375; "שמירה כ-PDF" and "מקצה לקצה". Command: /impeccable layout

## Persona Red Flags

**Avi (Free barber):** a disabled Print, three sheets that each say the code isn't live, and no price; the one action is a link inside a warning.
**Dana (Pro café owner, phone):** Print far from the preview; "Save as PDF" isn't on her iPhone; her tent prints without its footer.
**Sam (screen reader):** Print's disabled state is linked to its reason (kept); the thumbnails are hidden (kept).

## Minor Observations

The "דלפק" hint contradicts the code's own description of the design; Plex Mono sets "8 חותמות" and "קיפול" on paper; the demo logo host doesn't resolve in dev, so sheets render without a logo locally.

## Questions to Consider

- What can a printed sheet honestly promise in one line?
- Should the standee follow the card's language, and could a bilingual shop print both?
- Should the sheet fit its text to the paper rather than clip it?
