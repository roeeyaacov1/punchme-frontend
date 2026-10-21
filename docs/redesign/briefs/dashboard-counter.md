# The counter pages

Phase 5, step A of `docs/redesign/guide.md`: the Overview (`/dashboard`),
Scan (`/dashboard/scan`), Customers (`/dashboard/customers`) and Activity
(`/dashboard/activity`). Diagnosed and written on 21 Oct 2026 with
`/impeccable critique`, `/impeccable audit`, `/break-ui`, three UI UX Pro Max
lookups, the dataviz skill's rules, and `/impeccable shape` (mode: Operate).
No code changed. Step B builds it on Lightbox (DESIGN.md) and
`src/components/kit`, in Plan mode.

The inputs: CLAUDE.md, PRODUCT.md, DESIGN.md, `docs/dashboard-routes.md`,
`docs/redesign/briefs/visual-world.md` (§4, Lightbox and its Scan at 375px),
`docs/redesign/briefs/dashboard-shell.md` (§8 and §12), the pages' code, and the
pages themselves on the local backend's demo data: Demo Coffee on Pro (300
customers, an 8-stamp card) and Demo Barbershop on Free. They were walked as
staff and as owner on both plans, Hebrew first at 375px, then in English and at
1280px, with every scan answer produced from typed codes. Two reviewers ran
apart for the critique: one walked and read the pages, the other ran
Impeccable's detector and injected its overlay. Break-ui fed the roster and the
feed their worst cases at the API boundary, in the browser only (Appendix A).
Four questions went to Roee on the way (§7).

Read "In short" first. Sections 8 to 11 are what step B builds.

1. In short
2. The pages today
3. Critique
4. Audit
5. The worst cases
6. The lookups and the chart rules
7. Decisions made in this step
8. The new pages
9. What the shell left here
10. Copy
11. What step B keeps, touches and checks
12. Left for other phases, and still open
- Appendix A: the worst-case data

---

## 1. In short

- **Four pages, one job: the counter.** The installed app opens on the
  Overview, Scan is used dozens of times a day, Customers is where a name
  or a number is looked up, and Activity is the record. Each page claims
  Lightbox with `useLightboxPage()` and is rebuilt on the kit, so the seam
  between the warm frame and the old violet pages closes for all four.
- **Scan's answer becomes impossible to miss.** Lightbox's inset lit panel
  and photo snap, made to read at arm's length: a 48px state glyph, the
  64px count, stamps of 20px or more, and every secondary line in its own
  light's deep tint (Roee, §7). Punched and already punched stop being two
  near-white tints 1.02:1 apart. Typing a code becomes a second scanner:
  open whenever the camera isn't running, and kept open on a desk for a USB
  reader.
- **The Overview is stat tiles over a chart** (Roee, from Impeccable's roll,
  §7): four tiles (came back, customers, new, reward waiting), the month's
  people a day as a real chart, the week, then what customers see. Free
  gets one honest activation panel with the price, and a hire on Free gets
  one line that is true for them.
- **Customers finds people the way they are spoken.** "050-000-9242" finds
  the customer stored as +972500009242; phones read 050-000-9242; one stamp
  away is marked in the row; a row opens the customer in a sheet, where the
  stamp buttons, the message and the removal live, instead of eight controls
  on every 134px row. The export is for managers and the owner (Roee, §7).
- **Activity puts its filters above what they scope,** keeps the chart on
  screen while a new period loads, and never draws a day it didn't load as
  a day of zero.
- **Time runs like the numbers in both languages** (Roee, §7): oldest at the
  left, today at the right, on every chart.
- **Five things say what isn't so, and this phase fixes them:**
  - the Overview says "nobody came back" while it loads;
  - a busy shop's exact 30-day figures are printed as floors ("+178", read
    as growth) and lose their comparison, although the window was loaded in
    full (§2);
  - Activity draws the days it never loaded as zero;
  - staff on Free are offered three "activate" links that all end on the
    refusal;
  - a failed scan shows the server's English sentence in the Hebrew page.
- **The shell's §12 is settled here (§9),** and every page moves to the
  glossary: חותמת and הטבה, never ניקוב and פרס.

## 2. The pages today

### What each role and plan sees

Checked with real sign-ins for every row.

| | Overview | Scan | Customers | Activity |
|---|---|---|---|---|
| Staff · Pro | The violet brief band (came back, four readouts, the month), the week, the join QR | Title and a two-line lead, the viewfinder, sound, "type the code instead" collapsed | 300 rows of 134px, each with − and +, and a ⋮ holding only "copy number"; the CSV export | The period control, the chart, three filters, 50 rows a page |
| Owner · Pro | Also "הגדרה", the join QR, their own pass and "add to wallet" | The same | ⋮ adds "message" and a red "remove" | The same |
| Owner · Free | A three-step checklist (studio, standee, billing), "הגדרה", the QR panel holding only "activate to get your QR", their own pass | A warn notice and "הפעילו אותה" → Billing; the camera still opens | One link: "activate to start enrolling real customers" | The same one link |
| Staff · Free | "Get your first customer" over "nothing to set up here", an empty QR panel with only its title; the tour's stop is centred, because nothing carries `overview-lead` | The notice and "הפעילו אותה", which lands on the refusal | The same link, which lands on the refusal | The same link, which lands on the refusal |

### The three questions

**How long from a pass held up to a customer free to go?** As short as it
can be. The camera opens on arrival, nothing is tapped to stamp, a read costs
one request, and a different card is taken while the last answer is still on
screen (`ScanPage.tsx:45-74`, `lib/scan.ts`). What fails is reading the
result: the answer is a near-white tint with a 19px word and 13px marks, and
when the camera can't open, typing a code hides both the field and its answer.

**Can staff find a customer by the number they say?** No. "050-000-9242" and
"0500009242" find nobody, because the stored number is +972500009242 and the
search compares digits as typed (`CustomersPage.tsx:111-123`). Only "500009242"
or "+972…" match. A new staff member concludes the customer isn't enrolled
and signs them up again.

**Can an owner see whether it's paying for itself?** The question is right:
the headline is people who came back on two separate days, which is what the
product is sold on. The answer is wrong in two states. While the reads load,
the band says "אף אחד לא חזר" with every figure at 0 (`Brief.tsx:94-99`). For
a busy shop every figure is printed as a floor with a "+" that reads as growth
in Hebrew ("+178", "+1208"), and the comparison is dropped. In the demo the
60-day walk stops at its 1,500-event guard, but the 1,500th event is 33 days
old: the 30-day window was loaded in full, and only the 30 days before it were
cut. `overviewBrief.ts` marks every figure capped whenever the walk was
(`DashboardOverview.tsx:150-151`, `overviewBrief.ts`), so any café past about
25 stamps a day sees floors and never sees its comparison.

### Measured

- **Scan's answer at 375px** (`ScanResult.tsx:52-155`):
  - It covers the 343px frame, 38.6% of the screen.
  - The word is 19px and the count 44px: `t-stat` clamps there at 375, not
    at 64. The stamp marks are 13px.
  - "עוד 3 ניקובים לפרס" is 14px at 3.94:1, an AA failure (`opacity-85`).
  - Punched is `#ecfdf5` and already punched `#fffbeb`: 1.02:1 apart. At
    night the answers sit darker than the page around them (1.09–1.19:1).
  - At 55cm on a 375pt phone the word subtends about 10′ of arc, the count
    about 31′, a mark about 13′ and the secondary line about 7′.
- **The Overview at 375px:** 1,957px tall for the owner on Pro. Its band's
  readout labels are 10px IBM Plex Mono, uppercase and tracked, setting
  Hebrew in a face with no Hebrew. The week's bars sit under the phone bar
  at 812px tall.
- **Requests on opening the Overview (Pro):** the roster at 100 a page (3 in
  the demo) and the 60-day activity walk (15 in the demo), each one request
  after another. The installed app starts on this page.
- **Customers:** rows are 134px; the six filter chips scroll sideways under
  the edge; phones show as +972500009242 in 12px mono; the count line and the
  tags are 11–12px mono.
- **Activity:** 4,262px tall with 50 rows; "14 ימים" and "30 ימים" wrap onto
  two lines even at 1280px; the chart's day targets are 20–22px wide at 14
  days and 14px at 30; the count line says "מוצגים 275 מתוך 275" with 50 rows
  on screen.
- **Under 44px:** "נסו שוב" 73×40, "העתקת קישור" 134×42, "ייצוא ל-CSV" 123×42,
  pagination 62×42 and 58×42, a refusal's "סגירה" 67×42, the Free checklist's
  links 36px tall, the wallet toggle 79×28, the desktop ± 36×36.

## 3. Critique

22/40, Acceptable. Two reviewers worked apart and one after the other, since
browser agents share one session:

- **A, design review:** read the code and walked the pages live.
- **B, detector:** ran Impeccable's detector over the 18 markup files and
  injected its overlay into the four live pages.

The design reviewer couldn't open its own tab or sign in as other accounts, so
it simulated staff and Free in its tab; every staff and Free view in this
brief was then checked with a real sign-in. A scored 24/40 on its own; the
worst cases (§5) moved recognition and error recovery down a point each. The
snapshot is in `.impeccable/critique/` (untracked), for step D's
`/impeccable polish`.

