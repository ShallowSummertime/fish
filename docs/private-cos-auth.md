# Wow Family 私有 COS 鉴权设计

状态：2026-11-02 已完成本地实现；尚未部署或进行真实 COS 播放验收。此前 `unified-wow-deployment.md` 中公共媒体配置属于 public web v1 的历史范围，本设计取代其未来公开媒体方案，不代表已上线。

## 边界与现状

- `/english/` 是独立静态应用，目录 `english/data/catalog.json` 当前有 241 课，键为 `lessons/<id>.mp4`；客户端 `english/app.js` 目前从 `config.json` 和 `mediaUrl` 拼公开地址，自动下一集也走该路径。`scripts/assert-english-static.mjs` 当前禁止所有 `/api/` 字符串，需改为只允许本设计三个同源端点并继续禁止旧端点和公开回退。
- 用户提供：私有桶 `english-1257786947`，`ap-hongkong`，默认域名 `https://english-1257786947.cos.ap-hongkong.myqcloud.com`；CORS 允许生产源 `https://howtofishwalkthrough.com` 的 GET/HEAD/Range；桶为空，自定义媒体域名未完成。上述为用户提供的状态，未由本轮联网验证。
- 登录保护签发接口，签名 URL 本身是有效期内的 bearer 凭证，可被已登录者转发；登出或会话撤销不能撤回已签发 URL。此方案不是 DRM，也不隐藏浏览器网络面板中的地址；COS 预签名 URL 包含 `q-ak`（SecretId 标识）和短期签名参数，这是 bearer 凭证的一部分，并非 SecretKey。SecretKey 和长期签名能力不得进入前端；测试、日志和文档不得输出真实 q-ak 或完整签名 URL。如需隐藏该标识，需要另行设计媒体代理。仅在明确有权分发的素材上启用。
- 默认域名可能受腾讯云 2024-01-01 后新建桶浏览器预览限制，签名成功不等于 video 可播放。须通过自定义域名及真实对象实测解决或确认；不得以签名、构建、模拟器或部署成功代替验证。

## 数据流与策略

1. 用户在 `/english/` 输入高熵家庭访问码（建议随机生成至少 32 字节并以 base64url 表示，不接受低熵口令）。仅服务端保存其 UTF-8 原文的 SHA-256 十六进制摘要；校验不 trim、不改大小写；输入以 UTF-8 字节计 1–256 字节。先检查配置摘要严格为 64 个十六进制字符，计算固定 32 字节摘要，用 `crypto.timingSafeEqual` 对固定长度 buffer 比较。日志和错误不包含原文、摘要、Cookie 或签名 URL。
2. Vercel Node Function 使用维护中的 `jose` 的 `SignJWT` / `jwtVerify` 生成及验证 HS256 签名会话：固定 issuer `wow-family`、audience `wow-family-english`、subject `family`、iat、exp；限制 algorithms 为 HS256，严格验证所有必需 claims 和最大年龄，不能从 token 选择算法。会话最长 12 小时，不自动滑动；会话单独使用至少 32 随机字节的 secret（base64url 解码验证字节长度），与访问码、COS 密钥均不同。`jose` 是密码协议库，应用负责授权、cookie 和撤销策略。
3. Cookie 名 `__Host-wow_session`：`Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=43200`，无 Domain；响应只经 HTTPS。无状态方案无法单独撤销某一设备：登出清除本机 cookie；泄漏时轮换 session secret 使所有会话失效，必要时同步轮换访问码。已有签名 URL 最多存续 300 秒。
4. 播放签名请求仅接受目录中的 `lessonId`；服务端从随函数部署的同一份 `english/data/catalog.json` 构造不可变 Map，启动校验 ID 唯一、每条 key 精确满足 `lessons/${id}.mp4`，重复/坏目录配置失败关闭。禁止从客户端接受 key、URL、bucket、region 或 domain。导入目录时需通过 Vercel `functions` 的 `includeFiles` 显式包含文件，构建产物验证实际函数包能读取目录，避免本地成功而线上遗漏。
5. 服务端 `cos-nodejs-sdk-v5` 的 `getObjectUrl` 使用固定 bucket/region、服务端 key、`Sign: true`、`Expires: 300`、精确对象 key、GET；返回 URL 和服务器签名截止时间。确认 SDK 版本 API、签名 host 与 query 参数实际匹配；自定义域名通过 SDK 的 Domain 选项签入，不能事后改写 URL host。不要 HEAD 探测当作已存在：签发本身不请求 COS，缺对象由播放器错误处理。URL `expiresAt` 是签名到期时间，不保证视频中途的后续 Range 请求可用。
6. 每次进入课程或自动切下一课都调用签名 API，等待响应后设置 video.src；请求竞态用递增令牌或 AbortController 丢弃旧课程响应。长视频后续 Range、seek 或重播遇签名过期时，在会话有效前提下重新签发并恢复最近播放时间与播放/暂停状态；每次用户操作最多一次有界自动刷新，失败显示重试，避免循环请求。不能无限预取和持久化 URL；播放完清理引用。全屏、进度、播放模式与浏览器自动播放阻止提示保留。
7. 所有 API 响应包括错误均 `Cache-Control: no-store, private`、`Pragma: no-cache`；请求 `fetch(..., {credentials:'same-origin', cache:'no-store'})`。禁止缓存 signed URL、token 和鉴权响应到 localStorage、Cache API、日志或分析事件。`english/sw.js` 只处理列出的 shell GET，明确排除 `/api/` 和跨域视频；更新 cache 版本以撤掉旧 shell/config，生产验证老 SW 升级。COS 对象本身的缓存与授权需独立核验，不能因 API no-store 假定对象不会被浏览器或中间缓存保存。

