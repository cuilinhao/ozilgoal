# Ozil Goal Generator

Ozil Goal Generator 是面向 `https://ozilgoal-aivideo.com` 的独立单图足球进球视频应用。前端使用 Next.js 15 / React 19，Cloudflare Workers 运行 OpenNext，D1 保存账户、任务、订单和积分账本，R2 保存私有媒体。本仓库的配置和数据应与原站隔离；本说明不代表新域名已经部署或通过生产验收。

## 公开页面

- `/` 是 Ozil Goal Generator 首页及生成入口；`/ozil-goal-generator` 保留兼容访问，canonical 指向 `/`。
- 六篇指南位于 `/ozil-goal-generator/` 下：`ozil-goal-ai-prompt`、`ozil-goal-ai-template`、`ozil-goal-trend`、`ozil-goal-meme`、`ozil-goal-capcut-template` 和 `ai-football-video-from-photo`。首页、生成器及这些指南支持英语、韩语、日语、法语、西班牙语和繁体中文。英语不加前缀，其他语言使用 `/ko`、`/ja`、`/fr`、`/es`、`/zh-TW`；切换语言保留页面、查询参数和锚点。每种语言都有翻译正文、canonical、hreflang 和 sitemap 项；兼容首页别名归一到相应语言首页。翻译位于 `lib/i18n/messages/ozil-*.json`，博客继续使用原生语言文章链接。公开提示词工具的界面翻译，生成的技术提示词仍为英语。
- `/ozil-goal-generator/blog` 收录英语、巴西葡语和西语原生文章。文章使用各自的固定路径，不自动生成六语言镜像。
- `/pricing`、登录、账户、政策和 `/contact` 保留；定价、政策与联系页使用现有六语言界面。
- 旧 Hotel Lobby、AI Rap Song、旧博客和 showcases 页面不属于本独立站的公开路由、导航或 sitemap。

## 产品与支付

- 用户上传一张已获授权的成年人照片，支持 JPG、PNG、WebP，最大 10 MB。生成输出为 15 秒、9:16、带声音的足球进球视频，每次需要 300 积分。实际效果会随素材和生成结果变化。
- 支持邮箱密码和 Google 登录；新账户初始余额为 0。账户页显示生成记录、订单和积分。失败任务按服务端规则退还已预留积分；生成后的媒体需通过审核才可读取。
- 四档一次性积分包使用 Stripe Checkout：Starter USD 9.90 / 300、Creator USD 29.90 / 1,200、Pro USD 49.90 / 2,200、Business USD 99.90 / 5,000。签名 Webhook 核实付款后幂等入账，付款成功回跳本身不发放积分。新站必须使用自己 Stripe 账户的 Price、密钥和 Webhook。
- 客服、退款、隐私请求与内容举报地址为 `cuilinhao2021@gmail.com`。

## 本地运行

需要 Node.js 22 或更新版本。

```bash
npm ci
npm run dev
```

开发地址为 `http://127.0.0.1:3000`。公开页面可在缺少服务配置时预览；登录、上传、生成和付款需要对应的服务绑定与密钥。按 [`.env.example`](.env.example) 在受 Git 忽略的 `.dev.vars` 中配置本地变量，初始化本地 D1 后可运行 Workers 预览：

```bash
npm run db:local
npm run preview
```

## 验证与部署

```bash
npm test
npm run typecheck
npm run cf:build
```

公开路由、SEO、支付和生成流程的验收步骤见 [QA 说明](QA/README.md)；独立 Worker、D1、R2、Google OAuth 和 Stripe 配置见 [部署指南](REPLACE_GUIDE.md)。任何旧站的测试或发布记录都不能代替新站的预览与生产验收。

## 代码入口

| 路径 | 用途 |
| --- | --- |
| `app/`、`components/ozil-goal/` | 页面、生成器、账户页与 API 路由 |
| `content/ozil-goal-pages.json`、`content/ozil-blog/` | Ozil 指南和原生语种博客内容 |
| `content/public-pages.ts`、`app/sitemap.ts`、`app/robots.ts` | 公开索引范围与规范域名 |
| `lib/server/`、`migrations/` | 认证、积分、生成、支付、审核、媒体和 D1 迁移 |
| `tests/` | 自动化回归测试 |

内容和搜索抓取维护见 [GEO 页面说明](docs/geo-delivery.md)。
