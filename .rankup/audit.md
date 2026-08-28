# Audit

## 2026-08-28 — Static indexing and homepage depth gate

- Verified architecture: all 16 indexable routes are rendered with `renderToString` during the production build and written as route-specific HTML before deployment; the site is SSG/static prerendered rather than a CSR-only shell.
- Verified local output: the homepage H1 begins at byte 5,884, the initial HTML contains 1,622 visible words, and visible FAQ content matches the emitted FAQPage JSON-LD.
- Fixed: compressed every final rendered Title to 60 characters or fewer; the build now checks all 16 routes rather than a small route subset.
- Fixed: expanded the homepage with a route manual, first-hour priorities, late-game dependency guidance, and seven intent-specific FAQs.
- Regression gate: production build fails if a route has an empty root, a Title over 60 characters, or the homepage drops below 1,200 visible words / loses its static H1, route manual, FAQ, or FAQ schema.
- External follow-up: publish and verify the same properties on production, then refresh GSC sitemap and URL inspection. BacklinkDirs is not eligible without a permanent third-party Submit Link and reciprocal-link authorization; no eligibility facts may be invented.

## 2026-08-28 — AdSense pre-application remediation

- AdSense account evidence: `howtofishwalkthrough.com` is present in Sites with status `Needs review`; ownership flow selected `ads.txt`; dashboard reported `Not found` before this release.
- Fixed: added the exact authorized seller record for publisher `pub-5329936944958399` at `/ads.txt`.
- Fixed: added substantive About, Contact, Privacy, and Terms/Disclaimer routes and linked them from every footer.
- Fixed: privacy policy now explains browser-local checklist storage, hosting logs, Google AdSense cookies/identifiers, My Ad Center choices, and the need for a Google-certified CMP where consent is required.
- Fixed: expanded the Bosses, Locations, Lures, and Achievements hubs with actionable workflows, evidence boundaries, and internal links instead of leaving list-only pages.
- Fixed: emitted `index,follow,max-image-preview:large` in prerendered and client metadata; preserved real host-level 404 behavior.
- Verified locally: 13 prerendered routes, exact ads.txt content, trust-page footer links, canonical/OG/Twitter/JSON-LD/robots metadata, image assets, and zero broken internal route links; `pnpm test` passed.
- Remaining account action: verify ads.txt after production propagation, configure a Google-certified CMP before serving ads in regions where consent is required, complete payment/account activation, and submit site review.

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
