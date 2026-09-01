# 迭代记录

## 2026-09-01 — 四个 Boss 深度页发布

- 目标：用已归档、权利安全的素材把 Giant Piranha、Pufferfish、Albatross、Mutated Bowhead Whale 从地点页中的章节扩展成四个独立搜索入口。
- 实施：新增四个静态 Article 路由；每页提供 900+ 可见英文词、4 张可发布素材、触发链、攻击循环、唯一掉落保护、NPC 交付、完成检查和故障恢复。Boss hub 改为直接链接独立页；正常 Mutated Bowhead 路线与 Handyman 裸手成就页保持明确边界。
- SEO：sitemap 从 19 扩至 23 个可索引 URL；四页具备独立 Title、description、canonical、OG/Twitter 图、Article 与 BreadcrumbList Schema，`dateModified` 为 2026-09-01。
- 资产：没有公开第三方研究帧；复用原创路线图、用户自有图鉴衍生图和已发布截图式重建图，并将新页面用途同步进固定资产库。资产库 488 项、归档 472、待处理 16、校验失败 0。
- 验证：Vitest 4/4、TypeScript、Vite build、24 路由预渲染、静态内容/媒体/Schema/无研究帧门禁与固定资产库校验通过。浏览器控制入口本轮不可用，视觉风险由既有组件和静态尺寸门禁约束。生产四页均为 200、自指 canonical、Article Schema、4 张图片；23 页全站审计无坏页、重复 Title 或断图，未知 URL 为 404。
- 下一轮唯一改进：部署后观察四页的 GSC 发现、索引和查询数据，再选择首批高证据 creature 详情页。

## 2026-08-31 — 当前竞品与搜索盘面复查

- 目标：识别当前真正抢占 How to Fish 攻略搜索的站点，并决定下一批内容应扩页面数量还是提高一手信息增益。
- 观察：本站 Git、路由和生产 Sitemap 一致为 19 个索引 URL。howtofish.org 已达 127 URL，howtofishguides.wiki 36，howtofishgameguide.com 14，howtofishhq.wiki 13；Game8 的 How to Fish 页面未在本次精确站内搜索中稳定出现。媒体站已用独立 Spider Crab、Pufferfish、Beginner 和完整 walkthrough 页面验证长尾需求。
- 结果：证伪“继续把 Game8 当唯一当前竞品”和“按 49 个实体一次铺开”的假设。本站下一批优先用现有视频证据完成 Giant Piranha、Pufferfish、Albatross、Mutated Bowhead Whale 四个 Boss 深度页。
- 证据：`.rankup/topics/competitor-analysis-2026-08-31.md`；四个竞品 Sitemap；Web.Cafe `how to fish game` 美国英语 SERP 快照。
- 工具状态：Rankup 2.32.0 检出 2.63.0，但因本机 npm cache 含 root-owned 文件而更新失败；保留当前版本继续，未伪称更新成功。
- 学习决定：run-specific；本次结论属于游戏发行窗口和当前 SERP，不晋升全局 Skill。
- 下一轮唯一改进：先从素材库盘点四个 Boss 的可发布关键帧，素材不足项单独列出后再开始写页。

## 2026-08-31 — 七篇 P0 攻略收敛实施

- 目标：停止用薄 URL 扩张，保留独立 Handyman 搜索任务，并把五个重复意图集中到既有权威页；Casino 在可复现前不参与索引。
- 实施：重写 Handyman；向 Reel 加入快速皮肤循环，向 Beginner 加入连杀奖励与 5x 成就区分，向 Bosses 加入按关卡武器规划与正常游戏五站路线；加入五条永久重定向；Casino 输出 `noindex,follow` 并退出 sitemap/首页。
- 判据：19 个 sitemap URL、20 个预渲染页面、5 条永久跳转配置、Handyman 700+ 词/5+ 相关视觉、Casino noindex、公开首页不再导向隔离/合并页。
- 结果：本地所有机械门禁通过。浏览器 QA 另外发现首版 SVG 标签越界和移动端过小，修复为拆行标签与图解内部横向滚动后，桌面/移动页面均无根级横向溢出。
- 学习决定：run-specific；现有“视觉变化必须浏览器复验”和“薄意图优先合并”规则已经覆盖，不晋升全局 Skill。
- 下一轮唯一改进：补首页独立 1200px 分享图并统一元描述长度门禁。

## 2026-08-31 — 生产站与 GSC 现状复查

