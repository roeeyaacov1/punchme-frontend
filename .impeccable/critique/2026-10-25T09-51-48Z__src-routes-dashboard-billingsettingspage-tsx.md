---
target: /dashboard/billing (Phase 7 step A)
total_score: 21
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
target_identity: "file:C:\\Users\\roeey\\Projects\\punchme-frontend\\src\\routes\\dashboard\\BillingSettingsPage.tsx"
target_fingerprint: "sha256:3199e1b95ff0342eb643b9d19ccbd3e9dc683c450624d83bd4db26a87d3aa5a1"
target_path: "C:\\Users\\roeey\\Projects\\punchme-frontend\\src\\routes\\dashboard\\BillingSettingsPage.tsx"
timestamp: 2026-10-25T09-51-48Z
slug: src-routes-dashboard-billingsettingspage-tsx
closed: true
---
Method: dual-agent (A: design review · B: detector and overlay), run one after the other because browser agents share one session.

## Design health: Billing (`/dashboard/billing`), 21/40, Acceptable

| # | Heuristic | Score | Key issue |
|---|---|---|---|
| 1 | Visibility of system status | 2 | The raw "סטטוס: none"; no price or date on Pro; no busy state on the redirects; a failed status read vanishes |
| 2 | Match with the real world | 2 | Stripe's word untranslated; "פרו" here, "מסלול Pro" on the landing page; "ניהול חיוב" doesn't say Stripe |
| 3 | User control and freedom | 2 | How to stop said only on Pro, and never what stopping does; leaving for Stripe unannounced |
| 4 | Consistency and standards | 2 | Says less than the Overview panel that links here, and than onboarding's "cancel any time" |
| 5 | Error prevention | 2 | `past_due` and `unpaid` render as "free + הפעלה", which starts a second subscription the backend won't bind |
| 6 | Recognition rather than recall | 2 | The unlocks carried from the Overview; Pro must remember the price |
| 7 | Flexibility and efficiency | 3 | One decision, one button |
| 8 | Aesthetic and minimalist design | 3 | Clean; the duplicate plan tag and the raw status are the noise |
| 9 | Error recovery | 2 | "Try again in a moment" for every failure, a permanent 400 included; focus to `<body>` |
| 10 | Help and documentation | 1 | Nothing on cadence, receipts, VAT, cancelling, or customers' cards after cancelling |

## Specificity
A stock plan card: a tag, a price, a button. The honest skeleton (the price before the button) is the authored part; the product's own argument (the calculator's "how many regulars cover ₪99") is missing from the page where the owner decides.

Detector: CLI 0 findings; advisory `design-system-font-size` at `primitives.tsx:265` (the old `Tag`, the plan tag) is real. Overlay: clean at 375 (Free and Pro) and 1280.

## Priority issues
1. [P1] A business in dunning is offered a second subscription: the page branches on the plan alone (`BillingSettingsPage.tsx:29`, `:71-99`); `past_due` is Free and a new subscription won't bind while the old one is in dunning (`apps/billing/services.py:23`, `:33`, `:199`). Fix: state from the subscription's `status`; `past_due`, `unpaid` and unknown words go to the portal, never a checkout.
2. [P1] Billing doesn't answer the payer's questions and prints a raw API word (`:69-114`, `:105-110`): one unlock instead of four, no price or date on Pro, no way to stop on Free, nothing on what stopping does. Fix: the Overview's four unlocks, the price from `PUNCHME_MONTHLY_PRICE`, "paid until", how to stop and what it does, the status said in words.

## Persona red flags
- Avi (Free barber deciding): one unlock where the Overview listed four; nothing on stopping or on his customers' cards; "סטטוס: none"; "הפעלה" doesn't say it opens a payment page; no VAT word.
- Sam: focus to `<body>` after a failed Activate; "none", "חינמי" and "פרו" in Plex Mono.

## Minor
- The redirect flag is never reset after Back from Stripe (`:30`, `:42-48`), so a page restored from the back-forward cache keeps its button disabled.
- The masthead's "הפעלה" links to this page from this page.
- `current_period_end` fetched and never shown.

## Questions
- Should the page where the owner pays carry the way to stop, and what stopping does, before the button?
- Should it link to the calculator, which runs on the owner's own numbers and can say no?
