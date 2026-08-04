---
'@magic-scope/react': patch
---

修复 Descriptions / Grid / Splitter 的 `displayName` 挂载位置(挂到导出名而非局部变量名)。运行时对象与 `displayName` 取值均不变,无行为差异;此前挂在局部名上会让 props 抽取工具静默丢弃主组件文档,导致展示站与文档站的参数表整体失真。
