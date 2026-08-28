# 固定资产库操作规范

固定资产库的默认位置是 `/Users/wanglu/Desktop/how to fish/固定资产库`。它是素材的可追溯副本与目录，不是剪切箱：任何原件都**不能移动或删除**，包括桌面上的视频、用户提供的截图与仓库中的研究文件。

## 分类与目录

归档工具使用下列稳定分类（目录前缀也表达处理阶段）：

- `00-catalog/`：清单、CSV、SHA-256 校验表和归档说明。
- `01-raw/user-provided/beginner-guide/`：新手指南的用户提供截图。
- `01-raw/user-provided/creature-gallery/`：用户自有的生物图鉴截图、离线页面和裁切坐标脚本；允许用于 `/creatures` 页面。
- 原始视频**不进入资产库目录**：第一座岛、攻略 1 和所有待审视频仅以原始绝对路径、字节数与 SHA-256 指纹登记在目录中。任何 `MP4`、`MOV` 或 `WEBM` 出现在可归档来源树中都会使工具停止；必须把视频显式登记为 source-only，只归档其分析衍生图。
- `02-analysis/island-1/` 与 `02-analysis/guide-1/`：由原视频采样生成的关键帧、联系表、分析笔记；`entities/` 保存去掉上下字幕区后的实体证据裁切，并保留来源帧关系。
- `03-reference/game8/`：Game8 参考图与说明。
- `03-reference/how-to-fish-weapons/`：离线武器资料包、数据脚本与配套截图。该资料混合社区攻略、第三方游戏截图和官方 Steam 截图，只能用于研究与交叉核验。
- `04-project/source-packets/`：站点研究源包。
- `05-published/public-images/`：站点当前使用的原始或生成图片。

目录结构以来源分区并保留来源目录下的相对文件名，避免同名文件互相覆盖。所有 `archivePath` 均相对于资产库根目录。

## 权利与可发布性

- Game8 图片，以及社交媒体/手机界面来源且权利不明的素材，只能作为 `reference-only` 研究依据，不可直接发布。
- 第一座岛的用户拥有录像保留在原路径；由其生成、并经审核的关键帧/实体图可发布。站点自有或生成的 `public/images` 素材也可发布。
- 新手截图是用户提供的材料，但原始截图在确认所有权前不可发布。可据其内容重新制作自有图示。
- 生物图鉴资料包由用户明确确认为自有图片；原始截图可发布，站点使用的 WebP 优化版必须保留到原始 PNG 的 `derivedFrom` 关系。
- 攻略 1 的视频、其关键帧、联系表与分析笔记均为研究专用：其中包含手机/社交界面、字幕，且权利未确认。
- `pending/unreviewed` 记录只说明发现了素材，不代表已获得权利、完成分析或可发布。

发布前必须同时查看资产库清单中的 `rights`、`publishability`、`status` 和 `pageUsage`；没有明确 `publishability: true` 的文件不得进入公开页面。衍生文件必须保留 `derivedFrom` 指向其原始素材或上游目录。

## 自动入库流程

以后每次分析新增素材时：

1. 新的研究衍生物直接放入 `research/video-analysis/<主题>/`；整个目录会在下次运行时自动入库，新主题默认仅研究用途，直到明确复核权利。此目录只能包含分析笔记、关键帧和联系表，不能包含视频。新的原件来源则在脚本的 `sourceGroups()` 中增加一个显式来源组、权利说明和页面用途。
2. 视频原件一律 source-only：只登记原始路径、大小、SHA-256 指纹和 analyzed/pending 状态，绝不复制、移动或删除。对每段完成分析的视频，抽取相关关键帧/实体截图并写入 `research/video-analysis/`，再关联实体、时间戳、攻击方式、价格、核验状态和覆盖缺口。
3. 执行正常入库；工具会建立缺少的分类目录、用写时克隆优先复制轻量原图与衍生物、更新目录和校验表。大于 100 MB 的非视频文件必须支持 APFS 写时克隆；不支持时工具会停止，绝不悄悄做昂贵的完整复制。
4. 复核清单中的 `derivedFrom`、权利和页面用途后，才可以提升素材状态或发布。
5. 归档完成后执行校验模式。原件始终留在原位置；资产库中的副本也不应手工改名或编辑。

从仓库根目录运行：

```sh
node scripts/build-asset-library.mjs --archive-root "/Users/wanglu/Desktop/how to fish/固定资产库"
node scripts/build-asset-library.mjs --archive-root "/Users/wanglu/Desktop/how to fish/固定资产库" --verify
```

