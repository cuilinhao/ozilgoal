# Ozil Goal Generator 验证说明

本文件记录 `ozilgoal-aivideo.com` 独立站的可复现验收步骤，不声明新站已部署或通过生产付款验证。旧站在 2026-10-03/04 的发布、页面数量及支付测试只对应当时的源码和账户，不能作为本独立站的验收证据。测试源码位于 `tests/` 与组件旁的 `*.test.*`；密钥、账户截图、原始订单及生产日志不得提交到 Git。

## 提交和部署前

```sh
npm ci
npm test
npm run typecheck
npm run cf:build
```

重点复核首页与别名、旧路由 404、sitemap、博客原生语种、私有历史接口和 Stripe Webhook 的自动测试。以本次命令实际结果记录测试数量和错误，不沿用旧站历史数字。

## 只读页面检查

在本地生产构建或独立 Workers 预览地址检查：

1. `/` 显示 Ozil 上传和生成入口；`/ozil-goal-generator` 可访问，canonical 指向 `/`。英语六个指南各有独立 canonical。`/fr` 等非英语 Ozil 首页和指南镜像返回 404。
2. `/pricing`、政策和 `/contact` 的六语言版本可访问；Ozil 博客索引及英语、巴西葡语、西语原生文章可访问，语言 alternates 只列出实际存在的对应文章。
3. `/sitemap.xml` 和 `/robots.txt` 指向 `https://ozilgoal-aivideo.com`；sitemap 不收录别名、非英语 Ozil 镜像或旧工具页面。
4. 旧公开路径 `/hotel-lobby-ai-video-generator`、`/ai-rap-song-generator`、`/blog`、`/showcases` 及其本地化版本返回 404。导航、页脚和 `llms.txt` 不链接这些页面。
5. 首页、指南和博客的标题、描述、内链、图片、FAQ/HowTo/BlogPosting 结构化数据与可见内容一致。检查桌面和手机布局、表单状态及语言切换。HTTP 200 本身不能证明交互可用。

本地只读 smoke 检查可在 `npm run build` 后启动 `npm run start`，再于另一终端运行：

```sh
node scripts/check-i18n.mjs http://127.0.0.1:3000
python3 scripts/check-geo.py http://127.0.0.1:3000
```

脚本分别检查现有公开/私有路由、语言与 canonical，以及 Ozil 页面、FAQ/HowTo、sitemap、robots 和 `llms.txt`；报告中的页面数由实际 sitemap 得出。生产或预览检查应替换为该环境自己的基址。检查时记录 Git 提交、环境、时间、URL 与结果。

## 功能与支付验收

1. 在隔离的测试环境验证邮箱和 Google 登录、退出、零初始积分、授权照片上传（JPG/PNG/WebP，最大 10 MB）、同一请求的幂等提交、300 积分预留、生成状态、失败退款、审核后的私有媒体和账户历史。验证已登录用户只能读取自己的订单、任务与媒体。
2. 使用**新 Stripe 账户的 test 模式**四档 Price 和 Webhook Secret，完成一笔测试付款、一次取消付款、签名 Webhook 和重复事件重放。核对只有已付款的订单入账一次；成功回跳、取消、无效签名或金额不符均不得发放积分。
3. 切换 live 前核对新账户四档 USD 金额、一次性 Price、密钥、Webhook 地址和模式一致。真实生产扣款与到账只有在实际授权交易完成并核查订单、账本和余额后才能标为已验收。生成与付款调用会产生外部费用或状态变更，应按验收范围执行。
4. 核对新 Worker、D1、R2、域名、Google OAuth 来源和回调与旧站隔离；测试 `www` 到根域名的 HTTPS 规范跳转。配置步骤见 [独立部署指南](../REPLACE_GUIDE.md)。

发布后把实际运行的测试、构建、预览、浏览器与付款结果另行记录。未执行的项目保持待验收状态。