| # | Heuristic | Score | Key issue |
|---|---|---|---|
| 1 | Visibility of system status | 2 | Scan: punched and already punched are 1.02:1 apart. The Overview opens on "nobody came back" before its reads return. Activity blanks its chart to a mono "Loading…" when the period changes |
| 2 | Match with the real world | 2 | ניקוב and פרס on every page, where the glossary and the tour say חותמת and הטבה; phones as +972…; "על ידי owner"; a floor printed "+178" |
| 3 | User control and freedom | 3 | "Not now" and a 15 s hold on a full card; Escape works. "−" has no undo, and a focused "Close" unmounts after 3.8 s |
| 4 | Consistency and standards | 2 | The tour's words against the pages'; "הפרס ניתן" is both the button and its confirmation; 40–42px buttons beside 44px controls |
| 5 | Error prevention | 2 | "050-…" finds nobody, inviting a duplicate sign-up; the removal confirmation focuses the destructive button; staff on Free get three doors that refuse them |
| 6 | Recognition rather than recall | 2 | A customer at 11 of 12 is tagged "באמצע הדרך"; one stamp away has a chip but no mark in the row; the Overview's "22 ready" is not a link to the 22 |
| 7 | Flexibility and efficiency | 3 | No tap to stamp, the next card taken at once, Enter submits a code, the chart has a roving tabindex. No path for a hardware scanner |
| 8 | Aesthetic and minimalist design | 2 | A loud violet band of owner figures above setup objects; 134px rows of eight elements; three full-width filters before the first event |
| 9 | Error recovery | 2 | A failed scan shows the server's English; "the camera is blocked" points to a field collapsed 230px lower |
| 10 | Help and documentation | 2 | The tour is true to role but teaches חותמת and הטבה while the pages say ניקוב and פרס; a hire on Free gets a centred stop |

**Specificity.** The logic and the copy belong to this product:
- the answer lands on the viewfinder, and nothing is tapped to stamp;
- every refusal is named ("זה השילוט להרשמה שלכם", "כבר נוקבה");
- the headline is people who came back, not stamps;
- an empty week is drawn as the owner's own unfilled card;
- the removal copy tells the truth about the wallet pass.

The look could belong to any SaaS dashboard: a violet-to-magenta stats hero,
mono uppercase labels, a stack of white rounded panels, search-sort-chips-table
and chart-filters-table. The Hebrew is translated rather than designed for.

**The detector.**
- **CLI:** 0 findings and 6 advisories over 18 files, all
  `design-system-font-size`: 11px at `WeekLedger.tsx:121` and `:155` and
  `ActivityChart.tsx:212` and `:269`, 10px at `primitives.tsx:210` (the band's
  readout labels), 11px at `primitives.tsx:265` (`Tag`).
- **Overlay:** 6 on the Overview, none on Scan, Customers or Activity.
  `ai-color-palette` on the band's gradient (#662eba to #a52668); four
  `undersized-ui-text` on its 10px Hebrew labels set in Plex Mono; one
  `nested-cards` on the Apple pass preview, a false positive (the frozen
  preview in its stage). The overlay saw default states only: no scan
  answer, no row menu, no confirmation.

**Priority issues**

1. **[P1] The scan answer isn't impossible to miss.** §2's measurements: a
   19px word, a 44px count, 13px marks, a secondary line that fails AA, and
   the two most frequent answers 1.02:1 apart. Fixed in §8.4.
2. **[P1] Typing a code, the only path when the camera fails, hides itself
   and its answer.** The field stays collapsed while the frame says "type it
   below"; with the keyboard open the answer is off screen; a failure shows
   the server's English (`ScanPage.tsx:150-153, 239-242`). Fixed in §8.4.
3. **[P1] Customer lookup fails on Israeli numbers**, and the roster hides
   who is one stamp away and loses Latin names' first words (§5). Fixed in
   §8.5.
4. **[P1] The Overview says untrue things** while loading and for a busy
   shop, and at 5,000 customers it reports 2,472 without saying the roster
   stopped (§5). Fixed in §8.3.
5. **[P1] The pages don't know who is looking.**
   - Staff on Free get "activate" links on Scan, Customers and Activity that
     end on the refusal (`ScanPage.tsx:322-337`, `CustomersPage.tsx:503-511`,
     `ActivityPage.tsx:178-189`), against CLAUDE.md's rule that a hire is
     never shown a door that refuses them.
   - The Free owner's checklist sends them to a print that is Pro only;
     three doors lead to Billing and none names the price.
   - Staff can export every customer's name and phone number
     (`CustomersPage.tsx:483-493`).

   Fixed across §8.

**Personas**
- **Noa (staff, first week, rush hour, one hand):** mint and cream look
  alike at arm's length; the typed answer is off screen; "אפס חמישים…" finds
  nobody; "−" sits 6px from "+" with no undo; the tour taught her חותמת and
  הטבה; "הפרס ניתן" claims the hand-over before it happens.
- **Avi (Free barber deciding):** three doors to Billing, none with a price;
  step 2 asks for a print he can't make; Customers and Activity are one link
  each; Scan asks for the camera to tell him there is nobody to scan.
- **Dana (Pro café owner, "is this paying for itself?"):** "nobody came back"
  on every cold open, then floors with a "+" and no comparison, because her
  shop is busy; her falling fortnight draws as a climb in Hebrew.
- **Sam (screen reader, keyboard):** the live region says "4/8", which can be
  read as a date; Enter in the removal confirmation deletes; chart days are
  14–22px wide; a focused "Close" unmounts.
- **Alex (power user):** no hardware-scanner path; the Overview's figures
  aren't links; pagination at the foot of a 4,262px page.

**Strengths, kept:**
- Scan's flow: the camera open on arrival, no tap, a different code taken at
  once, repeats held off in the browser, the cooldown owned by the server,
  sound and vibration as the first signal, every outcome named.
- Candour in the numbers: people who came back, no comparison it can't
  prove, floors marked, the empty week drawn as the owner's own card.
- Role trimming where it was thought through: no remove item for staff, the
  hire's Overview without setup objects, empty filter chips disabled.

## 4. Audit

10/20, Acceptable.

| # | Dimension | Score | Key finding |
|---|---|---|---|
| 1 | Accessibility | 2 | The scan's secondary line at 3.94:1; Hebrew labels at 10–12px; chart days 14–22px wide (WCAG 2.5.8); a focused "Close" unmounts after 3.8 s (2.2.1); the removal confirmation focuses "remove"; reduced motion removes the scanning sweep instead of softening it (`index.css:1299-1311`) |
| 2 | Performance | 2 | The Overview opens with the roster walk and the 60-day activity walk, each one request after another: at 5,000 customers 25 roster pages and 15 activity pages, on the page the installed app starts on |
| 3 | Theming | 1 | All four pages on the old scope: the band's hard-coded gradient and stroke (`Brief.tsx:50-52`, `index.css:1374-1380`), a navy viewfinder, violet primaries, an amber wash in `InstallApp` (Lightbox forbids warm washes), the old navy at night |
| 4 | Responsive | 3 | No horizontal overflow; phone layouts for the roster and the feed. But the chips scroll sideways under the edge, the week sits under the bar, segment labels wrap at 1280px, and several targets are 36–42px |
| 5 | Implementation integrity | 2 | Three primitive families (`dashboard/primitives`, `marketing/primitives`, hand-rolled) and nothing from the kit; six type sizes under the ramp; facts computed, tested and never shown (`oneAway`, `quietDays`, `joinedDelta`); a capped flag that is too pessimistic; developer text in the UI |

**Positive, and kept:** one h1 per page; the skip link; visible focus; named
row menus ("More for Dana Cohen"); a roving tabindex on the chart; the scan's
live region; figures in `dir="ltr"` where they were isolated; memoised
filtering over the whole list.

## 5. The worst cases

Break-ui's fixtures entered through the two reads they test, the roster and
the activity feed, by a script that wraps `fetch` in the browser and answers
the way the server does: newest first, the full `count`, and page sizes capped
at 100. Nothing in the repo changed. Appendix A is the script. Its toggle has
five states: Demo, Worst case (64 customers on a 12-stamp card, 60 days of a
busy café), Empty, One, and 5,000.

