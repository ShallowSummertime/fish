# Baseline

- Date: 2026-08-27
- Site status: local implementation only; no production traffic, indexing, conversion, or revenue data exists.
- Technical baseline: `pnpm typecheck`, `pnpm test`, and `pnpm build` are the local gates.

## 2026-08-31 production and search baseline

- Production sitemap: 25 static URLs; all return 200 with one H1, self-referencing canonical, index/follow robots and JSON-LD. Unknown URL returns 404; HTTP and `www` permanently redirect to the HTTPS apex.
- Media: all public image URLs return 200; no sitemap page has a missing image alt or width/height declaration.
- Search Console performance currently covers 2026-08-26 through 2026-08-28: 174 impressions, 1 click, 0.6% CTR and average position 12.6.
- GSC page rows: Lighthouse 1 click/19 impressions; homepage 0/110; Beginner Guide 0/42; Locations 0/3; About 0/1. Other pages have no reported impressions in the available window.
- GSC sitemap status is successful and last read 2026-08-31, but currently reports 18 discovered pages rather than the live 25. The page-indexing report is still processing and gives no indexed/excluded totals yet.
- Public Google `site:` searches find the homepage; they are not a reliable index count and do not replace the pending GSC coverage report.
- PageSpeed Insights mobile API did not return during the audit window, so no current lab performance score is recorded.

## 2026-09-01 GSC indexing baseline

- The production sitemap contains 19 intended index URLs. Search Console read it successfully on 2026-09-01 and reports all 19 URLs discovered.
- URL Inspection reports 9 indexed URLs: `/`, `/beginner-guide`, `/bosses`, `/locations`, `/locations/lighthouse`, `/locations/forest`, `/contact`, `/privacy`, and `/terms`.
- URL Inspection reports 10 non-indexed URLs: `/achievements`, `/bosses/spider-crab`, `/creatures`, `/lures`, `/locations/rocks`, `/locations/desert`, `/locations/volcano`, `/guides/reel-of-fortune`, `/guides/mutated-whale-handyman`, and `/about`.
- Nine of the ten non-indexed URLs are `Discovered - currently not indexed`. `/locations/volcano` is currently `URL is unknown to Google` even though it is present in the successfully read sitemap.
- The aggregate Page indexing report is older (last updated 2026-08-28): it shows 9 indexed and 6 excluded known URLs. Its single redirect example is the expected `https://www.howtofishwalkthrough.com/` redirect and is not an indexing defect. Its Rocks classification is stale relative to URL Inspection.
- A fresh production crawl found no HTTP, canonical, robots, H1, structured-data, broken-image, or sitemap blocker across the 19 URLs. The current non-indexing pattern is primarily crawl prioritization on a new site; `/about` is also only 175 visible words and `/lures` is the lightest game-content hub at 686 words.
