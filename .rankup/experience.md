# 项目经验

- **[2026-08-28] 移动端主导航规则必须与文章目录隔离**

  全局移动端 `nav` 选择器会把攻略页的 `.quick-nav` 也设为顶部绝对定位导航，造成目录覆盖 H1。Rocks 页面在 390px 浏览器 QA 中复现；通过末加载的页面样式将 `.quick-nav` 恢复为 `position: static` 后，页面宽度保持 390px 且目录回到首张图之后。后续重构应把全局规则收窄为 `header > nav`。

- **[2026-08-27] 以 lure progression 而非地点固定池组织 regular creature 内容**

  站点将主线 locations 与 creature pool 分开建模；locations 用于路线和剧情，lures 用于 collection intent。游戏事实基线来自项目内已记录的 Steam Community guides。
- **[2026-08-27] 技术完成不等于攻略内容完成**

  生产站八条 sitemap 路由均可抓取且元数据、404、构建断言通过，但所有页面仍为零图片；Beginner 与 Spider Crab 的可见正文分别只有约 164 与 151 词，且出现面向站长的搜索意图话术。今后的内容完成门禁必须检查玩家能否仅靠本页完成任务：版本、前置条件、逐步操作、截图、成功状态、失败恢复、奖励/下一步和来源缺一不可。
