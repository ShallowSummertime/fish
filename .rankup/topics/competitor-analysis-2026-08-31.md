# How to Fish 竞品分析 — 2026-08-31

## 范围与方法

- 对账本站 Git、真实路由和生产 `sitemap.xml`：当前为 19 个可索引 URL。
- 核对五个垂直站公开 Sitemap、robots、首页和代表性深层页面。
- 抽样美国英语搜索意图：`how to fish game`、walkthrough、bosses、achievements。
- 只把当前可访问页面和 2026-08-31 搜索快照当作事实；Game8 的旧拆解只作历史结构参考。

## 核心结论

当前最大直接竞品已经不是 Game8，而是 `howtofish.org`。它用 127 个 URL 覆盖 creature、boss、quest、weapon、lure、NPC、island 和工具，形成了最完整的实体网。第二个需要关注的是 `howtofishguides.wiki`，它只有 36 个 URL，但已建立 10 个单 Boss 页面、5 个岛页面，以及 multiplayer、money、mods、save-file 和 black-screen 等问题页。

本站不应跟随它们批量生产模板化薄实体页。现有优势是用户自有视频、逐帧证据、可发布截图式素材、五岛深度路线、可操作的失败恢复和严格内容门禁。下一轮应该把这些一手素材转成 4 个高意图 Boss 深度页，再根据证据量逐批扩实体，而不是把 49 个 creature 一次拆成 49 个低信息增益页面。

## 竞品盘面

| 竞品 | Sitemap URL | 主要策略 | 最强项 | 可攻击缺口 |
|---|---:|---|---|---|
| `howtofish.org` | 127 | 全实体程序化 Wiki + 工具 | 44 creature、12 boss、8 quest、43 wiki、5 岛详情、Killscore calculator；内链覆盖最完整 | 部分页面模板重复明显；单 Boss 页战斗细节偏短；不少数字需要当前补丁复验；缺少逐帧攻击动作证据 |
| `howtofishguides.wiki` | 36 | 攻略集群 + 单 Boss + 问题页 | 11 个 Boss 路由、6 个 island 层级、money/multiplayer/mods/help 覆盖；walkthrough 内链很强 | 文本密集、原创画面少；大部分 lastmod 停在 8 月 25–26 日；部分固定数值和版本边界容易过时 |
| `howtofishgameguide.com` | 14 | 少量高完成度综合页 | 页面目录、站内搜索、图文 walkthrough、验证日期和相关链接体验好 | 只有 3 个独立岛页；Boss 仍集中在 hub；实体覆盖不足 |
| `howtofishhq.wiki` | 13 | 证据优先、窄范围发布 | checked date、官方来源、editorial policy、patch/platform/multiplayer 信任感强 | 主动放弃 fish/map/island 大量实体；全部 Sitemap lastmod 为 8 月 26 日，更新速度已落后 |
| IGN / PC Gamer / Destructoid | 少量编辑页 | 依靠高 DR 抢 beginner、boss、full walkthrough | 强品牌、作者实测、编辑截图；能快速占头部查询 | 内容碎片化，没有完整 creature/lure/quest 工具网，也不会持续覆盖全部小长尾 |
| Game8 | 当前可见性不确定 | 历史 Hub–Spoke Wiki 模式 | 大站结构、表格、相关链接和更新时间模板成熟 | 2026-08-31 的精确站内搜索没有稳定返回 How to Fish 页面；直接请求受反爬限制，不应继续把它当唯一当前标杆 |

## 搜索盘面

`how to fish game` 的当前 SERP Top 3 是 Steam Community、Steam Store 和 IGN Beginner Guide。Web.Cafe 快照将该词估为 KD 42.5/100，并估算进入前十约需 45–95 个引用域；月搜索量缺失。因此该词可以作为首页长期主词，但不适合作为新站短期主攻词。

当前搜索结果已经出现多家新垂直站：`howtofishguides.wiki`、`howtofish.org`、`howtofishgameguide.com`、`howtofish.live` 和 `howtofishs.wiki`。窗口不是“没有对手”，而是“对手已经开始批量铺页，但一手图证和当前补丁复验仍不足”。

媒体站正在验证 Boss 查询的真实需求：PC Gamer 已分别发布 Spider Crab 与 Pufferfish 单篇攻略；Destructoid 发布五岛完整 walkthrough；IGN 抢占 beginner tips。本站应避免用通用摘要和它们比域名权重，改用更完整的召唤链、攻击前摇、掩体位置、掉落保护、NPC 交付和失败恢复来提高信息增益。

## 本站相对位置

### 已领先

