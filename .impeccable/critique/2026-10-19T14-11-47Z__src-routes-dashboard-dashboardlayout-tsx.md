---
target: the dashboard shell
total_score: 22
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 2
target_identity: "file:C:\\Users\\roeey\\Projects\\punchme-frontend\\src\\routes\\dashboard\\DashboardLayout.tsx"
target_fingerprint: "sha256:4bee37b865fe4917b5699475e1e87f07abbc8c6c01b9e3b95ee9e547981a85ca"
target_path: "C:\\Users\\roeey\\Projects\\punchme-frontend\\src\\routes\\dashboard\\DashboardLayout.tsx"
timestamp: 2026-10-19T14-11-47Z
slug: src-routes-dashboard-dashboardlayout-tsx
---
Method: dual-agent (A: design review sub-agent · B: detector and browser-overlay sub-agent)

Target: the dashboard shell (DashboardLayout, DashboardNav with NAV_GROUPS, the phone bar and the More sheet, AccountControls, CardChip, RequireRole, RequireBusiness, useDashboardTheme with the index.html pre-paint script, the tour). Mode: Operate. Walked live on 19 Oct 2026 as the Pro owner, manager and staff of Demo Coffee and the Free owner of Demo Barbershop, Hebrew first at 375px, then 768, 1280 and English.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Active states are clear; every page is titled "PunchMe — Digital Loyalty Cards", in English in Hebrew too; route changes are not announced; boot shows bare "Loading..." lines |
| 2 | Match System / Real World | 2 | "Push"/"פוש" on the bar vs "Customer messages" in the rail; Billing under "Setup"/"הגדרה"; the tour says פרס and ניקוב and tells Free owners and staff about customers they don't have |
| 3 | User Control and Freedom | 2 | Escape, Skip and Back work; an unknown URL leaves the shell for a dead end; the tour can lock the app |
| 4 | Consistency and Standards | 2 | Phone and rail organise pages differently; Scan is the only tab without a visible label; More claims to be modal but traps nothing; the refusal page has no h1; the plan is said twice |
| 5 | Error Prevention | 2 | Role filtering is excellent; signing out hands the next person the last person's page; no catch-all route; a failed business fetch sends a live shop to onboarding |
| 6 | Recognition Rather Than Recall | 3 | Everything is labelled and grouped; six owner pages hide behind More; Billing's place under Setup has to be learned |
| 7 | Flexibility and Efficiency | 2 | Scan is one tap everywhere and Android has a home-screen shortcut; the bar ignores role (staff get an empty slot); no shortcuts |
| 8 | Aesthetic and Minimalist Design | 3 | Calm; the More sheet's loudest element is the theme switch; headings sit over single items |
| 9 | Error Recovery | 1 | The refusal is the only designed error and names neither your role nor who to ask; /dashboard/nope is React Router's English developer page; a failed load presents as onboarding |
| 10 | Help and Documentation | 2 | A replayable tour over the real pages; wrong for Free owners and hires, never covers a full card, no contact path |
| **Total** | | **22/40** | **Acceptable** |

## Design Specificity Verdict

LLM assessment: the structure belongs to this product, the look does not. The groups follow the roles (the Counter group is exactly the staff job), Scan is treated as the counter's one action (first rail row, a raised 74px button in the bar, a manifest shortcut), the masthead chip carries the owner's real card colours, a page above your rank says no in place, and the tour lights the owner's real pages through a real gap in its overlay. The visual language is category-generic and pre-Lightbox: a white sidebar, grey small caps, violet pills for "selected", a violet floating button, "Loading..." in a monospace face. The biggest missed chance is the plan: Lightbox's own picture is that Pro switches the sign on, yet "חינמי" is inert grey text and Pro says "פרו" twice.

Deterministic scan: `impeccable detect` on 8 shell files exited 2 with one warning and one advisory. design-system-font-size at DashboardNav.tsx:251 is true: the tab labels are 11px, under DESIGN.md's smallest step (13px). design-system-font at index.html:26 is a false positive: Roboto is loaded for the Google Wallet preview, as index.html, DESIGN.md and CLAUDE.md say. The other six files are clean.

Visual overlays: injected on /dashboard at 375 and 1280, with the More sheet open, and on a staff refusal (/dashboard/design). The shell produced no findings. The one hit, nested-cards, is the Overview's 300px pass slot (CardPreviews.tsx:440 inside DashboardOverview.tsx:382): a false positive, and Phase 5's page. The overlay tab was closed afterwards.

## Priority Issues

