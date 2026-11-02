# Fish + Wow Family 统一部署设计

状态：public web v1 静态 MVP 已实现且本地测试、类型检查和构建通过；尚未提交或部署，真实浏览器和生产验证待完成。生产配置、媒体及公开传播权利尚未核实。

## 目标与范围

Fish 保留现有根站、预渲染、SEO、sitemap、五条 Vercel 重定向和真实 404 行为；同一 Vercel project 的静态输出另提供 `/english/`，独立页面标题、描述及 PWA。public web v1 保留课程浏览、语言切换、计划与进度，以及播放器和播放模式；本次 COS 基址保持空，不上传、不公开视频。字幕、逐句跟读、录音和学习包仍在本地产品，未迁移至 public web v1。原始视频、秘密、个人绝对路径、Node 服务及服务端生成能力不迁移；不宣称尚未配置的能力可用。部署静态站与公开 COS 会使资源面向公网：每个课程视频、字幕、翻译和图片须先确认拥有公网分发权，未知即不发布该资源；现有 LAN 私密链接与家长算术门不构成公网鉴权。

## 路由和构建

Fish Vite 根配置和 `scripts/prerender.ts` 保持现有语义。新增独立静态子应用源 `english/`，构建脚本复制/处理其文件至 `dist/english/`，在 Fish 的 `tsc -b && vite build && tsx scripts/prerender.ts` 成功后执行；不清空或覆盖根站 dist。构建期产生的 URL 使用 `/english/` 前缀或从明确的子应用 base 推导，不能使用 Wow 当前根绝对路径。将 `/english` 规范化到 `/english/`；`/english/?lesson=<id>` 是可刷新深链接；仅在引入真实路径式客户端路由时针对明确的英语路由配置回退，未知路径保留真实 404。核对 Vercel redirects 优先级及预览/生产实测，不设全局 SPA catch-all。根 sitemap 不新增英语页面，英语页面不伪装成游戏内容。

## 目录、媒体和字幕契约

以 Wow `data/library-manifest.json` 为本地输入，离线生成白名单静态 `english/data/catalog.json`：版本、levels 的 id/number/name，lessons 的稳定 id/title/type/unit/number、`videoKey`、`hasSubtitle`、`hasChineseSubtitle` 及经过验证的字幕资源引用；按现有消费者需要明确映射 level 信息和总数。禁止序列化 root、sourceFolder、videoPath、subtitlePath、构建机器路径、秘密和任意未审查字段。保留原 lesson ID，避免本地进度被过滤；对 ID 唯一性、空字段和来源对账，缺失/冲突失败而非静默删课。生成器输入路径由执行者提供，不将它嵌入产物；无输入时使用经审查、已提交的安全目录，CI 不依赖源机文件。

本次构建不配置 COS 基址，部署前必须核实 Vercel 环境也为空。未来仅在已确认公网传播权时，公开配置 `WOW_PUBLIC_MEDIA_BASE_URL` 为构建时注入的完整 HTTPS COS/CDN 公共目录 URL（可含子目录，以 `/` 结尾；无凭据、query 或 fragment），配置值本身会公开；空值合法且提示“视频尚未配置”，不得发起 `/media/` 请求。对象键是相对于基址的非空路径，例如 `lessons/<lesson-id>.mp4`；不可含前导斜杠、`.`/`..`、空段、反斜杠、协议或控制字符，各路径段逐段编码后相对拼接，确保 URL 仍在配置目录下；目录列出的 key 与实际上载对象需逐项对应，不能以原绝对文件路径猜测已有对象。视频不存在、403、网络错误时显示明确提示，其他浏览器功能保持可用。运维另行确认 COS 公网读取、HTTPS、CORS（含跨域字幕/资源）及视频 Range/206、Content-Type、缓存；上传和公开权限必须有权利依据。私有素材必须由独立鉴权服务签发短期签名 URL；不得把私有素材直接配置为公开 base。签名服务不在本次范围内。密钥不进入仓库、客户端或日志。

