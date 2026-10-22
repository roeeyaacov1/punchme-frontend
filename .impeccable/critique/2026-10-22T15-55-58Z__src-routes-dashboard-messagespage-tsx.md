---
target: Messages, the broadcast composer and the rule editor
total_score: 21
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 3
target_identity: "file:C:\\Users\\roeey\\Projects\\punchme-frontend\\src\\routes\\dashboard\\MessagesPage.tsx"
target_fingerprint: "sha256:afc0e73ae4e937d7a8824f88b642f38f6ff895ca512cecfa651c5e1bba0e9c1c"
target_path: "C:\\Users\\roeey\\Projects\\punchme-frontend\\src\\routes\\dashboard\\MessagesPage.tsx"
timestamp: 2026-10-22T15-55-58Z
slug: src-routes-dashboard-messagespage-tsx
---
Method: dual-agent (A: design review sub-agent · B: detector and overlay sub-agent), run one after the other because browser agents share one session. A walked Messages, the composer and the rule editor live as the Free manager, the Free owner, the Pro manager and the Pro owner, Hebrew first at 375px, then English at 1280 and night; B ran the CLI detector over the nine markup files and injected the overlay into the live pages. The main thread then fed the pages worst-case data at the API boundary, in the browser only (break-ui), which moved two scores down a point (H1, H9).

Phase 6 brief: docs/redesign/briefs/dashboard-manager.md.

## Design Health Score: Messages (the list, /dashboard/messages/new, the rule editor)

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 1 | Free and "not enabled" still say "נותרו לכם שתי שליחות השבוע"; last year's broadcast reads "23 באוק׳", tomorrow, because the date has no year; a stalled rule's "הפעם הבאה" is in the past; "כלל חדש" opens off-screen; switches and saves say nothing |
| 2 | Match System / Real World | 2 | 17 keys say ניקוב/פרס; "לכ-300" beside "ל-300"; "כתבו לנו" with no channel; Hebrew dates and counts in Plex Mono |
| 3 | User Control and Freedom | 2 | Off is never gated; drafts lost on leaving; the delete confirm drops focus |
| 4 | Consistency and Standards | 2 | The header switch saves at once, the form on a button; "on" said three times a row; two links per row to one place |
| 5 | Error Prevention | 3 | Two-step send with the count; gift-mismatch and placeholder warnings; but a duplicate rule goes through and the default gift has no cost line |
| 6 | Recognition Rather Than Recall | 3 | Recipes fill everything; the preview greets "דנה"; each rule has a one-line summary |
| 7 | Flexibility and Efficiency | 2 | No duplicate or history per rule; history 10 at a time on 42px buttons; segmented controls one tab stop per option |
| 8 | Aesthetic and Minimalist Design | 2 | The band outshouts the actions; a 1,907px editor for a rule whose defaults are right; at 25 rules the history is 4,000px down |
| 9 | Error Recovery | 2 | API errors become sentences, but a refused switch-on is said 329px above its switch with no way forward; a missing rule offers "try again" |
| 10 | Help and Documentation | 2 | Nothing on how often a rule reaches one person, or that Android gets no alert without a gift |
| **Total** | | **21/40** | **Acceptable** |

## Design Specificity Verdict

The behaviour is PunchMe's: `{שם}` refused in a broadcast, the opt-in toggle disabled when it can't be honoured, rules "on hold" when the wallet can't address one pass, a preview in the card's language greeting a sample customer, the count on the send button. The look is any SaaS automations screen: a violet-to-magenta band with 10px mono labels, three identical recipe cards, a lock-screen card in a stage in a panel, letter-spaced mono tags, amber notices, all on the old violet scope inside the Lightbox frame (lavender by day, navy at night under the warm masthead).

Deterministic scan: the CLI found nothing on these files beyond two legacy advisories (`primitives.tsx:210`, the band's 10px labels; `:265`, the 11px Tag). The overlay found the "פעיל" tag at 4.4:1 (true; three tags share it), and nested-cards on the preview bubble (partly true: Panel > LitStage > bubble) and on two segmented tracks (false).

## Priority Issues

- **[P1] The page tells the reader things that aren't true for them.** Sends left on Free and when sending isn't open; an empty history inviting a first send to nobody; "הכללים רצים לבד" while rules are on hold or stale; "כתבו לנו" with no channel; "לשדרוג ל-Pro" sending a manager to Billing's refusal; last year's broadcast dated like tomorrow. Fix: say only what holds for this viewer, plan and moment. Command: /impeccable clarify
- **[P1] Win-back turns on in three taps, but who and when are never said together.** The trigger and the count sit 1,400px apart; nothing says 86 people at the next 10:00, then each person once on their 30th day; the gift is on by default with no cost; a second identical rule goes through; nothing on Android. Fix: one live sentence beside the action, and a duplicate guard. Command: /impeccable clarify
- **[P1] A long business name pushes the composer and the editor sideways.** From about 38 characters (the column takes 120) the preview's name, which never wraps, sizes the form's implicit grid column: 565px fields on a 375px screen, the page 602px wide (`MessageForm.tsx:157`, `NotificationPreview.tsx:42`). Command: /impeccable harden
- **[P2] Focus is dropped and the switches can't be told apart.** "כלל חדש", "הסרת הכלל" and the send's confirmation each unmount the button that had focus; every switch is named "הכלל פעיל". Command: /impeccable harden
- **[P2] A failed read looks like an empty page.** No rules, nothing sent, "טוען..." for good. Command: /impeccable harden

## Persona Red Flags

**Alex (power user):** win-back is 3 taps and 4 screens of scroll; no duplicate or history; history in pages of 10 at the foot of a 5,970px page at 25 rules.
**Sam (screen reader):** seven switches all named "הכלל פעיל"; focus to `<body>` when the send confirmation opens; the audience count and a switched rule change silently; one h1 and `<p>` section labels.
**Avi (Free barber deciding):** three zeros, "two sends left", "nobody to send to", a win-back whose primary is "save without turning on", and no price.
**Dana (Pro café owner, phone):** "כלל חדש" seems to do nothing; "מתאימים: 86" is ambiguous; her draft is gone when a customer walks in.

## Minor Observations

"נותרו לכם 0 שליחות השבוע" in the confirmation; "הודעות החודש" counts deliveries; titles that start in Latin align to the far edge; every body cut to one line with no way to read it; the composer and editor keep the list's page title.

## Questions to Consider

- If the win-back defaults are right, why is it a nine-field form rather than one sentence and "turn on"?
- Should Messages open on the 86 who are slipping away and what answers them, rather than an audience band?
- What does an owner see on the day a rule first runs?
