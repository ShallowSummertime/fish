# 决策记录

## DEC-20261102-04：家庭访问码登录在本设备保持 30 天

- 状态：accepted
- 日期：2026-11-02
- 决定：家庭访问码成功登录后签发固定 30 天的 HttpOnly/Secure/SameSite=Strict 会话，不做滑动续期；COS 播放地址仍只签发 300 秒。
- 依据：当前阶段只有一个家庭访问码，12 小时会导致家长和孩子频繁重复输入；延长登录会话能直接降低使用摩擦，又不把 COS 长期凭据或视频地址暴露给前端。
- 风险与复查：借用设备会保留更久访问权，不再使用时需主动退出；后续接入家长账号和设备管理时，以可撤销的账号会话替代本方案。

## DEC-20260827-01：按 lure pool 组织 creature 内链

- 状态：accepted
- 日期：2026-08-27
- 决定：Creature 详情页与 lure hub 互链；地点页不把鱼种说成地理限定池。
- 证据：Steam 社区成就攻略明确指出捕获结果由 lure 决定。
- 影响：页面更符合游戏机制和“what lure catches X”搜索意图。

## DEC-20260827-02：主线使用五个 locations

- 状态：accepted
- 日期：2026-08-27
- 决定：Lighthouse + Forest + Desert + Rocks + Volcano 为主线地点；Developer Island 只作隐藏测试区提示。

## DEC-20260831-03：先做有一手图证的 Boss 深度页，不追随竞品批量拆实体

- 状态：accepted
- 日期：2026-08-31
- 背景：howtofish.org 已扩到 127 个 URL，howtofishguides.wiki 扩到 36 个 URL；本站只有 19 个索引 URL，但已有 Forest、Desert、Rocks、Volcano 的用户自有视频和关键帧资料。
- 备选方案：一次拆出 49 个 creature 页面；复制竞品 calculator；先扩四个视频证据最完整的 Boss 页面。
- 决定：先发布 Giant Piranha、Pufferfish、Albatross、Mutated Bowhead Whale 四个深度页。Creature 详情页按证据量分批发布；Killscore 规则未完整复验前不复制 calculator。
- 证据：`.rankup/topics/competitor-analysis-2026-08-31.md`；生产 Sitemap 19 URL；竞品 Sitemap 分别为 127、36、14、13 URL。
- 影响：用原创实战信息增益避开域名权重正面对撞，同时防止为追 URL 数量制造低质页。
- 复查条件：四个 Boss 页发布并获得至少 28 天 GSC 查询数据，或游戏补丁改变 Boss 机制。
- 关联：`.rankup/plan.md`、`.rankup/keywords.md`。
