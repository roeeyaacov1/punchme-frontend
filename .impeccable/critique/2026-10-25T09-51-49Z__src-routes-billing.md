---
target: /billing/success and /billing/cancel (Phase 7 step A)
total_score: 12
max_score: 36
na_heuristics: 7
p0_count: 0
p1_count: 1
target_identity: "file:C:\\Users\\roeey\\Projects\\punchme-frontend\\src\\routes\\billing"
timestamp: 2026-10-25T09-51-49Z
slug: src-routes-billing
---
Method: dual-agent (A: design review · B: detector and overlay), run one after the other because browser agents share one session.

## Design health: `/billing/success` and `/billing/cancel`, 12/36, Poor (heuristic 7 n/a: a page with one job has nothing to accelerate)

| # | Heuristic | Score | Key issue |
|---|---|---|---|
| 1 | Visibility of system status | 1 | "Completing…" with no progress, and for good after a failed read; the switch to the timeout line isn't announced |
| 2 | Match with the real world | 2 | "No charge was made" is plain; "check back shortly" doesn't say where; the English document title in Hebrew |
| 3 | User control and freedom | 1 | Success has no link or button; an installed iPhone app has no Back; cancel's way out is a 58×20 link |
| 4 | Consistency and standards | 1 | Outside the shell, unbranded, fixed navy and slate |
| 5 | Error prevention | 1 | An unhandled rejection freezes the page; hires are told a subscription is completing; an old success URL replays "you're live" |
| 6 | Recognition rather than recall | 2 | Cancel doesn't say the plan is unchanged; success doesn't say what was paid |
| 7 | Flexibility and efficiency | n/a | One job per page |
| 8 | Aesthetic and minimalist design | 2 | So empty it looks broken |
| 9 | Error recovery | 1 | No message for a failed read, no action after the timeout |
| 10 | Help and documentation | 1 | No next step, nothing on when customers can join |

## Specificity
The least authored screens in the product: one centred sentence on a blank page.

Detector: CLI 0 findings on both files. Overlay: clean on both (success injected after its timeout).

## Priority issues
1. [P1] The return from Stripe ends in a dead end, a false "completing", or a flash of "not live": the poll has no catch, so one failed read (a hire's 403 included) freezes it (`BillingSuccessPage.tsx:22-48`); it gives up at 30 s for good (`:36-39`); no heading, landmark, live region, link or button (`:50-53`); it navigates before the business reads Pro (`:30-33`), so the Overview opens on "עדיין לא פעיל · הפעלה" and the shell's sign, decided once at mount (`DashboardLayout.tsx:108-110`), never switches on. Cancel is a bare page whose 58×20 link sends a hire to a refusal (`BillingCancelPage.tsx:8-14`). Fix: both on Lightbox and the kit, a heading, a status region, the poll tolerant of failure, an honest timeout ("no need to pay again") with a way on, the hand-off after the business reads Pro, a hire told no out loud.

## Persona red flags
- Avi, just paid with a slow webhook: one sentence, then a dead end; on a network blip, "completing" for good.
- Avi, backed out of Stripe: "No charge was made", the one good beat, and a 20px link.
- A hire: "משלימים את המנוי שלכם…" for good (403), or "חזרה לחיוב" into a refusal.

## Questions
- Should the wait warn against paying twice, here and on Billing, until Stripe confirms?
- Should these pages follow the dashboard's day and night?