**[P0] The tour can lock the app on a phone.** On the first stop the card is placed, then the step effect resets its position (DashboardTour.tsx:173-181) and nothing places it again unless the target is found. Staff on a Free business never get the target (the hire panel has no `overview-lead`, DashboardOverview.tsx:296-303), nor does an Overview whose template fails or takes over 5 s. A hidden card then sits under a full-screen overlay that takes every tap; only Escape or a rotation frees it, and a reload reopens it because it marks itself seen only on close. Fix: centre the card when no target turns up, draw the full overlay only around a found target, test "target never found, card visible". Command: /impeccable harden.

**[P1] The shell has no error states.** /dashboard/nope renders React Router's English developer page outside the shell (no catch-all or errorElement under /dashboard, main.tsx:134-175). A failed /api/businesses/me (500, offline) reads as "no business" and redirects a live shop to /onboarding (RequireBusiness.tsx:17-19, BusinessProvider.tsx:28-41). Fix: a "no page here" and a "didn't load" panel inside the shell; onboarding only on a 404, a retry panel otherwise. Command: /impeccable harden.

**[P1] The tour's copy overclaims.** "no app, no signup" (tour.steps.join.body, both languages); Free owners and hires get the Pro owner's script ("Is it working?", "Everyone who has joined", "ready for the first customer"); on ?activated=1 it covers "You're live!". Hebrew uses פרס and ניקוב, not הטבה and חותמת, and "לכל אחד" instead of the slash form. Fix: copy per plan and role, "no app, no account, no password", hold the tour back after activation. Commands: /impeccable clarify, then /impeccable onboard.

**[P2] The phone bar splits the counter.** Staff get an empty, aria-hidden slot (DashboardNav.tsx:305-310, 329) while Activity, a staff page, is the only page in their More; "Push" is jargon beside the rail's "Customer messages". Fix: a bar built per role, Scan centred and carrying its word. Command: /impeccable layout.

**[P2] Nothing says who is signed in, and the hand-off breaks.** Signing out leaves the login page's `from`, so the next person lands on the last person's page (staff landed on the Billing refusal). The plan line is inert on Free and doubled on Pro, the duplicate set in Plex Mono, which has no Hebrew. Fix: the account menu names the person and their role; sign out navigates to /login with no state (src/auth untouched); the owner's Free line is the door to activation. Commands: /impeccable clarify, /impeccable polish.

## Persona Red Flags

**Noa (staff at the counter, first week, one hand):** her first screen on a shared phone can be the owner's Billing refusal; her tour asks the owner's question and promises "the first customer" in a café with 300; it never covers a full card; Activity sits behind More next to an empty slot; Scan has no visible label; on a Free business the tour locks the phone; tab labels are 11px.

**Avi (Free barber deciding whether to activate):** "חינמי" is inert; the tour promises customers, a wallet card after one scan and "no signup", none true on Free; it ends "Tap it — the camera opens", and Scan then says there is nobody to scan; the Activate stop doesn't state ₪99.

**Sam (screen reader, keyboard):** More is aria-modal with no focus trap (Tab walks from sign-out to the page behind); More has aria-haspopup but no aria-expanded; the title never changes and is English; the refusal page has no h1; loading lines have no role="status" and are set in Plex Mono; the language row has no lang; under reduced motion the sheet and the tour card lose their entrance instead of a 150 ms fade.

**Alex (power user):** no keyboard shortcut for Scan; the rail is taller than an 860 px screen, sign-out below the fold; Billing is two taps on a phone; the tour's Next and Back are 40 and 42 px.

## Minor Observations

- The rail's logo links to the marketing landing page.
- More lights up on a refused page it doesn't contain (isMorePath ignores role).
- "הגדרה" reads as "a definition"; Billing isn't setup.
- The refusal says "the poster" in English and "בשבילך" (singular) in Hebrew; its back link is 42 px.
- Group headings are uppercase and tracked in Hebrew.
- The chip falls back to navy #0f0f23 while the templates load.
- The tour remembers a device, not a person, so a hire on the owner's phone never gets it.
- Nothing resets scroll between dashboard pages (no ScrollRestoration).
- Every cold boot logs two 401s from the refresh flow (src/auth, frozen) and the stub wallet's logo host fails to resolve.

## Questions to Consider

- Should the bar be shaped by role rather than kept symmetric with a hole?
- Should the plan line be the door to Billing: a sign the owner switches on?
- Should Scan carry its word, and should a hire's walk end on a full card rather than a first customer?