从已获授权的 SRT 离线转换成 `/english/data/subtitles/<id>.en.vtt` 与 `/english/data/cues/<id>.json`（现有 `{lessonId,cues}`，保留时间、序号和文本语义）；中文仅在原始 SRT hash 与翻译条数匹配、文本完整且有权公开时生成 `<id>.zh.vtt`，否则 `hasChineseSubtitle=false`。构建须验证 VTT/JSON 解析、时序、ID 对应、可用性标志与实际文件一致；坏数据失败或明确排除并报告，绝不能凭字幕路径存在声称可用。无字幕时禁用对应字幕及句子练习，加载失败有提示。字幕可放同源静态目录；不把未经授权源素材放入 Git 或产物。

## PWA、状态和降级

manifest 的 `id`、`start_url`、`scope` 均为 `/english/`，图标、shell 和注册 URL 均在该前缀；`/english/sw.js` 注册 scope `/english/`，只缓存自身版本化 shell 和安全静态数据，不截获 Fish、跨域 COS、视频或不存在的服务 API；升级只清理 Wow 自己命名空间的缓存。离线只承诺已缓存 shell/数据，不承诺视频、字幕全量或服务端功能。浏览器 `localStorage` 按 origin 隔离：保留 `wow-family-progress-v1` 和既有状态结构、稳定 lesson ID，在同一 origin 刷新后验证；旧本地服务器和正式域是不同 origin，浏览器不会自动搬迁，除非另做明确的导入/导出功能，本期不承诺跨 origin 迁移。

公共静态版不调用 `/api/reload`、`/api/lesson/*/mp3|pdf|flashcards/*`、`/audio/*`、`/pdf/*`、`/flashcard/*` 或 `/api/packages/*`：本地扫描、FFmpeg 音频生成、PDF、服务端闪卡、Ollama/模型、学习包制作/导出/配音和相应下载均隐藏或显示双语不可用提示，不虚构成功或无限轮询；无公网后端及家长鉴权。录音与逐句跟读仍属于本地产品，public web v1 未提供；未来若迁移录音，需单独验证 HTTPS、设备支持及麦克风权限。无 COS 配置、无字幕、录音权限被拒、离线、服务不存在均有用户可见状态。

## 实现范围与设计差异

本次 public web v1 仅复制纯浏览器状态模块，采用重新适配的静态页面；不迁移字幕、逐句跟读、录音、学习包或未经确认权利的原素材，原课程字幕标志全部为 false。以下清单保留初始设计作为来源参考，不表示各列文件或功能已经迁移。当前实际文件与本地证据见 `progress-unified-site.md`。

## 精确迁移清单（初始设计，非实际完成清单）

以下左侧均为 Wow 工作树相对路径，右侧为 Fish；使用指定文件，不递归复制未列出文件，源工作树只读。所有文件内容及资源公开权利在复制前审核。

