# Audit

## 2026-08-31 — P0 七页收敛整改

- 已修复：Handyman 从 325 词单图薄页升级为 1200+ 静态词深度路线，明确官方条件与保守打法边界，覆盖 Volcano 前置、裸手准备、岩石站位、出拳窗口、失败恢复、联机归属风险和完成确认；使用三张现有 Volcano 实机素材、官方成就图和两张原创 SVG 图解。
- 已合并：Weapon Skins → Reel of Fortune；Spider Summon → Spider Crab；Killscore → Beginner；All Bosses 与 Five-Boss → Bosses。权威页吸收可用内容，旧 URL 使用 Vercel 永久重定向，不再保留 200 薄副本。
- 已隔离：Casino 保留 20 页预渲染清单中的直达页面，但改为当前补丁待复现说明，首轮 HTML 输出 `noindex,follow`，并退出 sitemap 与首页公开入口。
- 索引面：sitemap 从 25 收敛到 19 URL；静态构建仍生成 20 页。自动断言覆盖 robots、sitemap 数量、重定向配置、首页无隔离/合并页入口、Handyman 深度与媒体数。
- 视觉修复：浏览器 QA 发现原创 SVG 的长标签越界并在移动端过度缩小；标签已拆行，390px 下图解使用自身 720px 横向滚动区，页面根节点保持无横向溢出。
- 本地证据：Vitest 4/4、TypeScript、Vite build、20 路由预渲染、静态断言与 `git diff --check` 通过；桌面 1440×900 与移动 390×844 浏览器检查无页面级横向溢出，全部四张位图加载成功。

## 2026-08-31 — 七篇视频攻略逐页裁决

- 结论：不能把七页统一视为“扩到固定词数”问题。逐页比对视频证据、线上正文、现有权威页和当前搜索结果后，建议保留并重写 Handyman；将 Weapon Skins、Summon Spider Crab、Killscore、All Bosses 和 Five-Boss Challenge 合并到既有权威页；Casino 在当前补丁复现前隔离索引。
- 关键事实：All Bosses 标题没有覆盖 Boss board 的全部特殊遭遇；Five-Boss 原视频依赖 mod，删除该部分后没有独立内容增量；Killscore 页面把 1.05–1.50 连杀表与用户会搜索的 5x Impressive 成就混在同一词形；Casino 使用 Reel 图片且没有交付可复现路线。
- 正向机会：Handyman 有独立成就意图、1:29 实战证据、现成 Volcano 图与官方成就图标，具备直接升级为深度页的条件。
- 机械验证：新增 `.rankup/scripts/analyze-content-overlap.mjs`；线上正文三词组比较确认 Weapon Skins 最接近 Reel，All Bosses 最接近 Five-Boss/Locations。该分数只作重复线索，最终裁决以搜索任务和事实覆盖为准。
- 完整逐页报告：`.rankup/topics/p0-video-guide-analysis-2026-08-31.md`。

## 2026-08-31 — 25-page production and GSC audit

- Passed: all 25 sitemap URLs return 200, contain static first-response content, one H1, self-referencing canonical, index/follow robots and JSON-LD. Titles are unique and at most 60 characters. Unknown URLs return a real 404; HTTP and `www` permanently redirect to the HTTPS apex.
- Passed: 75 unique public images were checked with HEAD requests; no broken image, missing alt, or missing width/height was found. All 40 unique internal route/asset href targets return 200. `robots.txt`, sitemap and the authorized `ads.txt` seller line return 200.
- P0 content: the seven new video-derived pages contain only about 233–498 main-content words. Six begin their step list with H3 before any H2. Each has only one image, and several reuse the same route or Reel art. Follow-up analysis now recommends consolidation rather than expanding all seven independently; see the dedicated 2026-08-31 verdict above.
- P0 search discovery: GSC has 174 impressions and 1 click for the available Aug 26–28 window, average position 12.6. Only Lighthouse, homepage, Beginner, Locations and About appear in the page table. The coverage report is still processing; the successful sitemap reports 18 discovered pages while production contains 25.
- P1 social: the homepage has `twitter:card=summary_large_image` but no `og:image` or `twitter:image`. About, Contact, Privacy and Terms also have no social image; the homepage is the commercially relevant fix.
- P1 metadata: Beginner (163), Lighthouse (168), and Volcano (170) descriptions exceed the 160-character target; Bosses is 104 characters and below the 110-character target.
- P1 intent: `/guides/unlock-weapon-skins-fast` overlaps `/guides/reel-of-fortune`, and `/guides/summon-spider-crab` overlaps `/bosses/spider-crab`. Keep separate only if GSC shows distinct query intent; otherwise consolidate or redirect to avoid splitting signals.
- P2 headers: Vercel currently serves HSTS but not an observed CSP, X-Content-Type-Options, Referrer-Policy or Permissions-Policy. Add only after testing future AdSense/CMP compatibility.
- External on-page audit: homepage scored 93/A. Representative new guides scored 65/C, 65/C and 45/D, mainly from thin copy, heading hierarchy and keyword/task alignment. The homepage tool's “pure redirect landing page” warning is a false positive for a content hub and is not treated as a defect.
- Performance: the anonymous PageSpeed Insights mobile request timed out, so this audit does not claim a current Lighthouse/Core Web Vitals result.
- Verification: `pnpm test` passed; 25 route files were prerendered and the static gate passed. Reusable live audit script saved at `.rankup/scripts/audit-production.mjs`.

