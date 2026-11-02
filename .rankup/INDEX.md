# Rankup 项目索引

- 项目：How to Fish Walkthrough
- 最近更新：2026-11-02
- 当前阶段：5 — COS 私有媒体鉴权代码已部署，等待安全配置与真实对象验收
- 当前目标：保留现有攻略站并把 Wow Family 作为 `/english/` 子应用合入同一 Vercel 仓库，媒体改用腾讯云 COS 契约
- 下一入口：PROJECT.md

## 接力

- 当前任务：完成 `/english/` 私有 COS 的生产配置和真实媒体验收；鉴权代码已部署。
- 验收：未登录拒绝、会话和课程对象白名单、5 分钟签名、本地测试/构建、Vercel 正式部署、生产安全降级与独立审查通过；桶为空时不宣称真实播放成功。
- 约束：桶 `english-1257786947` / `ap-hongkong` 保持私有；不上传文件，不提交或输出 SecretId、SecretKey、访问码、会话密钥，不覆盖仓库未归属改动。
- 部署设计：`docs/unified-wow-deployment.md`；私有 COS 鉴权新设计：`docs/private-cos-auth.md`。
- 当前状态：提交 `945ad84` 已部署为 Vercel Production Ready。根站、英语页、深链、308、真实 404 和缺配置时 API `503 NOT_CONFIGURED`/页面安全降级已在正式域验证；Vercel 项目环境变量当前为空，未写入任何 secret。采用 300 秒服务端预签名 URL，默认域名可能受 2024 年后存储桶浏览器预览限制；桶为空、自定义域名和真实对象尚未配置，故真实播放、CORS 和 Range 仍待验收。
- 阻塞：OpenCLI 未安装；Vercel应优先沿 GitHub 自动部署链路验证，必要时再使用可用浏览器驱动。
- 下一条要执行的动作：在腾讯云创建仅允许该桶 `lessons/*` 执行 `cos:GetObject` 的 CAM 身份，并由项目所有者直接在 Vercel 配置所需变量；上传一条有分发权的样例后验证签名、GET/Range 206、seek 和真实浏览器播放。

## 推荐读取顺序

1. PROJECT.md
2. architecture.md
3. decisions.md
4. plan.md

## 可复用脚本

- `.rankup/scripts/audit-production.mjs --base <origin> --out <json>`：全量核对线上 sitemap、页面状态、canonical、H1、Schema、OG 图、图片状态、ads.txt 与真实 404；已验证 2026-08-31，不依赖登录态。
- `.rankup/scripts/analyze-content-overlap.mjs --base <origin> --focus <path,path>`：按正文三词组比较 sitemap 页面之间的文本重叠，辅助识别重复选题和合并候选；已验证 2026-08-31，不依赖登录态。
- `.rankup/topics/competitor-analysis-2026-08-31.md`：当前五个垂直站、媒体站、Game8 可见性、Sitemap 规模和本站 P0–P2 竞争策略快照。

## 最近变化

- 2026-09-04：补齐首页 1280px OG/Twitter 分享图、全站 Meta Description 长度门禁及所有正文图片的 alt/固有尺寸门禁；生产审计 28/28 通过。GSC 重新提交 sitemap，确认发现 28 URL，并将 9 个新增页面全部加入优先抓取队列。
- 2026-09-03：发布 Tuna、Bowhead Whale、遗失 Boss 任务物/不刷新排错、Money & Cooking 四篇深度攻略；线上 sitemap 扩展到 28 URL，全站生产审计 28/28 无坏页、断图或重复标题。
- 2026-09-01：新增 `/guides/tips-and-tricks` 深度页，并以 Patch 1.0.10 自有视频证据回填 Beginner 安全控制与 Desert Coconut → Bing Bong → Carrot 路线；索引面扩展到 24 URL。
- 2026-09-01：发布 Giant Piranha、Pufferfish、Albatross、Mutated Bowhead Whale 四个独立 Boss 深度页；索引面由 19 扩展至 23 URL，固定资产库同步新页面用途。
- 2026-09-01：GSC 成功读取当前 19 URL sitemap；逐 URL Inspection 确认 9 页已收录、10 页未收录，主要原因为 `Discovered - currently not indexed`，生产技术审计未发现全站阻挡。
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
- 2026-08-31：复查当前竞品后，最大垂直威胁更新为 127 URL 的 howtofish.org 与 36 URL 的 howtofishguides.wiki；Game8 不再作为唯一当前标杆。下一内容批次收敛为 Giant Piranha、Pufferfish、Albatross、Mutated Bowhead Whale 四个有现成视频证据的深度页。
