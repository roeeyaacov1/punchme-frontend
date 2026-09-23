# PunchMe — product brief for the dashboard redesign

This document contains **facts about the product**, not design direction. Every visual and
compositional decision — layout, color, typography, components, navigation patterns — is
the designer's. Attach this file (plus `copy-deck.md` and the `locked-objects` screenshots)
to the Figma Make chat.

## What the product is

A digital loyalty punch card for small Israeli businesses — a barber, a café owner, a
personal trainer, a therapist. Their customer scans a QR code once; a punch card lands in
their Apple/Google Wallet with no app and no signup, and stamps itself on every visit.
₪59/month; designing and previewing is free, paying activates it for real customers.

The dashboard is the owner's side: scan customer codes at the counter, see who came back,
message customers, edit the card, print signage, manage the team and billing.

**The user** is a solo operator, not technical, often skeptical of software dashboards.
They use this one-handed, on a phone, between customers.

## Hard facts every screen must respect

1. **Hebrew first.** Hebrew RTL is the primary state of every screen; English LTR is the
   variant. All copy comes from `copy-deck.md` — real product strings, both languages,
   never invented Hebrew, never lorem ipsum. Whatever typefaces are chosen must fully
   support Hebrew (most monospace faces don't — never set Hebrew text in one). Numbers,
   phone numbers, URLs and card codes stay LTR inside Hebrew text. Hebrew has no uppercase.
2. **Two sizes.** Every screen at mobile 375×812 and desktop 1280+. Mobile is the primary
   counter context.
3. **Two themes.** The product ships light and dark today and both must exist in the new
   design. Palette is free; all text meets WCAG AA contrast in both themes.
4. **Roles.** staff < manager < owner. Staff: scan, overview, customers, activity.
   Manager adds: messages, card studio, signage, settings. Owner adds: team, billing.
   Nobody is shown a door their role can't open.
5. **Plans.** Free vs Pro. On Free, real customers can't join yet — data surfaces are
   empty/locked with an honest path to activation (billing). These states are designed as
   carefully as the full ones; a brand-new shop sees mostly them.
6. **Locked objects** (see `locked-objects/` screenshots): the wallet pass preview (Apple
   and Google renderings of the owner's own card, in the owner's own colors), the
   enrollment QR, and the four printed signage sheets are produced by existing code and
   mirror what Apple/Google/paper actually show. They are placed and framed in the design —
   never redrawn, never restyled, never re-colored.
7. **Honest content.** Sample data looks like a real small business: Israeli names
   (נועה לוי, אבי כהן…), a barbershop called מספרת שי, ~40 customers, modest numbers.
   No fake growth metrics, no decorative stats.
8. **Accessibility.** WCAG AA text contrast, comfortable touch targets, visible keyboard
   focus, screens operable by keyboard.

## The screens

Nineteen functional briefs (numbered 0–17 plus three audit passes) live in the prompt pack —
navigation frame, Overview, Customers, Messages hub, Broadcast composer, Automation editor,
Activity, Scan, Card Studio, Signage, Team, Billing (+ payment return pages), first-run
tour, and four new surfaces: customer detail, delivery log, settings, and an internal admin
tool. Each brief states the page's job, its data, its controls, its states, and who sees
it — nothing about how it should look.

## Template

Starting from a Figma Community template is recommended purely as raw material — pick any
that suits, checking: licence permits derivative commercial use; it includes mobile frames;
it has table/form coverage (this product is mostly tables and forms). Two options already
licence-verified (CC BY 4.0), in case they save time — the choice is free:

- Untitled UI — FREE Figma UI kit v2.0:
  <https://www.figma.com/community/file/1020079203222518115/untitled-ui-free-figma-ui-kit-and-design-system-v2-0>
- Untitled UI data tables kit:
  <https://www.figma.com/community/file/1332203037536263387/figma-data-tables-ui-kit-untitled-ui>

Strip stock photography and invented logos from anything imported.

## What comes back (per converged group file)

1. The Make project's exported/downloaded code (ZIP).
2. The published prototype link.
3. Screenshot set per screen: HE + EN × light + dark × mobile + desktop, clearly named
   (e.g. `customers-he-dark-mobile.png`).

These are the specification the engineering side builds from — the real app is rebuilt in
the product's own codebase to match them.
