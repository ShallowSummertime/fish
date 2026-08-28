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
