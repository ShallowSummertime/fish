# Release record

## 0.6.0 — 2026-08-28

- 目标：AdSense 低价值内容、图文证据、媒体性能与结构化数据整改。
- 变更：重写 Achievements/Lures/Bosses；优化九张 Beginner 轮播图；替换错误或不清晰的 Creature/Lighthouse 图证；Schema 改为按路由类型输出；新增 CMP 前禁投广告和内容质量阻断门禁。
- 本地验证：Vitest、TypeScript、Vite build、16 路由预渲染及静态质量断言通过。
- Commit：`03e1155`，已推送 `main` 并由 Vercel 发布到主域。
- 生产验证：16 个 sitemap 路由均为 200，47 个抽样内链/资产无错误，未知路径为 404；Bosses/Lures/Achievements 分别为 1305/862/1445 可见词并输出 CollectionPage；Beginner 仅引用 WebP、八张非首图均延迟加载；ads.txt 仍为授权原文。
- 结论：production-verified；CMP 与私人联系渠道仍属于账户/所有者侧后续条件。

## 0.1.0 — 2026-08-27

- 环境：GitHub source release; no production website deployment.
- 变更：Initial responsive guide site with eight prerendered routes and the verified entity baseline.
- 部署目标：`ShallowSummertime/fish` source repository.
- 数据迁移：无。
- 验证：`pnpm typecheck`, `pnpm test`, `pnpm build`, static-route assertion, independent browser E2E and independent blocking review passed.
- 生产站点：未部署；Cloudflare/hosting/GSC 状态待确认。
- 结论：source-verified; production-unverified.

## 0.1.1 — 2026-08-27

- 环境：Vercel Production，GitHub 项目 `ShallowSummertime/fish` 自动部署。
- 域名：`https://howtofishwalkthrough.com` 为主域；`www` 使用 308 永久跳转到主域。
- DNS：Namecheap 停放记录已替换为 Vercel 要求的 apex A 与 `www` CNAME。
- 验证：主域 HTTPS、八个预渲染路由、逐页 Title/canonical/H1、robots、sitemap 和真实 404 均通过生产环境检查。
- 结论：production-verified。

## 0.2.0 — 2026-08-28

- 目标：AdSense 申请前整改与 GSC 可索引性升级。
- 变更：新增 `/ads.txt`、About、Contact、Privacy、Terms；补强 Bosses、Locations、Lures、Achievements hubs；13 个路由统一静态输出 `max-image-preview:large`。
- 验证：`pnpm test` 通过，静态路由/信任链接/隐私披露/ads.txt/404 契约均有断言。
- 账户状态：AdSense 站点已添加但仍待 ads.txt 线上验证和人工审核；无广告代码上线。

## 0.3.0 — 2026-08-28

- 环境：Vercel Production，主域 `https://howtofishwalkthrough.com`。
- 变更：新增 `/locations/rocks` 第四座岛深度攻略，覆盖 10 种常规生物、Tuna 战斗、Albatross 召唤与打法、Volcano 解锁路线，以及武器和鱼饵准备。
- 素材：使用 3 张用户自有百科图片；Game8 图片仅用于资料核对，未发布到网站。
- 站内链接：首页、Locations、Bosses 与相关攻略已接入 Rocks 页面；sitemap 已包含新 URL。
- 资产归档：固定资产库共 231 项，已归档 224 项，待处理 7 项，失败 0 项。
- 验证：`pnpm test`、TypeScript、Vite build、15 路由预渲染、静态断言、桌面与 390px 移动端浏览器检查均通过；生产 URL 返回 200。
- Commit：`dfd4e80`。
- 结论：production-verified。

## 0.4.0 — 2026-08-28