## 同源与接口契约

三个接口都只接受 POST、`Content-Type: application/json`（可带 charset=utf-8），最多 1024 字节实际流式读取（包括无或伪造 Content-Length，超限立即停止），只接受各接口规定字段、合法 JSON object，拒绝数组和额外字段。响应 JSON UTF-8，统一 `{ "error": { "code": "..." } }`，不得回显输入或供应商异常；无跨域响应头。对所有 POST 严格检查 `Origin` 精确等于服务端配置的 `WOW_APP_ORIGIN`，缺失、`null`、不匹配均 403，且使用 `Sec-Fetch-Site` 若存在须为 `same-origin`；不能信任 Host/X-Forwarded-Host 推导目标源。非浏览器客户端必须显式发送正确 Origin。生产和预览分别配置真实源；配置缺失或非 HTTPS origin 返回 503，不能用生产源通配预览。非 POST 405 并带 `Allow: POST`；错误 415/413/400 分别为 `UNSUPPORTED_MEDIA_TYPE`/`BODY_TOO_LARGE`/`INVALID_REQUEST`；同源校验失败 403 `FORBIDDEN_ORIGIN`。错误顺序及配置检查在测试固定，任何失败均不签发。

| 路由 | 请求 | 成功 | 其他错误 |
|---|---|---|---|
| `POST /api/english/login` | `{"code":"..."}` | 200 `{"authenticated":true}` 并设置 cookie | 错码 401 `INVALID_CREDENTIALS`；安全配置缺失/无效 503 `NOT_CONFIGURED` |
| `POST /api/english/logout` | `{}` | 200 `{"authenticated":false}`，同属性删除 cookie；已过期/无会话也成功 | 源、方法、格式错误按通用规则；无 session secret 也可清 cookie |
| `POST /api/english/playback` | `{"lessonId":"<catalog id>"}` | 200 `{"url":"https://...","expiresAt":"<ISO 8601 UTC>"}` | 无、失效或篡改会话 401 `UNAUTHENTICATED`；不在目录 404 `LESSON_NOT_FOUND`；配置缺失/无效 503 `NOT_CONFIGURED`；签名失败 502 `SIGNING_FAILED` |

UI 区分 401 登录/会话过期、403 源校验失败、404 课程不存在、503 未配置，以及网络/签名/媒体失败；中英文可读提示，不展示内部细节。正确登录后重试当前课程；登出清除播放器当前 URL。密码输入框有 label、状态 aria-live、禁用重复提交及可见错误。服务端签发成功不能分辨对象不存在、COS 403、CORS 或默认域名预览限制；HTML video 错误统一媒体失败，不能虚称具体原因。

