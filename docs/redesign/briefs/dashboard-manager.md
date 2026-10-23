# The manager pages

Phase 6, step A of `docs/redesign/guide.md`: the Standee
(`/dashboard/standee`), Messages (`/dashboard/messages`) with the broadcast
composer (`/dashboard/messages/new`) and the rule editor
(`/dashboard/messages/automations/new` and `/:automationId`), and Refer a
friend (`/dashboard/referrals`). Diagnosed and written on 22 Oct 2026 with
`/impeccable critique`, `/impeccable audit`, `/break-ui`, UI UX Pro Max
lookups and `/impeccable shape` (mode: Operate). No code changed. Step B
builds it on Lightbox (DESIGN.md) and `src/components/kit`, in Plan mode.

The inputs: CLAUDE.md, PRODUCT.md, DESIGN.md (the apricot charts and the
lighter night included), `docs/dashboard-routes.md`,
`docs/redesign/briefs/visual-world.md`, `dashboard-shell.md` (§8, how a page
claims Lightbox) and `dashboard-counter.md` (the patterns these pages share:
the kit's `Notice` and `FilterChips`, the customer sheet, plural keys, a read
that fails saying so). Also the pages' code, the backend's messaging and
referral services, and the pages themselves on the local backend's demo data:
Demo Coffee on Pro (300 customers, two broadcasts, one rule of each kind,
referrals with one flagged) and Demo Barbershop on Free. They were walked as
the Free manager, the Free owner, the Pro manager and the Pro owner, Hebrew
first at 375px, then in English at 1280px and at night. Two reviewers ran
apart for the critique: one walked and read the pages, the other ran
Impeccable's detector and injected its overlay. Break-ui fed the broadcast
list, the rule editor, the referrals list and the standee their worst cases
at the API boundary, in the browser only (Appendix A). Three questions went
to Roee on the way, and §11's at the review (§7).

Read "In short" first. Sections 8 to 10 are what step B builds; §11's
questions are answered in §7, and §13 adds the review's notes, which win
where they differ.

1. In short
2. The pages today
3. Critique
4. Audit
5. The worst cases
6. The lookups
7. Decisions made in this step
8. The new pages
9. Copy
10. What step B keeps, touches and checks
11. Open questions for Roee
12. Left for other phases, and outside the redesign
13. Review notes for step B
- Appendix A: the worst-case data

---

## 1. In short

- **Six routes, one job: what customers see after they leave.** A sign on the
  counter, the messages that bring them back, and the friends they bring.
  Each page claims Lightbox with `useLightboxPage()` and is rebuilt on the
  kit, so the seam (lavender by day, navy at night, under the warm frame)
  closes for the manager group.
