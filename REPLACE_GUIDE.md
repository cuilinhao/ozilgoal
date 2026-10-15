# Ozil Goal Generator 独立部署指南

目标站点为 `https://ozilgoal-aivideo.com`。本指南用于建立独立的 Cloudflare、Google OAuth 和 Stripe 配置；配置或验收状态以新站的实际控制台及测试结果为准。变量清单见 [`.env.example`](.env.example)，部署脚本见 [`package.json`](package.json)。

## 1. 环境与资源

1. 为新站确认 Cloudflare Worker、D1 数据库和 R2 媒体桶均属于目标账户，并核对 [`wrangler.jsonc`](wrangler.jsonc) 中的名称、资源 ID、路由和 `APP_URL`。不要连接旧站的 D1、R2、Worker 或生产数据。
2. 将根域名指向新 Worker，并为 `www` 设置到根域名的 HTTPS 重定向。正式 `APP_URL` 使用 `https://ozilgoal-aivideo.com`，与页面 canonical 和 OAuth 回调保持一致。
3. 使用 Cloudflare Workers Secrets 设置 `GOOGLE_CLIENT_ID`、`GOOGLE_CLIENT_SECRET`、`MEDIA_SIGNING_SECRET`、视频服务密钥、`STRIPE_SECRET_KEY` 和 `STRIPE_WEBHOOK_SECRET`。`MEDIA_SIGNING_SECRET` 使用至少 32 字符的随机值。D1、R2、静态资源和 Worker 自引用由 Wrangler bindings 提供，不是 Secret 字符串。
4. 按实际视频提供商配置 API 密钥和可信媒体主机名；只允许已核实的输出 CDN 主机。生产域名须能供服务商访问参考素材。Secret 不写入 Git、客户端变量或截图。

本地开发把变量放在受 Git 忽略的 `.dev.vars`；不要把本地测试环境连接到生产资源。新站数据库从自身迁移初始化，旧站用户、积分、订单及媒体不会自动转入。

## 2. Google 登录

在新站使用的 Google Web OAuth 客户端中配置：

| 项目 | 值 |
| --- | --- |
| Authorized JavaScript origin | `https://ozilgoal-aivideo.com` |
| Authorized redirect URI | `https://ozilgoal-aivideo.com/api/auth/callback/google` |

本地验证可另外添加实际本地源地址及其回调 URI。客户端 ID 与 Secret 必须属于同一 OAuth 客户端。发布后分别验证常规 Google 登录、One Tap、邮箱登录和退出；One Tap 的客户端配置不能替代回调 URI 配置。

## 3. Stripe 独立收款

新站使用自己的 Stripe 账户。**必须在这个账户分别创建 test 和 live 模式的 Product/Price；旧站、其他账户及不同模式的 Price ID 均不可沿用。** 四档均为一次性 USD 积分包，无订阅：

| 套餐 | 价格 | 积分 | 环境变量 |
| --- | ---: | ---: | --- |
| Starter | USD 9.90 | 300 | `STRIPE_PRICE_STARTER` |
| Creator | USD 29.90 | 1,200 | `STRIPE_PRICE_CREATOR` |
| Pro | USD 49.90 | 2,200 | `STRIPE_PRICE_PRO` |
| Business | USD 99.90 | 5,000 | `STRIPE_PRICE_BUSINESS` |

设置 `PAYMENT_PROVIDER=stripe`，并让 `STRIPE_MODE`、四个 Price ID、`STRIPE_SECRET_KEY` 和 Webhook endpoint 全部对应**同一 Stripe 账户和同一 test/live 模式**。服务端会核对 Price 是否有效、一次性、币种与金额是否匹配。切换到 live 时重新填写该账户的四个 live Price ID 和 live 密钥；不能只改 `STRIPE_MODE`。

在新账户创建接收端 `https://ozilgoal-aivideo.com/api/webhooks/stripe`，订阅以下事件，并把该接收端生成的签名密钥设为 `STRIPE_WEBHOOK_SECRET`：

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `charge.refunded`
- `refund.created`
- `refund.updated`
- `refund.failed`
- `charge.dispute.created`
- `charge.dispute.updated`
- `charge.dispute.closed`

只有已付款、签名和订单信息均核对通过的回调才发放积分；成功回跳本身不发积分。退款和争议事件进入人工复核。测试时检查重复回调不会重复入账，取消付款不会入账，金额、模式或签名不匹配会被拒绝。

## 4. 构建、迁移与发布

1. 在目标提交上运行 `npm ci`、`npm test`、`npm run typecheck`、`npm run cf:build`。
2. 核实 Wrangler 所指的是**新站 D1**，检查迁移和备份策略后执行 `npm run db:remote`。本地数据库可用 `npm run db:local` 初始化。
3. 配置上述 Secrets、bindings、域名及四档 test Price，先在预览或测试环境完成端到端验收，再从同一确认过的源码运行 `npm run deploy`。
4. 核查英语首页和六个指南、`/ozil-goal-generator` 兼容入口、原生语种博客，以及六语言定价、政策和联系页；再核查登录、生成任务、私有媒体及历史记录。根域名 canonical、`/robots.txt` 与 `/sitemap.xml` 应指向新域名；旧站主题页面和非英语 Ozil 首页/指南镜像不应公开可访问。
5. 使用 Stripe test 模式完成一笔付款和一次取消，检查订单、积分账本和重复 Webhook。随后切到新账户 live 配置，逐项核对四档 Checkout 的币种、金额和商品。生产真实收款与到账只有在授权的真实交易完成并核验后才能标记为已验收。

发布后记录 Git 提交、Worker 版本、迁移结果及验收证据。若需修改套餐或站点地址，应同步更新服务端配置、Stripe 商品、Google 授权、canonical、sitemap 和相关测试。客服地址为 `cuilinhao2021@gmail.com`。