- 目标：以线上 HTML、当前 Git 路由、生产 sitemap 和 GSC 实际数据四方核对站点质量。
- 结果：25 个静态页面和全部图片技术检查通过；首页 on-page 得分 93/A；官方 Steam 新闻仍以 Patch 1.0.10 为最新公开补丁。
- 主要缺口：七篇新视频攻略只有约 233–498 个正文词；逐页裁决显示五页应并回既有权威页、一页需补丁复现、一页可直接深写。首页仍缺分享图；四页 description 超出建议范围；GSC 发现页数仍停在 18。
- 搜索基线：可用数据窗口为 8 月 26–28 日，174 曝光、1 点击、0.6% CTR、平均排名 12.6；索引覆盖报告仍在处理，不能从公开 `site:` 结果推断准确索引数。
- 工具沉淀：新增参数化 `.rankup/scripts/audit-production.mjs`，以后可重复检查 sitemap、SEO 元数据、图片、404、robots 与 ads.txt。首轮在 Node 20 因 `Object.groupBy` 不可用失败，已改为 `reduce` 并复跑成功。
- 下一轮唯一改进：先执行七页收敛，优先深写 Handyman 并把重复意图合并到既有权威页，不再按 URL 数量扩充薄页面。

## 2026-08-31 — 七篇视频攻略去留分析

- 目标：确定七个新 URL 应扩写、合并还是隔离，避免把“内容增长”误解为保留所有薄页。
- 观察：Handyman 有独立任务和实战证据；Weapon Skins、Spider Summon、All Bosses 与 Five-Boss 均已有更强站内承接页；Killscore 把 1.05–1.50 连杀表与 5x Impressive 成就混在同一词形；Casino 尚未证明稳定路线。
- 结果：证伪“七页全部补到固定词数即可”的假设。建议一页深写、五页合并、一页复现前隔离。
- 工具：新增并验证 `.rankup/scripts/analyze-content-overlap.mjs`，正文重叠只作线索，最终裁决仍看搜索任务与事实覆盖。
- 下一轮唯一改进：执行合并、301、sitemap/首页入口同步，并先完成 Handyman 深写。

## 2026-08-29 — 私人联系渠道

- 目标：解决敏感纠错、隐私和版权请求只能通过公开 GitHub Issues 提交的问题。
- 实施：使用站长明确提供的私人邮箱作为首选联系渠道；Contact 提醒访客不要发送无关敏感数据，GitHub Issues 仅用于公开技术问题；Privacy 和 Terms 同步说明邮件处理与版权请求路径。
- 门禁：构建时检查 mailto、公开渠道警示、邮件隐私说明和私人下架路径，防止后续页面退回 GitHub-only 状态。
- 下一轮唯一改进：定期检查私人邮箱可投递性与垃圾邮件分类，必要时再迁移到域名邮箱或无登录表单。

## 2026-08-28 — AdSense 低价值页面与媒体性能整改

- 目标：消除 Achievements、Lures、Bosses 的薄内容风险，并修复轮播负载、图文错配和全站 Article Schema 泛用问题。
- 内容：28 个成就加入官方条件、实操路线和版本警告；4 个常规诱饵池加入完整目标和剧情例外；11 个 Boss 加入战斗、奖励和失败恢复。
- 图片：九张 Beginner 卡由 17.34 MB PNG 降至 920 KB WebP，首图优先、其余延迟加载；Creature 首图改为真实百科；Spider Crab 与 Empty Beer Can 步骤重新选帧并校正文案。
- 技术：Article 仅用于六篇编辑攻略；列表 hub、首页及信任页使用匹配的 Schema。AdSense 脚本在 CMP 配置前由构建门禁禁止进入核心页面。
- 验证：Vitest、TypeScript、Vite、16 路由静态预渲染与新增质量断言全部通过。仍需生产部署后复验真实响应；CMP 与私人联系通道属于账户/所有者侧后续。
- 下一轮唯一改进：获得站长指定的私人联系邮箱或表单端点后，为隐私与版权敏感报告提供非公开渠道。

## 2026-08-28 — 静态收录门禁、首页 1200+ 词与目录投放准备

- 目标：消除“CSR 空壳”风险、把最终 Title 压到 60 字符以内、扩充首页正文与 FAQ，并为 GSC/免费目录提交建立可验证闭环。
- 观察：项目已有构建时 `renderToString` 静态预渲染，不需要更换框架；真正缺口是没有全站 Title 门禁、首页仅有简短导语、外部审计结果缺少可持续断言。
- 实施：为 16 页加入最终 Title ≤60 断言；首页加入完整路线依赖、首小时购买与诱饵原则、七项 FAQ，并让 FAQPage JSON-LD 与可见答案共用同一数据源。
- 验证：`pnpm test` 通过；16 个 crawlable route 通过静态断言；首页初始 HTML 1,622 个可见英文词，H1 位于第 5,884 字节，非空静态 root、canonical、robots、Article/Breadcrumb/FAQ schema 均在构建产物中。
- 下一轮唯一改进：在生产部署后用真实响应再次量 Title、H1 字节位置、正文词数和 sitemap，再提交 GSC 与合格目录。

## 2026-08-28 — Rocks 补强与 Volcano Island 5 深度攻略

