# Release record

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
