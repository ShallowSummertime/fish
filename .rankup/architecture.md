# 架构

- 绿地公开内容站，采用 React 19 + TypeScript + Vite 的可静态构建单页应用；开发服务器保留 history fallback，部署时需要同等 rewrite 配置。
- 单一 typed content source 维护 creatures、bosses、locations 和 lures。
- 站点信息架构：Home → Hub（Creatures/Bosses/Locations/Lures）→ Detail。
- Creature 的主关系是 lure pool；Location 承载剧情推进、NPC、商店和 Boss。
- 路由：20 个预渲染 URL，其中 19 个进入 sitemap 并允许索引；`/guides/casino-money-route` 仅供直达核验、使用 `noindex,follow` 且不出现在公开导航。五个已合并的旧 `/guides/*` URL 由 `vercel.json` 永久重定向到 Beginner、Bosses、Spider Crab 或 Reel of Fortune 的对应段落。`src/data.ts` 的 `pageMeta` 是预渲染真源，`public/sitemap.xml` 是索引清单；`localStorage` 分别保存本机 creature 与 achievement checklist，不上传用户进度。
- 素材架构：原视频 source-only；关键帧、联系表和实体事实进入 `research/video-analysis/` 与 `research/asset-knowledge/`。权利未确认的社交视频帧只能研究，公开页使用去 UI/字幕且贴近游戏画面的重建素材。
