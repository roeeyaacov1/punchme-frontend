---
target: /dashboard/team (Phase 7 step A)
total_score: 22
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 1
target_identity: "file:C:\\Users\\roeey\\Projects\\punchme-frontend\\src\\routes\\dashboard\\TeamPage.tsx"
target_fingerprint: "sha256:0145cbbe7a5ee7e71fd07fa6254c348d703a3a0985d135cce47cdfae3c741bb6"
target_path: "C:\\Users\\roeey\\Projects\\punchme-frontend\\src\\routes\\dashboard\\TeamPage.tsx"
timestamp: 2026-10-25T09-51-48Z
slug: src-routes-dashboard-teampage-tsx
---
Method: dual-agent (A: design review · B: detector and overlay), run one after the other because browser agents share one session.

## Design health: Team (`/dashboard/team`), 22/40, Acceptable

| # | Heuristic | Score | Key issue |
|---|---|---|---|
| 1 | Visibility of system status | 2 | Making a link changes nothing in view at 375; the row lands 600px below; the copy fails silently; role change, cancel and remove announce nothing |
| 2 | Match with the real world | 2 | "פג ב-" (expired on) on a live link; the browser's US date order; people as emails; "בלי מיילים" over an email field; "השלט", "הכרטיס" off the glossary |
| 3 | User control and freedom | 3 | Remove has an inline confirm; a role tap is reversible; cancel is instant but a new link replaces it |
| 4 | Consistency and standards | 2 | The violet scope inside Lightbox; the destructive "להסיר" in the primary fill; one trash icon for two different actions |
| 5 | Error prevention | 2 | "dana@" taken as an address; no feedback invites a second open link; a mis-tap demotes a manager instantly |
| 6 | Recognition rather than recall | 2 | The link never shown; the role sentence only in the form |
| 7 | Flexibility and efficiency | 2 | Copy only, no share menu; an expired link can't be renewed |
| 8 | Aesthetic and minimalist design | 3 | Calm, but member rows are 114px stacks led by a violet pill at 375 |
| 9 | Error recovery | 1 | One notice at the top for every failure, often off-screen, in the API's English; it outlives the next success; a failed read draws an empty team |
| 10 | Help and documentation | 3 | Good sentences on roles, the address and "once, two weeks"; silent on what the hire will be asked to do |

## Specificity
The copy is authored (links sent "however you already talk to them", roles as what they open, the honest cost of a blank address). The composition is a stock SaaS invite form, member list and pending list, on the old violet system.

Detector: CLI 0 findings; advisory `design-system-font-size` at `primitives.tsx:265` (the old `Tag`, 11px Plex Mono, on the owner and invitation tags) is real. Overlay: 4 (Free) and 3 (Pro) `nested-cards`, all on the old `SegmentedControl` track: false positives.

## Priority issues
1. [P1] The invite link is never shown, and getting it depends on a silent clipboard write after the request (`TeamPage.tsx:82-87`, `:113-124`; the comment at `:119-121` claims the link is on screen). Focus falls to `<body>`. Fix: the link, made, in place of the form: the link in full, Share (navigator.share) and Copy, who can use it and until when, what the hire will do; focus moved there and announced.
2. [P2] Failures silent or far from the action: one warn notice at the top (`:138`, no `role="alert"`), the API's English detail (`:74`), errors that outlive a success (`:93`), no `isError` branch, so a failed read draws an empty team and hides an open link (`:55-59`, `:201-222`). Fix: errors under the control, `role="alert"`, cleared on success; a failed read says so with "נסו שוב".
3. [P2] Hebrew calls every open invitation expired ("פג ב-"), dates follow the browser (`:245`), and `dir="ltr"` on whole paragraphs pushes Hebrew and emails to the left edge (`:238`, `:306`). Fix: "בתוקף עד", `listDay` in the page's language, `<bdi dir="ltr">` around the email only.

## Persona red flags
- Dana (Pro café owner, first hire between customers): "יצירת קישור הזמנה" 159×40; nothing changes in view; no Share; she presses again and mints a second open link; the row says "פג ב-11/8/2026"; a mis-tap demotes her manager silently.
- Sam (screen reader, keyboard): focus to `<body>` after five actions; nothing announced; the address's consequence sentence not wired with `aria-describedby`; every cancel button named the same; tags in Plex Mono.
- A hire who typed the URL: the shell's role panel, good, with no call behind it.

## Minor
- Targets under 44px: 159×40, 134×42, 66×40, 64×42.
- The cap message doesn't say which cap (25 people or 20 open invitations); re-inviting an address silently cancels its earlier link; `joined_at` fetched and never shown.

## Questions
- What if making a link ended on the link itself, with the share menu and the message already written?
- Does the email field belong in the first view, or behind "only for one address"?