| # | Severity | Field | Worst case | What happens | Fix |
|---|---|---|---|---|---|
| 1 | Broken | the roster's size | 5,000 customers | The list stops at 2,500: `listAllCustomers` asks for 200 a page, the server answers 100 (`PAGINATION_MAX_PER_PAGE_SIZE`), and the 25-page guard ends half way. The Overview reports "2,472 customers" and says nothing; search, filters and the export cover half the shop | Outside the redesign: `src/api` is frozen (§12). Here: every page says the list stopped, in words, and the Overview's figure becomes a floor |
| 2 | Broken | the activity window | 30 busy days | The walk stops at 1,500 events, and the days before the loaded edge are drawn as zero: a false drop at the start of the line | Draw only loaded days; mark the rest "not loaded" (§8.6) |
| 3 | Broken | `customer_display_name` | "Bartholomew Fitzgerald-Montgomery III", "Александра Кузнецова-Петрова" | In an RTL row a Latin or Cyrillic name truncates at the left, so it loses its first name: "…Montgomery III" | `dir="auto"` and `text-align: match-parent` on the name, wrapping to two lines before any ellipsis (§8.5) |
| 4 | Broken | `customer_display_name` | "נועה Smith-Goldberg" | Mixed direction truncates mid-run: "נועה …-Goldberg" | The same |
| 5 | Broken | `customer_phone` | "050-000-9242" typed | No match; the customer exists | Compare national numbers (§8.5) |
| 6 | Ugly | the bucket | 11 of 12 | Tagged "באמצע הדרך" (halfway), the same as 3 of 12; cards over 10 stamps draw a bar, not stamps | A "one more" mark in the row (§8.5) |
| 7 | Ugly | `customer_display_name` | "" (the name is optional at /join) | The row's title is "—" and its monogram "•" | The phone becomes the title, and a person glyph the monogram |
| 8 | Ugly | `customer_phone` | null | An orphaned "—" under the name | Omit the line |
| 9 | Ugly | counts | 1 | "1 לקוחות" | Plural keys in both languages (`_one`, and Hebrew's `_two` and `_many`) |
| 10 | Ugly | counts | 2,500 | "2500", "2103", "1 / 125" | `Intl.NumberFormat` in the page's language |
| 11 | Ugly | a period change | 14 to 30 days | The chart and the list are replaced by "טוען..." in mono, then come back | Keep the previous render at reduced opacity while the new period loads |
| 12 | Ugly | `business_user_email` | "aleksandra.wisniewska-kowalczyk@…" | "על ידי aleksandra.wisniewska-kowalczyk" in the meta line and the select | Kept as the email's local part (the feed carries nothing else), set with `dir="ltr"` and allowed to wrap; a backend ask (§12) |
| 13 | Fragile | the name field | 120 characters (the column's limit; the join form has no `maxLength`) | "יוסי (בעלה של מיכל מהקומה השלישית, תמיד בלי סוכר) כהן" fills two lines | Two lines, then an ellipsis; the sheet shows it whole |

**Decisions this left, settled in §8:** names wrap to two lines before they
truncate (an owner identifies people by them); a 1,000-plus roster grows by
"20 more" rather than virtualising (20 rows at a time, measured below 1,500ms
on localhost for 2,500); a nameless customer is titled by their number.

**What held up:** the Arabic name ("محمد أبو ربيعة"), the emoji ("Maya 🌸 בן
דוד") and the one-letter name ("ע") render cleanly with the right monogram;
the 120-character name never overflows its row; an empty filter result offers
to clear the filters; empty chips are disabled; the 1,280px table had room for
every name.

## 6. The lookups and the chart rules

**UI UX Pro Max** (`search.py --domain …`):

- `ux "data table search filter mobile"`:
  - tables become cards on a phone;
  - "no results" offers a way out;
  - chips wrap instead of clipping in one row (High).

  All three are taken: one list at every width (§8.5), the empty result
  keeps its "clear filters", and the chips wrap.
- `ux "scan feedback success error"`:
  - confirm success visibly;
  - give errors a next step;
  - announce errors through a live region.

  Taken: the answers in §8.4, each refusal with what to do, and one polite
  live region that says the answer in words.
- `chart "visits over time"`: a trend over time is a line chart, an area for
  a single series, a stat tile under four points, and a visible summary or
  table as its accessible twin. Taken in §8.3 and §8.6.
- A fourth lookup, RTL time axes, found no match in the database, so that
  question went to Roee instead (§7).

**The dataviz rules, applied to the three charts:**

- **The form.** The month's people a day and Activity's stamps a day are
  lines, one series each, so no legend: the title names it. The week is
  seven bars. The four headline numbers are stat tiles, not charts.
- **Colour.** One series in ink (`#2b2521`, 14.88:1 on a panel; night ink
  14.92:1), never coral: Lightbox keeps coral for the one thing to press.
  The validator's six checks are for categorical palettes and don't apply
  to a single ink series, whose only test is 3:1 against its surface.
  Status colours stay out of the data.
- **Marks.**
  - A 2px line with round joins, and an area of the series at about 8%.
  - Today's point at 8px or more, inside a 2px ring of the surface.
  - Bars no thicker than 24px, a 4px rounded top, square at the base, 2px
    apart.
  - A 1px baseline one step off the surface, solid.
- **Labels.** Only selective direct labels: the peak once and today at the
  end. Never a number on every point. Text wears text tokens (ink,
  ink-muted), never the series colour. Nothing under 13px, and no Plex Mono:
  axis labels are Assistant 600 at 13px (`type-tag`), figures are Rubik
  tabular.
- **Interaction.** A crosshair finds the day: one hit surface for the whole
  plot snaps to the nearest day, so no target is 14px wide. The readout
  above the plot leads with the value ("23 אנשים · יום ג׳, 14 באוק׳"), and
  keyboard focus shows the same as a pointer.
- **Filters.** In one row above everything they scope. The period comes
  first.
- **Refetch.** A refetch keeps the frame: the last render holds at reduced
  opacity, with no skeleton flash.
- **A missing day is not a zero.**
- **Every chart has a twin for a screen reader:** a one-line summary and the
  days as a list.

## 7. Decisions made in this step

| # | Question | Roee's answer (21 Oct) |
|---|---|---|
| 1 | The Overview's structure | **Stat tiles, then a chart.** Impeccable's roll (`concept-seed --scope surface --mode operate`, seed `dacc11f8`) dealt positions 7, 1 and 2 of seven ranked structures: stat tiles over a chart (the dealt lead), the verdict then the counter, and today then the month. Roee took the dealt lead. The decision page closes unseen in a hidden pane here, so the three came through the question tool, each with a wireframe at 375px (§8.3) |
| 2 | Time on the charts in Hebrew | **Like the numbers.** Oldest at the left and today at the right in both languages, as a number line; the figures on a chart already read left to right inside Hebrew, and a rising fortnight now rises in both languages |
| 3 | The answers' secondary text | **Every answer light takes its own deep tint,** not only the "not recorded" answer Roee asked for (§8.4, §8.8) |
| 4 | The CSV export | **Managers and the owner.** Staff keep search, the filters and copying one customer's number |

The six challengers the roll dealt (a split-flap board, an acetate manual, a
design annual's plates, a zoo map, labanotation, a jet-age ticket wallet) were
declined on audience identification for a counter screen. The ticket wallet's
"nothing disappears, it cancels" is already in Lightbox.

## 8. The new pages

### 8.1 What is fixed

- **Every route** of the four, and their role and plan gating: all four are
  staff and up.
- **Every call in `docs/dashboard-routes.md`** for these pages, the same as
  today and no others:

  | Page | Calls |
  |---|---|
  | Overview | `listTemplates`; `getTemplateDesign`; on Pro, `listAllCustomers` and the 60-day activity walk (`fetchActivityWindow`, 100 a page, its guard unchanged); manager and up, `previewCard`, then `useWalletPass` polling `GET /api/cards/{serial}` every 3 s, at most 20 times |
  | Scan | `listTemplates`; `scanCode` per code; `getPublicCard` on a 409; `redeemCard` |
  | Customers | `listAllCustomers` on every plan; manager and up, `getMessagingSummary` (`can_send` decides "message"); `adjustCardStamps` with `expected_stamp_count`; `sendCustomerMessage` (manager and up, when `can_send`); `deleteCustomer` (manager and up) |
  | Activity | on Pro, `fetchActivityWindow` back to the period's start (7, 14 or 30 days, at most 15 pages), again on each period change |

- **The scan's refusals:** 404 is not one of your cards, 429 is stamped too
  recently, 409 is resolved by `getPublicCard` into full or cancelled.
  `src/lib/scan.ts` stays as it is: the payload reading, the 10 s repeat
  window and the classification.
- **Search, filters, sort and the export run in the browser** over the whole
  list. `?search=` stays unused.
- **Pro-only reads don't run on Free:** the Overview's roster and activity,
  and Activity's walk.
- **The stamp buttons only when `VITE_STAMP_ADJUST_ENABLED` is `true`.** With
  the flag off they are not drawn at all, rather than drawn disabled with a
  sentence about a backend endpoint.
- **`?activated=1`** after checkout: the Overview says "you're live", and the
  shell's sign switches on and the tour holds back, as Phase 2 built them.
- **The tour's anchors:** `overview-lead` on the Overview's lead in every
  state, and `customers-roster` on the roster (and on its empty state). The
  shell's `nav-scan` is untouched.
- **`activityFilters.ts` and `overviewBrief.ts` keep their tests passing;**
  where they change, their tests change with them (§11).
- **Untouched:** `src/api`, `src/auth`, `src/hooks`, `src/config`,
  `src/lib`, the pass previews and the shell.

### 8.2 Lightbox, page by page

Each of the four pages calls `useLightboxPage()` at its top (shell brief §8).
While one is mounted, `<html>` wears `theme-lightbox` (and `theme-night` at
night) instead of the old pair, so the wall, the street and the overscroll are
Lightbox's, and the seam at the frame's edge closes for the counter. Nothing
on these pages uses the old primitives (`dashboard/primitives.tsx`,
`marketing/primitives.tsx`, `ctaClasses`, `fieldClasses`, `PunchMark`) or the
old type classes (`t-h3`, `t-stat`, `t-eyebrow`, `t-figure`).

### 8.3 The Overview: stat tiles, then a chart

**On Pro, at 375px, top to bottom:**

1. **The title,** "סקירה", in `type-title`.
2. **On `?activated=1`:** a lit notice, the ok badge with "אתם פעילים! לקוחות
   אמיתיים יכולים להצטרף עכשיו." (`billing.success.done`). In place, never
   a toast.
3. **The tiles, a 2×2 grid** under the label "30 הימים האחרונים", the grid
   carrying `data-tour="overview-lead"`. Each tile: a label (`type-label`),
   its figure (the kit's `Figure` at `stat`, Rubik tabular, isolated), and at
   most one line under it. In Hebrew the first tile sits at the top right.

   | Tile | Figure | Its line | Goes to |
   |---|---|---|---|
   | חזרו · Came back | People seen on two or more days in 30 | Against the 30 days before, when proved ("12 יותר מ־30 הימים שלפני"); said plainly when it can't be ("אין השוואה: 30 הימים שלפני לא נטענו במלואם") | Nowhere; it is the verdict |
   | לקוחות · Customers | The roster without cancelled cards | None | Customers |
   | חדשים · New | Cards opened in 30 days | Against the 30 days before (`joinedDelta`, exact: it comes off the whole roster) | Customers, sorted by "joined recently" |
   | הטבה מחכה · Reward waiting | Full cards waiting now | "28 בחותמת אחת להטבה" (`oneAway`) | Customers, filtered (`?filter=ready`; the line opens `?filter=oneAway`) |

   - **The verdict's tile is the lit one:** it wears the band's light
     (`LitPanel light="band"`), the dashboard's one loud surface, and keeps
     its light at night, where it is the brief DESIGN.md names among the lit
     things. The other three are ordinary panels.
   - **A rise is said out loud** (the ok badge with its arrow). A fall or
     no change is said quietly in ink-muted. A slow month is never red.
   - **The links** are a query on an existing route, `/dashboard/customers`;
     Customers reads `filter` and `sort` on arrival. No route is added.
4. **A quiet line when the counter has gone quiet:** "אף אחד לא קיבל חותמת
   מאז יום שלישי. השילוט עדיין על הדלפק?" when `quietDays` is 3 or more.
   It is computed today and never shown.
5. **The chart, "אנשים ביום":** the brief's `days` series (people a day, 30
   days) as a real line, by §6's rules.
   - Today is at the right, its value labelled at the end ("היום · 14"),
     and the peak is labelled once.
   - It is a picture with a readout, not a filter. Its foot links to
     Activity ("לכל הפעילות").
   - Days the walk didn't reach are left undrawn and labelled "לא נטען",
     never drawn as zero.
6. **The week, "השבוע":** total stamps, against last week, and seven bars.
   - The bars are in ink, today at the right, the peak labelled once,
     weekdays at 13px.
   - A week with nothing in it stays the owner's own unfilled card, drawn
     with the kit's `StampRow`.
7. **What customers see** (`dashboard.groups.facing`, the shell's heading),
   for managers and the owner:
   - **The join QR,** "קוד ה-QR להצטרפות", lit at night (`.theme-lit`), with
     "copy link".
   - **Their own pass,** "הכרטיסייה שלכם", standing on the kit's
     `WallpaperStage` (Lightbox's change 1), with "add to wallet". There is
     no notification over it: this page reads no messages.

   Staff see the join QR alone, titled the same, with no group heading: it
   is the one thing here they use, to show a customer who wants to join.
8. **"Put PunchMe on your phone"** (`InstallApp`), last and quiet, rebuilt
   on the kit. Its iPhone caveat is words and an icon on a plain panel, not
   an amber wash.

**Honest figures.**
- **Loading:** tiles and chart are the kit's `Skeleton`s until both reads
  settle. Never a 0 or "nobody came back" before they have.
- **Floors per window, not per walk:**
  - `buildBrief` learns how far the walk reached from the oldest event it
    holds.
  - The 30-day figures are exact whenever that event is older than the
    window's start, which is the demo's case.
  - Only the comparison waits for the 30 days before it.
  - When a figure really is a floor, it says so in words ("לפחות 178"),
    the number isolated. Never a bare "+".
  - The same rule for the week's total against last week.
- **The roster:** when the roster walk stops at its guard, the customers
  tile reads "לפחות 2,500", and a line under the tiles says the list
  stopped there.
- **Failure:** if a read fails, the tiles give way to one notice, "הנתונים לא
  נטענו", with "נסו שוב" (a refetch). Today a failed read draws zeros.

**A Pro shop with no customers yet** (the day of activation, and every day
until the first join): the tiles and chart give way to one lit panel carrying
`overview-lead`, "עוד אין לקוחות · שימו את קוד ה-QR ליד הדלפק. מי שיסרוק
יופיע כאן.", with the join QR itself large inside it and, for managers and the
owner, a link to the Standee. The tiles appear with the first customer.

**On Free.** None of the Pro reads runs. The lead carries `overview-lead`.

| | The lead | Then |
|---|---|---|
| Owner | One activation panel: "עדיין לא פעיל" (`dashboard.plan.notLive`). Activation costs ₪99 a month (`PUNCHME_MONTHLY_PRICE`, isolated), and from then on real customers can join, messages really send, the standee prints and referrals open. "הפעלה" is the screen's one coral button, to Billing | Their own pass on its wallpaper ("Try it yourself, free, before activating"), then the install prompt |
| Manager | The same panel and the price, with "הבעלים מפעיל/ה את הכרטיסייה" instead of the button | Their own pass, then the install prompt |
| Staff | One line: "עדיין לא פעיל. אחרי שהבעלים יפעיל/תפעיל את הכרטיסייה, כאן יופיעו מי חזר/ה, מי חדש/ה ומי מחכה להטבה." | The install prompt |

The three-step checklist goes:
- step 1 (designed) was true and had nothing to do;
- step 2 (print) is Pro only;
- step 3 is the panel's button.

The join QR panel goes on Free, because `/join` turns customers away until
activation. The panel says the QR goes live with it.

**From 1024px:** the four tiles in one row; the chart and the week side by
side (two thirds and one third); the QR and the pass side by side.

### 8.4 Scan

The counter's one action. Lightbox's Scan at 375px (visual-world §4, DESIGN.md
"The lit panel and the scan's photo snap") is the composition, made to read at
arm's length.

**The screen at 375px:**

- **One sign row:** "סריקת כרטיסייה" in `type-sign` (20px), with Light and
  Sound as pill toggles at its end. Each toggle is 44px tall with
  `aria-pressed`; "on" is an ink pill. The two-line lead goes: the tour and
  the aim line teach it, and its 44px row goes back to the frame.
- **The viewfinder:** 343×343, 28px corners, camera glass (`#0e0c0a`), never
  lit. The reticle and the aim line are in Panel Light (17.97:1). The
  sweep line is the reader's "still looking" signal; under reduced motion it
  pulses its opacity slowly instead of disappearing.
- **Below it:** the tally on one line ("4 חותמות · הטבה אחת נמסרה · לכל
  הפעילות"), then "הקלדת קוד", a pill.

**The answer: an inset lit panel 12px inside the frame,** 24px corners, under
the kit's `SnapFlash`, settling with `LitPanel snap`; its newest stamp lands
with `StampRow land="snap"`. Each answer is read in this order, from the
farthest away to the nearest:

1. **The light**, the whole panel.
2. **A 48px state glyph**: lucide, stroke 2.5. At 55cm it subtends about 49′.
3. **The word**, in `type-answer` (24px).
4. **The count, on the answers that have one**: the kit's `Figure` at
   `count`, 64px Rubik 700 tabular, isolated. About 46′.
5. **The card's stamps**, as the kit's `StampRow`: one unbroken row, the next
   stamp marked "now". About 31px a stamp on an 8-stamp card and 20px on a
   12-stamp one.
6. **One secondary line**, `type-body` at 16px, in the light's own deep
   tint (§7, §8.8).

| Answer | Light | Glyph | Word | Then |
|---|---|---|---|---|
| Stamped (200) | Punched `#c9f0d9` | Check, ink | "נוספה חותמת" | The count, the stamps, "עוד 3 חותמות להטבה" in `#224c37` |
| Card full (200, `reward_ready`) or already full (409 → full) | Full `#ffd36b` | Gift, ink | "הכרטיסייה מלאה!" or "הכרטיסייה כבר מלאה" | The count, the stamps all filled, the reward (Assistant 600, 18px, ink), "מסירת ההטבה" as an ink pill (14.88:1) and "לא עכשיו" quiet. Held 15 s |
| The reward handed over | Punched | Check, ink | "ההטבה נמסרה" | "הכרטיסייה התאפסה, והכרטיס בארנק כבר התעדכן." in `#224c37` |
| Stamped too recently (429) | Panel Light `#fff4e6`, the refusal's | Clock, warn `#92400e` (6.52:1) | "כבר הוחתמה", in warn | The reason and what to do, in ink-muted (7.47:1). No count |
| Not one of your cards (404), the sign-up poster, a foreign code | Panel Light | Triangle (or QR for the poster), warn | Its word, in warn | The reason, in ink-muted |
| Cancelled (409 → void) and not recorded (any other failure) | Failed `#ffc9c2` | CircleAlert, ink | "הכרטיסייה בוטלה" or "החותמת לא נרשמה" | The reason in `#66302a` (7.11:1): a Hebrew sentence per cause, never the server's English |
| Reading | No light | None | None | "קורא…" in Panel Light on the glass, and no flash: the snap belongs to the answer |

- **Punched and already punched:** they now differ in light (mint against
  warm white), in glyph (a check against an amber clock), in whether a 64px
  count is there, and in sound, which `feedback.ts` already makes different.
- **Not recorded, per cause:**
  - offline: "אין חיבור. בדקו את הרשת וסרקו שוב.";
  - a 5xx: "השרת לא ענה. סרקו שוב בעוד רגע.";
  - a 403: "החשבון הזה לא יכול להחתים כרטיסיות כאן.";
  - anything else: "משהו השתבש. סרקו שוב.";
  - a failed redemption: "ההטבה לא נרשמה", with the same causes.
- **The button and its result are two things:** "מסירת ההטבה" (Give the
  reward) asks; "ההטבה נמסרה" (Reward given) answers.
- **Holding:** every answer keeps today's hold times (`HOLD_MS`), and the
  clock pauses while focus or a pointer is inside the answer, so a focused
  "Close" never vanishes from under a keyboard (WCAG 2.2.1).
- **The live region** says the answer in words, once: "נוספה חותמת: 4 מתוך
  8. עוד 4 להטבה."; "הכרטיסייה מלאה: קפה חינם"; never "4/8".

**Typing a code is a second scanner.**

- **When the camera isn't running** (starting too long, blocked, no camera,
  not https, failed):
  - the field opens and takes focus by itself;
  - the viewfinder folds to a short glass band holding the camera's state
    and its one way out;
  - the answer lights in that band, right above the field, where the open
    keyboard doesn't reach.
- **"The camera is blocked"** says how to allow it again and keeps "נסו שוב"
  as a secondary button. The typed field is already there.
- **On a desk or a tablet with a keyboard** (`hover-fine`), the field is
  always open and keeps focus after each answer, so a USB or Bluetooth
  scanner that types a code and Enter works as a second camera.
- **On a phone with the camera running,** "הקלדת קוד" opens the field; after
  an answer it lets go of focus, so the keyboard closes and the answer is in
  view.
- **The field:** the kit's `Input`, 48px, `dir="ltr"`, its label "קוד
  הכרטיסייה", and "החתמה" (Stamp) as its button. The code is Latin, so the
  field's text is the one place on this page that IBM Plex Mono may set
  (DESIGN.md: card codes).

**On Free** the camera doesn't open: there is nobody to scan, and a
permission asked for nothing is a permission refused later. The viewfinder
stays dark glass with "הכרטיסייה עדיין לא פעילה" in Panel Light, and:
- for the owner, "הפעלה" to Billing (a lit secondary button);
- for a hire, "אחרי שהבעלים יפעיל/תפעיל אותה, מחתימים כאן." with no link.

There is no typed field on Free.

**At night** the page is the street and the viewfinder dark glass, so the
answer is the only lit thing on the screen.

**From 768px** the column is at most 560px wide and centred, the viewfinder
square at the column's width, and the field always open.

### 8.5 Customers

**At 375px, top to bottom:**

1. **The title** "לקוחות" with the count beside it ("300", isolated). For
   managers and the owner, "ייצוא" (Download) at the row's end, a 44px
   secondary button; staff don't see it (§7).
2. **Search:** the kit's `Input`, `type="search"`, "שם או טלפון".
   - It compares phone numbers as national numbers on both sides: digits
     only, a leading 972 becomes 0. So "050-000-9242", "0500009242",
     "+972 50 000 9242" and "500009242" all find +972500009242.
   - Names are compared folded, as today, and the card's name stays
     searchable.
   - It lives in a small pure module beside the page
     (`customerSearch.ts`) with its own test. `src/lib` is frozen.
3. **Filters,** chips that wrap and never scroll sideways, each with its
   count:
   - "כולם", "הטבה מחכה" and "חותמת אחת להטבה" always;
   - "בלי חותמות" when it has any;
   - "בוטלו" only when there are cancelled cards.

   "In progress" goes: it is everyone else, and the default sort already
   puts the closest first. Then the sort, the kit's `Select`: "הכי קרובים
   להטבה", "הצטרפו לאחרונה", "שם".
4. **The roster:** one lit panel holding one list (the kit's `List`), the
   same shape at every width, carrying `data-tour="customers-roster"`.
   - **A row** is about 60px and is one button that opens the customer:
     - **leading,** a 40px monogram: a person glyph when there's no name;
     - **title,** the name. `dir="auto"` and `text-align: match-parent`, so
       a Latin or Cyrillic name keeps its first word and still lines up with
       the Hebrew ones. It wraps to two lines before an ellipsis. With no
       name, the number is the title;
     - **meta,** the number as an Israeli reads it ("050-000-9242",
       `dir="ltr"`), omitted when there is none;
     - **trailing,** the count ("7/8", the kit's `Figure`) and at most one
       badge: "הטבה מחכה" on gold, "עוד חותמת" (one more) as a neutral
       badge, or "בוטלה" in warn words with its icon.
   - **No row** carries a stamp button, a menu or a coloured edge any more.
5. **Under the list:** "מוצגים 20 מתוך 300" and "עוד 20", which appends.
   There are no pages to count, and no Back at the foot of a long list.

**The customer, in a sheet** (the kit's `Sheet`: up from the bottom on a
phone, in from the end edge from 768px), opened by the row:
- **The name,** whole. The number with "copy" (a toast confirms the copy:
  the owner's own action).
- **The card,** as the kit's `StampRow`, its count and its state.
- **"−" and "+"**, 48px and 16px apart, only when the flag is on. A press
  says what it did in a toast with "Undo", which sends the opposite delta
  with the new `expected_stamp_count`. A 409 conflict refetches and says the
  count changed meanwhile.
- **"Message"** (manager and up, when `can_send`), opening the short
  message in the same sheet.
- **"Remove"** (manager and up), at the sheet's foot, in danger words. It
  opens the kit's `Dialog` with today's honest copy about the wallet pass,
  focus on "Cancel", never on "Remove".
- **Failures** are said in the sheet, in words with their icon, in the
  page's language: a failed removal or adjustment never shows the server's
  English.

**Arrival:** `?filter=ready`, `?filter=oneAway` and `?sort=recent` (from the
Overview's tiles) set the chips and the sort.

**States:**
- **Loading:** the kit's `SkeletonRows`.
- **No customers (Pro):** the kit's `EmptyState`, "עוד אין לקוחות". Its
  action is the Standee for managers and the owner, and the Overview's join
  QR for staff.
- **Free, never activated:**
  - the owner: "אחרי ההפעלה, כל מי שמצטרף/ת יופיע/תופיע כאן", with
    "הפעלה" to Billing;
  - a hire: the same sentence with "אחרי שהבעלים יפעיל/תפעיל את
    הכרטיסייה", and no link.
- **Free after Pro** (the shop dropped back): the roster as usual, under a
  notice that new customers can't join, with "הפעלה" for the owner.
- **The roster's guard:** "הרשימה נעצרה ב-2,500 לקוחות, אז החיפוש, הסינון
  והייצוא מכסים רק אותם." No "API", no "parameter".
- **No match:** "לא נמצאו לקוחות" with "clear search and filters". When the
  search had digits, a hint that a number can be typed as it's said.

**From 1024px** the list keeps its shape at a readable width (up to 720px),
with the sheet coming in from the end edge. The desktop table goes: the list
already says everything the table did.

### 8.6 Activity

**At 375px, top to bottom:**

1. **The title** "פעילות".
2. **One row of filters above everything they scope:**
   - the period, the kit's `SegmentedControl` ("7 ימים · 14 · 30"; the
     chosen one an ink pill, never wrapping);
   - then "סינון", a secondary button showing how many filters are on. It
     opens the kit's `Sheet` with the search, the action (the kit's `Select`
     or `RadioGroup`), the person (only when there is more than one) and
     "נקו הכול".

   From 1024px the search and the two selects sit in the row itself. A day
   picked on the chart joins the row as a removable chip.
3. **The chart, "חותמות ביום":** stamps a day by §6's rules.
   - Today is at the right.
   - The chart's one hit surface snaps to the nearest day. Tap or press
     Enter to filter the list to that day; the arrow keys move a day
     earlier or later.
   - Unfiltered, it is the net the shop handed out. With one action chosen,
     it is that action's size, as `dayTotals` does today.
   - Its total sits in the panel's head.
4. **The list,** grouped by day under headers that carry the day and its
   count ("היום · 14", "אתמול · 31", "יום ג׳, 14 באוק׳ · 43"). Each event is
   a row:
   - the customer, or their card's short code when the feed has no name;
   - the action in one word ("חותמת", "מתנה", "נוספה ידנית", "הוסרה" in
     warn words, "ייבוא");
   - the time, and who.
5. **Under the list:** "מוצגים 50 מתוך 714" and "עוד 50". Silent when
   everything fits.

**States:**
- **A period change** keeps the last chart and list on screen at reduced
  opacity, with a polite "טוען…" status, until the new period lands. No
  blank, no mono.
- **The walk's guard:**
  - "בתקופה הזו היו יותר מ-1,500 אירועים, אז מוצגים רק האחרונים, מ־25
    בספט׳.";
  - the chart draws from that day on, and the days before it are a band
    labelled "לא נטען", never zeros;
  - the 7- and 14-day periods are unaffected.
- **Nothing in the period:** the kit's `EmptyState`, "לא נרשמו חותמות ב-14
  הימים האחרונים", with "30 ימים" as its action when a longer period exists.
- **Free:** the same role-aware panel as Customers.

**Who:** the email's local part, as today, because the feed carries nothing
else. It is set `dir="ltr"`, and allowed to wrap in the meta line rather than
push the row.

### 8.7 Pieces the pages share

- **From the kit, as they are:** `Button`, `LinkButton`, `Input`, `Select`,
  `SegmentedControl`, `RadioGroup`, `LitPanel`, `Badge`, `Figure`, `List`,
  `EmptyState`, `Skeleton`, `SkeletonRows`, `Loading`, `Dialog`, `Sheet`,
  `useToast`, `StampRow`, `SnapFlash`, `WallpaperStage`, `focusRing`.
- **Two the kit lacks. Step B asks before adding either to the kit**, as the
  shell brief said:
  - `Notice`: an icon and words on a plain panel, in ok, warn or danger,
    with an optional action. For "you're live", the guards, the quiet
    counter and Free after Pro. Today's `Notice` paints warm washes.
  - `FilterChips`: single-choice chips with counts that wrap, the chosen one
    in ink. Phase 6's Messages and Referrals would use it too.
- **New beside the pages, not in the kit:**
  - `StatTile`;
  - one line chart (today's `ActivityChart`, reworked to serve the Overview
    as a picture and Activity as a control);
  - the week's bars (`WeekLedger`, reworked);
  - `ScanAnswer`;
  - `CustomerSheet`.

  `CardPunches`, `RowMenu` and the band's `Brief.tsx` go once nothing uses
  them. `Monogram`, `QuickMessage`, `RemoveCustomerConfirm` and
  `StampAdjuster` are rebuilt on the kit inside the sheet.

### 8.8 Colour, type and states

- **Coral** is the Scan circle (the shell's) and, on these pages, only the
  Free owner's "הפעלה". Every chart, every "selected" and every chosen chip
  or segment is ink.
- **Gold** is the reward: the full answer's light and the "הטבה מחכה" badge.
- **Three new colours, one per answer light,** for its secondary line.
  Measured by visual-world §13's method:

  | Token | Hex | On its light |
  |---|---|---|
  | `answer-punched-ink` | `#224c37` | 7.85:1 on `#c9f0d9` |
  | `answer-full-ink` | `#504019` | 7.07:1 on `#ffd36b` |
  | `answer-failed-ink` | `#66302a` | 7.11:1 on `#ffc9c2` |

  Each is its light's own hue, darkened in OKLCH to L 0.38. The refusal
  answers on Panel Light and keeps ink-muted (7.47:1).
  - **Step B adds them** to `tailwind.config.js` beside the answers, with
    their ratios, and to DESIGN.md's colours.
  - **DESIGN.md's Don't changes** from "anything but ink on a scan's answer
    light" to "anything but ink or its light's own tint". This also settles
    a contradiction: the config's comment allows ink-muted there, while
    DESIGN.md forbids it.
- **Type:**
  - `type-title` for page titles and `type-card-title` for panels;
  - `type-label` for tile labels and `type-tag` for badges and chart labels;
  - the kit's `Figure` for every number, which isolates it with `dir="auto"`.
    Checked: "4 / 8" stays in order, and a bare span reads "8 / 4";
  - `Intl.NumberFormat` for every count from 1,000 ("2,500");
  - nothing under 13px, and Plex Mono only in the typed code's field.
- **Every count has its plural keys in both languages:** "לקוח/ה אחד/ת",
  never "1 לקוחות".
- **Charts run like the numbers** (§7): each plot, its bars and its axis
  labels sit in a `dir="ltr"` box, so they don't mirror in Hebrew, while the
  chart's title, its readout and the panel around it stay logical. This
  replaces the mirroring `ActivityChart` and `Brief.tsx` do today.
- **States each page draws:**
  - loading;
  - empty on Pro;
  - Free, for the owner and for a hire;
  - Free after Pro;
  - a guard reached;
  - a read failed (offline included);
  - staff, manager and owner;
  - Hebrew and English;
  - day and night;
  - 320, 375, 768, 1024 and 1280px;
  - reduced motion;
  - 200% text.

### 8.9 Motion (for step C)

Animate by frequency.

- **Scan** is used dozens of times a day, so nothing moves but the answer:
  - DESIGN.md's photo snap: the flash, the panel's settle, the newest stamp
    landing, all done by 300ms;
  - under reduced motion, a 150ms fade, the flash a 0.3 glow and the stamp
    still;
  - the sweep pulses instead of vanishing.
- **The Overview:**
  - its tiles arrive by light once, on the first load (`LitPanel arrive`),
    and never again on a refetch;
  - no figure counts up.
- **Customers:** the sheet moves the kit's way, and nothing else does.
- **Activity:** a period change crossfades the line in 150ms; a picked day's
  band appears at once.

## 9. What the shell left here

The shell brief's §12 asked Phase 5 to settle four things:

1. **The hire panel on a Free Overview had no `overview-lead`.** Staff on Free
   now get one true line, and it carries the anchor, so the tour's stop
   lights it instead of centring (§8.3).
2. **The Free checklist linked a manager to Billing, which refuses them.** The
   checklist goes. The activation panel has its button for the owner alone,
   and a manager reads that the owner activates, with the price (§8.3).
3. **Scan said "הפרס ניתן" where the glossary says הטבה.** The button is
   "מסירת ההטבה" and its answer "ההטבה נמסרה", and every string on the four
   pages moves to חותמת and הטבה (§10).
4. **The Overview's "Setup" heading should follow the shell's groups.** It
   becomes "מה שהלקוחות רואים" (`dashboard.groups.facing`) over the join QR
   and the owner's own pass, for managers and the owner. Staff see the QR
   with no group heading. `dashboard.groups.setup` is left unused and waits
   for Phase 10.

The shell's other notes hold. The tour's Overview stop ("who came back this
month, and what happened this week") still describes the tiles and the week.
Its Customers stop ("who is one stamp away") is now true in the row as well
as in a chip.

## 10. Copy

Every string goes through `t()`, in `en` and `he` together. These are drafts in
the product's voice (plural to the reader, slash forms for people, the
glossary's terms); step D's `/impeccable clarify` settles them.

**The glossary pass, on all four pages:**
- ניקוב, נוקבה and ניקובים become חותמת, הוחתמה and חותמות;
- פרס becomes הטבה;
- the English "punch" becomes "stamp";
- singular people take slash forms (הלקוח/ה, יפעיל/תפעיל, מצטרף/ת);
- the brand is "פאנץ' מי" in Hebrew, as the shell's titles have it.

That covers about 40 keys today:
- under `dashboard.scan.*`: `result`, `tally` and `manual`;
- under `dashboard.customers.*`: `columns`, `filter`, `status`, `sort`,
  `stamps`, `remove`, `message` and `truncated`;
- under `dashboard.activity.*`: `action`, `chartTitle`, `emptyPeriod` and
  `emptyPro`;
- `dashboard.week.stamps`, `dashboard.brief.verdict_one` and
  `team.notReady`.

Developer text leaves the UI: `dashboard.customers.stamps.pendingBackend` (it
points to a doc) and `dashboard.customers.truncated` ("until the API gains a
search parameter"). The message hint's Hebrew says "only he sees it" where
the English says "only she": both become "only they".

| Key | English | עברית |
|---|---|---|
| `dashboard.scan.result.stamped` | Stamped | נוספה חותמת |
| `dashboard.scan.result.toGo_one` / `_two` / `_other` | 1 more to the reward / {{count}} more to the reward | עוד חותמת אחת להטבה / עוד {{count}} חותמות להטבה |
| `dashboard.scan.result.redeem` | Give the reward | מסירת ההטבה |
| `dashboard.scan.result.redeemed` | Reward given | ההטבה נמסרה |
| `dashboard.scan.result.tooSoon` | Already stamped | כבר הוחתמה |
| `dashboard.scan.result.tooSoonHint` | It was stamped moments ago, so this scan wasn't counted. If this really is a second visit, wait a minute. | הכרטיסייה הוחתמה לפני רגע, אז הסריקה הזו לא נספרה. אם זה באמת ביקור נוסף, חכו דקה. |
| `dashboard.scan.result.unknownCardHint` | This code isn't a card at this business. Ask them to open the pass in their wallet. | הקוד הזה לא שייך לכרטיסייה בעסק הזה. בקשו לפתוח את הכרטיס בארנק. |
| `dashboard.scan.result.failed` | The stamp didn't go through | החותמת לא נרשמה |
| `dashboard.scan.result.failedServer` (new) | The server didn't answer. Scan again in a moment. | השרת לא ענה. סרקו שוב בעוד רגע. |
| `dashboard.scan.result.failedRefused` (new) | This account can't stamp cards here. | החשבון הזה לא יכול להחתים כרטיסיות כאן. |
| `dashboard.scan.result.failedOther` (new) | Something went wrong. Scan again. | משהו השתבש. סרקו שוב. |
| `dashboard.scan.result.redeemFailed` (new) | The reward wasn't recorded | ההטבה לא נרשמה |
| `dashboard.scan.announce.stamped` (new) | Stamped: {{count}} of {{total}}. {{left}} more to the reward. | נוספה חותמת: {{count}} מתוך {{total}}. עוד {{left}} להטבה. |
| `dashboard.scan.manual.toggle` | Type a code | הקלדת קוד |
| `dashboard.scan.manual.submit` | Stamp | החתמה |
| `dashboard.scan.freePlanHire` (new) | Not live yet. Once the owner activates the card, this is where you stamp it. | הכרטיסייה עדיין לא פעילה. אחרי שהבעלים יפעיל/תפעיל אותה, מחתימים כאן. |
| `dashboard.overview.tiles.returned` / `.customers` / `.joined` / `.ready` (new) | Came back / Customers / New / Reward waiting | חזרו / לקוחות / חדשים / הטבה מחכה |
| `dashboard.overview.atLeast` (new) | At least {{count}} | לפחות {{count}} |
| `dashboard.overview.noComparison` (new) | No comparison: the 30 days before couldn't all be loaded. | אין השוואה: 30 הימים שלפני לא נטענו במלואם. |
| `dashboard.overview.oneAway` (new) | {{count}} one stamp away | {{count}} בחותמת אחת להטבה |
| `dashboard.overview.quiet` (new) | Nobody has been stamped since {{day}}. Is the standee still on the counter? | אף אחד לא קיבל חותמת מאז {{day}}. השילוט עדיין על הדלפק? |
| `dashboard.overview.chartTitle` (new) | People a day | אנשים ביום |
| `dashboard.overview.loadFailed` (new) | The figures didn't load | הנתונים לא נטענו |
| `dashboard.overview.activate.body` (new) | Activating costs ₪{{price}} a month. From then on real customers can join, your messages really send, the standee prints and Refer a friend opens. | ההפעלה עולה ₪{{price}} לחודש. מהרגע הזה לקוחות אמיתיים יכולים להצטרף, ההודעות יוצאות באמת, השילוט מודפס וחבר מביא חבר נפתח. |
| `dashboard.overview.activate.ownerActivates` (new) | The owner activates the card. | הבעלים מפעיל/ה את הכרטיסייה. |
| `dashboard.overview.hireFree` (new) | Not live yet. Once the owner activates the card, this shows who came back, who is new and who has a reward waiting. | עדיין לא פעיל. אחרי שהבעלים יפעיל/תפעיל את הכרטיסייה, כאן יופיעו מי חזר/ה, מי חדש/ה ומי מחכה להטבה. |
| `dashboard.overview.emptyPro` (new) | No customers yet. Put the QR by the counter: whoever scans it shows up here. | עוד אין לקוחות. שימו את קוד ה-QR ליד הדלפק: מי שיסרוק יופיע כאן. |
| `dashboard.qr.title` | The join QR | קוד ה-QR להצטרפות |
| `dashboard.customers.searchPlaceholder` | Name or phone | שם או טלפון |
| `dashboard.customers.filter.ready` / `.oneAway` / `.new` / `.void` | Reward waiting / One stamp away / No stamps yet / Cancelled | הטבה מחכה / חותמת אחת להטבה / בלי חותמות / בוטלו |
| `dashboard.customers.status.oneAway` (new) | One more | עוד חותמת |
| `dashboard.customers.sort.progress` | Closest to the reward | הכי קרובים להטבה |
| `dashboard.customers.truncated` | The list stopped at {{shown}} customers, so search, filters and the export cover only those. | הרשימה נעצרה ב-{{shown}} לקוחות, אז החיפוש, הסינון והייצוא מכסים רק אותם. |
| `dashboard.customers.more` (new) | {{count}} more | עוד {{count}} |
| `dashboard.activity.filters` (new) | Filter | סינון |
| `dashboard.activity.truncated` | The period held more than {{shown}} events, so only the latest are shown, from {{since}}. | בתקופה הזו היו יותר מ-{{shown}} אירועים, אז מוצגים רק האחרונים, מ־{{since}}. |
| `dashboard.activity.notLoaded` (new) | Not loaded | לא נטען |

Reused: `dashboard.plan.notLive`, `billing.activateCta`,
`billing.success.done`, `dashboard.groups.facing`, `dashboard.brief.*` (the
comparison sentences), `dashboard.week.*`, `common.retry`, `common.copied`.

## 11. What step B keeps, touches and checks

**Keeps** everything in §8.1. The guide adds that `activityFilters.ts` and
`overviewBrief.ts` keep their tests passing; where §8 changes them, the tests
change in the same commit and keep every case they have.

**Touches** these, and nothing else:
- `src/routes/dashboard/DashboardOverview.tsx`, `ScanPage.tsx`,
  `scan/ScanResult.tsx`, `scan/ScannerViewport.tsx`, `CustomersPage.tsx`,
  `ActivityPage.tsx`;
- `overviewBrief.ts` and its test: floors per window, and the oldest event
  the walk reached;
- `activityFilters.ts` and its test, if the day grouping lands there;
- a new `customerSearch.ts` and its test: the national number, and the
  phone's display;
- `src/components/dashboard/Brief.tsx`, `WeekLedger.tsx`,
  `ActivityChart.tsx`, `CardPunches.tsx` and `InstallApp.tsx`, or their
  replacements beside them;
- `src/components/customers/`;
- the keys in §10, in `en` and `he`;
- DESIGN.md: the three answer inks, the Don't line in §8.8, charts in ink
  running like numbers, and the brief's lead tile where it names the band;
- `tailwind.config.js`: the three answer inks, with their ratios;
- `src/components/kit`: only `Notice` and `FilterChips`, and only after
  asking (§8.7).

`useQrScanner.ts` and `feedback.ts` stay as they are. As in the shell's phase,
one page per commit.

**Doesn't touch:**
- `src/api`, `src/auth`, `src/hooks`, `src/config` and `src/lib`, so not
  `lib/scan.ts` or `lib/csv.ts`;
- the pass previews;
- the shell, the tour's steps, and the other phases' pages.

**Checks,** in step D, through the browser:
- **Roles and plans:**
  - staff, manager and owner on Pro;
  - staff, manager and owner on Free (staff-free@demo.punchme.test exists;
    a manager on Free is invited from the Team page);
  - a Pro shop with no customers;
  - `?activated=1`.
- **Scan:**
  - every answer from typed codes on the demo data, the way this step made
    them: punched, full, already full, too soon, unknown, the poster, a
    foreign URL;
  - not recorded, with the backend stopped;
  - the typed path at 375×480, the keyboard's height;
  - a hardware scanner's Enter on a desk;
  - the hold pausing under focus.
- **The worst cases:** Appendix A's five states on Customers, Activity and the
  Overview.
- **Rendering:**
  - Hebrew and English;
  - 320, 375, 768, 1024 and 1280px;
  - day and night;
  - reduced motion;
  - 200% text.
- **The keyboard path:** the chart's arrows, the sheet's focus and return,
  and the dialog opening on "Cancel".
- **The console:** clean apart from the two known lines (the two 401s at a
  cold boot, and the stub wallet's logo host).
- **On a real phone, installed, in Hebrew:**
  - the answer read at 55–60cm (visual-world §12 left it open);
  - the camera prompt on an iPhone home-screen app;
  - the keyboard over the typed field.

## 12. Left for other phases, and still open

**Found here, fixed outside the redesign:**
- **`src/api` is frozen,** and it holds the roster's real cap.
  `listAllCustomers` asks for 200 a page and the server answers 100
  (`PAGINATION_MAX_PER_PAGE_SIZE`), so its 25-page guard stops at 2,500
  customers, not the 5,000 `docs/customers-backend-issues.md` assumes. Either
  ask for 100 and raise the guard, or move search to the `?search=` the
  endpoint now has; both change a frozen file or a page's calls, so ask
  first. Until then the pages say where the list stopped.
- **The activity feed names people by email.** `ActivityItemOut` carries
  `business_user_email` only. A display name on it would let Activity say
  "נועה" instead of "noa.m".

**Still open:**
- **A busy shop's comparison.** The Overview's 60-day walk keeps its
  1,500-event guard. A café past about 25 stamps a day has its 30 days
  exact (§8.3) but not the 30 before them, so its tiles say there's no
  comparison. `docs/dashboard-routes.md` gives the Overview's walk no page
  limit and Activity's 15. Raising the Overview's guard costs about one
  more request per 100 stamps; Roee decides at the review.
- **"Is it paying for itself?" in shekels** would need the owner's average
  spend and the reward's cost, which only the landing calculator asks for
  and never stores. Nothing here invents them.
- **The install prompt** may belong in the shell's account sheet once the
  Overview has settled; that is the shell's call, later.

**For other phases:** the Standee still says "no signup" (Phase 6, CLAUDE.md);
the Free Overview's "the standee prints" leans on Phase 7's Billing showing
the same price and what it unlocks.

## Appendix A: the worst-case data

Paste it into the console of a signed-in dashboard tab on the dev server, or
serve it and add it as a script tag. It wraps `fetch` for the roster and the
activity feed only, answers as the server does (newest first, the full
`count`, page sizes capped at 100), and adds a toggle above the phone bar:
Demo, Worst case, Empty, One, 5,000. Demo passes everything through. A reload
removes it. Nothing in the repo changes.

```js
// break-ui-counter.js: Phase 5, step A. Worst-case data for the counter
// pages, in the browser only. Paste it into the console of a signed-in
// dashboard tab on the dev server. Nothing in the repo changes, and a reload
// removes it.
//
// It wraps window.fetch for two GET endpoints, the roster
// (/api/businesses/{id}/customers) and the activity feed
// (/api/businesses/{id}/activity): the same boundary the real data crosses.
// It answers the way the server does: newest first, `count` for the whole
// set, and page_size capped at 100 (django-ninja's
// PAGINATION_MAX_PER_PAGE_SIZE), so the client's own paging and its page
// guards run exactly as they would against a real shop.
//
// A toggle sits above the phone bar: Demo · Worst case · Empty · One · 5,000.
// Demo passes every request through to the local backend.
(() => {
  if (window.__breakui) {
    window.__breakui.show();
    return "break-ui: already installed";
  }

  const DAY = 86_400_000;
  const REQUIRED = 12; // the renderer's maximum card length
  const TEMPLATE = "כרטיסיית הקפה והמאפים של בית הקפה השכונתי באבן גבירול";

  // Deterministic, so every reload of the fixture is the same shop.
  const rng = (seed) => () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  const token = (r, n = 32) => Array.from({ length: n }, () => ALPHABET[Math.floor(r() * 64)]).join("");
  const uuid = (r) => {
    const h = () => Math.floor(r() * 16).toString(16);
    return `${Array.from({ length: 8 }, h).join("")}-${Array.from({ length: 4 }, h).join("")}-4${Array.from({ length: 3 }, h).join("")}-a${Array.from({ length: 3 }, h).join("")}-${Array.from({ length: 12 }, h).join("")}`;
  };
  const phone = (r) => `+9725${Math.floor(r() * 10)}${String(Math.floor(r() * 1e7)).padStart(7, "0")}`;

  // Real naming patterns of an Israeli counter: Hebrew, Arabic, Russian and
  // English names, double-barrelled surnames, a name with a geresh, a name
  // with an emoji, one letter, none at all, and a note typed into the name
  // field (the join form has no maxLength; the column takes 120).
  const NAMED = [
    { name: "אלכסנדרה וישנייבסקה-קובלצ'יק", count: 12 },
    { name: "Bartholomew Fitzgerald-Montgomery III", count: 12 },
    { name: "", count: 12 },
    { name: "محمد أبو ربيعة", count: 11 },
    { name: "Александра Кузнецова-Петрова", count: 11 },
    { name: "ע", count: 11 },
    { name: "נועה Smith-Goldberg", count: 11 },
    { name: "Maya 🌸 בן דוד", count: 10 },
    { name: "יוסי (בעלה של מיכל מהקומה השלישית, תמיד בלי סוכר) כהן", count: 10 },
    { name: "שירה-לי בן-עמי אלמוג-רוזנטל מרקוביץ'-אבוטבול", count: 9 },
    { name: "JOSÉ MARÍA GONZÁLEZ DE LA VEGA", count: 9 },
    { name: "רחל אבוטבול", count: 8, noPhone: true },
    { name: "Rachel O'Connor-Abergel", count: 5, void: true },
    { name: "David Lévy", count: 0 },
  ];
  const FIRST = ["נועה", "תמר", "יעל", "מאיה", "שירה", "אביגיל", "רוני", "איתי", "יונתן", "אורי", "דניאל", "עומר", "נועם", "אריאל", "מיכל", "הדס", "ליה", "עדי", "דוד", "משה", "Emma", "Liam", "Olivia", "Noah", "Ava", "Elijah", "Анна", "Дмитрий", "Ольга", "محمد", "أحمد", "ليلى"];
  const LAST = ["כהן", "לוי", "מזרחי", "פרץ", "ביטון", "אברהם", "פרידמן", "אזולאי", "דהן", "אוחיון", "שפירא", "רוזנברג", "בן דוד", "אשכנזי", "קפלן", "Johnson", "Taylor", "Brown", "Иванова", "Смирнов", "خليل", "حداد"];

  function roster(seed, n) {
    const r = rng(seed);
    const rows = [];
    const now = Date.now();
    const push = (name, count, extra = {}) => {
      const full = count >= REQUIRED;
      rows.push({
        card_id: uuid(r),
        customer_display_name: name,
        customer_phone: extra.noPhone ? null : phone(r),
        stamp_count: count,
        stamps_required: REQUIRED,
        status: extra.void ? "void" : full ? "reward_ready" : "active",
        template_name: TEMPLATE,
        created_at: new Date(now - Math.floor(r() * 400) * DAY - Math.floor(r() * DAY)).toISOString(),
        serial: token(r),
      });
    };
    if (n === 1) {
      push("נועה כהן", 11);
      return rows;
    }
    for (const row of NAMED.slice(0, n)) push(row.name, row.count, row);
    while (rows.length < n) {
      const name = `${FIRST[Math.floor(r() * FIRST.length)]} ${LAST[Math.floor(r() * LAST.length)]}`;
      const roll = r();
      const count = roll < 0.06 ? 12 : roll < 0.12 ? 11 : Math.floor(r() * 11);
      push(name, count, { void: r() < 0.01 });
    }
    return rows;
  }

  // Sixty days of a busy café (about 3,000 stamps): Thursday is the peak,
  // Saturday nearly shut, today only up to now. Mostly scans by three people
  // (one with a long email, one called Jo), a few gifts from a rule, a few
  // stamps typed in, a few taken back, and two imports.
  function feed(seed, people, days, perDay) {
    const r = rng(seed);
    const ACTORS = [
      "owner@northwind-coffee.example.com",
      "aleksandra.wisniewska-kowalczyk@northwind-coffee.example.com",
      "jo@northwind-coffee.example.com",
    ];
    const WEEKDAY = [1, 1, 1.1, 1, 1.3, 0.8, 0.15]; // Sunday first
    const now = Date.now();
    const midnight = new Date(now);
    midnight.setHours(0, 0, 0, 0);
    const events = [];
    let imports = 0;
    for (let d = 0; d < days; d += 1) {
      const dayStart = midnight.getTime() - d * DAY;
      const weekday = new Date(dayStart).getDay();
      const n = Math.round(perDay * WEEKDAY[weekday] * (0.8 + r() * 0.4));
      for (let i = 0; i < n; i += 1) {
        const at = dayStart + (7 + r() * 13) * 3_600_000;
        if (at > now) continue;
        const person = people[Math.floor(r() * people.length)];
        const roll = r();
        let source = "scan";
        let stamps = 1;
        let actor = ACTORS[Math.floor(r() * ACTORS.length)];
        if (roll < 0.05) {
          source = "automation";
          actor = null;
        } else if (roll < 0.09) {
          source = "adjust";
        } else if (roll < 0.12) {
          source = "adjust";
          stamps = -1;
        } else if (roll < 0.125 && imports < 2) {
          source = "adjust";
          stamps = 8;
          imports += 1;
        }
        events.push({
          card_serial: person.serial,
          customer_display_name: person.customer_display_name,
          stamps,
          source,
          created_at: new Date(at).toISOString(),
          business_user_email: actor,
        });
      }
    }
    events.sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
    return events;
  }

  const cache = {};
  function data(mode) {
    if (cache[mode]) return cache[mode];
    let customers = [];
    let activity = [];
    if (mode === "worst") {
      customers = roster(7, 64);
      activity = feed(11, customers, 60, 55);
    } else if (mode === "huge") {
      customers = roster(7, 5000);
      activity = feed(11, customers.slice(0, 400), 60, 55);
    } else if (mode === "one") {
      customers = roster(7, 1);
      activity = [
        {
          card_serial: customers[0].serial,
          customer_display_name: customers[0].customer_display_name,
          stamps: 1,
          source: "scan",
          created_at: new Date(Date.now() - 20 * 60_000).toISOString(),
          business_user_email: "jo@northwind-coffee.example.com",
        },
      ];
    }
    cache[mode] = {
      customers: customers.map(({ serial, ...row }) => row),
      activity,
    };
    return cache[mode];
  }

  const state = { mode: "demo", requests: [] };
  const realFetch = window.fetch.bind(window);
  const ROUTE = /\/api\/businesses\/[^/]+\/(customers|activity)$/;

  window.fetch = async (input, init) => {
    const href = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    const method = (init?.method ?? (typeof input === "object" && "method" in input ? input.method : "GET")).toUpperCase();
    let url;
    try {
      url = new URL(href, location.href);
    } catch {
      return realFetch(input, init);
    }
    const match = ROUTE.exec(url.pathname);
    if (state.mode === "demo" || method !== "GET" || !match) return realFetch(input, init);

    const set = data(state.mode)[match[1]];
    const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
    const size = Math.min(100, Math.max(1, Number(url.searchParams.get("page_size") ?? 100)));
    const items = set.slice((page - 1) * size, page * size);
    state.requests.push({ kind: match[1], page, size, at: Math.round(performance.now()) });
    await new Promise((resolve) => setTimeout(resolve, 15));
    return new Response(JSON.stringify({ items, count: set.length }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };

  async function refetch() {
    // Absolute, so it resolves against the app's origin however this script
    // was loaded: the same module record, so the app's own client.
    const { queryClient } = await import(new URL("/src/lib/queryClient.ts", location.origin).href);
    await Promise.all([
      queryClient.resetQueries({ queryKey: ["customers"] }),
      queryClient.resetQueries({ queryKey: ["activity"] }),
    ]);
  }

  // Dev chrome, not the design under test: a plain grey track with a white
  // pill on the chosen segment, above the phone bar, in the system face.
  const MODES = [
    ["demo", "Demo"],
    ["worst", "Worst case"],
    ["empty", "Empty"],
    ["one", "One"],
    ["huge", "5,000"],
  ];
  const bar = document.createElement("div");
  bar.setAttribute("role", "group");
  bar.setAttribute("aria-label", "break-ui data");
  bar.dir = "ltr";
  bar.style.cssText =
    "position:fixed;left:50%;transform:translateX(-50%);bottom:calc(84px + env(safe-area-inset-bottom));z-index:2147483647;display:flex;gap:2px;padding:3px;border-radius:999px;background:#d4d4d4;font:600 12px/1 system-ui,sans-serif;box-shadow:0 1px 4px rgb(0 0 0/.2)";
  const paint = () => {
    for (const button of bar.children) {
      const on = button.dataset.mode === state.mode;
      button.style.background = on ? "#fff" : "transparent";
      button.setAttribute("aria-pressed", String(on));
    }
  };
  for (const [mode, label] of MODES) {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.mode = mode;
    button.textContent = label;
    button.style.cssText = "border:0;border-radius:999px;padding:8px 10px;color:#111;cursor:pointer;font:inherit";
    button.addEventListener("click", () => window.__breakui.set(mode));
    bar.append(button);
  }
  document.body.append(bar);

  window.__breakui = {
    state,
    data,
    async set(mode) {
      state.mode = mode;
      state.requests = [];
      paint();
      await refetch();
      return `break-ui: ${mode}`;
    },
    show() {
      if (!bar.isConnected) document.body.append(bar);
    },
    hide() {
      bar.remove();
    },
  };
  paint();
  return "break-ui: installed (Demo)";
})();
```
