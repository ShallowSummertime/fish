# Audit

## 2026-08-27 — implementation review

- Resolved: replaced JS-only route metadata with postbuild static HTML for all sitemap routes.
- Resolved: removed fabricated ordinary-creature lure assignments; only special/boss summons are shown as mappings.
- Resolved: hardened persisted checklist parsing and added mobile navigation/checkbox accessibility attributes.
- Resolved: made `/bosses/spider-crab` the canonical Spider Crab route and added build verification for it.
- Resolved: removed the catch-all SPA rewrite so unknown URLs remain real host-level 404 responses.
- Verified: independent browser E2E passed direct Spider Crab navigation, 49-card creature search, persistence, mobile navigation and zero console errors.
- Verified: independent blocking re-review found no remaining P0 issue for declared sitemap routes.
- Remaining: independently verify any future normal creature-to-lure mapping before publishing it as a fact.

## 2026-08-27 — production content-quality audit

- P0: all eight production routes contain zero editorial images; the two primary guides do not provide screenshot-led walkthroughs.
- P0: `/beginner-guide` exposes roughly 164 visible words and `/bosses/spider-crab` roughly 151, which is insufficient to complete the promised first-hour route or boss fight without another source.
- P0: the Spider Crab article includes publisher-facing language about "search intent" instead of combat instructions, recovery windows, failure handling, quest hand-in, and post-fight progression.
- P1: hub cards mostly repeat entity names, summon items, and one-sentence route labels; they do not answer location, preparation, execution, reward, or failure-state questions.
- P1: `/achievements` lists names but provides no unlock conditions, ordering, missable warnings, or completion route.
- P1: the initial implementation gate proved crawlability and data-count consistency, not editorial usefulness. Technical readiness must no longer be treated as content completion.
- Evidence: live HTML audit of all sitemap routes on 2026-08-27; route set matches Git and production sitemap.