- 五个主线地点都有独立页面；Rocks、Volcano、Lighthouse 和 Beginner 已有自有/可发布图片和完整步骤。
- Handyman、Spider Crab、Achievements 的实操深度明显高于多数模板型竞品页。
- 49-creature 清单、28-achievement tracker 已是可交互页面，不只是静态列表。
- 19 个索引 URL 均静态预渲染，canonical、Schema、图片和 404 门禁已验证。
- 事实边界更谨慎：不会把 Developer Island 写进正常五岛主线，也不会为不确定价格、伤害和掉率编数字。

### 当前落后

- 只有 Spider Crab 一个独立 Boss URL；对手已覆盖 10–12 个 Boss 详情页。
- creature 仍集中在一个 hub，拿不到 `how to catch [creature]`、`[creature] bait/value/location` 的单实体长尾。
- 缺 money/cooking、multiplayer troubleshooting、save-file、platform status 等明确任务页。
- 没有真正计算型工具；`howtofish.org` 已有 46 creature、20 bonus 的 Killscore calculator。
- 首页和信任页仍缺统一 OG 分享图；部分 Meta Description 长度门禁仍待完成。

## 建议执行顺序

### P0：用已有视频证据做 4 个 Boss 深度页

1. `/bosses/giant-piranha`：Leech/quest trigger、minion 处理、移动射击、Skeleton 保护和 Desert coordinates。
2. `/bosses/pufferfish`：endangered creature → Carrot、滚动攻击前摇、树/商店掩体、Fin 交付和 Rocks 解锁。
3. `/bosses/albatross`：Professional Boss Lure → Tuna、尸体放置、远程武器、投射物/俯冲、Head 交付。
4. `/bosses/mutated-bowhead-whale`：Scientist chain、Bowhead 搬运、crater trigger、岩浆线路、Whale Fin 和 RHIB ending；与 Handyman 页区分正常打法和裸手成就打法。

每页最低标准：900–1,400 个可见英文词、4–8 张自有/可发布素材、一个攻击循环图、召唤与交付链、失败恢复、checked patch/date、双向内链。没有足够素材时不发布独立页。

### P1：补任务型缺口，不批量铺薄页

- `money-and-cooking-guide`：只使用已验证 grill、cooking、Killscore 和安全售卖资料；不要承诺 casino 稳定收益。
- `multiplayer-and-joining-help`：只在官方 patch notes 或自有复现能支撑时发布。
- 按已有素材先拆 5–10 个高价值 creature 页，优先 Tuna、Leech、Needlefish、Blue Shark、Goblin Shark、Bowhead Whale；每页必须增加独立画面、路线和用途，而不是复制数据库字段。
- 建立官方 patch/update 页面，保持当前版本与已验证日期；只引用 Steam 官方更新。

### P2：工具差异化

- 暂不复制竞品 Killscore calculator。只有当 46 个基础价格、20 个 multiplier、叠加规则和当前补丁都可复验时再做。
- 更适合本站现有资产的是“下一步路线检查器”：选择当前岛、已完成 NPC hand-in、持有 quest item，输出下一动作和失败恢复。它直接复用五岛深度路线，信息增益比第二个普通 calculator 更高。

## 90 天竞争策略

- 第 1–2 周：发布四个 Boss 深度页并更新 Boss hub、岛页、成就页的双向内链。
- 第 3–4 周：补 money/cooking 与一篇有官方证据的 multiplayer/help 页面。
- 第 2 月：按素材库证据质量发布首批 5–10 个 creature 详情页；观察 GSC 实际查询后再决定下一批。
- 第 3 月：依据 GSC 查询和玩家反馈决定做“下一步路线检查器”还是补第二批实体页。
- 每月最后一天复查竞品 Sitemap 数量、lastmod、新增工具和 SERP 专页占比；不要把本次快照当永久事实。

## 证据

- 本站：`https://howtofishwalkthrough.com/sitemap.xml`，19 URL，核对 2026-08-31。
- `https://howtofish.org/sitemap.xml`，127 URL；最近 lastmod 2026-08-28。
- `https://howtofishguides.wiki/sitemap.xml`，36 URL；lastmod 集中在 2026-08-25–26。
- `https://howtofishgameguide.com/sitemap.xml`，14 URL；lastmod 2026-08-27。
- `https://howtofishhq.wiki/sitemap.xml`，13 URL；lastmod 2026-08-26。
- 代表页：`howtofish.org/tools/bonus-multiplier-calculator/`、`howtofish.org/creatures/clam/`、`howtofishguides.wiki/walkthrough/`、`howtofishgameguide.com/walkthrough/`。
- 搜索与媒体样本：IGN Essential Tips for Beginners、PC Gamer Spider Crab/Pufferfish、Destructoid complete walkthrough；核对 2026-08-31。
