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
