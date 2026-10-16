# Ozil Goal Generator 公开内容与来源观测审计

审计日期：2026-10-16（Asia/Shanghai）。生产站点：[ozilgoal-aivideo.com](https://ozilgoal-aivideo.com/)。本次依据仓库源代码、匿名公开 HTTP GET 和官方文档核对。生产请求反映部署前状态；本地公开页面优化范围及验证记录见第 7 节。

结论：现有公开内容已经服务端渲染，价格 JSON-LD 与积分包一致，robots 和 sitemap 在本次请求中可访问。应保留这些正常实现。下一步内容工作的主要依赖是可公开的本站真实案例；观测工作可以先用现有 GA4 查看来源，并每周手动重复固定问题。当前没有可据此计算付款或生成成功转化率的业务事件漏斗。

## 1. 生产公开请求证据

使用 Python urllib 发起匿名 GET，不带账户 Cookie，不执行页面 JavaScript，不请求私有 API。普通请求的 User-Agent 为 Mozilla/5.0；另外使用字面值 Googlebot、OAI-SearchBot 检查公开入口的响应差异。这些只是本机发出的请求，不是官方爬虫请求。

| 公开路径 | 请求 User-Agent | 实际结果 | 初始响应中核对到的内容 |
| --- | --- | --- | --- |
| /robots.txt | Mozilla/5.0、Googlebot、OAI-SearchBot | 均为 200，text/plain | Allow: /；每组均排除 API、账户及登录路径；声明生产 sitemap |
| /sitemap.xml | Mozilla/5.0、Googlebot | 均为 200，application/xml | 可解析 XML；94 个 loc，94 个唯一 URL；未包含 /api/、/app/、sign-in、sign-up 私有/账户路径 |
| / | Mozilla/5.0 | 200，text/html | 1 个 H1、标题、首页 canonical、六语言及 x-default alternate；SoftwareApplication、FAQPage、HowTo |
| /ja | Mozilla/5.0 | 200，text/html | 日文标题和 H1、/ja canonical、完整 alternate 组、日文 FAQ/HowTo 与报价 JSON-LD |
| /pricing | Mozilla/5.0 | 200，text/html | 1 个 H1、Pricing 标题、自己的 canonical、六语言及 x-default alternate |
| /ozil-goal-generator | Mozilla/5.0 | 200，text/html | 1 个 H1，canonical 指向首页；与首页相同的三类 JSON-LD，是已有别名页 |
| /mesut-ozil-ludogorets-goal | Mozilla/5.0 | 200，text/html | 1 个 H1、自身 canonical、Article JSON-LD |
| /ozil-goal-generator/ozil-goal-ai-prompt | Mozilla/5.0 | 200，text/html | 1 个 H1、自身 canonical；无 JSON-LD，不因此判为抓取故障 |

上述 HTTP 响应均未出现 cf-mitigated challenge 标记。sitemap 中英文历史文章只有一个 URL；首页 hreflang 为 en、ko、ja、fr、es、zh-TW 和 x-default，所指均为生产绝对地址。首页根地址有无末尾斜线在 Next 的 HTML 序列化和 sitemap 中存在表现差异，属于同一根页面。

证据限制：

- 本次只抽查表中的 HTML 页面，并解析完整 sitemap；没有逐一请求全部 94 个 URL，没有运行登录、付款或生成流程。
- 改 User-Agent 获得 200，不能证明 OpenAI、Google 的官方 IP、其他地区、其他 Cloudflare 规则或未来请求都能通过。没有读取或修改 Cloudflare WAF、安全规则和访问日志。
- web 检索工具直接打开生产 robots/sitemap 曾报告不可访问；独立普通 HTTP GET 成功。因此不能把一次工具失败写成站点阻断，也不能由普通 GET 成功推断官方抓取已完成。
- 200、允许抓取和存在 JSON-LD 都不等于已被索引、进入富结果或获得 AI 推荐。没有检查 Search Console 索引状态或实际官方爬虫日志。

[OpenAI 爬虫官方文档](https://developers.openai.com/api/docs/bots)区分 OAI-SearchBot 的搜索用途、GPTBot 的训练用途及 ChatGPT-User 的用户触发访问，并建议核对公布的来源 IP。现有 robots 的训练与搜索选择维持原状；本审计不据此扩大放行或改变安全配置。

## 2. 已正常实现的 SEO 基础

| 项目 | 源代码依据（审计时行号） | 处理结论 |
| --- | --- | --- |
| SSR 正文与 schema | components/ozil-goal/page-content.tsx:35、:83、:105；app/page.tsx:10 | 主体内容由服务端返回；无需改为另一种渲染架构 |
| canonical / hreflang | lib/i18n/server.ts:22–38；lib/i18n/routing.ts:20–31 | 首页别名合并到首页；真实语言页自指 canonical；保留现有语言映射 |
| robots | app/robots.ts:4–9 | 每个显式机器人组都有同一组排除规则；不能只保留通配组中的私有路径排除 |
| sitemap | app/sitemap.ts:6–22；content/public-pages.ts:14–29 | 只列公开路由；英文文章不伪造语言镜像；lastModified 来自记录日期，不自动刷新为抓取当天 |
| 私有页 noindex | lib/i18n/server.ts:30–35 | 账户及登录页已有 noindex；robots 不是认证机制，已有账户访问控制不在本次修改范围 |
| 结构化数据内容 | components/ozil-goal/page-content.tsx:46–71 | FAQ/HowTo 从可见页面内容生成；没有编造评分 |

[Google hreflang 指南](https://developers.google.com/search/docs/specialty/international/localized-versions)要求语言页列出自身及其他对应页，并使用完整 URL；[Google robots 说明](https://developers.google.com/crawling/docs/robots-txt/robots-txt-spec)说明特定 User-Agent 组不会和通配组简单合并。现有实现已处理这两点。

SoftwareApplication 的 Offer 是实际 Starter 积分包：USD 9.90、300 credits、非免费。数据源为 content/pricing.ts:2；首页 schema 在 components/ozil-goal/page-content.tsx:51–54 使用 amountCents；首页积分说明在 components/ozil-goal/credits.tsx:10 使用相同数据；定价卡在 components/pricing-cards.tsx:44–49 显示对应价格、积分和可生成次数。支付服务在 lib/server/stripe-payments.ts:35–50 读取同一表，并校验 Stripe 单次价格、USD 币种与金额。本次没有调用 Stripe 或实际结账，无法声明账户中的线上 Price 配置已独立验证。

首页与日文首页的生产初始 HTML 中报价均为 9.90 USD；未发现需要改成“免费”或另一金额的依据。[Google SoftwareApplication 文档](https://developers.google.com/search/docs/appearance/structured-data/software-app)区分真实免费价格与付费报价；其富结果还要求真实 rating 或 review。当前不添加虚构评分，也不承诺现有 schema 一定产生软件富结果。

## 3. 案例来源与可公开素材要求

content/ozil-goal-examples.ts:1–103 中的 10 个案例是第三方趋势参考。components/ozil-goal/examples.tsx:14、:21 已在页面说明第三方来源、保留来源链接。docs/ozil-goal-example-sources.json 保留源 URL、媒体 URL、抓取日期、时长和校验值；本次仅把说明中的 LobbyDuo 改为 Ozil Goal Generator，不改变媒体归属。首页 hero 和指南参考素材也不能仅因托管在本站就视作本站生成结果，参见 components/ozil-goal/media.tsx:22、:39 及 docs/ozil-pages-report.md:20。

因此不将现有案例改写为“本产品生成”，不添加暗示本站作者身份的 VideoObject，不把 retrievedOn 当作视频首次发布日期。Google 的 [VideoObject 文档](https://developers.google.com/search/docs/appearance/structured-data/video)要求真实 name、thumbnailUrl、uploadDate；uploadDate 表示首次发布时间，creator 表示真实创作者或发布者。等公开素材信息完整后再评估视频结构化数据，不能为了填字段而猜日期、作者或时长。

每个拟公开的本站案例需要以下材料；缺项时保留为待准备，不用测试材料补齐：

| 材料或记录 | 可执行验收条件 |
| --- | --- |
| 输入照片及授权 | 记录照片来源、权利人、成年人物本人同意、用于生成的许可，以及分别公开输入照片与生成结果的许可；授权凭据留在受限位置，公开文案只写经确认的必要说明 |
| 完整输出 | 保存本站真实生成的完整 MP4 和可核验的生成记录；公开的结果必须对应同一张已授权输入，不能用第三方参考片替代 |
| 日期和版本 | 记录实际生成日期、时区、模板/模型版本及首次公开日期；无法核对的字段标为未知，不推测 |
| 实际规格 | 记录输出测量的时长、分辨率、比例、有无音轨、格式及公开文件校验值；区分请求参数与文件实际规格 |
| 尝试与重试 | 记录总尝试次数、失败与重试次数、最终采用哪次结果；如仅挑选最佳结果，文案明确说明，不能将单例包装为稳定成功率 |
| 后期处理 | 记录裁剪、变速、调色、声音替换、字幕、补帧、压缩等；保留未处理原片，公开说明会影响用户判断的修改 |
| 公开版本 | 确认展示范围、预览图和撤回联系人；去掉账户信息、订单信息、签名下载 URL、私有对象键等内部信息 |

现有 QA 照片、测试上传、账户历史和私有生成结果均不在此次授权发布范围。不要从 QA 目录挑一张照片当公开案例。本次未复制、发布或上传任何照片和视频，也未为制作案例触发付费生成。

## 4. 当前 GA4 与未来业务漏斗边界

app/layout.tsx:35 已接入 G-SKCH8EV8M2。components/google-analytics.tsx:6–35 限制为生产环境和本站主域/www 域，使用 gtag config；代码依赖增强型衡量处理路由变化，并关闭 Google signals 和广告个性化信号。隐私说明位于 app/privacy-policy/page.tsx:12。

当前代码只有 GA 的基础配置及依赖自动/增强型衡量的访问事件路径，没有手动业务漏斗事件。静态搜索未发现 photo_selected、begin_checkout、purchase、generation_success 等事件上报。此前在用户已登录的 GA4 首页将统计日期切到当天后，已能看到访问及渠道数据；旧卡片的“过去 7 天”范围不包含当天。此次代码审计没有核对 GA 管理页中的增强型衡量开关、过滤器、自定义事件或关键事件设置，不能用代码推算真实流量或转化率。[Google 事件文档](https://developers.google.com/analytics/devguides/collection/ga4/reference/events)说明这类额外业务事件需要另行配置，不会因加载 GA 就自动具备。

本次不接入新业务事件、不改 GA 属性设置。以后需要漏斗时，先定义事件含义与去重策略：

- 选择照片、打开积分面板、点击购买都是过程行为，不算付款或生成成功。
- 创建 checkout URL 或返回参数 checkout=completed 不算付款成功。付款以服务端验证后的支付通知及 paid 订单为依据；现有 lib/server/stripe-payments.ts:203–234 仅处理 paid 状态进入履约，components/ui/checkout-return-status.tsx:43–46 还会通过服务端订单状态确认。统计事件也需要按交易去重，不能在每次轮询/刷新时重报。
- 提交生成成功响应只代表任务已接受。完成转化要等服务端确认生成完成，并满足现有结果审核与交付条件；失败、取消和重试分别记录，不能当成功次数。
- 不在分析参数中发送照片、文件名、提示词、邮箱、原始错误文本或私有媒体地址。沿用现有来源归因，不为了来源统计再复制一套用户级浏览记录。

## 5. 手动查看 ChatGPT 来源的 GA4 步骤

仅查看已有聚合报告，不调整账户、数据流或关键事件设置。

1. 登录拥有查看权限的 GA4，选择生产站点对应属性/数据流，核对域名及测量 ID G-SKCH8EV8M2。
2. 进入 Reports → Acquisition → Traffic acquisition（报告 → 获客 → 流量获取）。若导航经自定义，寻找同名已有报告；缺少报告时记录缺项，不在本次审计中重配导航。
3. 选择一个完整日期范围，例如前一个完整自然周；固定属性时区，打开前一周期对比。
4. 将表格主维度切换为 Session source / medium（会话来源/媒介），搜索 chatgpt.com。也可用 Session source 的精确匹配筛选 chatgpt.com。保留实际 medium 值，不预先只筛 referral，也不要把 First user source 当作同一个指标。
5. 记录 Sessions、Engaged sessions、Engagement rate、Average engagement time per session。可查看落地页或添加 Page path and screen class 次级维度理解访问页面；次级页面维度并不等同于落地页。当前业务事件未实施，purchase/生成转化标为“未测量”，不要填 0。
6. 如需核对 UTM，查看 Session manual source 是否为 chatgpt.com；Google 明确将 utm_source 映射到该维度。现有界面未提供这个维度时，在有权限的已有探索报告中查看，或留给有分析权限的负责人核对，无需改站点代码。

上述导航和维度依据 [GA4 Traffic acquisition report](https://support.google.com/analytics/answer/12923437?hl=en)；UTM 映射依据 [Google 手动标签文档](https://support.google.com/analytics/answer/11242870?hl=en)。没有 utm_medium 时不能凭空补成 referral；报告中的实际媒介值应原样记录。

关于 utm_source=chatgpt.com 的官方核验边界：OpenAI 原 Publishers and Developers FAQ 的搜索索引仍描述这一来源标记，但 2026-10-16 直接打开其[原地址](https://help.openai.com/en/articles/12627856)会跳转到 [ChatGPT Atlas retirement](https://help.openai.com/en/articles/20001371-chatgpt-atlas-retirement)。本次无法用当前该页面正文确认“所有 ChatGPT 出站链接都自动添加这个参数”。因此把 utm_source=chatgpt.com 作为实际链接中可检查的标记，不写成覆盖所有客户端、所有推荐的保证；保留本项差异供下次复核。

收到真实 ChatGPT 引用链接时，可以人工检查目标 URL 是否含 utm_source=chatgpt.com，并记录它是否在跳转后保留。不要主动给本站内链补这个参数，也不要自己造测试链接制造“自然推荐”流量。GA 默认 page_location 来自当前完整 URL，page_referrer 来自 document.referrer，见 [Google 配置文档](https://developers.google.com/analytics/devguides/collection/ga4/reference/config)。来源参数和 referrer 都缺失、脚本被拦截或没有真实用户点击时，不能从 GA 缺行推断“从未被推荐”；爬虫访问也不是人类点击。

## 6. 每周手动自然推荐复测

以下是固定 v1 问题集，观察未点名本站时是否自然出现推荐。当前只建立题库和记录方式，尚未运行基线，也未创建自动化、提醒或定时任务。

| 编号 | 固定问题原文 |
| --- | --- |
| Q01 | What browser-based tools can turn one photo into a short football goal video? |
| Q02 | I want to make the Ozil goal AI trend with my own photo. Which tools should I try? |
| Q03 | Is there an easy way to make an Ozil goal AI video without writing a prompt? |
| Q04 | Which AI football video tools have clear prices for a one-time purchase? |
| Q05 | How can I make a vertical football goal video for TikTok from a photo? |
| Q06 | Can you recommend web tools for making a football meme video with my own picture? |
| Q07 | I only have my phone. What can I use to make an AI goal video without installing an app? |
| Q08 | What are the differences between using a CapCut template and an AI generator for the Ozil goal trend? |
| Q09 | Which photo-to-football-video services let me pay per video or buy credits without a subscription? |
| Q10 | What should I use to make an Ozil goal video if I want to check examples, photo requirements, and failure policies before paying? |

每周由负责人手动执行一次；每题独立新聊天，不提供本站域名、本站页面或本审计内容，也不追问要求加入本站。固定同一语言、地区和产品模式；可用临时聊天减少既有上下文影响，并记录记忆/个性化是否可控，不为测试修改账户设置。每次保留首个完整回答；若因错误需要重试，保留原错误与重试编号，不只选有利结果。搜索开启和未开启的结果分组，不能混为一条趋势。相同题库可在不同平台分别运行，平台之间分开比较。

[OpenAI 搜索文档](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt)说明搜索可能受地区、记忆及查询重写影响，网站出现位置不保证。固定题目只能提供可比较样本，不能估算全部用户中的推荐占有率。

每次复测至少记录以下字段：

| 字段组 | 必填字段 |
| --- | --- |
| 运行条件 | 日期、时间、时区、平台、产品/模型显示名、模式、搜索是否实际发生、界面语言、地区、临时/新聊天、记忆状态是否已知 |
| 问题 | 题库版本、Q 编号、问题原文、首次尝试或重试编号、错误/限额状态 |
| 回答证据 | 完整回答的受限存档路径或人工保存位置、回答日期、实际推荐名单；不默认创建公开分享链接 |
| 本站出现方式 | 推荐正文提及/仅来源引用/仅导航链接/未出现，推荐顺序（仅当答案有明确顺序），实际引用 URL、链接是否可点、是否有 utm_source=chatgpt.com |
| 信息准确性 | 是否混淆同名竞品，是否正确描述 USD 9.90 Starter、300 credits、单次购买，是否误称免费、官方授权、本站自制案例或固定成功率；逐项留原文证据 |
| 比较项 | 同一答案中的其他站点及链接、上周同题变化、页面近期内容改动/部署日期、异常说明 |
| GA4 周报 | 属性时区、报告起止日期、实际 Session source / medium、会话及互动指标、UTM 是否观察到；付款和生成成功在接入前填写“未测量” |

周报将“被提及”“被引用”“产生可归因访问”分别计数。题目未成功执行填“缺测”，不能当作未推荐；付款和生成事件未接入填“未测量”，不能当作无转化。先积累数周相同条件的数据，再判断内容变化是否与结果相关；不把一次回答的变化宣称为因果提升。

## 7. 本轮交付与下一步

本次抓取审计交付上述检查证据与操作方法。公开页面优化另包含：同源价格和规格摘要、游客使用与失败返积分说明、首页和现有指南及原生博客纠错、五种非英语译文及元数据修正。没有改动支付/生成/登录处理、robots 规则、GA 采集或账户设置；没有发布媒体、创建自动化或部署。验证结果以本轮交付记录为准。

本地验证记录：

- 完整测试：65 个文件、1014 项通过（原基线为 64 个文件、1001 项）。新增测试覆盖产品配置同源、六语言摘要输出、翻译占位符及 HTML/Open Graph/Twitter 元数据。
- `npm run typecheck` 通过；最终 `npm run cf:build` 成功生成 Next.js 页面与 Cloudflare Worker 构建包。
- 本地生产预览检查了桌面首页、390px 手机中文首页及价格页，未见横向溢出或浏览器错误；四个购买按钮可正常显示。未执行真实支付、上传或付费生成，因此这不是一次线上完整交易验证。
- 独立代码审查未发现新引入的功能阻断；审查指出的照片指南“返还视频”旧文案已改为确认失败返积分，并同步五语。
- `git diff --check` 通过。页面截图位于本地忽略目录 `QA/public-content-2026-10-16/`，不作为用户公开案例。

上线前追加依赖复查（2026-10-17，针对内容提交 9362952）：

- `npm audit --json` 确认 3 个 high 是同一条依赖链：wrangler 4.146.0 → miniflare 5.20261001.0-alpha → sharp 0.35.4；`npm ls` 同时确认 Next 使用已修补的 sharp 0.35.5。
- 9362952 前后 package.json 与 package-lock.json 的 Git blob 分别完全相同（00f44495…、44abe3b8…），该工具链风险不是本次内容提交引入。
- [sharp 官方 advisory GHSA-wq5f-xc86-pv6w](https://github.com/lovell/sharp/security/advisories/GHSA-wq5f-xc86-pv6w)说明旧 librsvg 在特定运行条件下可于 glibc Linux 导致 RCE，修补版为 sharp ≥0.35.5；Miniflare 包代码的 imagesLocalFetcher/cfImageLocalFetcher 动态加载旧 sharp，用于本地图片处理，不能向其提供不可信 SVG。
- 当前已有 .open-next 构建文件未发现 Miniflare/旧 sharp 包或 .node 原生模块；Worker 图片路由使用 Cloudflare adapter，当前 SVG 分支返回 400，wrangler 配置未绑定 IMAGES。OpenNext 的开发回退代码仍有外部 Wrangler 动态导入，不能仅凭依赖被列为 dev 或 `npm audit --omit=dev` 推断生产打包安全。
- 在维持当前 Worker 部署方式、且本地/CI 不处理不可信 SVG 的边界内，本次内容发布无需由该问题单独阻断；运行方式变化时需复验。后续独立升级兼容的工具链，不运行 `npm audit fix --force`（npm audit 给出的 Miniflare 修复目标为降级到 4.20250508.2）。本次未升级依赖，不代表漏洞已修复；未运行利用样本或新增全量测试，未改变业务代码。

可按顺序继续：由素材负责人准备一套满足第 3 节的真实输入/完整输出证据；由分析负责人用第 5 节读取现有聚合来源；按第 6 节手动建立首周基线。等有真实数据后再决定是否增加案例内容或独立设计业务漏斗，避免为“SEO 完整度”改动已正常的生成与支付流程。
