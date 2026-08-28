# Content Growth Progress

## Task

依次处理内容增长问题，优先使用素材库的内容；全部可推进项完成后汇总缺失素材。

## Scope

The first bounded growth increment closes the two missing main-route guide pages: Forest (location 2) and Desert (location 3). Existing pending Guide 2 and Guide 3 videos are analyzed first; only catalog-confirmed publishable derivatives may enter the site. Research-only frames may support facts but may not be published.

## Loop Goal

Publish evidence-based Forest and Desert deep guides with rights-safe visuals where available, complete five-location navigation and internal links, update the fixed-asset manifests, pass local content/build gates, pass independent production E2E and review, and deliver one consolidated missing-material list for any unsupported sections.

## Budgets

| iterations | repair cycles | elapsed | external cost |
|---|---|---|---|
| 4/10 | 1/6 | 0/240m | 0 |

## Phase Status

| Order | Phase | Skill | Role | Gate | Status | Evidence |
|---:|---|---|---|---|---|---|
| 1 | inventory | rankup | maker | Git/routes/live sitemap and asset catalog reconciled | ✅ | 16 routes; Forest and Desert are the missing location guides; Guide 2/3 videos are pending |
| 2 | analyze-media | asset archive workflow | maker | both videos timestamped; entities, rights and keyframes cataloged | ✅ | Guide 2: 9 evidence frames + notes, SHA-256 37ff2640…; Guide 3: 13 evidence frames + notes, SHA-256 0d347125…; all direct frames research-only |
| 3 | design | rankup SEO/content | maker | page/evidence matrix and publishable asset set approved by evidence | ✅ | Forest uses one existing catalog image plus three original diagrams; Desert uses one existing route image plus three original diagrams; all six diagrams have explicit lineage and route usage |
| 4 | implement | project React/SSG | maker | both routes, metadata, sitemap and internal links exist | ✅ | 18-route SSG build; Forest and Desert metadata, schema, sitemap and five-location links complete |
| 5 | local-verify | project tests | checker | unit, TypeScript, build, prerender, static assertions and asset validation pass | ✅ | `pnpm test`, `pnpm test:asset-library`, `git diff --check`, real asset-library verify (398 records, 0 failures), independent review and 1280/390 browser QA passed |
| 6 | deploy-1 | Git/Vercel | landing owner | scoped commit is on origin/main and production updates | ✅ | Commit `9c8b4fa` pushed to `origin/main`; both production routes return 200 with commit-unique SSR content |
| 7 | e2e-1 | production HTTP/browser | checker | both routes pass desktop/mobile content, media, metadata and link checks | ✅ | 1440×900 and 390×844 passed; no document overflow, broken images or console errors; mobile menu works |
| 8 | review | independent review | checker | no blocking accuracy, copyright, accessibility or low-value findings | ✅ | Independent checker reported no remaining P0–P2 before deployment |
| 9 | repair-and-reverify | maker + checker | split | review repairs pass affected gates, or N/A with no diff | ✅ | One repair cycle; evidence wording, asset lineage and enforcement tests rechecked successfully |
| 10 | finalize | rankup | landing owner | records updated, remote ancestry proven, missing-material list consolidated | ✅ | Production sitemap has exactly 18 URLs; final material gaps deduplicated below |

## Constraints

- Preserve the existing root `progress.md`; it belongs to earlier work and is not staged or deleted.
- Do not publish Game8 assets, uncertain social-media frames, watermarks, account identifiers, creator subtitles, or unsupported numbers.
- Raw videos remain at their original paths. Archive keyframes, analysis, lineage, rights status and page usage only.
- Unknown names, values, prices, damage and mechanics remain null/unverified.
- One implementation writer and one landing owner; independent checkers remain read-only.

## Acceptance Ledger

| Target | Required result | Proof |
|---|---|---|
| Forest | Standalone second-location route with NPC requests, lure/catch preparation, bosses, hand-in, recovery and Desert transition | static HTML + production E2E |
| Desert | Standalone third-location route with NPC requests, lure/catch preparation, bosses, hand-in, recovery and Rocks transition | static HTML + production E2E |
| Media | Every published image is catalog-confirmed publishable and has traceable lineage | asset manifest + file checks |
| Growth topology | Homepage/Locations/adjacent guides link through all five locations; sitemap and canonical routes agree | static assertions + production sitemap |
| Missing assets | One final deduplicated list, only after all evidence-supported work is complete | final audit |

## Failure Log

| Iteration | Failure Signature | Type | What Changed Next | Repeat |
|---:|---|---|---|---:|
| 2 | Six new SVGs were publishable but lacked per-file lineage/page usage; Leech count and phase threshold overstated evidence | evidence / asset governance | Add explicit manifest lineage and tests; downgrade Leech count to version lead; replace numeric phase threshold with later-phase wording | 1 |

## Delivery Ledger

| Commit | Files | Remote ancestry |
|---|---|---|
| `9c8b4fa` | 45 scoped content, media-evidence, SSG and test files | `origin/main` contains commit; production served its unique Forest/Desert copy |

## Iterations

- Iteration 0: reconciled repository routes, live sitemap and asset catalog; selected Forest and Desert as the first bounded increment.
- Iteration 1: analyzed Guide 2 and Guide 3 videos, extracted research-only evidence frames/contact sheets, documented timestamped claims and explicit non-claims, and rejected all direct frames for publication because they retain third-party platform UI, attribution or creator captions.
- Iteration 2: implemented the two missing route pages, then failed independent evidence review on diagram lineage and over-precise Leech/phase wording.
- Iteration 3: repaired asset lineage and enforcement tests, downgraded the Leech counter to a version-specific lead, removed unverified health thresholds, rebuilt the real fixed-asset catalog, and passed all local, independent and responsive-browser gates.
- Iteration 4: pushed `9c8b4fa`, confirmed the Vercel production rollout, and passed independent production E2E for initial HTML, metadata, schema, links, assets, responsive layout, console health, menu behavior and the 18-URL sitemap.

## Consolidated Missing Materials

- Forest current-build, owner-owned clean captures: the active Leech counter, accepted reward/special bait label, Giant Piranha later phase, Skeleton pickup and hand-in, and visible Desert destination marker.
- Desert current-build, owner-owned clean captures: Tourist request and accepted bait reward, Pufferfish Fin pickup and hand-in, and visible Rocks destination marker.
- Current shop evidence for both locations: rod, weapon, attachment, ammunition, lure and Dynamite labels, prices and any displayed stats.
- Desert ordinary-creature encyclopedia screens and the complete grill-unlock interaction.
- A dedicated rights-cleared Desert gameplay hero; the page currently uses the generic five-location route image.
