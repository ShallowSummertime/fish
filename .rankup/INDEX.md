# Rankup 项目索引

- 项目：How to Fish Walkthrough
- 最近更新：2026-08-31
- 当前阶段：9 — 实战攻略与实体资料库扩展
- 当前目标：以 19 个可索引 URL 集中内容权重，并继续补首页分享图与元描述门禁
- 下一入口：PROJECT.md

## 推荐读取顺序

1. PROJECT.md
2. architecture.md
3. decisions.md
4. plan.md

## 可复用脚本

- `.rankup/scripts/audit-production.mjs --base <origin> --out <json>`：全量核对线上 sitemap、页面状态、canonical、H1、Schema、OG 图、图片状态、ads.txt 与真实 404；已验证 2026-08-31，不依赖登录态。
- `.rankup/scripts/analyze-content-overlap.mjs --base <origin> --focus <path,path>`：按正文三词组比较 sitemap 页面之间的文本重叠，辅助识别重复选题和合并候选；已验证 2026-08-31，不依赖登录态。

## 最近变化

- 2026-08-27：建立项目定位、实体模型与 MVP 实现边界。
- 2026-08-27：实现 Vite + React 静态攻略站；49-creature 清单、核心 hubs、SEO 文件与本地验证已完成。
- 2026-08-27：八个路由完成静态预渲染；独立 E2E 与阻断式 review 通过。
- 2026-08-27：Vercel Production、Namecheap DNS、HTTPS、主域跳转和生产路由验收完成。
- 2026-08-27：生产内容审计确认八页均无图片且核心攻略过薄；计划切换到 Spider Crab 与 Beginner 深度重写。
- 2026-08-28：核心攻略已扩展为截图/原创图解驱动内容；AdSense 申请前新增 ads.txt、隐私/关于/联系/条款页，补强薄弱 hub，并扩大为 13 个可抓取静态路由。
- 2026-08-28：GSC 域名所有权通过 Namecheap TXT 验证；sitemap 与首页、Beginner Guide、Lighthouse Guide 已提交；完整 73 项 AdSense 审计见 `adsense-audit-2026-08-28.md`。
- 2026-08-28：新增 `/locations/rocks` 深度攻略，使用自有图鉴素材覆盖 Professional 鱼池、Tuna、Albatross、Volcano 解锁与失败恢复；路由和 sitemap 扩展到 15 页。
- 2026-08-28：分析攻略4-5旧版视频并归档 13 张研究帧与实体种子；补强 Rocks，新增 `/locations/volcano` 深度攻略、3 张截图式重建素材和完整 Bowhead 双战路线；扩展到 16 个静态路由。
- 2026-08-28：确认 16 页已有构建时静态预渲染；新增全站 Title ≤60、首页首轮 HTML ≥1200 词、静态 H1/FAQ/FAQPage schema 阻断门禁；生产部署与 GSC/目录复核待完成。
- 2026-08-28：完成 AdSense 低价值复审整改：Achievements/Lures/Bosses 从薄列表升级为实操指南，九张 Beginner 图压缩为 920 KB WebP，修正第一岛与生物图证，按页面类型输出 Schema，并加入 CMP 前禁投广告及内容深度门禁。
- 2026-08-28：将 `/achievements` 升级为 28 项带官方图标的交互图鉴；全球完成率按 Steam 官方页当日快照更新，并加入搜索、分类、位置、难度、进度勾选与 ItemList 结构化数据。
- 2026-08-28：按站点展示要求移除全站所有 Claim sources / Sources Verify 可见区块；事实核验仍在编辑流程中保留，并新增 16 路由静态阻断检查防止区块回归。
- 2026-08-29：加入站长确认的私人联系邮箱；Contact、Privacy、Terms 明确私人邮件和公开 GitHub Issues 的边界，并增加静态回归门禁。
- 2026-08-31：生产站扩展到 25 个静态 URL；新增七篇视频主题攻略。全站技术抓取通过，但七篇新稿仅约 233–498 个正文词且多数只有一张复用图，成为当前内容质量 P0。
- 2026-08-31：GSC 最近可用数据（8 月 26–28 日）为 174 曝光、1 点击、0.6% CTR、平均排名 12.6；仅 5 个 URL 获得曝光。索引覆盖报告仍在处理，sitemap 成功但只显示发现 18 页。
- 2026-08-31：逐页复核七篇新稿后，内容策略从“七页全部扩写”收敛为：Handyman 深写；五个重复意图合并并 301；Casino 当前补丁复现前隔离索引。
- 2026-08-31：完成七页收敛实现：Handyman 扩为 1200+ 静态词并使用 4 张现有素材与 2 张原创 SVG 图解；五个薄页永久导向权威页；Casino 保留直达但 `noindex,follow` 且退出 sitemap/首页；索引清单收敛为 19 URL。
