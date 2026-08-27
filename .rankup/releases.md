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