也可使用 `pnpm asset-library` 与 `pnpm asset-library:verify`。若用其他目录，必须传入同样的 `--archive-root` 参数；资产库不得位于本仓库或任何被归档来源目录之内。

## 校验与可追溯性

`00-catalog/asset-manifest.json` 是机器可读的主清单，按稳定路径排序，逐文件记录来源绝对路径、归档相对路径、媒体类型、角色、状态、权利、可发布性、页面用途、字节数、SHA-256/`fingerprint` 与衍生关系。当前资产使用不随物理版本目录变化的逻辑 `asset:` ID；内容更新产生的旧副本保留为 `archived/superseded`，并使用独立的 `asset-history:` ID。历史记录的 `sourcePath` 为 `null`，通过 `historicalProvenance`、`logicalArchivePath` 与 `supersededBy` 指向当前逻辑资产。知识条目不能引用历史 ID。CSV 便于人工筛选；`checksums.sha256` 列出当前和所有已保留历史副本。`--verify` 会检查每份副本（包括历史版本）是否存在且校验和一致，并以 `lstat`/`realpath` 验证所有 source-only（包括 pending）视频仍是 Desktop `how to fish` 根目录内的普通文件、字节数和指纹，不要求也不会寻找视频副本。

`research/asset-knowledge/first-island.seed.json` 与 `research/asset-knowledge/weapons.seed.json` 是可审阅的实体知识种子；工具会分别归档并合并输出 `00-catalog/knowledge-manifest.json` 与 CSV。每条实体都支持岛屿/地点、武器、NPC、鱼类/生物、Boss、武器附件、饵料、物品和商店等分类，并记录规范名、别名、图像/证据资产 ID、可选的 source-only 视频资产 ID 与时间戳、攻击方式、买卖价与适用语境、解锁/用途、核验状态/日期、备注及页面用途。未知值必须是 `null`，核验状态只能是 `verified` 或 `unverified`；不得猜测价格、精确名称或战斗数值。每条已核验实体至少需要一个可追溯的图像、证据或 source-only 视频资产 ID；自由文本 `sourceVideo` 只是说明，永远不能单独作为核验依据。工具会验证所有图像、证据和视频资产 ID 都存在于文件清单中。

社区资料中的具体数值使用实体内的 `observations` 保存。每条观察都必须记录字段、原始值、来源资产/URL、采集日期、语境和状态；`reference-only` 观察可以完整保留价格、伤害、升级阶梯等待核验数据，但不能自动提升到实体的正式价格、伤害或公开页面用途。只有获得当前补丁的自有游戏截图或同等可靠证据后，才能把观察升级为 `verified` 并更新正式字段。

知识目录中的 `coverageGaps` 是待补证据列表，而不是可发布的事实。第一座岛目前可以可靠回答 Lighthouse、Lighthouse Keeper、Clam、Fishing rod、Empty Beer Can、Spider Crab、Shell、Boat Keys、Radar 和 Reel of Fortune 的可见身份/用途；另有来自 Patch 1.0.8 原片的 Brass Knuckles（$24）、Knife（$45）与 Hot Dog（$1）商店截图。这三个价格只作为带版本语境的历史观测，发布前必须按当前补丁复核。武器资料包补充登记了 Dynamite、Pistol、Shotgun、SMG、Sniper Rifle、Assault Rifle 和六种附件，以及社区声称的价格、伤害和升级阶梯；它们全部保持 `unverified`、`reference-only`，配图也不可直接发布。Game8 图只可作参考证据；攻略 1 所见的 Drip 仍只保留为 `unverified`、`research-only`。所有未证实的鱼名、附件、价格和战斗指标保持为空，先补可追溯证据再更新种子。

## 路径安全

工具会以 `lstat` 拒绝来源树、资产库根目录、目标父目录和目标文件中的任何符号链接，并在创建目录后再次以 `realpath` 确认真实父目录仍位于真实资产库根目录内。检测到符号链接或路径逃逸时会停止，不会删除、跟随或替换该链接。资产库根目录可以首次创建，但不能位于仓库或任何来源目录之内。

正常模式可重复运行：相同文件不会再复制；若同一来源路径的内容更新，工具会把新副本放在同分类下的 `versions/<SHA-256 前缀>/`，保留原副本而不覆盖。它也不会删除资产库中本工具未登记的项目。
