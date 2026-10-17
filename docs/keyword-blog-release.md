# 四篇关键词文章发布记录

发布日期：2026-10-17（Asia/Shanghai）。生产站点：<https://ozilgoal-aivideo.com>。

## 内容与版本

- 关键词：`lamine yamal`、`sepak bola`、`gol pakai`、`gol de ozil`；重复输入的 `gol pakai` 合并为一篇。
- 四份简体中文原稿保存在 `content/ozil-blog/keywords/*/zh-CN.json`。按现有站点语言发布英语、韩语、日语、法语、西语、繁体中文，共 24 个文章页面。
- 六语言博客索引与文章互相声明 hreflang，既有 14 篇原生文章保持原路径。
- 内容与应用代码提交：`2a229b3`；发布时 Git 提交：`24c6daebc22867cc47d3ce87a950ab58952e1b43`，已推送 `origin/main`。
- Cloudflare Worker：`ozilgoal-aivideo`；生产版本：`4837b53d-144f-46f6-a411-a516905472a8`。

## 实际验证结果

1. `npm test`：69 个测试文件、1082 个测试通过。
2. `npm run typecheck`：通过；`npm run cf:build`：通过。最终新增的修改仅涉及验收脚本、对应测试和文档，应用使用已经验证的构建产物部署。
3. 本地生产构建与正式域名均运行 `scripts/check-i18n.mjs`：165 项检查、123 个 sitemap URL、24 篇译文、14 篇原生文章、31 个预期缺失路径，失败列表为空。
4. 本地与生产 `scripts/check-geo.py` 均通过。逐一检查 123 个页面的 canonical 与 sitemap/page hreflang，核对 6 个博客索引、24 篇译文及原生文章语言。生产使用 `GEO_HTTP_CLIENT=curl`，无非预期非 200 响应。
5. 生产浏览器验证：日文 `gol-de-ozil` 切换繁体中文后，正文、导航及价格内链语言正确；从繁体中文索引进入原生西语文章时加载独立文档；四篇新文章在索引中可见。
6. `/fr/ozil-goal-generator/blog/gol-de-ozil-con-mi-foto` 返回 308 到原生文章；未支持的 `/id/ozil-goal-generator/blog/sepak-bola` 返回 404。
7. `npm run indexnow`：从线上 sitemap 提交 123 个 URL，IndexNow 返回 200。此结果表示通知已被接受，不表示搜索引擎已收录。
8. 2026-10-17 在 Google Search Console 的 `sc-domain:ozilgoal-aivideo.com` 资源中重新提交 `https://ozilgoal-aivideo.com/sitemap.xml`，界面确认“已成功提交站点地图”，提交日期更新为 2026-10-17。提交时上次读取仍为 2026-10-16、已发现网页 59，等待 Google 重新读取；不能将提交成功写成 123 个页面已被 Google 收录。重新核对线上 XML 共 123 个不重复 URL，24 篇新译文齐全，lastmod 均为 2026-10-17，每篇有六语言及 x-default 共 7 项 hreflang。成功截图保存在 `QA/keyword-blog-gsc-submitted.png`。

本次没有执行生产付款、付费视频生成或数据库迁移。HTTP 检查报告与生产页面截图保存在本地受 Git 忽略的 `QA/keyword-blog-*` 文件中；不提交凭据、账户数据或生产日志。