- 目标：把攻略4-5长视频转成可追溯事实和可独立通关的第四、第五岛英文攻略。
- 证据边界：源视频显示 Patch 1.0.5 且带播放器/中文字幕，原件只登记 source-only；13 张关键帧、联系表、分析笔记和 14 个实体只用于研究。旧伤害、弹药和升级数值不升级为当前事实。
- Rocks：新增 1.50× 烹饪目标、Tuna/Albatross 白色逃脱计时条、红屋檐掩体、俯冲与白色投射物、Head/Meat 区分，以及 `/locations/volcano` 交接。
- Volcano：新增 2542 可见词的 `/locations/volcano`，覆盖 Scientist 五鱼来源分歧、五种 Scientific 生物、Fish Bucket、Bowhead 跳跃、整体搬运、Mutated Bowhead 岩浆战、Whale Fin/RHIB 与 10 项故障恢复。
- 素材：依据视频关键帧生成 4 张去 UI/字幕、贴近原游戏低多边形画面的干净截图式重建图；3 张用于 Volcano、1 张用于 Rocks；两张早期偏概念插画未进入站点。
- 验证：Vitest、TypeScript、Vite 构建、16 路由静态断言、资产库 260 项/失败 0、桌面 1280px 与移动 390px 浏览器 QA 全通过；Volcano 4 张图片延迟加载后均为非零尺寸且无横向溢出。
- 下一轮唯一改进：取得当前 Patch 1.0.10 的 Scientist 任务计数器自有截图，解决“任意五条”与“五条 Scientific 捕获物”的残余分歧。

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
## 2026-08-28 — 28 项图文成就图鉴

- 目标：结合用户提供的成就图库，把文字密集的 Achievements hub 变成可检索、可勾选、可独立使用的图文百科。
- 证据边界：采用图库中的 28 个官方游戏图标和交互思路；成就名称、官方条件与全球完成率重新以 Steam 官方成就页核对，未采用参考页中冲突的路线、价格或旧版本说法。
- 实施：每项增加图标、分类、位置、难度、官方条件、实操路线、注意事项和全球完成率；加入搜索、分类筛选、浏览器本地进度、清空动作与完成统计。
- SEO：28 张图和正文进入首轮 HTML；CollectionPage 内嵌 28 项 ItemList，成就页有独立 OG 图并保留自指 canonical。
- 资产：28 张 256px 来源 JPG 优化为约 168 KB WebP；来源、衍生关系、权利边界和 `/achievements` 用途进入固定资产库，359 项校验失败 0。
- 验证：Vitest 3/3、TypeScript、Vite build、16 路由静态预渲染、成就专属内容门禁和固定资产校验全部通过。
- 下一轮唯一改进：后续版本更新时自动或人工刷新 Steam 全球完成率快照，并保留页面上的核对日期。
## 2026-08-28 — 全站删除 Claim sources 区块

- 目标：从所有公开页面移除 Claim sources / Sources Verify 及同类证据边界面板。
- 实施：删除共享 Evidence 组件、Lighthouse 手写来源块，以及 Locations、Rocks、Volcano、Reel、Lures、Spider Crab、Achievements 的来源区块；攻略正文与 Related 导航保持不变。
- SEO：Achievements description 去掉 “linked sources” 承诺；canonical、Schema、首轮 HTML 和 sitemap 不变。
- 门禁：16 条路由逐页断言不再出现 `.evidence`、Claim sources、Sources Verify 或旧验证标题。
- 验证：Vitest 3/3、TypeScript、Vite build、16 路由静态预渲染和全站关键词扫描通过。
- 下一轮唯一改进：保持后台资料与事实核验记录，不再将出版社式 claim-source 面板作为前台正文组件。

## 2026-09-01 — GSC 19 页逐 URL 收录核对

- 目标：不用公开 `site:` 估算或旧覆盖率汇总，逐页确认当前 sitemap URL 的真实索引状态与未收录原因。
- 对账：Git 和构建声明 19 个索引 URL；生产 sitemap 同样为 19 个；GSC 在 2026-09-01 成功读取并发现全部 19 个 URL。生产审计未发现状态码、canonical、robots、H1、Schema、图片或 sitemap 阻挡。
- 结果：9 页已收录；10 页未收录。未收录页为 Achievements、Spider Crab、Creatures、Lures、Rocks、Desert、Volcano、Reel of Fortune、Mutated Whale Handyman 和 About。
- 原因：除 Volcano 显示 `URL is unknown to Google` 外，其余九页均为 `Discovered - currently not indexed`。旧的网页索引报告仍停在 8 月 28 日，并将 Rocks 记为 `Crawled - currently not indexed`；逐 URL Inspection 是本轮当前证据。
- 裁决：这是新站抓取优先级问题，不是全站技术收录故障。下一轮优先提交/加强有搜索意图和原创素材的游戏页；About 不作为首批索引资源竞争优先级。
