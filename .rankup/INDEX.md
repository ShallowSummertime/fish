# Rankup 项目索引

- 项目：How to Fish Walkthrough
- 最近更新：2026-11-03
- 当前阶段：5 — 八个级别私有视频批量接入与生产验收
- 当前目标：保留现有攻略站并把 Wow Family 作为 `/english/` 子应用合入同一 Vercel 仓库，媒体改用腾讯云 COS 契约
- 下一入口：PROJECT.md

## 接力

- 当前任务：发布私有COS字幕修复；保留原鱼攻略站及现有视频鉴权。
- 当前状态（2026-11-03）：241课最新f40002b…字幕对象已上传，下载字节数1375276与SHA-256匹配，匿名Range GET为403。完整回归通过（英语19、站点4、241课、29路由）。公开仓库只提交代码与非内容清单，完整字幕全文不进Git或dist。
- 约束：不改COS权限/CORS/凭据，不覆盖媒体或学习记录；头像和其他无关工作不进入此次提交。
- 阻塞：无发布前阻塞；生产只读身份实际读取和浏览器字幕链路需部署后验证。
- 下一条要执行的动作：限定提交字幕文件、推送main，核对Vercel终态及登录后字幕接口/播放器。直接听审和真实触屏全屏仍待人工抽查。
- 证据与方案：`docs/english-subtitle-fix.md`、`docs/private-cos-auth.md`。

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

- 2026-11-02：三课首审后的19条确证中文修订已同步私有字幕候选；新摘要`f40002bfa5088526876907121d5e047a7a8d342bc3fa5c8d497f47339d544ac8`、1375276字节（旧47e291…已备份，不上传旧包）。Garden本地草稿安全同步42条，保留两条核心句与14图、禁出歧义题，仍未发布。Wow159项、Fish英语19项/站点4项/29路由完整回归通过；英文、时间轴和源视频均未变。上传/提交/部署仍因锁屏待续，未混入头像。

- 2026-11-02：字幕修复改为私有COS读取，公开仓库只保留固定对象/摘要/条数清单，完整1,375,130字节字幕已被Git忽略且未进入索引。实际目录完整测试通过（英语19/19、站点4/4、241课、29路由），现有视频匿名GET返回403。用户已批准字幕上传与修复发布；当前因Mac锁定无法核实既有云控制台上传会话与新对象私有保护，故尚未上传、提交、推送或部署。见docs/english-subtitle-fix.md。

- 2026-11-02：本地完成云视频字幕恢复候选（未部署）：私有家庭鉴权字幕接口、241 课英文/中英字幕、开关/失败重试与原时间轴逐句听读；英语专项 18/18、原字幕时间轴对账 241/241、完整构建和原站 29 路由静态回归通过。详见 `docs/english-subtitle-fix.md`。正式域 DNS 在当前执行环境返回 ENOTFOUND、Mac 锁定，线上与真机字幕验收待完成；生产仍不能宣称已恢复字幕。

- 2026-11-02：移除英语子应用固定 1200px 内容岛与 880px 播放器限制；课程库改为流式 auto-fit 网格，正式站验证 1920/1440/1280/768/375px 为 6/4/4/2/1 列，播放器最大 1600px，所有断点无横向溢出。
- 2026-11-02：完成 Wow Family 课程库、今日任务、批量选择和播放器交互优化；正式站通过桌面/320–414px、登录/访客、搜索分页、批量选课、焦点恢复和播放器冒烟验证。全屏与真实触屏手势保留人工设备抽查。
- 2026-11-02：将第二级缺失的第 006 集原始视频上传到私有 COS，目录对象数增至 66；正式域全量生产验证由 240/241 修复为 241/241，并完成该课程的浏览器实际播放验收。
- 2026-11-02：完成八级 241 课精确 COS 对象映射、所属级别前缀校验、静态门禁及全量生产字节范围验证脚本；本地完整测试通过。经用户操作时确认，CAM 策略版本 3 已设为当前版本，只允许八个精确目录的 `GetObject`。
- 2026-11-02：家庭访问码登录从固定 12 小时延长为固定 30 天；生产验证 Cookie/JWT 均为 2,592,000 秒，登录与第一级鉴权播放均为 200，COS 签名仍为 300 秒。
- 2026-11-02：轮换 Wow Family 家庭访问码；新明文仅存 macOS 钥匙串并复制到系统剪贴板，Vercel 仅保存 SHA-256；Production Ready 后正式登录与鉴权播放接口均返回 200。
- 2026-11-02：第一级 Yellow 33 集按原 COS 对象名接入私有签名播放；本地 12 项测试和 241 课静态断言通过，正式域完成首集播放、seek、自动下一集、Garden 和特殊文件名验收。
- 2026-11-02：完成 Wow Family 私有 COS 的生产配置：建立仅允许 `lessons/*` `GetObject` 的 CAM 子用户与策略，密钥直接写入 Vercel Secret，重新部署后正式域成功生成签名 URL；精确对象缺失返回 `NoSuchKey`，未宣称真实播放成功。
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
