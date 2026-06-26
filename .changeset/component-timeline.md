---
"@magic-scope/react": minor
---

新增 Timeline 时间线 / 信息流组件(Timeline + TimelineItem)

声明式组合:语义化 `<ol>` 的 `Timeline` + 若干 `TimelineItem`(`<li>`)。竖向轴 + 节点圆点(可用 `icon` 换图标)+ `::before` 连线(末项不画);节点按变体 `default/primary/success/warning/danger/info` 着色并带克制辉光。每条含 `title`、次级 `time`(渲染为 `<time>`)、正文。适合历史记录、进度、动态流;逻辑属性 RTL 友好、`overflow-wrap` 防长串溢出。含 6 个功能测试 + 文档 / playground 演示。
