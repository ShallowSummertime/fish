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