登录接口没有可靠的分布式限流存储；高熵随机码是本方案抵御猜测的前提，UI 禁用重复提交不是安全限流。上线前评估 Vercel 防火墙/持久化限流能力并记录证据；不能用 serverless 内存计数宣称全局限流。访问码泄漏需轮换。严格 Origin + SameSite 防跨站请求，但不能防同源 XSS；维持既有输出转义并审查 CSP。

## 配置与密钥元数据

仅配置 Vercel 服务器环境（Production/Preview 分离），绝不加 `VITE_`、写入源码、客户端构建产物、Git 或日志。任何必要项缺失、格式无效时返回 503，不退回 `WOW_PUBLIC_MEDIA_BASE_URL`。

| 环境变量 | 用途及约束 | 管理与轮换 |
|---|---|---|
| `WOW_APP_ORIGIN` | 当前部署的精确 HTTPS origin，生产 `https://howtofishwalkthrough.com`，无路径/query/fragment；每个 preview 如无法固定且可信则禁用登录 | 非密钥；环境隔离 |
| `WOW_FAMILY_CODE_SHA256` | 高熵家庭访问码原文 UTF-8 SHA-256，64 位 hex | secret；站点所有者在本机安全生成并单独交付访问码；泄漏轮换摘要与访问码 |
| `WOW_SESSION_SECRET` | 独立随机 secret，base64url 解码 ≥32 字节 | secret；泄漏轮换使所有旧会话失效 |
| `COS_SECRET_ID`, `COS_SECRET_KEY` | 专用 CAM 子身份服务端凭据 | secret；专人管理，定期及泄漏时轮换，禁用旧密钥后验证 |
| `COS_BUCKET`, `COS_REGION` | `english-1257786947`, `ap-hongkong` | 非密钥；严格校验目标资源 |
| `COS_MEDIA_DOMAIN` | 可选 HTTPS origin；空时使用 SDK 默认 COS 域名；配置时必须是已绑定且证书有效的明确域名，无凭据、路径、query、fragment | 非密钥；切换前验证 SDK 签名 host、TLS、私有访问、CORS、Range 和浏览器播放 |

CAM 最小权限目标仅允许此桶 `lessons/*` 的 `cos:GetObject`；不允许列桶、写入、删除、管理及其他桶。HEAD 是否需要额外 action、签名 Range 行为、腾讯 CAM 资源 ARN 格式和 SDK Domain 入参随实际官方文档及部署实测确认；不要猜测策略已生效。Vercel 输出只记录变量名、环境、责任人、轮换日期及是否配置，绝不记录值或哈希。鉴权配置、CORS、桶私有属性、文件权利和对象上传由操作方另行确认；不因此自行上传。

## 精确实施清单

- 新增 `api/english/login.js`, `api/english/logout.js`, `api/english/playback.js`；新增 `lib/english/auth.js`, `lib/english/http.js`, `lib/english/catalog.js`, `lib/english/cos.js`，集中校验、会话和签名，浏览器不引用服务端模块。
- 修改 `english/app.js`, `english/index.html`, `english/styles.css`：登录、登出、签发、续签及双语状态；保留既有学习/播放器逻辑。已删除 `english/media.js`，不再产生公开媒体 URL；修改 `english/sw.js` shell 白名单及版本。
- 修改 `scripts/build-english.mjs`：移除 `WOW_PUBLIC_MEDIA_BASE_URL`、不生成含公开基址的 `config.json`；修改 `scripts/assert-english-static.mjs`：允许明确的三个新 API 并禁止旧接口、公开基址和 secret；移除旧 config 引用及构建产物。更新 `test/english/app.check.mjs`，新增 `test/english/auth.check.mjs`, 以及必要真实浏览器 E2E；添加 `jose` 和 `cos-nodejs-sdk-v5` 到 `package.json` / lockfile，锁定版本；修改 `vercel.json` 精确 include catalog，不添加全局 rewrite。
- 修改 `docs/unified-wow-deployment.md` 标注历史方案已被本设计取代；上线后按真实证据更新 `.rankup/infrastructure.md`, `.rankup/integrations.md`, `.rankup/secrets.md`, `.rankup/INDEX.md`（仅元数据），以及任务 checkpoint。以上为实施清单；部署和项目平台记录仍待真实验证。

