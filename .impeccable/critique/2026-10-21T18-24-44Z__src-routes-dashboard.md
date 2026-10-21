---
target: "the counter pages: Overview, Scan, Customers, Activity"
total_score: 22
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 5
target_identity: "file:C:\\Users\\roeey\\Projects\\punchme-frontend\\src\\routes\\dashboard"
timestamp: 2026-10-21T18-24-44Z
slug: src-routes-dashboard
---
Method: dual-agent (A: design review sub-agent · B: detector and overlay sub-agent), run one after the other because browser agents share one session. A could not open its own tab or sign in as other accounts, and simulated staff and Free in its tab; the main thread then signed in for real as staff on Pro, the Free owner and staff on Free, and confirmed those views.

Target: the four counter pages, /dashboard (Overview), /dashboard/scan, /dashboard/customers, /dashboard/activity. Hebrew first at 375px, on the local demo data (Demo Coffee, Pro, 300 customers, an 8-stamp card; Demo Barbershop, Free), plus break-ui's worst cases injected at the API boundary in the browser.

## Design health score

| # | Heuristic | Score | Key issue |
|---|---|---|---|
| 1 | Visibility of system status | 2 | Scan: punched (#ecfdf5) and already punched (#fffbeb) are 1.02:1 apart. Overview: a cold load says "nobody came back" with every figure at 0 before the reads return. Activity: switching the period blanks the chart to a mono "Loading…" |
| 2 | Match with the real world | 2 | ניקוב and פרס on every page, where the glossary and the tour say חותמת and הטבה. Phones shown as +972…. "על ידי owner". "+178" reads as growth |
| 3 | User control and freedom | 3 | "Not now", a 15 s hold on a full card, Escape works. But "−" has no undo, and a focused "Close" unmounts after 3.8 s |
| 4 | Consistency and standards | 2 | The tour's words against the pages'; "הפרס ניתן" is both the button and its confirmation; 40–42px buttons beside 44px controls |
| 5 | Error prevention | 2 | Customers: "050-…" finds nobody, which invites a duplicate sign-up. Remove's confirmation focuses the destructive button. Staff on Free get three doors that refuse them |
| 6 | Recognition rather than recall | 2 | A customer at 11 of 12 is tagged "halfway"; the one-away state has a chip but no mark in the row. Overview's "22 ready" is not a link to the 22 |
| 7 | Flexibility and efficiency | 3 | No tap to stamp; the next card is taken at once; Enter submits a code; the chart has a roving tabindex. No hardware-scanner path |
| 8 | Aesthetic and minimalist design | 2 | Overview: a loud violet band of owner figures above setup objects on a daily page. Customers: 134px rows of eight elements. Activity: three full-width filters before the first event |
| 9 | Error recovery | 2 | A failed scan shows the server's English sentence. "The camera is blocked" points to a field that is collapsed 230px lower |
| 10 | Help and documentation | 2 | The tour is true to role but teaches חותמת and הטבה while the pages say ניקוב and פרס; it skips Activity; a hire on Free gets a centred stop, because the panel has no anchor |
| **Total** | | **22/40** | **Acceptable** |

A's own total was 24/40. The worst cases moved two scores down: recognition (one stamp away is invisible in the row) and error recovery (English server text, the hidden typed path).

## Design specificity

The logic and the copy are written for this product: the answer lands on the viewfinder, nothing has to be tapped to stamp, refusals are named, the Overview's headline is people who came back on two separate days, the empty week is the owner's own unfilled card, and the removal copy tells the truth about the wallet pass. The look could belong to any SaaS dashboard: a violet-to-magenta stats hero with four KPI readouts, mono uppercase labels, a stack of white rounded panels, search-sort-chips-table and chart-filters-table. The Hebrew is translated rather than designed for: Hebrew set in a mono face with no Hebrew at 10–12px, floors printed "+178", the glossary broken, and the time chart mirrored.

Deterministic scan: the CLI found 0 findings and 6 advisories over 18 files, all `design-system-font-size`: 11px at WeekLedger.tsx:121 and :155 and ActivityChart.tsx:212 and :269, 10px at primitives.tsx:210 (the band's readout labels), 11px at primitives.tsx:265 (Tag). The overlay found 6 on the Overview and none on Scan, Customers or Activity: `ai-color-palette` on the brief band (#662eba to #a52668), four `undersized-ui-text` on the 10px Hebrew labels in IBM Plex Mono, and `nested-cards` on the Apple pass preview, a false positive (the frozen preview in its stage). The overlay saw only default states, so the scan answers, the row menus and the confirmations were never scanned.

## Priority issues

1. [P1] The scan answer is not impossible to miss. It covers the 343px frame, but the word is 19px, the count 44px (t-stat clamps there, not 64), the marks 13px, and "3 more to the reward" is 14px at 3.94:1, an AA failure. Punched and already punched are near-white tints 1.02:1 apart, and at night the answers sit darker than the page. At 55cm the secondary line subtends about 7′ of arc. Fix: Lightbox's answer at full strength (an opaque light in both themes, a 48px state glyph, the 64px count, stamps of 24px or more, ink only, secondary text in each light's own deep tint), and already punched told apart from punched by more than a tint. Suggested: /impeccable shape, then /impeccable polish.
2. [P1] The typed path, the only path when the camera fails, hides itself and its answer. The field stays collapsed while the frame says "type it below"; with the keyboard open the answer is off screen; a failed scan shows the server's English. Fix: the field opens and takes focus whenever the camera isn't running; the answer lights right above the field; a failure is a Hebrew sentence per cause; a desk keeps the field open for a USB scanner. Suggested: /impeccable harden.
3. [P1] Customer lookup fails on Israeli numbers. "050-000-9242" and "0500009242" find nobody (CustomersPage.tsx:111-123); phones show as +972500009242; a customer one stamp away reads "halfway"; a Latin or Cyrillic name in Hebrew loses its first name to the ellipsis. Fix: compare on the national number, show 050-000-9242 isolated left to right, mark one stamp away in the row, set names with dir="auto". Suggested: /impeccable harden.
4. [P1] The Overview says untrue things in two states. On load it says "nobody came back" with zeros before the reads return. For a busy shop it prints exact 30-day figures as floors: the 60-day walk stops at 1,500 events, but the demo's 1,500th event is 33 days old, so the 30-day window is complete and only the comparison is missing; the page still shows "+178" and drops the comparison, and so would any café past about 25 stamps a day. At 5,000 customers it reports 2,472 customers and never says the roster stopped loading. Fix: skeletons until both reads settle; capped per window, not per walk; a floor said in words. Suggested: /impeccable harden.
5. [P1] The pages don't know who is looking. Staff on Free get "activate" links on Scan, Customers and Activity that land on the refusal, plus an empty QR panel and no tour anchor; the Free owner's checklist sends them to a print that is Pro only, three doors lead to Billing and none names the price; staff can export every customer's phone number. Fix: role- and plan-aware states, one honest activation panel with ₪99, export for managers and the owner. Suggested: /impeccable onboard.

## Persona red flags

- Noa (staff, first week, rush hour, one hand): mint and cream look alike at arm's length; the typed answer is off screen; "050…" finds nobody; "−" sits 6px from "+" with no undo; the tour taught her חותמת and הטבה; "הפרס ניתן" claims the hand-over before it happens.
- Avi (Free barber deciding): three doors to Billing, none with a price; step 2 is a dead end on Free; Customers and Activity are one link each; Scan asks for the camera to say there is nobody to scan.
- Dana (Pro café owner, "is this paying for itself?"): "nobody came back" on every cold open, then floors with "+" and no comparison because the shop is busy; her falling fortnight draws as a climb in Hebrew.
- Sam (screen reader, keyboard): the live region says "4/8", which can be read as a date; Enter in the remove confirmation deletes; chart day targets are 14–22px wide; a focused "Close" unmounts.
- Alex (power user): no hardware-scanner path; Overview figures aren't links; pagination at the foot of a 4,262px Activity page.

## Minor observations

- English and developer text in the Hebrew UI: the server's error.message (ScanPage.tsx:150, 239; CustomersPage.tsx:601, 616), "see docs/customers-backend-issues.md" in a tooltip, "until the API gains a search parameter", "PunchMe" in customer-facing hints.
- Masculine defaults (הלקוח, שלו, הבעלים מפעיל, הכרטיס) where the voice asks for slash forms; the message hint says "only he sees it" in Hebrew and "only she sees it" in English.
- "1 לקוחות"; counts with no thousands separator ("2500", "1 / 125").
- Reduced motion is none, not gentler: the scanning sweep disappears (index.css:1299-1311).
- Activity says "showing 275 of 275" with 50 rows on screen, and its total (net) differs from its event count.
- On 30 busy days the walk stops at 1,500 events and the days it never loaded are drawn as zero.
- Desktop: the week's 300px plot sits in a 929px panel; "14 ימים" wraps onto two lines even at 1280.

## Questions to consider

- Should "punched" be the loudest light on the screen, or should the screen stay calm and spend its light on the answers that need a person?
- What would the Overview be if it were built for the counter first: who is owed a reward today, who is one stamp away?
- Should a time series mirror in Hebrew at all, when the numbers on it read left to right?
- What if typing were a second scanner, always open on a desk for a USB reader, rather than a fallback behind a toggle?