## 2026-08-28 — Remove visible claim-source panels

- Removed every visible `Claim sources`, `Sources / Verify`, route-source, and evidence-boundary panel from the 16 public routes, including Lighthouse, Lures, Spider Crab, Achievements, Locations, Rocks, Volcano, and Reel of Fortune.
- Preserved the actual guide instructions, related-guide navigation, structured data, canonical metadata, and internal editorial verification discipline.
- Updated the Achievements description so it no longer promises linked sources; the page still states the date of its Steam completion-rate snapshot.
- Added a route-wide build gate that fails if any claim-source panel or prior evidence heading returns.
- Verification: Vitest, TypeScript, Vite build, all 16 static prerenders, and the no-source-panel regression scan pass.

## 2026-08-28 — Illustrated achievement encyclopedia

- Fixed `/achievements`: all 28 entries now use independently mapped official icons plus official Steam names, conditions, and an Aug 28, 2026 global-rate snapshot.
- Added practical discovery: name/condition search, seven category filters, route location, difficulty, completion progress, clear action, and browser-local persistence guarded against overwriting restored state.
- Preserved evidence boundaries: the supplied gallery informed icon mapping and interaction design; conflicting route text and stale figures were not copied, and Steam remained the primary condition/rate source.
- Added crawlable output: all cards, 28 icons, global-rate labels, and a 28-item ItemList are present in prerendered HTML rather than depending on client execution.
- Asset governance: source assets remain preserved; 28 optimized WebP derivatives are linked to their source files in the fixed-asset manifest with page usage and publishability notes.
- Verification: Vitest, TypeScript, Vite build, 16-route prerender, achievement-specific static gates, and asset-library checksum verification pass.

## 2026-08-28 — AdSense low-value remediation follow-up

- Fixed `/achievements`: replaced the 28-name list with all 28 official Steam conditions, practical attempt routes, cleanup categories, and current-build cautions for disputed or patched advice.
- Fixed `/lures`: published the four regular lure pools with confirmed target lists, route locations, all 11 special summons, story-item dependencies, owner-provided visual evidence, and cited verification sources.
- Fixed `/bosses`: every special encounter now includes a fight plan, reward or progression result, and recovery step; the page is no longer a one-line entity board.
- Fixed media quality: removed the unrelated creature-gallery overview image, replaced the unclear Spider Crab frame, recropped the keeper/Empty Beer Can exchange, and corrected Lighthouse captions so they describe visible evidence.
- Fixed performance: converted all nine Beginner Guide cards from 17.34 MB of PNGs to 920 KB of WebP assets, added dimensions and decoding hints, and lazy-loads eight off-screen carousel slides.
- Fixed structured data: Article is now limited to editorial guides; hubs use CollectionPage, the homepage uses WebSite, and trust pages use AboutPage, ContactPage, or WebPage.
- Regression gate: build now enforces content depth for Bosses/Lures/Achievements, all 28 achievement conditions, source links, optimized carousel budget, route-appropriate schema, correct gallery media, and no AdSense runtime before CMP configuration.
- Remaining external conditions: Google must approve the site and a Google-certified CMP must be configured before applicable ad serving. The owner-approved private email channel is now published for sensitive reports.

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
- Superseded by the low-value follow-up above: Bosses, Lures, and Achievements now have route-level guidance and automated depth gates rather than lightweight workflow copy.
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
