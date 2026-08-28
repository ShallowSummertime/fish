# 架构

- 绿地公开内容站，采用 React 19 + TypeScript + Vite 的可静态构建单页应用；开发服务器保留 history fallback，部署时需要同等 rewrite 配置。
- 单一 typed content source 维护 creatures、bosses、locations 和 lures。
- 站点信息架构：Home → Hub（Creatures/Bosses/Locations/Lures）→ Detail。
- Creature 的主关系是 lure pool；Location 承载剧情推进、NPC、商店和 Boss。
- 路由：`/`、`/beginner-guide`、`/creatures`、`/bosses`、`/locations`、`/locations/lighthouse`、`/locations/rocks`、`/locations/volcano`、`/guides/reel-of-fortune`、`/lures`、`/bosses/spider-crab`、`/achievements` 与四个信任页，共 16 个预渲染 URL。`src/data.ts` 是唯一的 typed entity source；`localStorage` 分别保存本机 creature 与 achievement checklist，不上传用户进度。
- 素材架构：原视频 source-only；关键帧、联系表和实体事实进入 `research/video-analysis/` 与 `research/asset-knowledge/`。权利未确认的社交视频帧只能研究，公开页使用去 UI/字幕且贴近游戏画面的重建素材。
