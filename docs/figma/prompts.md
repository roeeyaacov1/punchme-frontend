# PunchMe dashboard — Figma Make functional briefs

> **These briefs deliberately contain NO design direction.** No layouts, no colors, no
> component choices — the designer owns every visual and compositional decision. Each brief
> states only: what the page is for, what functionality it must carry, which states exist,
> and who sees it. The friendly designer version (Hebrew walkthrough + copy buttons) is
> `designer-guide.html` / <https://claude.ai/code/artifact/43ec7777-42f6-45fa-9ab7-6dc7450194fb>.
> This file is canonical; if the two disagree, this one wins and the guide is regenerated.
> (The shipped product's own design system is documented separately in `system-brief.md` —
> internal implementation reference only; it is NOT sent to the designer.)

Process notes (mechanics, not design):

- **Run order = numbering.** 0–3 in the seed file (context → navigation → Overview →
  Customers — the two most functionality-dense pages; settle your system there). Then
  duplicate the seed per group and run: Messaging 4–6 + 15, Core 7, Periphery 8–12 + 16,
  Customers 14, Admin 17, tour (13) anywhere. Audit passes A/B/C last, once per group file.
- **Re-paste the short reminder block** at the top of every prompt from 4 on.
- Iterate with one change per message, named element; prefer point-and-edit for local fixes;
  duplicate the file before structural experiments; restore versions on regressions.

The reminder block:

```
=== PunchMe facts ===
- Hebrew RTL is the primary state of every screen; English LTR is the variant.
- All copy comes from the attached copy deck — never invent Hebrew, never lorem ipsum.
- Numbers, phone numbers, URLs and serial codes stay LTR inside Hebrew text.
- Every screen: mobile 375px + desktop, light + dark theme, WCAG AA text contrast.
- Wallet pass / QR / printed signage are locked objects (attached screenshots) —
  design around them, never redraw them.
- Sample data: realistic Israeli small business (real names, ~40 customers, honest numbers).
```

---

## Prompt 0 — Product context (seed file, first message; attach template frames + copy deck + product brief)

You are designing the owner dashboard of **PunchMe** — a digital loyalty punch card for
small Israeli businesses (a barber, a café owner, a personal trainer). The customer scans a
QR code once and a punch card lands in their Apple/Google Wallet; it stamps itself on every
visit. The dashboard is where the owner scans customer codes, sees who came back, and sends
messages. Owners are not technical, use this between haircuts with one hand at the counter,
and are skeptical of software dashboards.

All design decisions — layout, color, typography, components, navigation patterns — are
yours. The following are product facts, not suggestions:

**Language.** Hebrew is the primary language; design every screen RTL-first, with an English
LTR variant. Use only the real product strings from the attached copy deck. Whatever
typefaces you choose must fully support Hebrew (note: most monospace faces have no Hebrew —
never set Hebrew text in one). Numbers, phones, URLs and serial codes remain LTR inside
Hebrew text. Hebrew has no uppercase.

**Platforms.** Every screen at mobile 375×812 and desktop 1280+. Mobile is the primary
counter context.

**Themes.** The dashboard ships with light and dark themes today and both must exist in
your design. Palette is yours; all text must meet WCAG AA contrast in both.

**Roles.** Three ranked roles gate everything: **staff** (counter work: scan, overview,
customers, activity) < **manager** (adds: messages, card studio, signage, settings) <
**owner** (adds: team, billing). A person must never be shown a destination their role
can't open.

**Plans.** Free vs Pro. On Free, the owner can design and preview everything but real
customers can't join — most data surfaces are empty and locked behind an "activate"
path that leads to Billing. Design these locked/empty states as real screens, not leftovers.

**Locked objects** (attached screenshots): the wallet pass preview, the enrollment QR, and
the printed signage sheets are rendered by existing code — the pass shows each owner's own
card colors, the signage is physical printed paper. Place them, frame them, give them room —
never redraw or restyle them.

**Content honesty.** Sample data must look like a real small business: real Israeli names,
a barbershop called מספרת שי, modest numbers (~40 customers). No invented growth metrics,
no decorative fake stats.

**Consistency mechanism:** before generating any screen, define your chosen palette as CSS
variables in a `tokens.css` (a light set and a dark set) and use only those variables in
everything you generate — this keeps ~20 screens coherent. The values are entirely your
choice.

