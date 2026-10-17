# Ozil 内容与搜索抓取维护

本独立站以 `https://ozilgoal-aivideo.com` 为规范域名。公开内容的路径以 [`content/public-pages.ts`](../content/public-pages.ts)、[`content/ozil-blog/`](../content/ozil-blog/) 和 [`app/sitemap.ts`](../app/sitemap.ts) 为准；不要沿用旧站页面数量或索引报告。

## 内容范围

- `/` 是英语 Ozil 首页；`/ozil-goal-generator` 是兼容入口，两者以 `/` 为 canonical。该兼容入口不单独列入 sitemap。
- 六个指南：`/ozil-goal-generator/ozil-goal-ai-prompt`、`/ozil-goal-generator/ozil-goal-ai-template`、`/ozil-goal-generator/ozil-goal-trend`、`/ozil-goal-generator/ozil-goal-meme`、`/ozil-goal-generator/ozil-goal-capcut-template`、`/ozil-goal-generator/ai-football-video-from-photo`。
- 首页、六个指南、定价、政策和联系页支持英语、韩语、日语、法语、西语、繁体中文；非英语使用对应语言前缀，canonical 和 hreflang 指向实际存在的页面。
- `/ozil-goal-generator/blog` 索引及 `lamine-yamal`、`sepak-bola`、`gol-pakai`、`gol-de-ozil` 四篇关键词文章支持上述六种语言。英文不带前缀，其余版本使用语言前缀，并互相声明 hreflang。四份简体中文源稿只保存在 `content/ozil-blog/keywords/`，不作为额外站点语言发布。
- 既有 14 篇英语、巴西葡语、西语原生博客保留原路径，各自只声明自身语言与 `x-default`；不把独立文章当作互译，也不创建语言前缀镜像。

旧 Hotel Lobby、AI Rap Song、旧博客和 showcases 不属于本独立站的公开内容。更新页面时同时检查站内导航、内链、canonical、语言 alternates、结构化数据、`robots.txt`、sitemap 和 [`public/llms.txt`](../public/llms.txt)。

## 产品事实与来源

首页与指南应和生成器保持一致：一张获授权的成年人照片，JPG/PNG/WebP、最大 10 MB；15 秒、9:16、带声音的视频；每次 300 积分。新账户不赠送积分，付款使用一次性积分包。生成结果和处理时间可能变化，不把示例描述为效果保证。

外部事实、素材许可和比较性陈述应保留可核查来源；修改公开内容时复核链接、日期和产品价格。六个指南正文见 [`content/ozil-goal-pages.json`](../content/ozil-goal-pages.json)，博客文章及原生语言关系见 [`content/ozil-blog/`](../content/ozil-blog/)，素材记录见 [`docs/media-sources.json`](media-sources.json)。

## 复现检查

先运行自动测试、类型检查和构建：

```bash
npm test
npm run typecheck
npm run cf:build
```

本地运行 `npm run build` 与 `npm run start` 后，在另一终端执行只读检查；也可把基址换成独立 Workers 预览地址：

```bash
node scripts/check-i18n.mjs http://127.0.0.1:3000
python3 scripts/check-geo.py http://127.0.0.1:3000
```

在本地或独立预览地址检查首页、六个指南、博客索引及文章、定价和政策页的状态码与页面正文；检查根域 canonical、实际存在的语言 alternates、FAQ/HowTo/BlogPosting 等结构化数据、`/robots.txt` 与 `/sitemap.xml`。确认旧公开路径和未支持语言不返回内容，站点地图只包含现有页面。浏览器还需检查窄屏布局、语言切换、跨原生文章导航时的页面语言、内链和图片加载。

这些检查只证明页面和抓取契约在被测环境中的行为；搜索收录、排名和 AI 引用需要使用新站的实际数据另行观察。操作清单见 [QA 说明](../QA/README.md)。

## 搜索引擎与 AI 抓取通知

ChatGPT 和 Copilot 的联网搜索依赖 Bing 索引；新域名在 Bing 抓取前，AI 搜索查不到本站。生产部署新增或修改公开页面后运行 `npm run indexnow`，把线上 sitemap 的全部 URL 提交给 IndexNow（Bing、Yandex、Naver、Seznam 共享）。密钥文件为 `public/bdfaff693d2aef8f6eb62e06aeca7f9e.txt`，内容必须与脚本中的 key 一致；脚本会先确认线上密钥文件可读。`--dry-run` 只列出将提交的 URL。

IndexNow 只是抓取通知，不保证收录。Bing 收录、抓取错误和关键词需在 Bing Webmaster Tools 查看（可从 Google Search Console 导入站点）。Cloudflare 安全事件中不应出现 GPTBot、OAI-SearchBot、ChatGPT-User 或 Bingbot 被拦截；上线期间 robots.txt 返回 5xx 或超时会让爬虫在缓存期内视为禁止抓取。