- `public/index.html` → `english/index.html`；`tokens.css` → `english/tokens.css`；`public/styles.css` → `english/styles.css`；`public/manifest.webmanifest` → `english/manifest.webmanifest`；`public/sw.js` → `english/sw.js`；`public/icon.svg` → `english/icon.svg`；`public/assets/english-adventure-hero.webp` → `english/assets/english-adventure-hero.webp`。
- `public/app.js`, `i18n.js`, `state.js`, `plan-selection.js`, `flashcard-state.js`, `training-state.js`, `training-planner.js`, `playback-evidence.js`, `listen-source-transition.js`, `viewing-reminder.js`, `lesson-title.js`, `recording-session.js`, `segment-repeat.js`, `recording-cleanup.js`, `recording-feedback.js` → 各自 `english/` 同名文件，调整 URL、静态数据适配与降级；审查静态 import 引用并保持完整。
- `data/library-manifest.json` → 仅作为本地生成输入，白名单输出 `english/data/catalog.json`；本机 SRT 和 `data/subtitles-zh.json` → 仅按上述权利和校验条件生成 VTT/cues。源清单及翻译原文件不直接复制。若源素材不可取得，记录缺项，不伪造字幕。
- 可复用纯浏览器测试 `test/i18n.test.mjs`, `lesson-title.test.mjs`, `plan-selection.test.mjs`, `recording-feedback.test.mjs`, `recording-session.test.mjs`, `state.test.mjs`, `training-flow.test.mjs`, `training-state.test.mjs`, `viewing-reminder.test.mjs`, `flashcard-state.test.mjs` → `test/english/` 同名，适配 import；审查 fixtures 依赖，明确逐文件迁移所需无敏感 fixture。服务端测试不声称覆盖静态版。
- Fish 新增 `scripts/build-english.mjs`、`scripts/generate-english-catalog.mjs`、`scripts/assert-english-static.mjs` 和必要的测试文件；修改 `package.json` 构建/测试链、按需修改 `vercel.json` 的唯一 `/english` redirect；lockfile 仅在确有依赖变化时更新。生成内容与输入来源应可复现，构建后校验最终 `dist/`。
- 不迁移 `server.mjs`、`lib/`、`scripts/build.mjs`、`public/learning-package.html`、`public/learning-package.js`、`public/learning-package.css`、`public/assets/word-art/*`、原始 MP4、缓存、输出及密钥；这些对应本地服务/学习包，不应留死入口。若后续确需服务端功能，单独设计后端与鉴权。

## A–E 完成判据与验证

| 项 | 范围与验收 |
|---|---|
| A 多表面 | Fish 与英语页桌面/移动、中文/英文、刷新及 `?lesson=` 深链；可用课能进入播放器，缺配置有提示。 |
| B 持久化 | 保持当前同源 localStorage 模型与 lesson ID；刷新验证计划、进度、收藏；跨 origin 不自动迁移。 |
| C 公开页面 | 根站预渲染、sitemap、重定向及真实 404 不回归；英语页面独立 title/description/manifest，不加游戏 sitemap。 |
| D 数据完整性 | 目录字段白名单、ID 唯一及数量对账、字幕标志与文件一致；扫描源码和最终 dist 的绝对路径、秘密及视频文件，单独确认分发权。 |
| E 跨功能 | `/english/` 资源/manifest/SW scope 隔离；COS Range、跨域与失败提示；字幕、录音、服务端功能降级和 Fish 路由共同回归。 |

实施后运行现有 `pnpm test`、`pnpm typecheck`、`pnpm build` 与 `git diff --check`，加静态 catalog/schema、路径/秘密扫描、COS URL 边界、字幕一致性、服务端接口零请求及 PWA scope 测试；浏览器在真实本地构建上验证移动/桌面、语言、深链、状态、录音拒绝和媒体失败。COS 已配置时验证真实授权样本可播放、seek 的 206 和字幕；未配置时只能验降级，不能报告播放通过。记录具体命令、退出码和证据。

## 回滚与正式验证

上线前保存当前 production deployment ID、对应 Git SHA、Vercel project/域名与环境配置的非敏感记录；不修改 COS 对象或删除原部署。仅在后续获准上线阶段按精确文件范围提交，并以 Vercel 上一次已验证 production deployment 回滚，确认域名指回且缓存更新；保留新版本证据以排障，回滚不清除浏览器本地状态。上线后核实生产域响应、根站重点页面/预渲染/旧重定向/真实 404、英语深链与双语、manifest 和 SW 控制范围；检查网络请求不落旧根 API。配置真实 COS 后验证有权样本 GET、Range/206、CORS、视频播放/seek、字幕与错误态；验证浏览器存储刷新、麦克风授权/拒绝和移动布局。记录部署 ID/SHA、时间、URL、实际响应和截图；无配置或无权利时明确未验证，不以构建或部署成功替代线上证据。