Wait for my page briefs before generating screens. Confirm you've absorbed this.

## Prompt 1 — Navigation & app frame

Design the dashboard's navigation and page frame, mobile and desktop, Hebrew RTL first.
Navigation structure and patterns are your call. Functional requirements:

**Destinations** (with minimum role): סריקה scan (staff) · סקירה overview (staff) ·
לקוחות customers (staff) · פעילות activity (staff) · הודעות ללקוחות messages (manager) ·
סטודיו הכרטיסיות card studio (manager) · שילוט signage (manager) · הגדרות settings
(manager) · צוות team (owner) · חיוב billing (owner). Scan is the most frequently used
action — it happens at the counter many times a day.

**Also present somewhere in the frame:** the business identity (name + their own card's
look + Free/Pro plan state); account controls — theme choice (light/dark/system), language
switch (HE⇄EN), "replay the tour", sign out; staff accounts of PunchMe itself additionally
get a link to an internal admin tool.

**Role behavior:** a staff member sees only their four destinations — no disabled doors, no
empty leftovers. Show the frame for an owner and the frame for a staff member.

**Mobile:** one-handed counter use is the reality; every destination must remain reachable.

Generate: desktop frame (owner, HE), desktop frame (staff, HE), mobile frame incl. how
beyond-primary destinations are reached (HE), one EN LTR variant, light + dark.

## Prompt 2 — Overview

**סקירה (Overview)** — the first screen after login. Its job: tell the owner whether people
are coming back, and what's worth doing today.

**Data to present (Pro):** how many people returned in the last 30 days (returned = visited
on 2+ separate days) with a comparison to the previous 30 days; totals — customers, new
joins, visits, customers whose reward is ready; a 30-day daily trend; this week's stamps
per day (Israeli week starts Sunday) with a total and a vs-last-week comparison; the 5
customers closest to their reward (name, progress, remaining); up to 3 suggested actions
when relevant — nothing scanned in N days (→ scan), N customers inactive 30+ days (→ start
a win-back message), N birthdays this month (→ birthday message) — plus a calm "nothing
needs you" state.

**Also on the page:** the enrollment QR (locked object) with a copy-link action; the wallet
pass preview (locked object); an install-as-app nudge (Chrome install prompt / iOS
add-to-home-screen steps, dismissible).

**Variants:** Free-plan owner — instead of stats, a 3-step getting-started path (card is
designed ✓ → print signage → activate), each linking to its page; staff member — counter
essentials only, no marketing content.

**A quiet week is a normal state, not an error.** Empty states for a brand-new business are
part of the brief.

Generate: desktop Pro (HE), mobile Pro (HE), desktop Free-owner, dark, one EN LTR.

## Prompt 3 — Customers

**לקוחות (Customers)** — the roster; the busiest working screen.

**Data per customer:** name, phone, stamp progress (e.g. 7 of 10), status (in progress /
reward ready / new / void), which card design they hold, join date.

**Functionality:** search (by name, phone digits, card name); sort (progress / recently
joined / name); filter by status — each filter shows how many it would return, and an empty
filter can't be applied; export the filtered list to CSV; pagination (~20 per page with a
count of shown/total).

**Per-customer actions:** copy phone; send them a one-off message (max 160 chars, live
counter, it arrives as a wallet notification on their lock screen); open their detail view;
adjust stamps up/down (bounded 0..required; can be disabled server-side — show a disabled
state with its reason); remove them — removal requires explicit confirmation that states
three consequences: history is permanently deleted, the pass in their wallet stops working,
they can re-join from zero. Reward-ready customers should be findable at a glance;
messaging/removal are manager+ actions — staff see only copy-phone.

**States:** loading; empty roster on Pro ("share the QR to get your first customer");
empty roster on Free (activate path); no search matches (with clear-filters); a void card
(muted, stamp adjustment disabled with reason).