- **Messages becomes three tabs** (Roee, from Impeccable's roll, §7): Rules,
  Message everyone, Sent. The violet audience band goes. Each rule's row says
  who it reaches and when it next runs, and is switched by a switch named
  after it. "Message everyone" holds the week's quota and the door to the
  composer. "Sent" holds the history, which opens a message whole.
- **The rule editor leads with one sentence and the message as it lands.**
  "At the next 10:00, the 86 customers who haven't visited in 30 days get
  this, then anyone who reaches 30 days, on that day. Once each, until they
  come back. With one stamp on the card." Under it, the message on the card's
  own wallpaper, and the one action. The fields follow, in sections with
  headings. That answers "who gets it, and when" in one place, and the
  win-back still turns on in three taps.
- **Refer a friend puts decisions first** (Roee, §7). A flagged referral sits
  at the top as a card that says what happened and what each answer does.
  The program is one line with its switch and what it costs, and its
  settings open in a sheet. Who brought whom follows, with filter chips.
- **The standee speaks the language the owner picks** (Roee, §7). It starts
  on the card's language, and English and Hebrew are a choice above the
  paper. It never clips: the name and the reward step down until the sheet
  fits. The QR code gets its full quiet zone, and Print sits under the sheet
  it prints.
- **Seven things say what isn't so, and this phase fixes them:**
  - the standee prints "בלי הרשמה" and "מצטרפים בחצי דקה";
  - the standee clips its own text, even the demo shop's table tent;
  - Messages tells Free and closed shops they have "two sends left";
  - last year's broadcast is dated like tomorrow;
  - a failed read draws an empty page ("no rules yet", "nothing sent yet",
    "no referrals yet"), or "loading" for good;
  - the referrals list is the newest 100, and an older flagged referral never
    reaches the review;
  - a hire is shown three doors to Billing, which refuses them, and no page
    names ₪99.
- **Two things break the layout:** a business name from about 37 characters
  pushes the composer, the editor and Refer a friend sideways at 375px, and
  `cn` doesn't merge classes, so the narrow fields stretch to the full width.
- **The glossary pass reaches these pages:** 27 Hebrew strings still say ניקוב
  or פרס, and a dozen use singular or gendered forms where the voice uses
  the plural and slash forms.
- **Five calls no page makes yet, and one parameter,** are put to Roee in
  §11. Two of them earn a place: the delivery log, for what went out to
  whom, and the referral grants, for what the program cost.

## 2. The pages today

### What each role and plan sees

Checked with real sign-ins for every row. The manager and the owner see the
same pages: none of the five pages branches on the role.

| | Standee | Messages | Composer | Rule editor | Refer a friend |
|---|---|---|---|---|---|
| Free, owner and manager | Print disabled (50%, linked to its reason); an amber notice "הכרטיסייה מוכנה, אבל הקוד עדיין לא פעיל — הפעילו את המנוי…" with a link to Billing; every sheet's code slot says "הקוד עדיין לא פעיל"; no price | A Pro notice with "לשדרוג ל-Pro"; the violet band at 0, 0, 0 ("עדיין אף אחד לא מחזיק בכרטיסייה"); "שליחת הודעה לכולם" and "נותרו לכם שתי שליחות השבוע"; three recipe cards; a history that invites "the first one" | The Pro notice; send disabled, "אין כרגע למי לשלוח"; "שלחו לי דוגמה" works | Prefilled (30 days, 10:00, a gift stamp); "כרגע אין לקוחות שמתאימים"; the primary is "שמירה בלי להפעיל" | The master switch off and disabled; "פרסים על הפניות הם חלק ממסלול Pro" with "למסלולים"; rows, cap and previews editable behind it |
| Pro, owner and manager | Print enabled; a live QR on four designs; "להורדת קובץ: הדפסה ← שמירה כ-PDF" | "הכללים לא פעלו בשעה האחרונה. אם זה נמשך, כתבו לנו." (the local scheduler isn't running); the band at 300, 86, 26, 172; three rules on; two broadcasts in the history | "יישלח לכ-300 לקוחות"; "שליחה ל-300 לקוחות" once a body is typed | "כרגע מתאימים לכלל: 86"; "שמירה והפעלה", "שמירה בלי להפעיל", the sample; an existing rule adds the header switch and "הסרת הכלל" | The program on, one row on (a friend's first stamp gives the member a stamp), the cap at 5 a month; the flagged referral at the head of the list, at the foot of the page |

A Free manager is shown three links that end on Billing's "הדף הזה לא פתוח
בשבילכם": "לשדרוג ל-Pro", "הפעילו כדי לקבל קוד QR" and "למסלולים". None of
the six routes names the price. All six sit inside `RequireRole
minimum="manager"` (`main.tsx:159-173`), so staff get the shell's "not for
your role" panel; staff weren't walked in this step.

### The three questions

**Can an owner switch a win-back on in under a minute, and say who gets it
and when?** Under a minute, yes, when every default suits: three taps and no
typing, but about four screens of scrolling. "כלל חדש" is below the fold and
opens its picker off-screen; the editor is 1,907px long and its primary sits
at the foot. Saying who and when, no:
- the trigger ("לקוחות שלא ביקרו 30 יום", "10:00") and the count ("כרגע
  מתאימים לכלל: 86") are 1,400px apart;
- nothing says whether the 86 all get it at the next 10:00, or each person
  once, on their 30th day;
- the gift is on by default, 86 free stamps, with no word on the cost;
- a second win-back goes through while an identical one is on;
- nothing says that on Android the phone stays silent unless the message
  carries a stamp (PRODUCT.md);
- after saving, "הכלל נשמר." and nothing about the first run.

**Can an owner print a standee that works, and is the page honest on Free?**
The print path is sound: a portal at the end of `<body>`, a scoped `@page`
per paper, `print-color-adjust: exact`, a table tent folded the right way.
But the sheet clips its own text (§5), its QR code has half the quiet zone
the spec asks for, and it prints claims the product doesn't keep. On Free it
is honest about the code (a dashed slot, "הקוד עדיין לא פעיל") and quiet
about the price, and it sends a manager to Billing.

**Does an owner understand what referrals do, what they cost, and what to
do with the flagged one?** What it does, yes: the rows read as sentences.
What it costs, never: "לתת ללקוח פרס" means a stamp, the cap ("5 פרסי הפניה
לכל חודש") is never put in stamps, and "כרטיסייה שלמה" (a whole free reward)
sits beside "ניקוב אחד" at the same weight. The flagged referral is at y
2,403 of a 3,007px page, under a filled violet "לספור", with no word on what
counting gives, to whom, or whether it can be undone.

### Measured

- **Page heights at 375px:** Messages 1,744 (Pro) and 1,687 (Free); the
  composer 1,229; the new rule 1,907; Refer a friend 3,007 (Pro) and 2,643
  (Free); the standee 1,741 (Pro) and 1,865 (Free). At 1280: Messages 1,227,
  Refer a friend 2,373, the standee 1,039. With 25 rules, Messages runs 5,970
  at 375, its history four screens under the rules.
- **No horizontal overflow at 375 with the demo's names;** from a business
  name of about 37 characters the composer and the editor start to run wide
  (377px at 37), and at 77 they run 602px and Refer a friend 598px (§5).
- **Text under 13px:** 17 runs on Messages, 14 on the composer, 19 to 20 on
  the editor, 35 on Refer a friend, 10 on the standee. The band's labels are
  10px Plex Mono, the tags 11px Plex Mono, uppercase and tracked; Plex Mono
  has no Hebrew, so "פעיל", "נשלח", the history's dates and "מתוך" fall back
  to a system face.
- **Contrast:** "פעיל" and "ניקוב ראשון" on their green wash 4.43:1 (4.14:1 in
  the editor's header), under AA at 11px; the off switch's track 1.55:1
  against its panel (WCAG 1.4.11 asks 3:1); the disabled master switch's
  reason 3.32:1.
- **Under 44px:** every `ctaClasses(..., "sm")` button is 40 to 42px (Print,
  "שליחת הודעה לכולם", "כלל חדש", "התחלה", every send and save, "לספור" and
  "לא לספור", the history's pager); "לשדרוג ל-Pro" 74×18; the rule names
  24px tall; the delete confirmation's "כן, להסיר" 49×20 and "ביטול" 29×20,
  8px apart.
- **The QR code:** 37 modules with no margin of its own; the white tile pads
  6% of the code, about 2.2 modules, where ISO/IEC 18004 asks for 4. It
  prints about 80mm wide on the A4 poster, 56mm on A5, 50mm on the tent.
- **The seam:** `<html>` wears `theme-purple theme-raised` on all six routes:
  by day a lavender page (`#f5f6fe`) under the warm-wall frame, at night a
  navy page (`#0f0f23`) under a `#1f1916` masthead and a `#2a241f` bar, and
  every screen carries two brand colours, the violet button and the coral
  Scan.

## 3. Critique

20/40, Acceptable: the mean of three page groups. Two reviewers worked apart
and one after the other, since browser agents share one session:

- **A, design review:** read the code and walked the six routes live as the
  four accounts.
- **B, detector:** ran Impeccable's detector over the nine markup files and
  injected its overlay into five live pages at 375, and Messages at 1280.

A scored 24, 23 and 19 on its own; the worst cases (§5) moved five
heuristics down a point. The snapshots are in `.impeccable/critique/`
(untracked), one per page group, for step D's `/impeccable polish`.

| # | Heuristic | Standee | Messages | Referrals | Key issue |
|---|---|---|---|---|---|
| 1 | Visibility of system status | 3 | 1 | 1 | Messages: "two sends left" on Free and when sending isn't open; last year's broadcast dated like tomorrow; a stalled rule's "next run" in the past; switches and saves silent. Referrals: the list stops at 100 and doesn't say so; the decision is last |
| 2 | Match with the real world | 2 | 2 | 1 | The standee prints "בלי הרשמה" and a 30-second promise; ניקוב and פרס on 27 strings; "פרס" for a stamp; an unknown reason prints its raw key |
| 3 | User control and freedom | 3 | 2 | 2 | Drafts lost on leaving; approve and reject can't be undone and aren't confirmed |
| 4 | Consistency and standards | 2 | 2 | 2 | A violet scope inside Lightbox; some controls save at once and others on a button; the standee in the dashboard's language, the messages in the card's |
| 5 | Error prevention | 1 | 3 | 2 | The standee clips its own sheet; a duplicate rule goes through; the filled primary is on the fraud flag |
| 6 | Recognition rather than recall | 3 | 3 | 2 | Recipes fill every field; what "לספור" does depends on rows 2,000px above |
| 7 | Flexibility and efficiency | 2 | 2 | 2 | No way to read a sent message whole, no history per rule, no filter on referrals |
| 8 | Aesthetic and minimalist design | 3 | 2 | 2 | The band outshouts the actions; a 3,007px settings column; on Free the loudest thing on the standee is a dead button |
| 9 | Error recovery | 2 | 2 | 1 | Errors land at the top of the page, up to 4,500px from the control; "נסו שוב" for a referral already decided; the API's slug in "(body_too_long)" |
| 10 | Help and documentation | 2 | 2 | 2 | Silent on how often a rule reaches one person, on Android, on cost, on what a flag means |
| | **Total** | **23** | **21** | **17** | |

**Specificity.** The behaviour belongs to this product:
- the standee shows four real sheets at thumbnail size, in the owner's
  colours with the live code, and on Free refuses to print a dead code;
- messaging says what a wallet can and can't reach: `{שם}` refused in a
  broadcast, the opt-in toggle disabled when it can't be honoured, rules "on
  hold" when the wallet can't address one pass;
- the preview greets a sample customer in the card's language, and the send
  button carries the count;
- the referral rows read as sentences and never say event, recipient or
  rule.

The look could be any SaaS automations screen: a violet-to-magenta band with
10px mono labels, three identical recipe cards, a lock-screen card in a
stage in a panel, letter-spaced mono tags, amber notices, five identical
handshake icons. The standee is the one page where Lightbox's lit sign is
literal, and it is the most generic violet of the three.

**The detector.**
- **CLI:** 0 findings and 4 advisories over 9 files.
  - Two `design-system-color` on `Standee.tsx:193-194`: false positives, the
    locked slot's fixed ink on its always-white tile (18.88:1).
  - Two `design-system-font-size`, both real: 10px at `primitives.tsx:210`
    (the band's labels) and 11px at `primitives.tsx:265` (the Tag).
- **Overlay:** 24 findings over six runs.
  - `low-contrast` ×3: the ok Tag at 4.4:1, true; three tags share it on
    Messages and one on Referrals.
  - `ai-color-palette` ×1: the friend preview's violet gradient button, true
    but inherited from the real join page (`ReferralJoin.tsx:335`), which
    Phase 8 owns.
  - `nested-cards` ×15:
    - five are segmented tracks, false;
    - six are pictures of paper or of the friend's page, false;
    - three are the lock-screen bubble, partly true (Panel > LitStage >
      bubble is three rounded boxes);
    - one is the review box, true: a warm fill nested in a panel.
  - `tiny-text` and `undersized-ui-text` ×5 on the standee's preview, false
    as type scale (the sheet is sized in `cqw`), true that the proof can't be
    read on a phone.

**Priority issues**

1. **[P1] The standee prints what the product doesn't keep, and clips what it
   prints.**
   - "בלי אפליקציה. בלי הרשמה." (`standee.noApp`) and "מצטרפים בחצי דקה"
     (`standee.steps.join`), on paper that stays on the counter for months.
   - Fixed type in a fixed-ratio panel with `overflow: hidden` (§5).
   - The sheet follows the dashboard's language.

   Fixed in §8.7.
2. **[P1] Messages says things that aren't true for the reader,** and never
   says who and when together (§2). Fixed in §8.3 and §8.4.
3. **[P1] The flagged referral is a blind, irreversible decision, last on the
   page, and the cost is never said.** Fixed in §8.6.
4. **[P1] Doors that refuse hires, and no price.**
   - Three links to Billing for a manager (`MessagesPage.tsx:159-164`,
     `BroadcastComposerPage.tsx:170-175`, `AutomationEditorPage.tsx:430-435`,
     `StandeePage.tsx:127-139`, `ReferralsPage.tsx:183-193`), against CLAUDE.md's
     rule that a hire is never shown a door that would refuse them.
   - None of the six routes names ₪99.

   Fixed across §8.
5. **[P1] A read that fails draws an empty page.** A failed rules read says
   "עוד אין כללים" and offers the recipes again, inviting a duplicate
   (`MessagesPage.tsx:293-339`); a failed history says nothing was sent; a
   failed referrals read says there are none; a failed templates read leaves
   the standee on "טוען..." for good. Fixed across §8.

**Personas**
- **Avi (Free barber deciding):**
  - three zeros, "two sends left" and "nobody to send to";
  - a win-back whose primary is "save without turning on";
  - three doors to Billing, none with a price;
  - a printable "בלי הרשמה".
  The sample to his own phone is the one thing that works, and it is a
  secondary button at the foot.
- **Dana (Pro café owner, between customers):**
  - "כלל חדש" seems to do nothing;
  - "מתאימים: 86" is ambiguous;
  - her draft is gone when a customer walks in;
  - the flagged referral is three screens down under a violet "לספור";
  - Print sits 1,400px above the sheet, and her table tent prints without
    its footer.
- **Sam (screen reader, keyboard):**
  - every rule switch named "הכלל פעיל" (three in the demo, seven in the
    worst case);
  - focus dropped by "כלל חדש", "הסרת הכלל" and the send's confirmation;
  - the audience count, a switched rule and every referral save change
    silently;
  - the composer and the editor have one heading and `<p>` sections.
- **Alex (power user):**
  - no way to read a sent message or a rule's history;
  - segmented controls one tab stop per option;
  - the history at the foot of a 5,970px page, ten at a time;
  - referrals one at a time, no filter.

**Strengths, kept:**
- The standee chooser shows the real sheet in the owner's colours and
  refuses to print a dead code: Print disabled with its reason through
  `aria-describedby`, the thumbnails hidden from the accessibility tree, a
  print path that survives night mode and the rail.
- The broadcast send is honest about consequences: the count on the button,
  a second step that says it can't be undone, the week's sends left, a
  350ms audience count, warnings before the API's own (a gift promised and
  not given, a placeholder a broadcast can't carry), and API errors turned
  into sentences with a fix.
- Switching a rule off is never blocked, and the referral rows never expose
  the API's words.

## 4. Audit

10/20, Acceptable.

| # | Dimension | Score | Key finding |
|---|---|---|---|
| 1 | Accessibility | 2 | Every rule switch has the same name; focus dropped three times; silent state changes; tags at 4.43:1 and 4.14:1; the off switch's track 1.55:1; 10 to 35 runs of text under 13px a page, Hebrew among them set in Plex Mono; one `h1` and `<p>` sections in the composer and the editor |
| 2 | Performance | 3 | Lean: five reads on Messages, polling only while a broadcast sends, six cheap SVG codes on the standee (four thumbnails, the preview, the print copy) |
| 3 | Theming | 1 | All six routes on the old scope: violet fills and "selected", a hard-coded band (`RULE_ON_BAND`), warm washes behind warnings (`bg-warn-bg`), a navy shadow baked into the lock-screen preview, the friend preview's violet gradient; at night a navy page under the warm frame |
| 4 | Responsive | 2 | `cn` is plain `clsx`, so `fieldClasses`'s `w-full` beats `w-20`, `w-24` and `w-auto`: the cap field 309px wide at 375 and the cap sentence four lines; buttons 40 to 42px; a long business name overflows three pages |
| 5 | Implementation integrity | 2 | Three primitive families and nothing from the kit; a failed read draws an empty page; facts fetched and never shown; developer text in the UI |

**Detailed findings**
- **[P1] A failed read draws an empty page, or a page that never finishes**
  (§3, issue 5). The counter pages' rule: a read that fails says so, with
  "נסו שוב".
- **[P1] Hires are shown doors that refuse them** (§3, issue 4).
- **[P1] The referrals list is the first page only.** `listReferrals(businessId)`
  (`ReferralsPage.tsx:99-103`) takes page 1, which django-ninja's
  `PageNumberPagination` cuts at 100, newest first. The queue is filtered
  from that page (`:156`), so a referral flagged before the newest hundred
  never reaches the review, and nothing says the list stopped. The endpoint
  takes `?status=flagged` and `?page=`, which no page sends (§11).
- **[P1] Focus dropped three times.** "כלל חדש" (`MessagesPage.tsx:274-283`)
  and "הסרת הכלל" (`AutomationEditorPage.tsx:710-719`) unmount themselves;
  "שליחה ל-N" is replaced by the confirmation (`BroadcastComposerPage.tsx:214-266`),
  and focus falls to `<body>` (checked). WCAG 2.4.3.
- **[P1] Seven switches, one name.** Every rule's switch is "הכלל פעיל"
  (`MessagesPage.tsx:460-465`), and it says "on" beside a switch that is off.
  WCAG 2.4.6, 4.1.2.
- **[P1] Overflow from a long business name.** The message form's grid
  (`MessageForm.tsx:157`) and the referral previews' grid
  (`ReferralsPage.tsx:270`) have no column template below their breakpoints,
  so the implicit track takes the min-content of the lock-screen preview,
  whose sender line never wraps (`NotificationPreview.tsx:42`). From about 37
  characters the page runs wide; at 77 the fields are 565px on a 375px
  screen.
- **[P2] Silent changes.**
  - The audience count (`MessageForm.tsx:305-323`) is not a live region.
  - Switching a rule (`MessagesPage.tsx:106-115`) and every referral setting
    (`ReferralsPage.tsx:125-141`) save with nothing said.
  - Errors land at the top of the page (`ReferralsPage.tsx:167`), or 329px
    above the rule switch that caused them (`MessagesPage.tsx:287-291`).

  WCAG 4.1.3.
- **[P2] Contrast and size.**
  - The old `Tag` (`primitives.tsx:257-272`) is 11px Plex Mono, uppercase
    and tracked: "פעיל" measures 4.43:1 on its wash.
  - The off switch's track is `bg-ink/20` (`primitives.tsx:418`), 1.55:1.
  - The band's labels are 10px mono (`primitives.tsx:208-213`).
  - Dates are `font-mono` (`MessagesPage.tsx:531`), and the old `Figure`
    sets "מתוך" in Plex Mono.
- **[P2] Widths that don't apply.**
  - `cn` (`src/lib/cn.ts`) is `clsx` with no merge, and Tailwind emits
    `.w-full` after `.w-20`, `.w-24` and `.w-auto`, so `cn(fieldClasses,
    "w-20")` is full width.
  - The cap sentence breaks into four lines (`ReferralsPage.tsx:225-250`,
    `:556`), and the editor's day fields stretch (`AutomationEditorPage.tsx:491`,
    `:515`, `:576`).
  - `src/lib` is frozen; the kit's fields don't have the problem.
- **[P2] The QR code's quiet zone.** `QRCodeSVG` (qrcode.react 4.2) draws no
  margin and the tile pads 6% of the code (`Standee.tsx:166`): about 2.2
  modules. The comment above it (`:159-161`) says the quiet zone is kept.
- **[P2] Headings.** The composer and the editor carry one `h1`; "מתי", "מה
  לכתוב", "מתנה" and "למי" are `<p>` labels (`MessageForm.tsx:156`, `:268`,
  `:306`; `AutomationEditorPage.tsx:460`). WCAG 1.3.1.
- **[P3] Facts fetched and never shown.**
  - `BroadcastOut`: `skipped_count`, `pending_count` and `reached_count`.
  - `AutomationOut`: `last_sent_at`, `sent_total` and `audience_count`.
  - `MessagingSummaryOut`: `birthdays_this_month` and the 14, 60 and 90-day
    `inactive_counts`.
- **[P3] Developer text.** `referrals.errors.invalid` prints the API's slug;
  "powered by PunchMe" is a literal in JSX (`Standee.tsx:330`).

**Positive, and kept:**
- Print disabled with its reason;
- the thumbnails hidden;
- `dir="auto"` on every field the owner types into;
- `role="switch"` on the old toggles;
- `role="alert"` on a failed request;
- the two-step send.

## 5. The worst cases

Break-ui's fixtures entered through the reads they test, by a script that
wraps `fetch` in the browser (Appendix A):
- what it serves: the broadcast list, the rules, one rule, the summary, the
  audience count, the referrals, the program, the referral rules, the
  templates (the card's name, reward and colours) and the business's name;
- how it answers: as the server does, paged the way it pages;
- writes: every write to messaging and referrals gets the refusal the server
  would give, so nothing reached the backend and no capped send was spent.

The 429, the 403, the 409 and the 422 were seen that way. Its toggle has six
states: Demo, Worst case, On hold (every notice at once), Empty, One, and
Many (37 broadcasts, 25 rules, 150 referrals). The standee was measured on
every design and every paper with ordinary and longest lengths.

| # | Severity | Field | Worst case | What happens | Fix |
|---|---|---|---|---|---|
| 1 | Broken | the card's name and reward on the standee | The demo's own "Demo Coffee" and "קפה חינם" on the table tent; a 45-character name with a 60-character reward on A4; the worst (77 and 182 characters, under the columns' 120 and 200) | The panel clips at the bottom. The demo's tent poster loses "powered by PunchMe" and 28% of its third step. Ordinary lengths clip the A4 poster and the tent's other designs (overflow of 10 to 83px on 202 to 403px panels). The worst pushes the QR code past the A4 poster's bottom edge: a sign that can't be scanned | Fit, not clip (§8.7) |
| 2 | Broken | the business's name | From about 37 characters ("המספרה של אבי ובניו ברחוב סוקולוב, רמ…" is 377px wide at 375); the column takes 120 | At 77 characters the composer and the editor run 602px wide and Refer a friend 598px; the title and body fields 565px | `minmax(0, 1fr)` at every width, and the kit's `WallpaperStage`, whose sender truncates inside its own width |
| 3 | Broken | `created_at` a year ago | A broadcast from 23 Oct 2025, today 22 Oct 2026 | "23 באוק׳, 09:00": tomorrow's date. `formatWhen` (`describe.ts:21-29`) has no year | `Intl.DateTimeFormat` with the year whenever it isn't this one |
| 4 | Broken | the referrals list | 150 referrals, three flagged among the oldest fifty | The list and the queue stop at the newest 100 without a word; the three never reach the review | The list says where it stops; the complete queue is an open question (§11) |
| 5 | Broken | `fraud_reason` | A reason this frontend doesn't know ("velocity") | "referrals.list.reason.velocity" printed in the meta line | A fallback sentence for any reason without a key |
| 6 | Ugly | a 409 on a review | The referral was decided meanwhile (another manager) | "זה לא נשמר. נסו שוב." at the top of a 6,180px page, 4,500px above the button; trying again can't help | "Already decided", on the card, and the list refetched |
| 7 | Ugly | a 422 on a rule's text | `referral_rule_invalid`, `body_too_long` | "אי אפשר לשמור את זה כמו שזה כתוב (body_too_long)." | A sentence per slug, under the field |
| 8 | Ugly | a 403 on switching a rule on | `upgrade_required` | "הפעלת כלל ושליחה ללקוחות אמיתיים זמינות במסלול Pro." 329px above the switch, with no way forward | Under the row, with the owner's "הפעלה" or the hire's line |
| 9 | Ugly | counts from 1,000 | 12,480 holders, 3,117 sent | "12480", "3117 מתוך 12480", "שליחה ל-12480 לקוחות", "כרגע מתאימים לכלל: 12480" | `Intl.NumberFormat` in the page's language |
| 10 | Ugly | `next_run_at` in the past | A rule that missed yesterday's 10:00 | "הפעם הבאה: 21 באוק׳" on 22 Oct | A late run says it is late |
| 11 | Ugly | the last send of the week | One send left, confirming it | "נותרו לכם 0 שליחות השבוע" | "זו השליחה האחרונה השבוע." |
| 12 | Ugly | every notice at once | Pro but not open, sending paused, rules on hold | Three amber notices stacked (one of them 50 words), and "נותרו לכם שתי שליחות השבוע" under them | One notice, the one that matters most; no quota where sending is closed |
| 13 | Ugly | titles that start in Latin | "SALE 50% על espresso", "Fresh sourdough…", "<b>חדש</b>" | `dir="auto"` turns them left-to-right and they align to the far edge of the list | `dir="auto"` with `text-align: match-parent` |
| 14 | Ugly | names on both sides missing | Nameless customers; a member card removed | "מישהו הצטרף/ה דרך מישהו"; a removed card reads as "מישהו" | The phone isn't on `ReferralOut`, so "a customer without a name" and "a customer whose card was removed" are said differently |
| 15 | Ugly | 25 rules (the cap) | Many | Messages runs 5,970px; the history is after every rule | Tabs (§8.3) |
| 16 | Fragile | a broadcast's body | 160 characters, a newline, a URL | Cut to one line; the owner can never read what went out | A sent message opens whole in a sheet (§8.3) |

**Decisions this left, settled in §8:**
- a sent message is read in a sheet, not by widening the row;
- dates carry the year whenever it isn't this year;
- the standee fits its text to the paper, and warns when even the smallest
  size won't fit.

**What held up:**
- escaping (`<b>`, `&amp;`, `<script>` render as typed);
- emoji and one-letter rule names ("🎂 יום הולדת שמח! 🎉", "ז");
- names with stray spaces;
- mixed Hebrew and Latin in the referral sentence (readable in Hebrew, though
  not isolated);
- the Hebrew plurals at 1 ("נשלח ללקוח אחד", "נותרה לכם שליחה אחת השבוע",
  "שליחה ללקוח אחד");
- the 429, said with its time ("הגעתם למכסת ההודעות השבועית. השליחה הבאה
  אפשרית ב-25 באוק׳, 14:05");
- the unknown-placeholder warning;
- no overflow at 375 with the demo's names.

## 6. The lookups

UI UX Pro Max (`search.py --domain ux …`):

- `"compose message preview send confirm audience"`: confirm a success
  visibly; show loading, then success or error, after a submit. Taken: a
  sent broadcast says so where it lands, with its progress; a saved rule says
  when it first runs.
- `"settings toggle autosave inline save"`: an error under its field, wired
  with `aria-describedby`; validate on blur. Taken: each referral setting
  says "saved" or its error beside it, and the cap says what's wrong instead
  of reverting in silence.
- `"destructive action confirmation undo"`: confirm before an irreversible
  action. Taken: deleting a rule, and counting or not counting a flagged
  referral, go through the kit's `Dialog` with the consequence said, focus on
  "ביטול".
- `"toggle switch label state"`: a status never by colour alone; a label
  always shown. Taken: each switch named after its rule, its state in words.
- `"empty state first use guidance"`: a message and an action. Taken.
- `"time schedule date picker"`: locale-aware dates, never ambiguous. Taken:
  the year whenever it isn't this one.
- No match for `"scheduled automation rule recurring"` or `"print preview
  paper download"`; those two rest on the backend's own rules and on §8.7.

## 7. Decisions made in this step

| # | Question | Roee's answer (22 Oct) |
|---|---|---|
| 1 | How Messages is laid out | **Tabs: Rules, Message everyone, Sent.** Impeccable's roll (`concept-seed --scope surface --mode operate`, seed `6c0ef4c0`) dealt positions 3, 6 and 1 of seven ranked structures: the week ahead (the dealt lead), tabs, and who you can reach as doors. Roee took tabs. The composer and the rule editor follow it |
| 2 | How Refer a friend is laid out | **Decisions first.** The roll (seed `e6f41d57`) dealt positions 5, 2 and 3: today's sentences on the kit (the dealt lead), decisions first, and roster-led. Roee took decisions first |
| 3 | Which language the printed standee speaks | **The owner picks,** starting on the card's language: a Hebrew and English choice above the paper, so a bilingual shop can print both |
| 4 | The delivery log, `listDeliveries` (§11, at the review) | **Yes.** "Sent" holds the rules' sends and the messages to one customer as well as the broadcasts, and a rule's editor lists its last sends. Broadcasts stay counts, never names (§13) |
| 5 | What referrals cost, `listReferralGrants` (§11) | **Yes.** The program's line says what it gave this month, and a referral's row its gifts (§13) |
| 6 | `listReferrals`'s own parameters (§11) | **Yes.** `?status=flagged` makes the decisions complete however old, and `?page=` lets the list go past 100 (§13) |
| 7 | `getBroadcast`, `testAutomation`, `revokeReferralGrant` (§11) | **Not used,** as the brief recommends |
| 8 | A5, two to an A4 (§11) | **No.** The A5 stays an A5 sheet on A5 paper, with today's hint |
| 9 | A two-language table tent (§11) | **Not now.** Each language prints on its own sheet |

The decision page closes unseen in a hidden pane here, so the rolls came
through the question tool, each structure with a wireframe at 375px. The
seven structures were ranked in writing before either roll. The challengers
each roll dealt were catalog worlds and were declined: the world is settled,
and in Operate a world lends type, palette, density and one signature move,
never the layout. The rolls dealt:
- for Messages, a timetable slide rack, a boarding pass and gate board, a
  convention catalog, a zoo map, a Crouwel grid and a split-flap board;
- for Referrals, metro tiles, a streaming wall, the zoo map, a centre-rail
  reference page, the timetable rack and a variable-font specimen.

One discipline from the boarding pass is kept: a row whose state changes
keeps its light until it is seen. A rule that goes on hold restyles in place
and stays marked; it doesn't vanish into a notice.

## 8. The new pages

### 8.1 What is fixed

- **Every route** of the six, and their gating: all six are manager and up,
  inside the `RequireRole` manager group; staff get the shell's panel.
- **Every call in `docs/dashboard-routes.md`** for these routes, the same as
  today, and no others unless Roee agrees to one in §11:

  | Page | Calls |
  |---|---|
  | Standee | `listTemplates`; `getTemplateDesign`, whose `default_language` now also starts the sign's language (no new call) |
  | Messages | `getMessagingSummary`; `listAutomations`; `listBroadcasts` (`page=N`, 10 a page), again every 3 s while one is sending; `listTemplates`, then `getTemplateDesign` through `useCardLanguage`; `listRecipes` in the card's language; `activateAutomation` and `pauseAutomation` |
  | Composer | `listTemplates` and `useCardLanguage`; `listRecipes`; `getMessagingSummary`; `getAudienceCount` on load and 350 ms after the audience options change; `sendTestMessage`; `createBroadcast` |
  | Rule editor | `listTemplates` and `useCardLanguage`; `listRecipes` for a new rule; `getAutomation` for an existing one; `getMessagingSummary`; `getAudienceCount` 350 ms after a valid trigger change; `createAutomation` (with `is_active` when saved on); `patchAutomation` to save, and `{is_active}` from the header switch; `sendTestMessage`; `deleteAutomation` |
  | Refer a friend | `getReferralProgram`; `listReferralRules`; `listReferrals`; `listTemplates`; `patchReferralProgram`; `putReferralRule`; `reviewReferral` |

- **The named behaviours:**
  - the 350 ms audience count, through `useDebounce`;
  - the 3 s polling while a broadcast sends, which runs whichever tab is open;
  - 429 `messaging_quota` with `next_allowed_at`, said with its time, and the
    send disabled ahead of it when the summary already knows;
  - 403 `upgrade_required` when a rule is switched on without Pro, said under
    that rule;
  - printing through the browser's print dialog, Pro only, with
    `html.standee-print-mode`, the portal at the end of `<body>`, the `@page`
    per paper and `print-color-adjust: exact`;
  - the card's language (`useCardLanguage`) driving the recipes, the chips'
    spelling and the preview, while the page speaks the dashboard's language;
  - the tour's `standee-sheet` anchor, on the sheet's stage, in every state.
- **The routes' query.** Messages reads `?tab=rules` (the default), `?tab=broadcast`
  and `?tab=sent`, on the existing route, the way Customers reads `?filter=`.
  The composer returns to `?tab=sent` and the editor to `?tab=rules`. No
  route is added. `docs/dashboard-routes.md` gains one line for it.
- **Untouched:** `src/api`, `src/auth`, `src/hooks`, `src/config`, `src/lib`
  (so `messageTemplate.ts`, `referralRules.ts`, `enrollUrl.ts` and `cn.ts`
  stay as they are), the pass previews, the shell, the tour's steps, and the
  public join page.

### 8.2 Lightbox, page by page

Each of the five page components calls `useLightboxPage()` at its top (shell
brief §8), so while one is mounted `<html>` wears `theme-lightbox` (and
`theme-night` at night) and the seam closes. Nothing on these pages uses the
old primitives (`dashboard/primitives.tsx`, `marketing/primitives.tsx`,
`ctaClasses`, `fieldClasses`, the old `Notice`, `Tag`, `Toggle`,
`SegmentedControl`, `LitStage`, `Band`, `Readouts`) or the old type classes
(`t-h3`, `t-stat`, `t-eyebrow`, `t-figure`). The standee keeps
`html.standee-print-mode` alongside the claim; they are different classes and
don't meet.

### 8.3 Messages: three tabs

**At 375px, top to bottom:**

1. **The title,** "הודעות ללקוחות", in `type-title`, and one line under it:
   how many hold the card ("300 לקוחות מחזיקים בכרטיסייה", the figure
   isolated and grouped). On Free it is the Free line below instead.
2. **One notice at most,** the kit's `Notice`, the first of these that holds:

   | When | Who | It says | Action |
   |---|---|---|---|
   | Free | Owner | Messages reach real customers once the card is active, at ₪99 a month; rules and a sample to their own card work now | "הפעלה" to Billing |
   | Free | Manager | The same, once the owner activates | None |
   | Pro, sending not open (`can_send` false) | Both | Sending isn't open for this business yet; rules saved now start when it opens | None |
   | Sending paused (`dispatch_enabled` false) | Both | Paused on PunchMe's side; the rules pick up where they stopped | None |
   | Rules on hold (`can_reach_one_customer` false) | Both | Which rules wait, and why, in two sentences, not fifty words | None |
   | The scheduler late (no tick in an hour, a rule on) | Both | The rules haven't run in the last hour, and catch up later the same day: the runner's `>=` on the hour and its per-day guard do exactly that (`messaging/services.py`) | None |

   "כתבו לנו" goes: no page carries the WhatsApp number yet (CLAUDE.md).
3. **While a broadcast is sending,** a lit line under the notice, whatever
   tab is open: "בשליחה עכשיו: 120 מתוך 300", a polite status that says the
   end once, when it settles.
4. **The flash** a composer or an editor hands over ("ההודעה יצאה לדרך",
   "הכלל נשמר ופועל. הפעם הראשונה: מחר, 10:00") is the kit's lit ok
   `Notice`, in place, `role="status"`, never a toast: it is the result of a
   send or a save, not of a tap on this page.
5. **The tabs,** the kit's `Tabs`: "כללים", "הודעה לכולם", "נשלחו". One tab
   stop; the arrows run the way the language reads; the open tab is ink with
   its 2px rule.

**Rules** (the default tab):
- **A row per rule,** active rules first by `next_run_at`, then those
  switched off, then those on hold, as the page opens. Once a rule is
  switched, that order holds until the page is opened again, so the row
  under the finger stays the rule that was switched (step C). Each row is
  two controls, never one link with a switch inside it:
  - **the rule,** a link to its editor: the kind's lucide icon, the name
    (`dir="auto"`, `text-align: match-parent`, two lines before an
    ellipsis), and one meta line in words: "מי שלא ביקר/ה 30 יום · 10:00 ·
    חותמת במתנה";
  - **the state line,** under it: "הבא: מחר, 10:00 · 12 נשלחו החודש".
    - **Off:** "כבוי".
    - **Late:** "היה אמור לרוץ אתמול ב-10:00", in warn words with its icon,
      when `next_run_at` is in the past.
    - **On hold:** "בהמתנה" and its reason in a few words, kept marked until
      it changes.
    - **Who it reaches,** only where the summary has the exact figure: a
      win-back of 14, 30, 60 or 90 days (`inactive_counts`), the reward
      reminder (`reward_waiting_count`), as "86 עכשיו"; a birthday rule
      as "9 החודש" (`birthdays_this_month`).
  - **The switch,** the kit's `Switch`, named after its rule ("החזרת לקוחות
    פעיל").
    - Switching on: `activateAutomation`, then a polite announcement with
      the next run.
    - Switching off: `pauseAutomation`, never gated.
    - A refusal is said under that row: 403 `upgrade_required` with the
      owner's "הפעלה" or the hire's line, 422 `kind_unsupported` in its
      sentence.
    - On Free the switch is disabled with its reason beside it ("נפתח עם
      ההפעלה"), and the 403 is still handled for a plan that changed
      meanwhile.
- **"כלל חדש",** a secondary button under the list, opens the kit's `Sheet`
  ("איזה כלל?") with the three starters from `listRecipes`.
  - Each starter: its icon, its name and its summary in the card's language,
    and "כבר יש: החזרת לקוחות" when a rule of that kind exists. That is a
    note, not a block: a second win-back at 60 days is legitimate.
  - Picking a starter goes to `/dashboard/messages/automations/new?recipe=…`.
  - Focus moves into the sheet, and back to "כלל חדש" when it closes.
- **No rules yet:** the three starters inline, as the kit's `EmptyState` with
  the line "רוב העסקים מתחילים בהחזרת לקוחות" (draft).
- **A failed read:** the kit's `Notice`, "הכללים לא נטענו", with "נסו שוב".
  Never the starters, which would invite a duplicate.

**Message everyone:**
- **The week's quota,** the tab's headline:
  - "נותרה שליחה אחת השבוע", or "השליחה הבאה: יום א׳, 25 באוק׳, 14:05" when
    `next_broadcast_allowed_at` is set;
  - the figures isolated;
  - plural keys for every count.
- **One line on what a broadcast is:** "הודעה אחת לכל 300 הלקוחות שמחזיקים
  בכרטיסייה, עכשיו. עד 2 בשבוע." `broadcasts_limit_7d` gives the number;
  the 20-hour gap isn't in the summary, so it is said only through the next
  allowed time.
- **The latest broadcast,** as a row that opens it (as in Sent).
- **"כתיבת הודעה"** to `/dashboard/messages/new`. It is the coral on this
  tab, and disabled with its reason when the week is spent or sending isn't
  open.
  - **Free:** the coral goes to the owner's "הפעלה", and the composer's door
    stays as a secondary "כתיבת דוגמה לעצמכם", because the sample works on
    every plan.
  - **Pro with nobody holding the card:** "עוד אין למי לשלוח" and a link to
    the standee.

**Sent:**
- **The history** from `listBroadcasts`, ten at a time, with "עוד 10", which
  appends the next page (no pager at the foot).
- **Each row:**
  - the title, or the business name;
  - the body, clamped to two lines;
  - the date, with the year whenever it isn't this year;
  - "172 מתוך 172" as a figure, with "4 לא נשלחו" in words when
    `failed_count` and `skipped_count` add up to anything;
  - a broadcast still sending shows its progress.
- **A row opens the message in the kit's `Sheet`:**
  - the message as it landed, on the card's wallpaper;
  - its gift and whether it went only to the opted-in;
  - its counts in words: sent, not sent, skipped, still going;
  - the date in full.

  It uses the row's own `BroadcastOut`; no `getBroadcast` (§11).
- **Empty:** "עוד לא נשלחו הודעות לכולם". On Free nothing invites a "first
  one" that can't go.
- **A failed read:** "ההודעות שנשלחו לא נטענו" with "נסו שוב".
- **Messages sent to one customer** from Customers aren't broadcasts, so they
  don't appear here. Showing them needs the delivery log (§11).

**From 1024px:** the column is at most 720px wide; the tabs and the rows keep
their shape.

### 8.4 The rule editor

The win-back in three taps stays three taps. What changes is that the page
says the rule before it asks anything.

**At 375px, top to bottom:**

1. **Back,** "חזרה להודעות" (44px), to `?tab=rules`.
2. **The title:**
   - **new:** the kind ("החזרת לקוחות"), with its icon;
   - **existing:** the rule's name, with the kit's `Switch` at the row's end,
     named after the rule. The switch saves at once, as today (`patchAutomation`
     `{is_active}`), and says so: "פעיל" or "כבוי" with a polite
     announcement.
3. **The rule in one sentence,** on a lit panel, live, computed in a small
   pure module beside the page (for example `ruleSentence.ts`, with its own
   test, since `src/lib` is frozen):
   - **Win-back:** "בשעה 10:00 הקרובה, 86 הלקוחות שלא ביקרו 30 יום יקבלו את
     ההודעה, ואחר כך כל מי שיגיע ל-30 יום בלי ביקור, באותו יום. פעם אחת לכל
     אחד/ת, עד שיחזור/תחזור."
     - with a repeat, "ושוב כל 30 יום, כל עוד לא חזר/ה";
     - with a gift, "עם חותמת אחת במתנה";
     - opted-in only, "רק למי שהסכים/ה לקבל הודעות".
   - **Birthday:** "בשעה 10:00, ביום ההולדת (or 3 ימים לפניו): כל לקוח/ה
     שמסר/ה תאריך לידה."
   - **Reward reminder:** "בשעה 10:00: מי שההטבה שלו/ה מחכה 7 ימים מקבל/ת
     תזכורת אחת."

   Its parts:
   - **The count** is `getAudienceCount`'s, as today, grouped and isolated.
     The sentence is a polite live region, debounced with the count, so
     changing the days says the new number once.
   - **"הקרובה"** because the first run is the next time the hour comes round:
     the backend's first-run guard (`_first_run_guard`) skips today when the
     hour has passed. After saving, the flash gives the exact time from the
     response's `next_run_at`.
   - **Under the sentence, one line for the phones:** "באייפון ההודעה מופיעה
     על מסך הנעילה. באנדרואיד היא מופיעה על הכרטיס, והטלפון מתריע רק כשמגיעה
     איתה חותמת." (PRODUCT.md, "After they leave".)
4. **The message as it lands:** the kit's `WallpaperStage` with the
   notification ("Roughly how it looks on the lock screen") over the owner's
   pass.
   - **The pass** is drawn from the template and the design `useCardLanguage`
     already reads (the same query key), as the Overview's `OwnPass` draws
     it, so no call is added. With no `serial`, its code is the preview's own
     simulation (`CardPreviews.tsx:37-42`). It stays untouched in its 300px
     slot.
   - **The sender** is the business name, truncated inside the stage's own
     width, so no name can push the page sideways again.
   - **On a phone** the stage may crop the pass below its stamp row. That is
     framing, never squeezing.
5. **The action, docked on a phone.** One bar above the phone bar, always in
   reach.
   - **Its content:** the short form of the sentence ("מחר 10:00 · 86
     לקוחות") and the primary:
     - "שמירה והפעלה" for a new or paused rule on Pro, which can send;
     - "שמירת שינויים" for a rule that is on;
     - "שמירה בלי להפעיל" where switching on can't happen (Free, sending not
       open, rules on hold), named as such.
   - **The toast offset** rises by the bar's height while it's docked.
   - **From 1024px** the sentence, the stage and the action stand in a
     sticky column beside the fields.
6. **The fields,** each section a panel under its own `h2`:
   - **"מתי"** (When):
     - the days as the kit's `SegmentedControl` (14, 30, 60, 90, אחר),
       chosen in ink, with "אחר" opening the kit's `Input` (`inputmode`
       numeric, 7 to 365, its error under it through `aria-describedby`);
     - the repeat as a `Switch` and its field;
     - the hour as the kit's `Select`.
   - **"ההודעה"** (The message): the title and the body as the kit's `Input`
     and `Textarea` with their counts ("12/40"), the chips in the card's
     language, and the warnings (an unknown or unsupported placeholder, a
     gift promised and not given) under the field they're about.
   - **"מתנה"** (Gift): a `Switch`, then the picker ("חותמת אחת", "2 חותמות",
     "3 חותמות", "כרטיסייה מלאה"). It says the cost in the sentence, never as
     a price. None on the reward reminder, as today.
   - **"למי"** (Who): opted-in only, disabled with its reason when it can't
     be honoured.
   - **"שם הכלל"** (the rule's name), last: the recipe names it, and the
     owner rarely needs to.
7. **Secondary actions** at the foot: "שלחו לי דוגמה" (to the shop's own
   card, every plan) and, on a new or paused rule on Pro, "שמירה בלי להפעיל".
8. **"הסרת הכלל"** for an existing rule, in danger words, at the very foot.
   It opens the kit's `Dialog` ("להסיר את הכלל? ההיסטוריה נשמרת."), focus
   on "ביטול", 44px buttons. Focus returns to "הסרת הכלל" if cancelled.

**A draft survives an interruption.** While the editor or the composer is
open, the draft is kept in `sessionStorage` under the route, put back on
return within the tab, and dropped on save, send, delete or "לבטל שינויים".
Dana's draft survives a customer walking in.

**After saving,** back on `?tab=rules` with the flash, which says the first
run:
- "הכלל נשמר ופועל. הפעם הראשונה: מחר, 10:00" from the response's
  `next_run_at`;
- "הכלל נשמר, כבוי" when saved off.

**States:** loading (the kit's `Skeleton`); a rule that failed to load or was
deleted (a `Notice`, "הכלל לא נמצא", with the way back, never "try again"
for a 404); Free; Pro not open; on hold; a 403 or a 422 under the action.

### 8.5 The broadcast composer

1. **Back,** to `?tab=broadcast`.
2. **The title,** "הודעה לכולם", and the week's quota under it, as on the
   tab.
3. **The fields:** the title (optional; the business name otherwise) and the
   body, the chips (no `{שם}`: a broadcast names nobody), the gift, opted-in
   only. The same kit pieces and the same `h2` sections as the editor.
4. **The message as it lands,** on the `WallpaperStage`, as in the editor.
5. **Who and when, in one sentence,** live:
   - "יוצאת עכשיו ל-300 הלקוחות שמחזיקים בכרטיסייה", with `messaging.editor.audience`'s
     "לכ-" gone: the number is the audience;
   - the phones' line, as in the editor;
   - with a gift, "300 חותמות במתנה" as words.
6. **"שליחה ל-300 לקוחות",** the coral, docked on a phone like the editor's.
   It opens the kit's `Dialog`:
   - **the message again,** short;
   - **the count, and that it can't be undone;**
   - **the week after this send:** "תישאר עוד שליחה אחת השבוע", or "זו
     השליחה האחרונה השבוע";
   - **the buttons:** "כן, לשלוח" and "ביטול", focus on "ביטול".
   - **A 429** closes it and says the quota with its time in place, the send
     disabled.
   - **A success** goes to `?tab=sent` with the flash.
7. **"שלחו לי דוגמה",** secondary.

**Free:** the owner's notice with the price and "הפעלה", or the hire's line.
The send isn't drawn (not a dead button); the sample is the action.

### 8.6 Refer a friend: decisions first

**At 375px, top to bottom:**

1. **The title,** "חבר מביא חבר", and its lead in the voice (§9).
2. **"מחכות להחלטה שלכם"** (shown only when there are flagged referrals). Each
   flagged referral is a lit panel:
   - **The line:** "נועה כהן הצטרף/ה דרך דנה לוי", each name in its own
     `<bdi>`. A missing name says "לקוח/ה בלי שם"; a removed card says
     "לקוח/ה שהכרטיסייה שלו/ה הוסרה".
   - **The reason, in a sentence:**
     - self-referral: "נועה הצטרף/ה עם מספר הטלפון של דנה";
     - shared device: "מטלפון שכבר שימש להצטרפות אחרת";
     - burst: "הרבה הצטרפויות הגיעו מאותו מקום בזמן קצר";
     - a reason this frontend doesn't know: "עצרנו את ההפניה הזו לבדיקה".
   - **What each answer does, in two lines,** built from the rules that are
     on:
     - counting gives the friend's welcome gift now when that row is on, and
       counts toward the member's gift on the friend's first stamp;
     - not counting keeps the friend's card, with no gift, and gives the
       member nothing for it.

     The backend's `review_referral` does exactly that: approving fires the
     held gift and puts the referral back on its path; rejecting keeps it
     with the verdict.
   - **"לספור" and "לא לספור",** two equal secondary buttons, each opening
     the kit's `Dialog` that repeats its consequence, focus on "ביטול". It
     can't be undone, so it is confirmed.
   - **The result** is said on the card ("נספרה: נועה קיבל/ה את מתנת
     ההצטרפות"). The referral then leaves the panel and appears in the list
     below with its new status: nothing disappears unsaid.
   - **A 409** (decided meanwhile) says "ההפניה הזו כבר הוכרעה" on the card
     and refetches.
   - **More than three:** the first three, then "עוד 2".
3. **The program, in one line,** a panel:
   - the master `Switch` ("חבר מביא חבר");
   - under it, what it costs now, built from the rules that are on: "חותמת
     ראשונה של חבר/ה ← חותמת אחת למי שהביא/ה. לכל היותר 5 בחודש ללקוח/ה.";
   - "הגדרות", a secondary button, opening the settings.

   It is disabled with its reason when the program can't be switched on:
   - **Free:** the owner's line with the price and "הפעלה"; the hire's,
     without it.
   - **Not open for this business:** its own line.
4. **"מי הביא את מי",** the list:
   - **Filters:** the kit's `FilterChips`, "כולם", "הצטרפו", "חותמת ראשונה",
     "סיימו כרטיסייה", "לא נספרו", each with its count from the loaded page.
   - **Each row:**
     - the line, as in the decision;
     - the status as the kit's `Badge`: joined neutral, first stamp ok,
       finished a card on gold, not counted neutral, waiting warn;
     - the date, with the year when it isn't this one;
     - for "not counted", its reason.
   - **Where the list stops:** after 100 it says so, "מוצגות 100 ההפניות
     האחרונות", until Roee answers §11.
   - **Empty:** "עדיין אין הפניות", with what turning it on does.
   - **A failed read:** "ההפניות לא נטענו" and "נסו שוב", never "עדיין אין".

**The settings, in the kit's `Sheet`.** Up from the bottom on a phone, in
from the end edge from 768px, focus returned to "הגדרות" on close. Sections
under `h2`s:
- **"מה כל אחד/ת מקבל/ת"** (the four rows, in the order things happen to a
  friend):
  - **Each row:** its condition ("כשחבר/ה מצטרף/ת"), its `Switch` named with
    the condition and the action together ("כשחבר/ה מצטרף/ת: מתנה לחבר/ה"),
    and when on, the gift picker.
  - **The gift picker:** "חותמת אחת", "2 חותמות", "3 חותמות", "כרטיסייה
    מלאה", the last saying what that is: "כרטיסייה מלאה (קפה חינם)".
  - **The message:** title and text with counts and chips, and "שמירת
    הטקסט".
  - **A refetch never wipes a text** the owner is still typing.
  - **The recommended row** keeps its line.
- **"תקרה":** "לכל היותר [5] מתנות ללקוח/ה ב[חודש]". The field and the select
  are as wide as their content; a value out of 1 to 20 says so under the
  field rather than reverting in silence.
- **"מה החבר/ה רואה":** the kit's `SegmentedControl` (כלום, שם פרטי, אות
  ראשונה).
- **"תצוגה":** what the friend sees and what the member receives, both in the
  card's language and both "בערך". The friend's is a faithful miniature of
  the real join page, which Phase 8 owns: it stays a picture of that page,
  staged on a lit panel, and follows it when Phase 8 changes it.

Every change saves where it is made, as today, and says so beside it: "נשמר"
in a polite status, or its error under the control in a sentence (one per
slug: `title_too_long`, `body_too_long` and the rest), never at the top of
the page and never the slug itself.

**On Free** the settings still open and the rows can be prepared, the way
messages can; the master switch says why it won't move.

**From 1024px:** the column is at most 720px; the sheet comes in from the end
edge at about 560px.

### 8.7 The standee

**At 375px, top to bottom:**

1. **The title,** "שילוט", and one line: put it where people already stand
   still, and one print lasts, because the code never changes.
2. **The design:** four cards as a radio group (2×2), each the real sheet at
   thumbnail size (`aria-hidden`), its name and its hint at 14px.
   - The chosen one has a 2px ink ring and an ink check: ink marks "selected",
     never violet.
   - "ההטבה" is renamed: the glossary uses הטבה for the reward itself (§9).
3. **"שפת השלט"** (Roee, §7): the kit's `SegmentedControl`, "עברית" and
   "English", each named in its own language.
   - **The default** is the card's language, from the `default_language` of
     the design the page already loads.
   - **What follows the choice:** the sheet renders with `i18n.getFixedT` for
     that language, with its own `lang` and `dir`, and so does the print
     copy in the portal.
   - **What doesn't:** the owner's name and reward print as typed, and the
     page around the sheet stays in the dashboard's language.
4. **The paper:** the kit's `SegmentedControl` (A4, A5, אוהל שולחן) and its
   hint.
5. **The sheet** on a lit panel (`theme-lit`, so it keeps its light at night,
   with the QR code among DESIGN.md's lit things), carrying
   `data-tour="standee-sheet"`.
6. **"הדפסה",** the coral, 52px, full width on a phone, right under the sheet
   it prints. Under it, the printing note (§9): actual size and 100%, a thin
   white edge from a home printer is normal, A5 needs A5 paper, and on a
   phone the share menu prints too.

**From 1024px:** two columns, the choices beside a sticky sheet with Print
under it, as today.

**On Free:**
- the sheets keep their dashed slot, "הקוד עדיין לא פעיל";
- **the owner:** in place of Print, a panel with what activation does here
  and the price ("הקוד נדלק עם ההפעלה, ₪99 לחודש, ואז מדפיסים") and "הפעלה",
  the coral;
- **the manager:** "הקוד יידלק אחרי שהבעלים יפעיל/תפעיל את הכרטיסייה", and
  no link;
- the print flag still lives with the page, so ctrl+P prints the sheet with
  its honest empty slot, never the dashboard.

**The sheet** (`components/dashboard/Standee.tsx`; it isn't one of the frozen
previews):
- **It fits, it never clips.**
  - The panel keeps its ratio and its `cqw` sizing.
  - When the content is taller than the panel, the business name and the
    reward step down together, in small steps, until it fits. Measured once
    per change, in a layout effect, and carried as one multiplier on those
    two blocks, so the on-screen sheet and the printed one, which scale
    together, fit the same.
  - The QR code never shrinks.
  - Past a floor (the reward at about two thirds of its size), the page says
    so under the sheet: the reward is too long for this paper, and the A4
    has room; on the A4 itself, a shorter reward fits, and Card Studio is
    where it's changed.
- **The quiet zone:** the code keeps four modules on every side (`marginSize`
  4 on `QRCodeSVG`, or the tile's padding at 4/37 of the code), so the comment
  at `:159-161` becomes true.
- **What the sheet says** (§9):
  - "בלי אפליקציה, בלי חשבון, בלי סיסמה" in place of "בלי אפליקציה. בלי
    הרשמה.";
  - "מצטרפים עם מספר הנייד" in place of "מצטרפים בחצי דקה";
  - "powered by PunchMe" through `t()`.
- **Type:** the stamps line and the fold's tag leave Plex Mono for Assistant
  (Plex Mono has no Hebrew), and nothing on the sheet relies on `uppercase`.
- **Print** is unchanged: the portal, `html.standee-print-mode`, the `@page`
  per paper, `print-color-adjust: exact`, the tent printing its top half
  upside down with its fold marked.

### 8.8 Pieces the pages share

- **From the kit, as they are:** `Button`, `LinkButton`, `Input`, `Textarea`,
  `Select`, `Field`, `Switch`, `SegmentedControl`, `RadioGroup`, `Tabs`,
  `LitPanel`, `Badge`, `Notice`, `FilterChips`, `Figure`, `List`, `ListRow`,
  `EmptyState`, `Skeleton`, `SkeletonRows`, `Dialog`, `Sheet`, `useToast`,
  `WallpaperStage`, `focusRing`. The kit's `SegmentedControl` is typed for
  string values, so the day presets travel as strings ("14") and are parsed
  at the edge.
- **New beside the pages, not in the kit:**
  - `ruleSentence.ts` and its test (the rule in one sentence, per kind);
  - a rule row;
  - the broadcast's sheet;
  - the referral decision card;
  - the referral settings;
  - the standee's fit (in `Standee.tsx`).
- **Retired** once nothing uses them: `components/messaging/NotificationPreview.tsx`
  (the kit's `WallpaperStage` replaces it) and the old `MessageForm.tsx`.
  `MessageForm` may be rebuilt on the kit as one shared form for the composer
  and the editor, as long as the form's grid has a column template at every
  width (§5, row 2).
- **Nothing new in the kit.** If step B finds it needs a piece the kit
  lacks, it asks first, as the shell's phase did.

### 8.9 Colour, type and states

- **Coral:**
  - on Messages, "כתיבת הודעה" on its tab;
  - on the composer, the send;
  - on the editor, the save;
  - on the standee, Print;
  - the Free owner's "הפעלה" wherever it stands.

  Refer a friend has none: its decisions are two equal choices, confirmed in
  a dialog. Every "on", "selected" and chosen chip is ink.
- **Gold** is the reward: the "סיים/ה כרטיסייה" badge, and nothing else.
- **No new colour.** Every pair is already measured in DESIGN.md and on
  `/style-guide`. The ok badge is Ok Tag on its wash (6.11:1), which settles
  the 4.43:1 "פעיל".
- **Type:**
  - `type-title` for page titles, `type-card-title` for panels;
  - `type-label` for field labels, `type-tag` for badges;
  - the kit's `Figure` for every number, which isolates it;
  - `Intl.NumberFormat` for every count from 1,000;
  - `Intl.DateTimeFormat` for every date, with the year whenever it isn't
    this one;
  - nothing under 13px, and no Plex Mono on these pages or on the sheet.
- **Every count has its plural keys** in both languages (`_one`, and Hebrew's
  `_two` and `_many`), and zero is said in words, never as "0 שליחות".
- **User text** (a rule's name, a broadcast's title and body, a customer's
  name) is `dir="auto"` with `text-align: match-parent`; names inside a
  sentence are each in a `<bdi>`.
- **States each page draws:**
  - loading;
  - empty on Pro;
  - Free, for the owner and for a manager;
  - Pro but not open, paused, on hold, the scheduler late (Messages);
  - a read failed (offline included);
  - a write refused (429, 403, 409, 422);
  - manager and owner, with staff refused by the shell;
  - Hebrew and English, and the sign in the other language;
  - day and night;
  - 320, 375, 768, 1024 and 1280px;
  - reduced motion;
  - 200% text.

### 8.10 Motion (for step C)

Animate by frequency. These pages are used weekly, not at the counter.
- **Tabs:** the open tab's rule lights up under it, never slides between
  tabs.
- **Sheets and dialogs:** the kit's own movement, with a crossfade under
  reduced motion.
- **Switches:** the kit's knob, 200ms on the in-out.
- **A decided referral:** its card's light goes out (180ms) and its row
  arrives in the list by light (240ms).
- **Nothing counts up.**
- **The sending line:** its number updates with no motion.
- **The standee:** the sheet swaps at once on a choice, at most a 150ms
  crossfade; the fit is instant.

## 9. Copy

Every string goes through `t()`, in `en` and `he` together. These are drafts
in the product's voice (plural to the reader, slash forms for people, the
glossary's terms); step D's `/impeccable clarify` settles them.

**The glossary pass.** ניקוב and ניקובים become חותמת and חותמות, פרס becomes
הטבה, and "reward" in English stays the card's reward: a referral gives a
gift (מתנה). That covers 27 keys today:
- `messaging.summary.rewardWaiting`, `messaging.kinds.reward_waiting`;
- `messaging.broadcast.composerLead`;
- `messaging.describe.gift_*` and `messaging.describe.rewardWaiting`;
- `messaging.editor.chip.reward`, `giftToggle`, `giftCount` and `giftFull`;
- `messaging.errors.gift_range` and `gift_unsupported_for_kind`;
- `referrals.blocked.upgrade_required`;
- `referrals.rows.friend_first_stamp_referrer.*` and
  `friend_completed_card_referrer.action`;
- `referrals.gift.stamps_*`, `referrals.message.chip.reward`;
- `referrals.cap.countLabel` and `between`;
- `referrals.list.status.qualified`.

"מפרסם" (publishes) in three error strings is not פרס, and stays.

**The voice pass:**
- **Slash forms** where a person is singular:
  - `messaging.summary.audience_one`;
  - `messaging.describe.inactive`;
  - `referrals.lead`;
  - `referrals.cap.before`;
  - `referrals.display.label`;
  - `referrals.list.empty`;
  - `referrals.rows.scanned_referrer.when`;
  - `messaging.errors.kind_unsupported_direct`.
- **The plural "שלכם"** for "שלך" in `messaging.guard.personalOnHold`.
- **"They" for "her"** in the English of `kind_unsupported_direct` and
  `design_outdated`.

**Developer text leaves the UI:**
- `referrals.errors.invalid` ("({{detail}})") gives way to a sentence per
  slug;
- `referrals.list.reason.*` gains a fallback;
- "powered by PunchMe" becomes a key.

| Key | English | עברית |
|---|---|---|
| `standee.noApp` | No app, no account, no password. | בלי אפליקציה, בלי חשבון, בלי סיסמה. |
| `standee.steps.join` | Join with your mobile number | מצטרפים עם מספר הנייד |
| `standee.poweredBy` (new) | powered by PunchMe | באמצעות פאנץ' מי |
| `standee.designs.card.name` | The stamps | החותמות |
| `standee.designs.counter.hint` | Code first, for a till or a desk | הקוד קודם, לקופה או לדלפק |
| `standee.languageLabel` (new) | Language of the sign | שפת השלט |
| `standee.formatHints.a5` | A5 paper, for the counter. A home printer needs A5 paper in the tray. | נייר A5, לדלפק. במדפסת ביתית צריך נייר A5 במגש. |
| `standee.previewNote` | Prints at actual size: choose 100%, not "fit to page". A thin white edge from a home printer is normal. | מודפס בגודל אמיתי: בחרו 100%, לא "התאמה לעמוד". שוליים לבנים דקים במדפסת ביתית הם רגילים. |
| `standee.downloadHint` | To keep a file, choose Save as PDF in the print window. On a phone, the share menu prints too. | לשמירה כקובץ בוחרים "שמירה כ-PDF" בחלון ההדפסה. בטלפון אפשר להדפיס גם מתפריט השיתוף. |
| `standee.free.owner` (new) | The code goes live when you activate, at ₪{{price}} a month. Then print it. | הקוד נדלק עם ההפעלה, ₪{{price}} לחודש, ואז מדפיסים. |
| `standee.free.hire` (new) | The code goes live once the owner activates the card. Then it prints. | הקוד יידלק אחרי שהבעלים יפעיל/תפעיל את הכרטיסייה, ואז אפשר להדפיס. |
| `standee.tooLong` (new) | The reward is too long for this paper even at its smallest. The A4 has room. | ההטבה ארוכה מדי לנייר הזה גם בגודל הקטן ביותר. ב-A4 יש מקום. |
| `standee.tooLongA4` (new) | The reward is too long even at its smallest. A shorter one fits; it's changed in Card Studio. | ההטבה ארוכה מדי גם בגודל הקטן ביותר. הטבה קצרה יותר תיכנס; משנים אותה בסטודיו הכרטיסיות. |
| `messaging.tabs.rules` / `.broadcast` / `.sent` (new) | Rules / Message everyone / Sent | כללים / הודעה לכולם / נשלחו |
| `messaging.reach_one` / `_two` / `_other` (new) | {{count}} customer holds your card / {{count}} customers hold your card | לקוח/ה אחד/ת מחזיק/ה בכרטיסייה / שני לקוחות מחזיקים בכרטיסייה / {{count}} לקוחות מחזיקים בכרטיסייה |
| `messaging.free.owner` (new) | Messages reach real customers once the card is active, at ₪{{price}} a month. You can set up rules and send a sample to your own card now. | ההודעות מגיעות ללקוחות אמיתיים אחרי ההפעלה, ₪{{price}} לחודש. כבר עכשיו אפשר להכין כללים ולשלוח דוגמה לכרטיסייה שלכם. |
| `messaging.free.hire` (new) | Messages reach real customers once the owner activates the card. You can set up rules and send a sample to the shop's own card now. | ההודעות יגיעו ללקוחות אמיתיים אחרי שהבעלים יפעיל/תפעיל את הכרטיסייה. כבר עכשיו אפשר להכין כללים ולשלוח דוגמה לכרטיסייה של העסק. |
| `messaging.guard.schedulerStale` | The rules haven't run in the last hour. They catch up by themselves later today. | הכללים לא רצו בשעה האחרונה. הם ישלימו מעצמם בהמשך היום. |
| `messaging.guard.personalOnHold` | These rules are on hold: more than one customer holds your card design, and the wallet can only send to a whole design. They stay saved. | הכללים האלה בהמתנה: יותר מלקוח/ה אחד/ת מחזיקים בעיצוב הכרטיסייה, והארנק שולח רק לעיצוב שלם. הם נשמרים. |
| `messaging.rules.next` / `.late` (new) | Next: {{when}} / Was due {{when}} | הבא: {{when}} / היה אמור לרוץ {{when}} |
| `messaging.rules.switch` (new) | {{name}} is on | {{name}} פעיל |
| `messaging.rules.switchedOn` (new) | {{name}} is on. Next: {{when}}. | {{name}} פעיל. הפעם הבאה: {{when}}. |
| `messaging.rules.picker` / `.exists` (new) | Which rule? / You already have one: {{name}} | איזה כלל? / כבר יש: {{name}} |
| `messaging.loadFailed.rules` / `.sent` / `.figures` (new) | The rules didn't load / The messages sent didn't load / The figures didn't load | הכללים לא נטענו / ההודעות שנשלחו לא נטענו / הנתונים לא נטענו |
| `messaging.broadcast.sending` (new) | Sending now: {{sent}} of {{total}} | בשליחה עכשיו: {{sent}} מתוך {{total}} |
| `messaging.broadcast.lastOne` (new) | This is the week's last send. | זו השליחה האחרונה השבוע. |
| `messaging.broadcast.goesTo_one` / `_other` (new) | Goes out now to the {{count}} customer holding your card / Goes out now to the {{count}} customers holding your card | יוצאת עכשיו ללקוח/ה שמחזיק/ה בכרטיסייה / יוצאת עכשיו ל-{{count}} הלקוחות שמחזיקים בכרטיסייה |
| `messaging.phones` (new) | On iPhone it appears on the lock screen. On Android it appears on the card, and the phone alerts only when a stamp comes with it. | באייפון ההודעה מופיעה על מסך הנעילה. באנדרואיד היא מופיעה על הכרטיס, והטלפון מתריע רק כשמגיעה איתה חותמת. |
| `messaging.sentence.inactive` (new) | At the next {{hour}}, the {{count}} customers who haven't visited in {{days}} get this, then anyone who reaches {{days}}, on that day. Once each, until they come back. | בשעה {{hour}} הקרובה, {{count}} הלקוחות שלא ביקרו {{days}} יקבלו את ההודעה, ואחר כך כל מי שיגיע ל-{{days}} בלי ביקור, באותו יום. פעם אחת לכל אחד/ת, עד שיחזור/תחזור. |
| `messaging.sentence.repeat` (new) | And again every {{days}} while they stay away. | ושוב כל {{days}}, כל עוד לא חזר/ה. |
| `messaging.sentence.birthday` (new) | At {{hour}}, {{when}}: each customer who gave a birthday. | בשעה {{hour}}, {{when}}: כל לקוח/ה שמסר/ה תאריך לידה. |
| `messaging.sentence.rewardWaiting` (new) | At {{hour}}: whoever's reward has waited {{days}} gets one reminder. | בשעה {{hour}}: מי שההטבה שלו/ה מחכה {{days}} מקבל/ת תזכורת אחת. |
| `messaging.sentence.gift` / `.optIn` (new) | With {{gift}} on the card. / Only to those who agreed to messages. | עם {{gift}} בכרטיסייה. / רק למי שהסכים/ה לקבל הודעות. |
| `messaging.editor.savedOn` / `.savedOff` (new) | Rule saved and on. First run: {{when}}. / Rule saved, off. | הכלל נשמר ופועל. הפעם הראשונה: {{when}}. / הכלל נשמר, כבוי. |
| `messaging.editor.notFound` (new) | This rule isn't there any more. | הכלל הזה כבר לא קיים. |
| `referrals.lead` | A customer shows their card, a friend scans it with their phone and gets a join page that knows who invited them. You decide what each of them gets. | לקוח/ה מראה את הכרטיסייה, חבר/ה סורק/ת אותה בטלפון ומגיע/ה לדף הצטרפות שיודע מי הזמין. אתם מחליטים מה כל אחד/ת מקבל/ת. |
| `referrals.decision.title` (new) | Waiting for your decision | מחכות להחלטה שלכם |
| `referrals.decision.reason.self_referral` (new) | {{friend}} joined with {{member}}'s own phone number. | {{friend}} הצטרף/ה עם מספר הטלפון של {{member}}. |
| `referrals.decision.reason.shared_device` (new) | {{friend}} joined from a phone another join already used. | {{friend}} הצטרף/ה מטלפון שכבר שימש להצטרפות אחרת. |
| `referrals.decision.reason.burst` (new) | Many joins came from the same place in a short time. | הרבה הצטרפויות הגיעו מאותו מקום בזמן קצר. |
| `referrals.decision.reason.unknown` (new) | We held this one back to check it. | עצרנו את ההפניה הזו לבדיקה. |
| `referrals.decision.count` (new) | Count it: {{friend}} gets the welcome gift now, and it counts toward {{member}}'s gift. | לספור: {{friend}} מקבל/ת עכשיו את מתנת ההצטרפות, וההפניה נספרת ל{{member}}. |
| `referrals.decision.skip` (new) | Don't count it: {{friend}} keeps the card, without the gift, and {{member}} gets nothing for it. | לא לספור: {{friend}} נשאר/ת עם הכרטיסייה, בלי המתנה, ו{{member}} לא מקבל/ת על זה כלום. |
| `referrals.decision.decided` (new) | This one was already decided. | ההפניה הזו כבר הוכרעה. |
| `referrals.program.cost` (new) | A friend's first stamp gives the member who brought them {{gift}}. At most {{cap}} a {{period}} per customer. | חותמת ראשונה של חבר/ה נותנת למי שהביא/ה {{gift}}. לכל היותר {{cap}} ב{{period}} ללקוח/ה. |
| `referrals.free.owner` / `.hire` (new) | Refer a friend opens with activation, at ₪{{price}} a month. / Refer a friend opens once the owner activates the card. | חבר מביא חבר נפתח עם ההפעלה, ₪{{price}} לחודש. / חבר מביא חבר ייפתח אחרי שהבעלים יפעיל/תפעיל את הכרטיסייה. |
| `referrals.gift.full` | A full card ({{reward}}) | כרטיסייה מלאה ({{reward}}) |
| `referrals.list.stopped` (new) | Showing the latest {{count}} referrals. | מוצגות {{count}} ההפניות האחרונות. |
| `referrals.list.noName` / `.removedCard` (new) | a customer with no name / a customer whose card was removed | לקוח/ה בלי שם / לקוח/ה שהכרטיסייה שלו/ה הוסרה |
| `referrals.saved` (new) | Saved | נשמר |

Reused: `billing.activateCta` ("הפעלה"), `dashboard.overview.activate.ownerActivates`,
`common.retry`, `messaging.errors.*` (the sentences per slug, and the
referral rules' slugs where they match), `messaging.editor.languageHE` and
`languageEN`, `messaging.history.*` where they still fit. The price comes from
`PUNCHME_MONTHLY_PRICE`, isolated.

## 10. What step B keeps, touches and checks

**Keeps** everything in §8.1. The guide adds the standee's print styles,
checked in print preview, and the card's language driving how messages read.

**Touches** these, and nothing else:
- `src/routes/dashboard/StandeePage.tsx`, `MessagesPage.tsx`,
  `BroadcastComposerPage.tsx`, `AutomationEditorPage.tsx`,
  `ReferralsPage.tsx`;
- `src/components/dashboard/Standee.tsx`: the fit, the quiet zone, the
  sign's language, Assistant for the stamps line and the fold, the
  `poweredBy` key;
- `src/components/messaging/`: rebuilt on the kit, or replaced beside the
  pages; `describe.ts` gains the year and `Intl`;
- new files beside the pages: `ruleSentence.ts` and its test, the rule row,
  the broadcast's sheet, the decision card, the referral settings;
- the keys in §9, in `en` and `he`;
- `docs/dashboard-routes.md`: the `?tab=` line, and any call Roee approves in
  §11.

One page per commit, as in the earlier phases; the sheet's fit and quiet
zone is a commit of its own.

**Doesn't touch:**
- `src/api`, `src/auth`, `src/hooks`, `src/config` and `src/lib`;
- the pass previews (drawn inside `WallpaperStage`, untouched);
- the shell, the tour's steps, the kit, the public join page, the other
  phases' pages.

**Checks,** in step D, through the browser:
- **Roles and plans:**
  - the manager and the owner on Pro and on Free (`manager-free@` and
    `free@`);
  - staff refused out loud on all six routes.
- **The worst cases:** Appendix A's six states on Messages, the composer, the
  editor and Refer a friend, including:
  - the 429 (One, then send);
  - the 403 (switch a rule on);
  - the 409 (count a flagged referral);
  - the 422 (save a referral text);
  - every notice at once (On hold);
  - 150 referrals (Many).
- **The standee:**
  - every design on every paper, in Hebrew and in English, with the demo's
    names, a 45-character name with a 60-character reward, and the worst:
    nothing clips, and the code is never smaller or closer to the edge;
  - Chrome's print preview for A4, A5 and the tent, by day and at night;
  - ctrl+P on Free.
- **Messages:**
  - a broadcast sending (the fixture's Worst case keeps it "sending", so the
    3 s polling runs);
  - the flash after a send and after a save, with the first run;
  - a draft surviving a trip to the Overview and back.
- **Rendering:**
  - Hebrew and English;
  - 320, 375, 768, 1024 and 1280px;
  - day and night;
  - reduced motion;
  - 200% text.
- **The keyboard path:**
  - the tabs' arrows;
  - each switch named after its rule;
  - the sheets' focus and return;
  - the dialogs opening on "ביטול";
  - focus never on `<body>` after "כלל חדש", "הסרת הכלל" or the send.
- **The console:** clean apart from the known lines: the two 401s at a cold
  boot, and the fake wallet's logo host (`fake-wallet.local`), which leaves
  the sheets without a logo locally.
- **On a real phone, installed, in Hebrew:** printing from the installed app
  on an iPhone (`window.print()` from a home-screen app is the one path
  nobody has seen work here), and the docked action above the phone bar.

## 11. Open questions for Roee

**Answered at the review (§7, rows 4 to 9):** yes to 1, 2 and 6; no to 3, 4,
5 and 7; not now to 8. Item 9 waits for the number. The rest of this section
is the case as it was put.

The last section of `docs/dashboard-routes.md` lists five wrappers no page
calls yet. The brief makes the case for two, and none is used unless Roee
agrees.

| # | Wrapper | The case | Recommendation |
|---|---|---|---|
| 1 | `listDeliveries` (`GET {biz}/messaging/deliveries?automation_id=`) | The delivery log: who got what, and when, and why a card was skipped. It answers "who got it" after the fact, which today nothing does. "Sent" could hold the rules' sends and the messages to one customer from Customers, which appear nowhere on Messages today, and a rule's editor could list its last sends. For a personal rule it is exact; for a broadcast it is the passes covered, and the model's own comment says never to present it as a recipient list | **Yes**, for "Sent" and the rule's last sends, with broadcasts said as counts, never as names |
| 2 | `listReferralGrants` (`GET {biz}/referrals/grants?status=`) | What the program gave: stamps and full cards, to whom, granted or skipped. It answers "what does it cost me", which the page can't say today except as a rule | **Yes**, as "this month: 14 stamps and 2 full cards" on the program's line, and a referral's gifts in its row |
| 3 | `getBroadcast` (`GET {biz}/broadcasts/{id}`) | One broadcast. The list carries the same shape, and its polling already updates a sending one | **No** |
| 4 | `testAutomation` (`POST {biz}/automations/{id}/test`) | Tests a saved rule. The editor's draft test (`sendTestMessage`) already covers it, unsaved changes included | **No** |
| 5 | `revokeReferralGrant` (`POST {biz}/referrals/grants/{id}/revoke`) | Marks a granted gift revoked without taking any stamp back. A barber would read "revoke" as undo, and it isn't | **Not now** |

**Also for Roee:**

6. **The referrals call's own parameters.** `listReferrals` sends neither
   `?status=flagged` nor `?page=`. With `?status=flagged`, the decisions
   would be complete, however old; with `?page=`, "עוד" could go past 100.
   Both are the same call with parameters the wrapper already takes, but
   they change what the page asks, so they wait for a yes. Until then the
   list says where it stops.
7. **A5, two to an A4.** An A5 sign printed alone needs A5 paper, which few
   shops keep. The A5 could instead print two to an A4 sheet in landscape,
   with a cut line, the way the tent prints two halves with a fold. It is a
   print layout change, not a call.
8. **A two-language table tent.** Its two faces could carry Hebrew on one and
   English on the other, for a bilingual counter. Roee's "owner picks" covers
   printing each language on its own; this would be one sheet.
9. **The WhatsApp number.** "כתבו לנו" goes from the stale-scheduler notice
   because no page carries the number, the same gap as the landing page's
   FAQ (CLAUDE.md). When it exists, the notices that need a person can name
   it.

## 12. Left for other phases, and outside the redesign

**Outside the redesign:**
- **The customers' own words:** the backend's starter copy still says "ניקוב"
  and "פרס" in what customers receive. Examples:
  - "הוספנו לך ניקוב במתנה לכרטיסייה";
  - "הפרס שלך מחכה";
  - the recipes' summaries, in the masculine singular.

  The Hebrew placeholder for the reward is `{פרס}`. These live in
  `apps/messaging/recipes.py` and `rendering.py`, and the referral starters
  in `apps/referrals`. A backend change; the frontend shows them in the
  card's language as they are.
- **`cn` merges nothing.** `src/lib/cn.ts` is frozen, and the kit doesn't
  pass conflicting classes, so the pages escape it by leaving the old
  primitives. Phase 10's cleanup can decide whether `tailwind-merge` earns a
  dependency.
- **The local scheduler doesn't run in Docker,** so every rule here says it
  hasn't run, and every rule's "sent this month" is 0. That's the dev
  environment, not the product.

**For other phases:**
- **The public join page** (Phase 8) keeps its violet gradient button, and
  the friend's miniature on Refer a friend follows it.
- **Billing** (Phase 7) is where every "הפעלה" here lands; it should name the
  same price and what it unlocks, as the Overview's activation panel does.

## 13. Review notes for step B

Checked against the code, the contract and the backend on 22 Oct. The calls
in §8.1 match `docs/dashboard-routes.md`, and the wrappers §11 proposes exist
and take the parameters it names. These notes win where they differ from §8
to §10.

- **The three calls Roee approved** (§7, rows 4 to 6) join the pages, and
  `docs/dashboard-routes.md` changes in the same commit as each: the call in
  its page's table, and out of "Calls no page makes yet".
  - **`listDeliveries`:** "Sent" lists what went out, newest first: each
    broadcast as today (counts, never names, as the model's own comment
    asks), and the rules' sends and the one-customer messages from
    Customers, which no page shows today. A rule's editor lists its last
    sends under the fields. Step B reads the endpoint's own filters and
    paging before building on them.
  - **`listReferralGrants`:** the program's line adds what it gave this
    month ("החודש: 14 חותמות ו-2 כרטיסיות מלאות"), and a referral's row its
    gifts, granted or skipped.
  - **`listReferrals` with its parameters:** the decisions panel reads
    `?status=flagged`, so it is complete however old a flag is, and the list
    pages with `?page=` ("עוד"). The line "מוצגות 100 ההפניות האחרונות" goes,
    and §5 row 4 is fixed rather than said.
- **The rule's sentence says "up to".** `count_audience` (the backend's
  `apps/messaging/audience.py`) doesn't apply the per-customer gap between
  two automated messages (`without_recent_automation_message`), so the live
  count is a ceiling: a customer who just got another rule's message is
  skipped at the run. The sentence reads "עד 86 הלקוחות שלא ביקרו…" (or
  "86 מתאימים עכשיו"), never "the 86 get this". The rest of it holds, as
  checked: once per lapse, or every `repeat_days` while they stay away, a
  real visit re-arms it (`dedupe_key`), and a late tick still runs that
  day (`local.hour >= send_hour`).
- **The A5 stays as it is** (§7, row 8): an A5 sheet, with the hint that a
  home printer needs A5 paper in the tray.
- **The critique snapshots** in `.impeccable/critique/` are committed with
  these notes, for step D's `/impeccable polish`.

**After step B** (checked in the browser on 23 Oct, for step D):
- **The local API is older than the delivery filter.** The backend's
  `exclude_kind` is merged (punchme-backend#2, `b63954b` on its `main`), but
  the `punchme-web` container still runs code from before it. So, locally,
  Sent falls back to the broadcasts alone. Before checking Sent, rebuild the
  image from the backend's `main` with `git archive main`, which keeps the
  uncommitted seed-demo work in its working tree out of the image. Then
  recreate `punchme-web` the way the dev-environment note gives it.
- **"Count it" says when.** The decision's line reads "the gift comes when
  נועה collects stamps". The rule that's on gives the member's gift on the
  friend's first stamp, so say that: "…ושני/ת תקבל/י את המתנה בחותמת
  הראשונה של נועה".
- **The rule's message still says ניקוב.** That is the backend's starter
  text saved in the rule (§12, outside the redesign), not this page's copy.

**After step C** (23 Oct, for step D):
- **On a real phone,** beside §10's list: a long press on a rule's row and
  on a standee thumbnail opens no callout; the keyboard over the
  composer's send and the editor's docked action; and a placeholder chip
  keeping the keyboard up as it inserts.
- **The kit's sheet doesn't position its scroller.** Anything placed
  absolutely inside it, such as an `sr-only` label, takes the panel as
  its box, so in a long sheet it can stretch the layer around the sheet
  and let a flick lift the sheet off the bottom of the screen. Refer a
  friend's settings now contain their own; the other sheets here, the
  customer's and the More sheet are clear today. A `relative` on the
  kit's scroller would close it for every sheet: a kit change, for Roee.

## Appendix A: the worst-case data

Load it into a signed-in dashboard tab on the dev server: paste it into the
console, or serve the file and add it as a script tag. It wraps `fetch` for
the manager pages' reads, answers as the server does, and refuses every
write to messaging and referrals the way the server would, so nothing
reaches the backend and no capped send is spent. A toggle above the phone
bar switches Demo, Worst case, On hold, Empty, One and Many. Navigate inside
the app (`history.pushState` and a `popstate` event) to keep it; a reload
removes it. Nothing in the repo changes.

```js
// break-ui-manager.js: Phase 6, step A. Worst-case data for the manager
// pages (Messages and its broadcast list, the rule editor, Referrals), in the
// browser only. Paste it into the console of a signed-in dashboard tab on the
// dev server. Nothing in the repo changes, and a reload removes it.
//
// It wraps window.fetch at the same boundary the real data crosses:
//   GET  /api/businesses/me                      (only the name changes)
//   GET  {biz}/templates                         (card name, reward, colours)
//   GET  {biz}/broadcasts?page=&page_size=       (paged like the server)
//   GET  {biz}/automations, {biz}/automations/{id}
//   GET  {biz}/messaging/summary, {biz}/messaging/audience
//   GET  {biz}/referrals (100 a page, the server's default), /program, /rules
// and it answers every WRITE to messaging and referrals with the refusal the
// server would give, so nothing reaches the backend and no send is spent:
//   POST broadcasts            -> 429 messaging_quota + next_allowed_at
//   POST automations/x/activate, POST/PATCH automations with is_active
//                              -> 403 upgrade_required
//   POST messaging/test        -> 409 preview_pass_missing
//   PATCH referrals/program    -> 422 referral_program_invalid
//   PATCH referrals/rules/...  -> 422 referral_rule_invalid
//   POST referrals/x/review    -> 409 referral_not_reviewable
//   anything else              -> 503
// In Demo every request passes through untouched, writes included.
//
// A toggle sits above the phone bar:
//   Demo · Worst case · On hold · Empty · One · Many
(() => {
  if (window.__breakuiManager) {
    window.__breakuiManager.show();
    return "break-ui: already installed";
  }

  const MIN = 60_000;
  const HOUR = 3_600_000;
  const DAY = 86_400_000;
  const now = () => Date.now();
  const iso = (ms) => new Date(ms).toISOString();
  // Today at a given local hour, n days from now (negative = past).
  const at = (days, hour, minute = 0) => {
    const d = new Date(now() + days * DAY);
    d.setHours(hour, minute, 0, 0);
    return d.getTime();
  };
  let seq = 0;
  const uuid = (prefix) => {
    seq += 1;
    const n = String(seq).padStart(12, "0");
    return `${prefix}-0000-4000-8000-${n}`;
  };

  // The longest values the backend takes, written the way an Israeli owner
  // would: Business.name is 120 (no maxLength in onboarding), a card's name 80,
  // its reward 200 (RewardStep's maxLength), a rule's name 60, a message's
  // title 40 and body 160 (MESSAGING_TITLE_MAX / MESSAGING_BODY_MAX), a
  // customer's name 120 (the join form has no maxLength).
  const BUSINESS = "בית הקפה והמאפייה של סבתא רחל ובניה — קפה, עוגות, כריכים וארוחות בוקר כל היום";
  const CARD = "כרטיסיית הקפה והמאפים של בית הקפה השכונתי באבן גבירול";
  const REWARD =
    "קפה הפוך גדול או תה צמחים לבחירה, עם מאפה חמאה טרי מהתנור, עוגיית שוקולד צ'יפס ביתית וכוס מיץ תפוזים סחוט — לשבת במקום או לקחת, בכל יום חוץ משבת, בכל אחד משלושת הסניפים שלנו בתל אביב";

  // ---- broadcasts -------------------------------------------------------
  function broadcast(o) {
    const audience = o.audience ?? 300;
    const failed = o.failed ?? 0;
    const skipped = o.skipped ?? 0;
    const pending = o.pending ?? 0;
    const sent = o.sent ?? audience - failed - skipped - pending;
    return {
      id: uuid("b0000000"),
      title: o.title ?? "",
      body: o.body,
      status: o.status ?? "sent",
      gift_stamps: o.gift ?? 0,
      gift_complete_card: !!o.full,
      opt_in_only: !!o.optIn,
      template_id: null,
      audience_count: audience,
      sent_count: sent,
      failed_count: failed,
      skipped_count: skipped,
      pending_count: pending,
      reached_count: sent,
      created_at: iso(o.created),
      sent_at: o.status === "sending" ? null : iso(o.created + 4 * MIN),
    };
  }

  const WORST_BROADCASTS = () => [
    broadcast({
      status: "sending",
      title: "מבצע סוף שבוע: 1+1 על כל הקפה והמאפים!",
      body: "רק היום עד 18:00. הזמינו מראש בוואטסאפ 050-123-4567 או ב-https://example.com/menu/weekend-special-2026?ref=wallet ותקבלו מאפה חם על חשבוננו, לכל השולחן ☕🥐",
      audience: 12480,
      sent: 3117,
      pending: 9363,
      created: now() - 4 * MIN,
    }),
    broadcast({
      title: "",
      body: "שלום לכולם!\nמחר סגור לרגל שיפוצים. נתראה ביום ראשון 🙏",
      audience: 1,
      created: at(-2, 9, 12),
    }),
    broadcast({
      title: "SALE 50% על espresso ו-cappuccino",
      body: "Happy hour every day 16:00–18:00. Show this message at the counter: 50% off every hot drink, no minimum.",
      audience: 2140,
      failed: 214,
      skipped: 37,
      created: at(-9, 16, 0),
    }),
    broadcast({
      title: "שנה טובה!",
      body: "שנה טובה ומתוקה מכל הצוות. השבוע: עוגת דבש במתנה לכל מי שמגיע/ה עם הכרטיסייה.",
      audience: 300,
      created: at(-364, 9, 0),
    }),
    broadcast({
      title: "<b>חדש</b> &amp; **טרי**",
      body: 'בדיקה: <script>alert(1)</script> & "ציטוט" ו-\'גרש\' {שם}',
      audience: 300,
      created: at(-12, 11, 30),
    }),
    broadcast({
      title: "Fresh sourdough every morning from 7am!",
      body: "Our new baker starts Sunday. Fresh sourdough, rye and challah every morning from 7am, while it lasts. Reserve a loaf by replying at the counter today.",
      audience: 300,
      created: at(-15, 7, 45),
    }),
    broadcast({
      title: "מתנה לכל הלקוחות 🎁",
      body: "כרטיסייה מלאה במתנה לכולם, לכבוד שנה לבית הקפה. בואו לממש עד סוף החודש!",
      full: true,
      audience: 296,
      skipped: 4,
      created: at(-20, 10, 0),
    }),
    ...Array.from({ length: 6 }, (_, i) =>
      broadcast({
        title: ["מבצע בוקר", "חדש בתפריט", "סגור בחג", "", "ערב טעימות", "תודה!"][i],
        body: ["כל הקפה ב-10 ₪ עד 9:00", "שקשוקה ביתית, רק בסופ\"ש", "ביום שלישי סגור. נתראה ברביעי", "בואו לטעום את העוגה החדשה", "ערב טעימות יין ביום חמישי ב-20:00", "תודה שאתם איתנו ❤️"][i],
        audience: 280 + i,
        created: at(-24 - i * 3, 10, 0),
      }),
    ),
  ];

  // ---- automations ------------------------------------------------------
  function rule(o) {
    return {
      id: uuid("a0000000"),
      name: o.name,
      kind: o.kind,
      status: o.on ? "active" : "paused",
      is_active: !!o.on,
      title: o.title ?? "",
      body: o.body ?? "היי {שם}, מתגעגעים אליך! בואו לקפה, מחכה לך חותמת במתנה.",
      gift_stamps: o.gift ?? 0,
      gift_complete_card: !!o.full,
      inactive_days: o.kind === "inactive" ? (o.days ?? 30) : null,
      repeat_days: o.repeat ?? null,
      birthday_days_before: o.kind === "birthday" ? (o.days ?? 0) : 0,
      reward_waiting_days: o.kind === "reward_waiting" ? (o.days ?? 7) : null,
      send_hour_local: o.hour ?? 10,
      opt_in_only: !!o.optIn,
      template_id: null,
      next_run_at: o.on ? iso(o.next ?? at(1, o.hour ?? 10)) : null,
      last_run_local_date: null,
      audience_count: o.audience ?? 0,
      sent_total: o.sentTotal ?? o.sent ?? 0,
      failed_total: 0,
      reached_total: o.sent ?? 0,
      sent_this_month: o.sent ?? 0,
      last_sent_at: o.sent ? iso(at(-1, o.hour ?? 10)) : null,
      created_at: iso(at(-40, 9)),
      updated_at: iso(at(-3, 9)),
    };
  }

  const WORST_RULES = () => [
    rule({
      name: "להחזיר את מי שלא הגיע חודשיים, עם קפה ומאפה במתנה לכולם",
      kind: "inactive",
      days: 365,
      repeat: 365,
      full: true,
      hour: 21,
      optIn: true,
      on: true,
      sent: 12480,
      title: "מתגעגעים אליכם בבית הקפה של סבתא!",
      body: "היי {שם}, לא ראינו אותך כבר {ימים}. מחכה לך כאן {הפרס} על חשבוננו, עד סוף השבוע. נתראה ב{עסק}! ☕",
    }),
    rule({
      name: "Birthday treat for regulars who opted in to our messages",
      kind: "birthday",
      days: 14,
      gift: 12,
      on: false,
      title: "Happy birthday, {name}!",
      body: "Happy birthday {name}! Twelve stamps from us, so {reward} is yours on your next visit to {business}.",
    }),
    rule({ name: "🎂 יום הולדת שמח! 🎉", kind: "birthday", days: 0, gift: 1, on: true, sent: 1 }),
    rule({ name: "ז", kind: "reward_waiting", days: 90, on: true, sent: 2, next: at(-1, 10) }),
    rule({ name: "Win-back 30 יום (גרסה 2)", kind: "inactive", days: 30, gift: 1, on: false }),
    rule({ name: "VIP ONLY!!!", kind: "inactive", days: 7, repeat: 7, gift: 3, optIn: true, on: true, sent: 731 }),
    rule({ name: "  החזרת לקוחות  ", kind: "inactive", days: 60, on: true, sent: 0 }),
  ];

  // ---- referrals ----------------------------------------------------------
  function referral(o) {
    return {
      id: uuid("r0000000"),
      status: o.status,
      fraud_reason: o.reason ?? "",
      referrer_card_id: o.member === null ? null : uuid("c0000000"),
      referrer_display_name: o.member ?? "",
      friend_card_id: uuid("c0000000"),
      friend_display_name: o.friend ?? "",
      attributed_at: iso(o.joined - 2 * DAY),
      joined_at: iso(o.joined),
      first_stamp_at: o.status === "qualified" || o.status === "completed" ? iso(o.joined + DAY) : null,
      completed_at: o.status === "completed" ? iso(o.joined + 20 * DAY) : null,
      reviewed_at: o.reason === "manual" ? iso(o.joined + DAY) : null,
      created_at: iso(o.joined),
    };
  }

  const WORST_REFERRALS = () => [
    referral({ status: "flagged", reason: "self_referral", friend: "Bartholomew Fitzgerald-Montgomery III", member: "נועה Smith-Goldberg", joined: now() - 20 * MIN }),
    referral({ status: "flagged", reason: "shared_device", friend: "", member: "", joined: now() - 3 * HOUR }),
    referral({ status: "flagged", reason: "burst", friend: "יוסי (בעלה של מיכל מהקומה השלישית, תמיד בלי סוכר) כהן", member: "Александра Кузнецова-Петрова", joined: at(-1, 18) }),
    referral({ status: "flagged", reason: "velocity", friend: "דנה כהן", member: "תמר לוי", joined: at(-2, 12) }),
    referral({ status: "joined", friend: "محمد أبو ربيعة", member: "ע", joined: at(-3, 9) }),
    referral({ status: "qualified", friend: "Maya 🌸 בן דוד", member: "JOSÉ MARÍA GONZÁLEZ DE LA VEGA", joined: at(-6, 15) }),
    referral({ status: "completed", friend: "שירה-לי בן-עמי אלמוג-רוזנטל מרקוביץ'-אבוטבול", member: "David Lévy", joined: at(-30, 10) }),
    referral({ status: "rejected", reason: "manual", friend: "Rachel O'Connor-Abergel", member: "רחל אבוטבול", joined: at(-31, 10) }),
    referral({ status: "rejected", reason: "already_customer", friend: "אורי מזרחי", member: "עדי פרץ", joined: at(-33, 10) }),
    referral({ status: "rejected", reason: "prior_customer", friend: "Jo", member: "יונתן ביטון", joined: at(-35, 10) }),
    referral({ status: "rejected", reason: "window_expired", friend: "Ólafur Darri Ólafsson", member: "ליאור אזולאי", joined: at(-40, 10) }),
    referral({ status: "joined", friend: "גל פרידמן", member: "שני מלכה", joined: at(-354, 10) }),
    referral({ status: "completed", friend: "נטע אברהם", member: null, joined: at(-60, 10) }),
    referral({ status: "qualified", friend: "איתי דהן", member: "מאיה כהן", joined: at(-7, 10) }),
  ];

  function manyReferrals() {
    const names = ["נועה", "תמר", "מאיה", "יעל", "שירה", "עומר", "דניאל", "Emma", "Liam", "Анна", "محمد"];
    const last = ["כהן", "לוי", "מזרחי", "פרץ", "Brown", "Иванова", "حداد"];
    const statuses = ["joined", "qualified", "completed", "rejected"];
    return Array.from({ length: 150 }, (_, i) => {
      // Twelve flagged ones, three of them older than the newest hundred.
      const flagged = i % 12 === 3 || i === 120 || i === 133 || i === 147;
      return referral({
        status: flagged ? "flagged" : statuses[i % 4],
        reason: flagged ? "shared_device" : statuses[i % 4] === "rejected" ? "already_customer" : "",
        friend: `${names[i % names.length]} ${last[(i * 3) % last.length]}`,
        member: `${names[(i + 4) % names.length]} ${last[(i * 5) % last.length]}`,
        joined: now() - i * 7 * HOUR,
      });
    });
  }

  const WORST_RULES_REFERRAL = [
    { event: "friend_joined", recipient: "friend", enabled: true, gift_stamps: 0, gift_complete_card: true, title: "ברוכים הבאים לבית הקפה של סבתא רחל!", body: "היי {שם}, {חבר} הזמין/ה אותך ל{עסק}. מחכה לך כרטיסייה מלאה במתנה: {פרס}. מספיק להראות את הכרטיס בקופה בביקור הראשון שלך אצלנו. נתראה!", saved: true },
    { event: "friend_first_stamp", recipient: "referrer", enabled: true, gift_stamps: 3, gift_complete_card: false, title: "{חבר} קיבל/ה חותמת ראשונה בזכותך!", body: "{שם}, תודה! {חבר} הגיע/ה לביקור ראשון ב{עסק}, אז הוספנו לך שלוש חותמות לכרטיסייה. עוד קצת ו{פרס} שלך. ממשיכים להביא חברים?", saved: true },
    { event: "friend_completed_card", recipient: "referrer", enabled: true, gift_stamps: 0, gift_complete_card: true, title: "", body: "", saved: true },
    { event: "scanned", recipient: "referrer", enabled: true, gift_stamps: 0, gift_complete_card: false, title: "מישהו סרק את הכרטיסייה שלך", body: "{שם}, מישהו סרק עכשיו את הכרטיסייה שלך ב{עסק}. אם {חבר} יצטרף/תצטרף, תקבל/י חותמות במתנה. {לא-מוכר}", saved: true },
  ];

  // ---- the summary and the audience --------------------------------------
  const SUMMARY = {
    worst: () => ({
      can_send: true,
      is_pro: true,
      customers_with_card: 12480,
      customers_with_birthday: 8012,
      inactive_counts: { "14": 5210, "30": 3904, "60": 2100, "90": 1504 },
      reward_waiting_count: 1,
      birthdays_this_month: 731,
      sent_this_month: 25316,
      can_reach_one_customer: true,
      broadcasts_used_7d: 2,
      broadcasts_limit_7d: 2,
      next_broadcast_allowed_at: iso(at(3, 14, 5)),
      scheduler_last_tick_at: iso(now() - 2 * MIN),
      dispatch_enabled: true,
    }),
    // Every notice the page can stack at once: messaging not open (Pro, off
    // the allowlist), sending paused, and rules on hold.
    onhold: () => ({
      can_send: false,
      is_pro: true,
      customers_with_card: 300,
      customers_with_birthday: 120,
      inactive_counts: { "14": 80, "30": 41, "60": 12, "90": 3 },
      reward_waiting_count: 22,
      birthdays_this_month: 9,
      sent_this_month: 640,
      can_reach_one_customer: false,
      broadcasts_used_7d: 0,
      broadcasts_limit_7d: 2,
      next_broadcast_allowed_at: null,
      scheduler_last_tick_at: iso(now() - 5 * HOUR),
      dispatch_enabled: false,
    }),
    empty: () => ({
      can_send: true,
      is_pro: true,
      customers_with_card: 0,
      customers_with_birthday: 0,
      inactive_counts: { "14": 0, "30": 0, "60": 0, "90": 0 },
      reward_waiting_count: 0,
      birthdays_this_month: 0,
      sent_this_month: 0,
      can_reach_one_customer: true,
      broadcasts_used_7d: 0,
      broadcasts_limit_7d: 2,
      next_broadcast_allowed_at: null,
      scheduler_last_tick_at: iso(now() - 2 * MIN),
      dispatch_enabled: true,
    }),
    one: () => ({
      can_send: true,
      is_pro: true,
      customers_with_card: 1,
      customers_with_birthday: 1,
      inactive_counts: { "14": 1, "30": 1, "60": 1, "90": 1 },
      reward_waiting_count: 1,
      birthdays_this_month: 1,
      sent_this_month: 1,
      can_reach_one_customer: true,
      broadcasts_used_7d: 1,
      broadcasts_limit_7d: 2,
      next_broadcast_allowed_at: null,
      scheduler_last_tick_at: iso(now() - 2 * MIN),
      dispatch_enabled: true,
    }),
    many: () => ({
      can_send: true,
      is_pro: true,
      customers_with_card: 2480,
      customers_with_birthday: 1900,
      inactive_counts: { "14": 1210, "30": 904, "60": 400, "90": 220 },
      reward_waiting_count: 140,
      birthdays_this_month: 160,
      sent_this_month: 5316,
      can_reach_one_customer: true,
      broadcasts_used_7d: 1,
      broadcasts_limit_7d: 2,
      next_broadcast_allowed_at: null,
      scheduler_last_tick_at: iso(now() - 2 * MIN),
      dispatch_enabled: true,
    }),
  };
  const AUDIENCE = { worst: 12480, onhold: 41, empty: 0, one: 1, many: 2480 };

  // ---- the datasets -----------------------------------------------------------
  const cache = {};
  function data(mode) {
    if (cache[mode]) return cache[mode];
    let broadcasts = [];
    let rules = [];
    let referrals = [];
    if (mode === "worst") {
      broadcasts = WORST_BROADCASTS();
      rules = WORST_RULES();
      referrals = WORST_REFERRALS();
    } else if (mode === "onhold") {
      broadcasts = WORST_BROADCASTS().slice(1, 4);
      rules = WORST_RULES().slice(2, 6);
      referrals = WORST_REFERRALS().slice(0, 3);
    } else if (mode === "one") {
      broadcasts = [broadcast({ title: "", body: "מחר סגור. נתראה ביום ראשון", audience: 1, created: at(-1, 9) })];
      rules = [rule({ name: "החזרת לקוחות", kind: "inactive", days: 30, gift: 1, on: true, sent: 1 })];
      referrals = [referral({ status: "flagged", reason: "self_referral", friend: "נועה כהן", member: "תמר לוי", joined: now() - HOUR })];
    } else if (mode === "many") {
      broadcasts = Array.from({ length: 37 }, (_, i) =>
        broadcast({ title: `מבצע מספר ${37 - i}`, body: "כל הקפה ב-10 ₪ עד 9:00", audience: 2480, created: now() - i * 3.5 * DAY }),
      );
      rules = Array.from({ length: 25 }, (_, i) =>
        rule({ name: `כלל ${i + 1}`, kind: ["inactive", "birthday", "reward_waiting"][i % 3], days: [30, 0, 7][i % 3], on: i % 2 === 0, sent: i * 7 }),
      );
      referrals = manyReferrals();
    }
    cache[mode] = { broadcasts, rules, referrals };
    return cache[mode];
  }

  // ---- the fetch wrapper ------------------------------------------------
  const state = { mode: "demo", requests: [] };
  const realFetch = window.fetch.bind(window);
  const BIZ = "/api/businesses/";
  const json = (body, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
  const delay = () => new Promise((resolve) => setTimeout(resolve, 15));

  async function patched(input, init, patch) {
    const res = await realFetch(input, init);
    if (!res.ok) return res;
    const body = await res.json();
    return json(patch(body));
  }

  function refuse(method, path) {
    if (method === "POST" && /\/broadcasts$/.test(path)) {
      return json({ detail: "Broadcast limit reached for this week", code: "messaging_quota", next_allowed_at: iso(at(3, 14, 5)) }, 429);
    }
    if (/\/automations\/[^/]+\/activate$/.test(path) || /\/automations(\/[^/]+)?$/.test(path)) {
      return json({ detail: "Sending messages to customers requires the Pro plan", code: "upgrade_required" }, 403);
    }
    if (/\/messaging\/test$/.test(path)) {
      return json({ detail: "Your own preview card isn't available right now — try again shortly", code: "preview_pass_missing" }, 409);
    }
    if (/\/referrals\/program$/.test(path)) {
      return json({ detail: "max_rewarded_per_referrer", code: "referral_program_invalid" }, 422);
    }
    if (/\/referrals\/rules\//.test(path)) {
      return json({ detail: "body_too_long", code: "referral_rule_invalid" }, 422);
    }
    if (/\/referrals\/[^/]+\/review$/.test(path)) {
      return json({ detail: "This referral isn't waiting for review", code: "referral_not_reviewable" }, 409);
    }
    return json({ detail: "break-ui: writes are off" }, 503);
  }

  window.fetch = async (input, init) => {
    const href = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    const method = (init?.method ?? (typeof input === "object" && "method" in input ? input.method : "GET")).toUpperCase();
    let url;
    try {
      url = new URL(href, location.href);
    } catch {
      return realFetch(input, init);
    }
    const path = url.pathname;
    if (state.mode === "demo" || !path.startsWith(BIZ)) return realFetch(input, init);

    const tail = path.slice(BIZ.length).split("/").slice(1).join("/");
    const mine = /^(broadcasts|automations|messaging|referrals)(\/|$)/.test(tail);
    if (method !== "GET") {
      if (!mine) return realFetch(input, init);
      state.requests.push({ method, path, refused: true });
      await delay();
      return refuse(method, path);
    }

    const set = data(state.mode);
    const big = state.mode === "worst";
    state.requests.push({ method, path: path + url.search });

    if (path === "/api/businesses/me") {
      if (!big) return realFetch(input, init);
      return patched(input, init, (b) => ({ ...b, name: BUSINESS }));
    }
    if (tail === "templates") {
      if (!big) return realFetch(input, init);
      return patched(input, init, (list) =>
        list.map((tpl, i) =>
          i === 0
            ? { ...tpl, name: CARD, reward_description: REWARD, stamps_required: 12, background_color: "#FFF8E7", foreground_color: "#3B2A1A", label_color: "#B45309" }
            : tpl,
        ),
      );
    }
    if (tail === "broadcasts") {
      const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
      const size = Math.min(100, Math.max(1, Number(url.searchParams.get("page_size") ?? 100)));
      await delay();
      return json({ items: set.broadcasts.slice((page - 1) * size, page * size), count: set.broadcasts.length });
    }
    if (tail === "automations") {
      await delay();
      return json(set.rules);
    }
    const one = /^automations\/([^/]+)$/.exec(tail);
    if (one) {
      const found = set.rules.find((r) => r.id === one[1]);
      if (!found) return realFetch(input, init);
      await delay();
      return json(found);
    }
    if (tail === "messaging/summary") {
      await delay();
      return json(SUMMARY[state.mode]());
    }
    if (tail === "messaging/audience") {
      await delay();
      return json({ count: AUDIENCE[state.mode] });
    }
    if (tail === "referrals") {
      const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
      const status = url.searchParams.get("status");
      const rows = status ? set.referrals.filter((r) => r.status === status) : set.referrals;
      await delay();
      return json({ items: rows.slice((page - 1) * 100, page * 100), count: rows.length });
    }
    if (tail === "referrals/program") {
      if (state.mode === "empty") {
        return patched(input, init, (p) => ({ ...p, enabled: false }));
      }
      return patched(input, init, (p) => ({
        ...p,
        enabled: true,
        max_rewarded_per_referrer: big ? 20 : p.max_rewarded_per_referrer,
        cap_period: big ? "lifetime" : p.cap_period,
        referrer_display_mode: big ? "first_name_initial" : p.referrer_display_mode,
        can_enable: true,
        enable_blocker: "",
      }));
    }
    if (tail === "referrals/rules") {
      if (!big) return realFetch(input, init);
      return patched(input, init, (r) => ({ ...r, rules: WORST_RULES_REFERRAL }));
    }
    return realFetch(input, init);
  };

  async function refetch() {
    // Absolute, so it resolves against the app's origin however this script
    // was loaded: the same module record, so the app's own client.
    const { queryClient } = await import(new URL("/src/lib/queryClient.ts", location.origin).href);
    const keys = [
      ["business"],
      ["templates"],
      ["broadcasts"],
      ["automations"],
      ["automation"],
      ["messaging"],
      ["referrals"],
      ["referralProgram"],
      ["referralRules"],
    ];
    await Promise.all(keys.map((queryKey) => queryClient.resetQueries({ queryKey })));
  }

  // Dev chrome, not the design under test: a plain grey track with a white
  // pill on the chosen segment, above the phone bar, in the system face.
  const MODES = [
    ["demo", "Demo"],
    ["worst", "Worst case"],
    ["onhold", "On hold"],
    ["empty", "Empty"],
    ["one", "One"],
    ["many", "Many"],
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
    button.style.cssText = "border:0;border-radius:999px;padding:8px 9px;color:#111;cursor:pointer;font:inherit";
    button.addEventListener("click", () => window.__breakuiManager.set(mode));
    bar.append(button);
  }
  document.body.append(bar);

  window.__breakuiManager = {
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
