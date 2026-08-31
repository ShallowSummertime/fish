# 当前计划

- 目标：把技术可用的 MVP 升级为玩家能够独立完成任务的实战攻略站。
- 更新时间：2026-08-31

| 优先级 | 工作项 | 状态 | 验收标准 |
|---|---|---|---|
| P0 | 首页与全局导航 | done | 响应式、游戏意图 TDK、入口清晰 |
| P0 | 49-creature 清单工具 | done | 数量断言通过，可搜索/筛选/勾选 |
| P0 | Boss/Location/Lure Hub | done | 实体数据和内链一致 |
| P0 | 重写 Spider Crab 实战攻略 | done | 具备版本日期、准备清单、召唤步骤、战斗循环、失败处理、任务交付与原创图解 |
| P0 | 重写 Beginner 第一小时路线 | done | 五地点路线与九图轮播已发布，步骤和结果状态可执行 |
| P0 | 建立内容发布门禁 | done | Boss/Lure/Achievement 深度、事实来源、步骤、失败状态、图片权利、图片性能、Schema 与 CMP 前禁投广告均有阻断断言 |
| P1 | SEO 基础设施 | done | canonical/OG/schema/sitemap/robots 齐全 |
| P1 | 补强 Boss/Location/Lure/Achievement hubs | done | 增加行动流程、验证边界、故障恢复与深度攻略内链 |
| P1 | Rocks 第四岛深度攻略 | done | 自有图鉴图片、10 条 Professional 捕获物、Tuna/Albatross 战斗步骤、Head 交付、Volcano 解锁与移动端 QA 全部通过 |
| P1 | Volcano 第五岛深度攻略 | done | Scientist 五鱼任务、5 条 Scientific 生物、Bowhead 整体搬运、Mutated Bowhead 岩浆战、Whale Fin/RHIB 结局、4 图与移动端 QA 全部通过 |
| P1 | 攻略4-5视频资料化 | done | 原视频 source-only；13 张关键帧、联系表、版本边界、14 个实体和 3 个覆盖缺口归档；公开页不引用研究帧 |
| P0 | AdSense 申请前技术与信任修复 | done | ads.txt、隐私/关于/联系/条款、爬虫元数据、13 路由静态断言全部通过 |
| P0 | AdSense 所有权验证与申请审核 | in-progress | 线上 ads.txt 被后台识别，站点审核成功提交 |
| P0 | GSC 合格页面提交 | in-progress | sitemap 可读取，核心内容 URL 经 URL Inspection 提交或确认已索引 |
| P0 | 首轮 HTML 与首页内容门禁 | done | 16 页静态正文、全站 Title ≤60、首页 1622 词及 FAQ 已在生产 HTML 中通过 |
| P1 | 免费目录资格筛选与提交 | in-progress | 先量真实流量与资格；只准备真实字段；BacklinkDirs/Submify 最终提交须单项确认并留证 |
| P1 | 构建、测试和独立 E2E/review | done | 客观 gates、静态 route 断言、独立 E2E 与生产部署 review 已通过 |
| P0 | 七篇视频攻略收敛与重写 | done | Handyman 独立深写；Weapon Skins、Spider Summon、Killscore、All Bosses、Five-Boss 合并到现有权威页并永久重定向；Casino 当前补丁复现前隔离索引；不保留 200 薄副本 |
| P0 | 修复保留攻略的标题层级 | done | Handyman 的 H1 后使用连续 H2；合并后的权威页保持现有语义标题结构；静态检查通过 |
| P1 | 补首页分享图 | pending | 首页存在独立 1200px+ `og:image` 与 `twitter:image`，生产 URL 返回 200；信任页可复用默认站点图 |
| P1 | 校正 Meta Description 长度 | pending | Bosses 不少于 110 字符；Beginner、Lighthouse、Volcano 不超过 160 字符；构建按解码后长度阻断回归 |
| P1 | 刷新 GSC sitemap 发现量 | pending | GSC 成功读取当前 19 URL sitemap；等待覆盖报告生成后再决定逐页提交，不用 `site:` 数量代替 GSC |
| P2 | 增加生产安全响应头 | pending | 评估并配置 Content-Security-Policy、X-Content-Type-Options、Referrer-Policy 和 Permissions-Policy，确保不破坏 Vercel、未来 CMP 或 AdSense |