## A–E 验收与验证

| 项 | 验收与证据 |
|---|---|
| A 多表面 | 桌面/移动、中文/英文，未登录、错码、登录、登出、过期、课程深链、自动下一集、循环、全屏、断网与媒体失败；实际浏览器截图及网络证据。 |
| B 持久化 | 登录 cookie 刷新有效而过期失效；既有 localStorage 计划/进度/收藏保持，登出不删学习记录；不承诺跨设备或跨 origin。 |
| C 公开页面 | Fish 根站预渲染、sitemap、旧 redirects、真实 404、`/english` redirect、PWA 和深链均回归；API 不改变根路由。 |
| D 数据 | 同一目录 ID 唯一和数量对账；服务端严格 allowlist，阻止 traversal/任意键/额外字段；dist、源码和函数产物扫描密钥、个人路径、旧公开 URL 与公开 base；区分测试假 secret 与真实凭据。 |
| E 交叉 | 会话/Origin/CSRF、API no-store、SW 不缓存 API 或媒体、过期签名后 seek/续签、COS Range/CORS/TLS、域名切换、错误态及根站共同验证。 |

单元与集成：固定随机测试向量覆盖摘要恒长比较、缺/坏配置、JWT 到期/篡改/算法混淆/claims、Cookie 属性及登出、方法/Origin/content-type/超限/畸形 JSON、空值和多余字段、目录重复/无效/未知 ID、SDK 调用严格参数和 300 秒上限、签名失败及无 fallback；使用可控时钟和 SDK mock，断言不泄漏值，不误称已连接 COS。DOM 测试覆盖登录和媒体状态、过期续签、竞态、自动下一集/循环/进度及双语，运行 `pnpm test`、`pnpm typecheck`、`pnpm build`、`git diff --check`；构建/产物及 Vercel Function 包验证 catalog。

独立浏览器 E2E：本地用真实 HTTP 服务和测试密钥运行真实函数路径，检查登录/401/403/404/503、Cookie、请求缓存、深链和旧 SW 升级；生产先证明未登录和缺配置安全降级、根站/重定向/404。仅在已获权对象上传、配置生产秘密及 CORS 后，验证签名 URL 在 300 秒内可 GET/Range 206、到期后新请求拒绝、真实浏览器播放和 seek；记录非敏感状态码、时间、域名、部署 SHA/ID 和截图，不保存完整签名地址。空桶时真实媒体验收保持未完成。

## 发布、回滚与未决项

上线前记录当前已验证 production deployment ID/SHA、域名与环境变量名称（无值），按目标环境配置秘密并验证受限权限；回滚到上一个已验证部署并核对主域、根站和英语页。旧版 public media 功能不得因旧环境变量在回滚后暴露私有素材：上线前确认 `WOW_PUBLIC_MEDIA_BASE_URL` 在所有环境为空，且桶仍私有；保留现有部署以备回滚。轮换 session secret 吊销所有会话；轮换 CAM 凭据需更新部署并禁旧凭据；短期 URL 最多 300 秒仍可能有效，不能承诺立即撤销。不要删除对象或改变桶公开权限。

未决：真实对象和分发权、2024 年默认域名预览行为及自定义域名配置、生产 secret 和实际 CAM 权限、生产/预览 Origin 与 CORS、Vercel 函数打包、限流能力、浏览器实测播放/Range。所有均未验证；任何缺项对应验收保持 pending。

参考：[腾讯云 Node SDK 预签名](https://cloud.tencent.com/document/product/436/36121)、[腾讯云对象访问 URL](https://intl.cloud.tencent.com/ind/document/product/436/40945)、[Vercel 函数文件打包](https://vercel.com/kb/guide/how-can-i-use-files-in-serverless-functions)、[jose 文档](https://github.com/panva/jose/blob/main/docs/README.md)。
