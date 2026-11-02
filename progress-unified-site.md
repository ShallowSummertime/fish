# Autopilot Progress — unified Fish + Wow Family site

## Task

把 Wow English 网站和 fish 代码库合并为一个仓库，在 Vercel 的 `howtofishwalkthrough.com` 上通过不同路径访问，并让视频可从腾讯云 COS 加载。

## Type

feature + deploy (cross-repository, deployed-required lane)

## Loop Goal

`fish` 成为唯一部署仓库：现有 How to Fish 路由保持不变，Wow Family 在 `/english/` 可访问；英语课程清单不包含本机路径，视频 URL 使用可配置的腾讯云 COS 基址，未配置或本地专属功能有明确降级。合并后的本地测试/类型检查/构建、Vercel 正式部署、生产 E2E 与独立审查全部通过；不复制原始视频、不提交密钥、不覆盖两个共享工作树中的未归属改动。

## Budgets

| iterations | repair cycles | elapsed | external cost |
|---|---|---|---|
| 4/10 | 2/6 | <240m | 0 |

## Feature Completeness

- A 多表面：根站桌面/移动端不回归；`/english/` 桌面/移动端、中文/英文、深链接均验证。
- B 持久化：课程计划与进度继续使用浏览器本地存储；子路径迁移不得改变现有状态模型。
- C 公开页面：根站继续使用当前预渲染 SEO；`/english/` 有独立 title/description/manifest，默认不进入游戏站 sitemap，避免混淆搜索意图。
- D 数据完整性：课程清单只包含公开字段、课程 ID、字幕可用性和 COS 对象键；禁止本机绝对路径进入构建产物。
- E 跨功能：Vercel 路由、PWA scope、资源路径、播放器、字幕、录音和现有 fish 404/redirect 行为均纳入回归。

## Phase Status

| Order | Phase | Skill | Role | Gate | Status | Evidence |
|---|---|---|---|---|---|---|
| 1 | investigate | autopilot + rankup | maker | 两仓、Vercel、运行时边界和版权/秘密边界明确 | ✅ | L0: fish 是已部署 Vite 静态仓；Wow 是本地 Node/PWA 且工作树很脏；生产域由 Vercel 服务 |
| 2 | design | autopilot + rankup | maker | 路由、静态数据、COS 契约、降级与迁移方案完整 | ✅ | L0：检查两仓配置、清单及接口；设计见 `docs/unified-wow-deployment.md`；未实施或验证 |
| 3 | implement | rankup stage 3 | maker | public web v1 实现 | ✅ | L1：241 条脱敏课程、批量计划/清空、进度、双语与三种播放模式；字幕及本地服务明确不可用 |
| 4 | local-verify | project tests | maker | test/typecheck/build/diff-check 全绿 | ✅ | L2：pnpm test（含 build、29 根站路由、4 个英语测试和 241 课产物检查）、pnpm typecheck、git diff --check 通过；独立 checker 完成桌面/390px 浏览器验收 |
| 5 | deploy-1 | GitHub + Vercel | landing owner | scoped commit 为 origin/main ancestor，Vercel production ready | ⏳ | |
| 6 | e2e-1 | browser | independent checker | 正式域根站与 `/english/` 用户旅程通过 | ⏳ | |
| 7 | review | code review | independent checker | 无 blocking finding | ✅ | public web v1 范围内无 blocking finding；P2 清空 today/week 已修复并复核 |
| 8 | deploy-2 | GitHub + Vercel | landing owner | 按 review diff 分类完成或 N/A | ⏳ | |
| 9 | e2e-2 | browser | independent checker | 最终生产版本通过或 no-diff N/A | ⏳ | |
| 10 | rankup-finalize | rankup | controller | INDEX/plan/infrastructure/releases 反映真实状态 | ⏳ | |
| 11 | issue-finalize | autopilot | controller | N/A：任务开始时未发现关联 issue | ⏳ | |
| 12 | cleanup | autopilot | controller | 临时文件/租约/会话清理，远端 ancestry 证明 | ⏳ | |

## Acceptance Ledger

| Item | Identity | Evidence target | Status |
|---|---|---|---|
| 根站不回归 | `https://howtofishwalkthrough.com/` + sitemap routes | L3 production | pending |
| 英语应用子路径 | `https://howtofishwalkthrough.com/english/` | L3 production | pending |
| COS 媒体契约 | sanitized catalog + configurable base URL + sample URL resolution | L2 build / L3 configured response if available | pending |
| 隐私与归属 | no local paths, secrets, or source videos in Git/build | L2 artifact scan | passed；Vercel 未配置 `WOW_PUBLIC_MEDIA_BASE_URL`，本次不公开视频 |

## Delivery Ledger

| Delivery SHA | Exact paths | Remote ancestry |
|---|---|---|

## Failure Log

| Iteration | Failure Signature | Type | Tried | Why | Next | Repeat |
|---|---|---|---|---|---|---|
| 0 | browser/opencli unavailable | environment-issue | `opencli doctor` | CLI not installed | prefer GitHub/Vercel deployment API and use another browser driver only for final UI verification | 1 |

## Telemetry

iteration 4; agents 0/4; maker complete; checker complete; external spend 0.

## Lessons Learned

- The deployed Fish repository is the safe consolidation target; the Wow worktree contains extensive uncommitted product work and must remain untouched as the source of truth during migration.

## Iterations

- 0: scoped both repositories, live domain, deployment path, and the static/COS boundary.

- 1: 完成统一部署设计（L0 静态检查）；下一步实施静态子应用、白名单目录及 COS/字幕契约，先确认各资源公开传播权；构建和生产验收均待执行。

- 2: 实现静态 MVP 与本地 gates。课程清单 241 条，字幕全部标不可用；未迁移录音、学习包及服务端生成功能。默认 COS 配置为空，真实播放/CORS/Range、公开传播权、浏览器响应式和生产状态未验证。下一步：独立本地浏览器验收、核实资源权利与 COS 对象，再按后续阶段部署。首次测试因根站断言固定为 5 条重定向失败，已改为单独校验 5 条 guide 及英语重定向；第二次 jsdom 测试因 Node 的 navigator 只读失败，修正测试初始化后全绿。

- 3: 补齐课程多选批量加入今日计划、确认清空且保留学习进度，以及播放器三种播放模式、全屏尝试播放、退出状态和播完重播；状态沿用浏览器存储。`pnpm test` 通过（4 个根站测试、29 条预渲染路由、4 个英语测试及 241 课产物检查），`pnpm typecheck`、`git diff --check` 通过。jsdom 模拟全屏和播放事件不等于真实浏览器/触屏或 COS 播放验收；继续待独立浏览器检查。

- 4: review P2 已修复：清空按钮在今日或本周有已添加课程时可用；确认后调用 `clearAllPlanContent` 清两份计划及对应 planProgress，保留 completed/watched，取消不改状态。此次定位为 public web v1：保留已实现的纯前端关键功能；字幕、逐句跟读、录音和学习包仍在本地产品，未迁移。COS 基址本次保持空，不上传、不公开视频；未来公开直链须确认传播权，私有素材须单独接入鉴权及短期签名，不可直接填公开 base。生产环境配置尚未核实。

- 5: 独立 checker 在 public web v1 范围内确认无 blocking finding；本地真实构建覆盖根站、英语课程库、Garden 搜索、批量计划、深链、双语、无 COS 降级及 390px 无横向溢出。Vercel 项目环境变量检索确认不存在 `WOW_PUBLIC_MEDIA_BASE_URL`，因此首次正式部署保持空媒体。
