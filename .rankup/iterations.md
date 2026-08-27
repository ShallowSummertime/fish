# 迭代记录

## 2026-08-27 — MVP implementation

- 完成：建立 React + TypeScript + Vite 攻略站，交付首页、七个核心内容路由、49-creature 清单、11 个 boss/special entries、五个主 locations、lure hub、28 achievements 和 SEO 静态文件。
- 判据：`pnpm typecheck`、`pnpm test` 和 `pnpm build` 均以 0 退出；本地 HTTP 在 `/` 和 `/creatures` 返回 Vite SPA 页面。
- 结果：通过。`src/data.test.ts` 断言 49 creatures、11 boss/special entities、5 main locations 和 28 achievements。
- 下一步：生产部署后验证真实域名、静态深链、404、sitemap 和 GSC。

## 2026-08-27 — review remediation

- 完成：构建后为 sitemap 的八个 route 生成静态 HTML，且每页包含独立 Title、description、canonical、OG/Twitter 和 JSON-LD；Spider Crab canonical 改为 `/bosses/spider-crab`。
- 完成：移除普通 creature 的猜测 lure assignment；只保留已验证的 special summon；localStorage 读取改为数组、白名单与去重校验。
- 完成：补 mobile nav ARIA、checkbox focus-visible、guide trust block 和相关指南内链。
- 验证：`scripts/assert-static.mjs` 检查全部八个生成页面和关键 crawlable 内容。
- 独立验收：浏览器 E2E 通过直达 Spider Crab、creature 搜索/持久化、移动导航和零 console error；re-review 无 P0 问题。
- 经验决定：run-specific，本次无项目外可泛化且需修改全局 skill 的新规则。

## 2026-08-27 — Vercel production deployment

- 完成：从 GitHub 导入 Vercel 项目 `lik/fish`，部署生产构建，并在 Namecheap 将停车页 DNS 替换为 Vercel apex A 与 `www` CNAME。
- 主域策略：apex 直接连接 Production；`www` 以 308 跳转到 apex，与 canonical 和 sitemap 保持一致。
- 生产验收：八个正式路由均返回 200 和路由专属元数据；`robots.txt`、`sitemap.xml` 返回 200；未知路径返回 404。
- 安全与成本：未写入 token、账号或密钥；Vercel Hobby 部署本次外部成本为 0。

## 2026-08-28 — AdSense readiness remediation

- 现状：AdSense Sites 显示 `howtofishwalkthrough.com` 为 `Needs review`，ads.txt 为 `Not found`，验证/审核尚未完成。
- 完成：加入精确 seller line，新增四个信任页与全站 footer 入口，补充隐私与广告披露，扩写四个列表型 hub，加入 large image preview robots 指令。
- 验证：`pnpm test` 全通过；13 个静态路由、ads.txt 精确值、privacy 必备披露、footer 信任链接、canonical 与 JSON-LD 均由阻断断言覆盖。
- 下一步：推送 Vercel 后验证生产 URL；在 AdSense 勾选 ads.txt 并验证；在 GSC 提交 sitemap 和核心攻略 URL。