Generate: desktop list (HE, one row's actions open), the message flow, the remove
confirmation, mobile list (HE), an empty state, dark.

## Prompt 4 — Messages hub

**הודעות ללקוחות (Messages)** — manager+. Home for everything the owner sends.

**Data:** audience size (customers holding the card); inactive-30-days count; reward-waiting
count; messages sent this month.

**Functionality:** start a broadcast (→ its own screen) — broadcasts are rate-limited
(N remaining per 7 days; when exhausted, when the next is allowed) and the limit is shown
honestly, not hidden; manage automations — each rule shows: its kind (win-back / birthday /
reward-waiting), name (→ editor), on/off state incl. "on hold" (a rule can be paused by the
system — switching ON is blocked while on hold, switching OFF always works), a plain-language
summary of when it fires and what it sends, sent-this-month, next run time; create a new
automation from three recipes (win-back · birthday · reward waiting), each with an honest
one-line description — this recipe picker is also the empty state; history of sent
broadcasts — title, body preview, timestamp, delivered X of Y, failures count, sending
status with live progress while a send is in flight; each opens its delivery log (brief 15).

**Guard states (shown above content, not replacing it):** Free plan (→ billing); messaging
not enabled for this account; sending temporarily paused system-wide.

Generate: desktop full (HE, 2 rules + 3 history entries), the recipe picker / empty state,
mobile (HE), dark.

## Prompt 5 — Broadcast composer

A dedicated screen (with a way back to Messages) for writing one message to many customers.

**Functionality:** title (max 40 chars, live counter) and body (max 160 chars, live
counter); insertable placeholders — customer name, business name, reward, days — that
render as real values per recipient; a placeholder that would exceed the limit can't be
inserted; a live preview of the actual lock-screen notification as one sample customer will
see it (uses the card's colors); optional gift attached to the message — off by default —
of 1/2/3 stamps or complete-the-card, with a plain explanation of what a gift stamp does;
audience controls — live recipient count that updates with every change, an opt-in-only
toggle (with a disabled-state reason when unavailable), and a card-design scope selector
shown only when the business has several card designs; send — the user must see the final
recipient count and how many broadcasts remain afterwards, and explicitly confirm before
anything is sent; send-a-test-to-myself (delivers to the owner's own preview pass).

**States:** quota exhausted (with when the next send unlocks); zero recipients; not-enabled
guard; send error.

Generate: desktop (HE) with live preview, the confirm step, mobile (HE), dark.

## Prompt 6 — Automation editor

One screen serves create and edit for a message rule. Three rule kinds:

- **Win-back:** fires after N days without a visit — presets 14/30/60/90 or custom 7–365
  (validated, with a live validity message); optional repeat every N days (7–365).
- **Birthday:** fires 0/1/3/7 days before the birthday.
- **Reward waiting:** fires after the reward has waited N days — presets 3/7/14 or custom
  1–90.

**Functionality:** rule name (max 60); the kind-specific timing controls above; send hour
(08:00–21:00); the same message composition as the broadcast composer — same placeholders,
same live preview, same gift option (gift hidden for reward-waiting rules), same live
audience count; save-and-activate vs save-paused (activation blocked while the account is
on hold — the reason shown); in edit mode: current on/off state and switch, and delete —
with explicit confirmation; send-a-test-to-myself.

**States:** create (seeded from a recipe) vs edit; invalid custom values; load failure
(message + way back, not an eternal spinner).

Generate: desktop win-back (HE), the birthday timing variant, mobile (HE), delete
confirmation.

## Prompt 7 — Activity

**פעילות (Activity)** — the ledger: every stamp event, day by day. Answers "what happened
when I wasn't there".

**Data per event:** when (day + time), who (customer name, or their card's short code when
nameless), what (stamp / gift / manual adjustment / removed / import), by whom (which staff
member, or automatic).

**Functionality:** period switch 7/14/30 days; a per-day trend of the period which can also
filter the list to a single day (with a visible, dismissible indication of the selected
day); search (customer, card code, staff member); filter by event type; filter by person
(only when more than one exists); events grouped by day with "today"/"yesterday" naming;
pagination at ~50 (shown/total when filtered).

**States:** Free plan (→ billing); loading; empty period; filters with no matches (with
clear-all); a truncation notice when the window couldn't load everything.

Generate: desktop (HE, a day selected, ~15 events over 3 days), mobile (HE), dark, empty
period.

## Prompt 8 — Scan

**סריקה (Scan)** — the counter tool: staff point the camera at a customer's wallet pass and
a stamp registers. Used many times a day, one-handed, phone-first.

**Functionality:** a live camera view that opens on arrival and stays open between scans;
torch toggle (only when supported) and scan-sound toggle; a manual code entry path (typed
codes are deliberate — they bypass duplicate protection); a session tally after the first
scan (stamps + rewards this session, link to Activity); Free-plan notice with activation
path.

**Scan outcomes to design** (each shown clearly, then the scanner resumes; timing feel is
yours — the reward decision must wait for the user): working; **stamped** (their new count
X of Y and how many remain); **reward ready** — the reward's own text with a redeem action
and a not-now; **redeemed** confirmation; **too soon** (same card scanned again within 45s —
friendly, not scolding); **void card** (with explanation); **unknown code**; **they scanned
the shop's own enrollment poster** (gentle explanation); **camera denied / unavailable**
(explanation + retry); network failure.

Generate: mobile idle (HE), stamped, reward-ready, camera-denied, desktop, dark mobile.

## Prompt 9 — Card Studio

**סטודיו הכרטיסיות** — where the owner edits the wallet card itself. The live pass preview
is the locked object (attached); everything around it is yours.

**Functionality:** preview the pass as Apple Wallet and as Google Wallet (toggle), at any
sample stamp count (0..required); edit — card name; reward text; stamps required (2–12);
stamp icon from a fixed set of 16, or upload custom stamp art (an upload wins over the
icon); background/stamp/text/label colors (free color choice — hex entry, eyedropper,
swatches); 6 ready palettes; background pattern (none/waves/dots/stripes); logo upload;
advanced ("wallet details"): rename the two pass field labels, card language HE/EN, barcode
format (QR / PDF417 / AZTEC / CODE128), organization name, custom artwork uploads, and a
pass-fields editor (add/remove/reorder fields: binding, label, section, alignment, change
message).

**Behavior facts:** a server-side check continuously reviews the draft and returns either
"all clear" or a list of concrete problems (e.g. text too light on the background) — these
must be visible; save is explicit (disabled until something changed, with saved
confirmation); every card already in customers' wallets updates itself after save.

Generate: desktop (HE), the advanced section open, mobile (HE), dark — noting the pass
keeps its own colors regardless of theme.

## Prompt 10 — Signage

**שילוט (Signage)** — pick a printed sheet, pick a paper size, print. The sheet designs
themselves are locked objects (attached) rendered with the owner's real card and QR.

**Functionality:** choose one of four sheet designs (poster / counter card / card / plain) —
the choice must show each design as it will actually print; choose paper — A4, A5, or a
folded table tent (A4 folded across the middle); a print action; on Free plan printing is
locked with the reason and an activation path shown.

**Facts:** the preview shows physical paper; the printed output must match what's on
screen.

Generate: desktop (HE), mobile (HE), the Free-locked state, dark (the paper preview is
still a preview of white paper).

## Prompt 11 — Team

**צוות (Team)** — owner only. **There is no email sending in this product:** the owner
creates an invitation LINK and sends it themselves (typically WhatsApp). The design must
make that model self-evident.

**Functionality:** create an invitation — choose the role it grants (staff or manager, each
explained in one plain sentence of what it opens); optionally bind it to an email address
(bound = only that address can use it; unbound = the link itself is the credential — whoever
receives it gets in — and this difference must be communicated); on creation the link is
shown and copied for sending; members list — each member's email and current role, role
changeable in place (staff⇄manager), removable with confirmation; the owner appears but has
no controls (there must always be an owner); pending invitations — who it's for (or
"anyone with the link"), role, expiry date, copy-again, revoke; expired invitations visible
but unusable.

**Errors to design:** already a member; team size limit reached; invalid email.

Generate: desktop (HE, 3 members + 2 pending incl. one expired), the link-created moment,
mobile (HE), one error state.

## Prompt 12 — Billing (+ payment return screens)

**חיוב (Billing)** — owner only. Deliberately minimal: the payment provider's own portal
does the heavy lifting.

**Functionality:** Free state — explains what's free (designing, previewing, the dashboard)
and what activation unlocks (real customers can join), shows the price ₪59/month, one
activate action (→ external checkout); Pro state — confirms the card is active, one
manage-billing action (→ external portal), and the subscription status as reported by the
provider. No invoice tables, no plan-comparison grids — those don't exist in the product.

**Also:** the two full-screen payment return pages — success: a finalizing/waiting state
(the system confirms the payment asynchronously, up to ~30s) then done; cancel: "no charge
was made" + way back.

Generate: Free (HE), Pro (HE), success + cancel, mobile, dark.

## Prompt 13 — First-run tour

A short introduction shown once on first arrival (replayable from account controls).
4–5 steps, filtered by role (staff see fewer). Each step: a title, 2–3 sentences (copy
deck: tour.steps.*), and where that feature lives in the navigation. Requirements: skip is
available on every step, not just the first; back/next; progress indication; keyboard
navigable; it must not cover the scanner.

Generate: mobile (HE, mid-tour), desktop (HE), dark.

## Prompt 14 — Customer detail (new)

A view of one customer, opened from the roster. Presentation (page, panel, drawer…) is your
call.

**Data:** name, phone (copyable), join date, which card design; stamp progress and the
reward they're collecting toward; their personal visit history, day by day (who stamped,
when — note: redemption events are not available in the data and must not be promised);
messages they received (title, date, delivered/failed).

**Actions:** the same per-customer actions as the roster — message, adjust stamps, remove
(same confirmation contract).

**States:** brand-new customer (joined today, 1 stamp, no messages); void card.

Generate: desktop (HE), mobile (HE), void state, dark.

## Prompt 15 — Delivery log (new)

For any sent message (broadcast or automation): who actually received it. Failures are
shown plainly — honesty is the product's stance.

**Data:** the message itself (title, body, sent date); totals — sent X of Y, failed N;
per recipient — name, delivery time, delivered or failed with a plain-language reason
("the card was removed from the wallet"). Failed entries must be easy to find.

**States:** all delivered (the common case — quiet); still sending, with live progress;
an automation that hasn't fired yet (when it will).

Generate: desktop (HE, some failures), mobile (HE), sending state, dark.

## Prompt 16 — Settings (new)

**הגדרות (Settings)** — manager+; the destructive part owner-only.

**Functionality:** edit business identity — name, trade (barber / café / trainer /
therapist / other), address (autocomplete), logo (with current logo shown); explicit save
with confirmation; pointers (not duplicates) to where card language and dashboard
theme/language live; owner-only danger zone — delete the business, requiring typed
confirmation of the business name, with the honest consequences stated: all customers,
cards and history permanently deleted, every pass in every wallet stops working.

Generate: desktop owner (HE), desktop manager (no danger zone), mobile (HE), the delete
confirmation, dark.

## Prompt 17 — Admin catalog (internal tool)

An internal tool for PunchMe staff who author the ready-made card looks shown to new
businesses. Same design system, RTL and themes as the rest; its own minimal frame (title,
staff indication, signed-in email, back-to-app, language, sign out). Desktop-first is
acceptable; must not break at 375px.

**List page functionality:** per-trade authoring coverage (how many published looks out of
a target of 3 per trade, shortfalls visible); the catalog entries — a true-color thumbnail
of each look, name, id, trade, description, published/draft; reorder (the order is what new
businesses see); publish/unpublish; edit; delete with confirmation; create new.

**Editor page:** trade, description, published flag, and the same Card Studio editing
established in brief 9 (it embeds the same editor).

Generate: list desktop (HE, 6 entries, one draft), editor (HE), list at 375px, dark.

---

## Pass A — RTL audit (once per group file, after its pages converge)

Audit every Hebrew screen for RTL correctness and fix: layout mirrored end-to-end,
text right-aligned, directional icons mirrored; numbers, phone numbers, URLs and serial
codes stay LTR within Hebrew text; interactive directionality (sliders, steppers,
progressions) behaves correctly in RTL; no letter-spacing artifacts on Hebrew. List every
screen you changed and what was wrong.

## Pass B — Theme audit

Audit both themes: every screen exists in both; layout identical between them; all text
meets WCAG AA in both; the locked objects (wallet pass, QR, printed-paper previews) are
unchanged by the theme — they show real physical/rendered artifacts. Fix and list.

## Pass C — States audit

For each screen verify these exist as designed states (not gray boxes): loading;
empty-new-business; Free-plan-locked with a path to activation; error; no-search-results
where applicable. A brand-new shop with zero customers must see a dashboard that feels
ready, not broken. Generate any missing states.
