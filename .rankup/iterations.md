# 迭代记录

## 2026-08-28 — Rocks Island 4 深度攻略

- 目标：用固定资产库中的自有图鉴素材创建可独立完成第四岛的英文攻略。
- 判据：新增可索引 `/locations/rocks`；至少 1200 个可见英文词、3 张可发布实机图、10 个 Rocks 捕获物、完整 Tuna → Albatross → Head → Volcano 链；桌面与 390px 移动端无横向溢出；第三方 Game8 图不公开。
- 结果：本地 TypeScript、Vitest、Vite 构建、15 路由静态断言与浏览器 E2E 通过；移动 QA 发现通用 `nav` 移动规则会绝对定位文章内目录，新增末加载的 `rocks.css` 将 `.quick-nav` 恢复到文档流后复验通过。
- 资产：Professional、Scientific、Boss 三张用户自有图鉴 WebP 增加 `/locations/rocks` 用途；固定资产库 231 项、校验失败 0。
- 下一轮唯一改进：取得 Rocks 岛自有实机路线视频后，用真实 NPC、商店、Tuna 落地点与 Albatross 掩体关键帧替换或补充图鉴级截图。

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

## 2026-08-28 — GSC verification and focused indexing

- Added the Search Console domain-verification TXT at Namecheap root DNS without changing the production A/CNAME records; authoritative DNS propagation was verified.
- Google confirmed domain ownership automatically through the domain provider method.
- Submitted `sitemap.xml`; immediate first processing status briefly reported unable to fetch, while the submission confirmation stated periodic processing would continue.
- Submitted exactly three URLs: homepage and Lighthouse were discovered/not indexed and joined the priority crawl queue; Beginner Guide was already indexed and was resubmitted after its content update.