- 环境：Vercel Production，主域 `https://howtofishwalkthrough.com`。
- 变更：补强 `/locations/rocks` 的 1.50× 烹饪、逃脱计时条、Albatross 掩体节奏和 Head/Meat 区分；新增 `/locations/volcano` 第五岛深度攻略，覆盖 Scientist 五鱼任务、Scientific 生物、Fish Bucket、Bowhead 整体搬运、Mutated Bowhead 岩浆战、Whale Fin 与 RHIB 结局。
- 素材：4 张贴近游戏截图的干净重建图已发布；带社交播放器、中文字幕和 Patch 1.0.5 HUD 的原帧仅研究。原视频 source-only，13 张关键帧、联系表、分析笔记和 14 个实体已进入固定资产库。
- 资产归档：固定资产库共 260 项，已归档 252 项，待处理 8 项，校验失败 0 项。
- 站内链接：首页、Locations、Bosses、Rocks 与 Related guides 均接入 Volcano；sitemap 扩展到 16 个可抓取静态路由。
- 验证：`pnpm test`、TypeScript、Vite build、16 路由静态断言、桌面与 390px 移动端浏览器检查通过；生产 Rocks/Volcano、4 张 WebP 与 sitemap 均返回 200，Volcano canonical/H1/图片加载/无横向溢出复验通过。
- Commit：`b5a6860`。
- 结论：production-verified。

## 0.5.0 — 2026-08-28

- 环境：Vercel Production，主域 `https://howtofishwalkthrough.com`。
- 变更：强化现有静态预渲染为收录门禁；16 个路由的正文、H1 与元数据均进入首轮 HTML；全站 Title 压缩到 60 字符以内；首页扩写到 1622 个可见英文词并加入与正文一致的 FAQPage 结构化数据。
- 质量门禁：构建阶段自动检查非空静态根节点、首页正文不少于 1200 词、FAQ 可见、FAQ schema 存在，以及每条路由的最终 Title 长度。
- 验证：`pnpm test`、TypeScript、Vite build、16 路由预渲染和静态断言通过；生产首页首轮 HTML 含 H1、1622 词与 FAQ schema，生产 sitemap 的 16 个 URL 均返回不超过 60 字符的 Title。
- Commit：`40707ff`。
- 结论：production-verified；GSC sitemap 当前成功读取但仍显示 13 个已发现页面，等待重新提交以刷新 16 URL 状态。
## 0.6.0 — 2026-08-28

- 环境：Vercel Production，主域 `https://howtofishwalkthrough.com`。
- 变更：`/achievements` 升级为 28 项带官方图标的交互百科，加入搜索、分类、位置、难度、Steam 全球完成率快照和本地完成进度。
- SEO：28 个完整卡片和图标进入静态 HTML，并输出 28 项 ItemList；页面 OG 图改为成就素材。
- 资产：28 张 WebP 共约 168 KB，固定资产库共 359 项，已归档 351 项，待处理 8 项，校验失败 0 项。
- 验证：Vitest、TypeScript、Vite build、16 路由预渲染、静态断言与固定资产校验通过。
- 生产验证：`/achievements` 返回 200；Title 38 字符；28 张图、28 个完成率、28 项 ItemList、canonical 与 sitemap 均正确，所有图标 URL 返回 200。
- Commit：`8e5cb26`。
- 结论：production-verified。
## 0.6.1 — 2026-08-28

- 环境：Vercel Production，主域 `https://howtofishwalkthrough.com`。
- 变更：全站删除 Claim sources、Sources / Verify、route sources 和 evidence boundary 可见区块；正文、攻略步骤和相关推荐不变。
- SEO：Achievements description 不再承诺 linked sources；16 路由增加无来源面板回归门禁。
- 验证：Vitest、TypeScript、Vite build、16 路由预渲染与全站静态扫描通过。
- Commit：`4917740`。
- 结论：production-verified；16 个公开路由均未发现已删除的来源面板或标题。

## 0.6.2 — 2026-08-29

- 目标：为隐私、版权、无障碍和事实纠错提供不公开的站长联系渠道。
- 变更：Contact 增加站长确认的私人邮箱，并将 GitHub Issues 明确限定为公开、非敏感技术反馈；Privacy 补充邮件数据处理、用途和保留说明；Terms 指向私人版权下架通道。
- 门禁：静态构建必须包含私人邮箱入口、GitHub 公开警示、邮件隐私披露和版权请求路径。
- 环境：Vercel Production，主域 `https://howtofishwalkthrough.com`。
- 验证：Vitest 3/3、TypeScript、Vite build、16 路由预渲染及静态断言通过；生产 Contact、Privacy、Terms 均返回新内容，16 个 sitemap 路由无 Claim sources 回归，ads.txt 未改变。
- Commit：`812edc8`。
- 结论：production-verified。
