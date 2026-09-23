# Dashboard redesign — progress

The single source of progress truth. Tick boxes (and add dates) as items complete.
Plan: `~/.claude/plans/i-want-to-replace-partitioned-gosling.md` · prompts: `prompts.md` ·
system brief: `system-brief.md` · copy deck: `copy-deck.md`.

## Stage 0 — Prep (Claude)
- [x] `docs/figma/product-brief.md` — designer-facing product facts, **zero design direction** (Roee's call, 24 Aug: the designer owns all visual decisions; `system-brief.md` is now internal implementation reference only) *(24 Aug 2026)*
- [x] `docs/figma/prompts.md` — the full pack reworked as **functional briefs** (0–17 + passes A/B/C) *(24 Aug 2026)*
- [x] `docs/figma/PROGRESS.md` — this checklist *(24 Aug 2026)*
- [x] `docs/figma/copy-deck.md` — real EN+HE strings, grouped per page (612 keys, 0 missing Hebrew) *(24 Aug 2026)*
- [x] `docs/figma/locked-objects/` — card-studio Apple + Google, standee sheet, overview QR/wallet, all HE *(24 Aug 2026)*
- [x] Template verified in Figma Community: Untitled UI free kit v2.0, CC BY 4.0 — links in `system-brief.md` *(24 Aug 2026)*
- [x] `docs/figma/designer-guide.html` — the designer's guide (Hebrew), published as an artifact: <https://claude.ai/code/artifact/43ec7777-42f6-45fa-9ab7-6dc7450194fb> *(24 Aug 2026)*
- [x] Committed — `docs/dashboard-redesign-kit`, fast-forwarded into main *(23 Sep 2026)*
- [ ] Guide link + kit zip (product-brief, copy-deck, locked-objects) handed to the designer; his Figma Make seat confirmed

## Stage 1 — Seed file (the designer in Figma Make; Roee signs off; Claude reviews via screenshots/prototype)
- [ ] Template duplicated; licence noted; 2–4 archetype frames curated and attached
- [ ] Prompt 0 run — `tokens.css` exists with light + night sets
- [ ] Prompt 1 — shell converged (desktop HE, staff variant, mobile + More sheet, EN mirror, dark)
- [ ] Prompt 2 — Overview converged (acceptance checklist passed)
- [ ] Prompt 3 — Customers converged
- [ ] **Seed sign-off (Roee)** — visual language locked; no structural prompts after this point

## Stage 2 — Group files (duplicated from the converged seed)
- [ ] Five duplicates created: Core · Customers · Messaging · Periphery · Admin
- [ ] Prompt 4 — Messages hub converged
- [ ] Prompt 5 — Broadcast composer converged
- [ ] Prompt 6 — Automation editor converged
- [ ] Prompt 15 — Delivery log converged
- [ ] Prompt 7 — Activity converged (**canary check: zero new components needed**)
- [ ] Prompt 8 — Scan converged
- [ ] Prompt 9 — Card Studio converged
- [ ] Prompt 10 — Standee converged
- [ ] Prompt 11 — Team converged
- [ ] Prompt 12 — Billing + success/cancel converged
- [ ] Prompt 16 — Settings converged
- [ ] Prompt 13 — Tour converged
- [ ] Prompt 14 — Customer detail converged
- [ ] Prompt 17 — Admin converged
- [ ] Pass A (RTL audit) run in all five group files
- [ ] Pass B (dark audit) run in all five
- [ ] Pass C (states audit) run in all five
- [ ] Cross-group screenshot grid reviewed; drift resolved in favour of the seed

## Stage 3 — Designs back out
- [ ] Make code downloaded per group into `design-reference/` (gitignored)
- [ ] Published prototype links collected here:
  - seed: · core: · customers: · messaging: · periphery: · admin:
- [ ] Screenshot record (page × he/en × light/night × mobile/desktop) in `docs/design/`

## Stage 4 — Implementation (one branch per phase; a phase ticks only after the full gate:
build + lint + test · HE + EN · 375px + desktop · console clean · keyboard + reduced motion · merged)
- [ ] Phase 0 — `dashboard-foundation` (tokens, primitives, shell, redirect table, **CLAUDE.md rewrite #1**)
- [ ] Phase 1 — `dashboard-core` (Overview, Activity, RTL chart primitives)
- [ ] Phase 2 — `dashboard-customers` (+ customer detail)
- [ ] Phase 3 — `dashboard-messaging` (+ delivery log — `listDeliveries` wrapper already exists unused)
- [ ] Phase 4 — `dashboard-scan`
- [ ] Phase 5 — `dashboard-studio-standee` (print re-verified on PDF)
- [ ] Phase 6 — `dashboard-settings` (Team, Billing, success/cancel, + Settings page)
- [ ] Phase 7 — `dashboard-admin` (unblocked by the onboarding-looks branch merging)
- [ ] Phase 8 — `dashboard-polish` (tour, veils, dead code, i18n sweep, **CLAUDE.md update #2**)
