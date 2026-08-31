# P0 七篇视频攻略去留分析 — 2026-08-31

## 结论

七个新 URL 不应全部按“补到 700–1000 词”机械扩写。现有站内已经有 Boss、地点、Reel、Beginner 与 Spider Crab 权威页；继续维持七个相邻薄页会分散素材、内链和搜索意图。

建议终态：保留并深写 1 页，合并 5 页，隔离验证 1 页。

| 当前 URL | 正文词数 | 视频证据 | 与现有页关系 | 建议终态 |
|---|---:|---|---|---|
| `/guides/mutated-whale-handyman` | 325 | 1:29 实战，路线清楚 | 独立成就意图 | 保留并重写 |
| `/guides/unlock-weapon-skins-fast` | 269 | 1:24，Drip → Reel → Z/C | 与 `/guides/reel-of-fortune` 高度同义 | 合并并 301 |
| `/guides/summon-spider-crab` | 233 | 0:06，只证明 Keeper 交付 | `/bosses/spider-crab` 已有完整召唤 H2 | 合并并 301 |
| `/guides/killscore-multipliers` | 279 | 0:04 静态文字卡，无实战 | 与 Beginner 的收益倍率内容相邻，且易与 5x Impressive 成就混淆 | 合并到 Beginner，301 到锚点 |
| `/guides/all-bosses-weapons-endgame` | 498 | 12:26，证据最丰富 | 与 `/bosses`、`/locations` 重复；“All Bosses”承诺未兑现全部特殊遭遇 | 合并到 `/bosses`；武器资料另行验证 |
| `/guides/five-boss-challenge` | 353 | 1:45，原视频含 mod 挑战 | 去掉 mod 后只剩普通剧情 Boss 摘要 | 合并到 `/bosses` 或作为非索引挑战组件 |
| `/guides/casino-money-route` | 410 | 4:47，有余额/移动/赌场画面，但可靠收益未验证 | 独立主题，但当前正文没有复现实际方法 | 暂时 noindex/移出 sitemap，当前补丁复现后再发布 |

## 逐页判据

### Handyman：唯一可以直接升级的独立页

- 独特任务：最终 Boss + 特定成就，不等同于 Volcano 通关页。
- 素材：现有 Volcano 三张公开图、Handyman 官方图标和研究视频足够先做 5–7 个图文步骤。
- 必改事实边界：官方文字是“Defeat the final boss with your bare hands”。页面应把“全程空手”写成最保守路线，不要未经验证地写成唯一判定条件；最低触发条件需当前版本实测。
- 内容结构：准备与存档、Boss 前置、岩石站位、攻击信号、短拳窗口、最后一击/全程空手边界、单人/合作归属、失败恢复、完成弹窗。

### Weapon skins：内容有需求，但 URL 应归并 Reel

- 当前 Reel 页已有 1,157 词并覆盖 Drip、机器、奖励识别、Z/C 和 GOLD GOLD GOLD。
- 新页的五步与 Reel 页属于同一任务链，没有足够独立信息增量。
- 把视频新增的“快速获取”内容作为 Reel 页 H2：最近机器选择、先清空物品栏、识别彩虹名称、奖励对应物品、无显示结果恢复。

### Spider Crab summon：精确查询应由完整 Boss 页承接

- 研究片只有 NPC 交付画面，Empty Beer Can、施放、战斗和 Shell 交付来自既有资料。
- `/bosses/spider-crab` 已存在 “Summon Spider Crab correctly” H2、完整战斗循环和失败处理。
- 301 到 `/bosses/spider-crab#summon`，保留精确锚点和首页/相关链接即可。

### Killscore：当前页面混合了两个不同机制

- 视频卡显示的是连续击杀：2 杀 x1.05、3 杀 x1.10、4 杀 x1.15、10+ 报告 x1.50，三秒内续杀。
- Steam 成就 `Impressive` 的官方条件是“Get a 5x killscore multiplier”，不是同一张 1.05–1.50 连杀表。
- 当前 Title 使用 `Killscore Multipliers`，可能吸引寻找 5x 成就的用户，却交付另一种连杀奖励表。
- 将已验证表格改名为 `Multi-kill chain bonus`，并入 Beginner 的 profit/multiplier 区；5x 成就另留在 Achievements，直到有实战证据再扩写。

### All bosses 与 Five-boss challenge：两页一起处理

- `/bosses` 已有 11 个特殊遭遇、召唤、战斗、奖励和恢复；`/locations` 已有五地点剧情路线。
- “All Bosses, Weapons & Endgame”只写五个地点步骤，没有覆盖 Boss board 上的全部特殊遭遇；标题承诺大于正文。
- Five-boss 原素材是 mod 挑战。删除 mod 细节后，页面与普通剧情路线几乎没有独特信息。
- 把长视频里可靠的“按岛升级武器”观察并入 `/bosses`，但价格、伤害、附件效果继续保持未验证；不要把研究用价格表直接发布。
- 如果未来取得当前版本自有武器商店截图，再单独建立 `/weapons`，不要继续复用“all bosses”URL。

### Casino：先证明方法，再让它被索引

- 当前公开图是 Reel of Fortune，不是 roulette room，图文实体错配。
- 正文主要是风险提示和“记录余额/小额旋转”，没有说明视频里真正的物品、移动、保存、输赢与退出顺序。
- 研究只证明起始余额 `$933,546`，它不是物品价格，也不能证明稳定收益或复制漏洞。
- 上线条件：在当前公开补丁用干净测试存档完成至少三轮可复现测试，保存专属截图，记录起始/结束余额、下注额、是否重载、主机模式与失败条件。无法复现则撤页，不把随机赢钱包装成 money route。

## P0 完成标准

1. 不再有两个页面争夺同一明确任务。
2. Handyman 达到 700–1,000 个有效正文词、至少 5 张任务相关图、H2/H3 层级正确。
3. 合并页使用 301，不留 200 薄副本；sitemap、首页入口、Related 链和 canonical 同步。
4. Casino 在复现前 noindex 且不进 sitemap；若复现失败则撤页。
5. 新的内容门禁检查标题兑现度、H1→H2→H3、每篇独有图片和目标页最低信息块，不只检查总词数。
