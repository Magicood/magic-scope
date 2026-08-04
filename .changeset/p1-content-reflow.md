---
"@magic-scope/react": minor
---

P1 设备适配:窄屏内容重排 —— Table 卡片化 + Breadcrumb 折叠(容器查询驱动)

- **Table**:窄容器(≤ 容器断点 `rune` 28rem)转卡片式重排——每行一张卡、单元格以列名(`data-label`,取自字符串表头)就地前缀、表头视觉隐藏但保留无障碍语义;选择列 / 展开行 / 汇总行 / 斑马纹 / 固定列(sticky 复位)均已适配。优先于 P0 的 coarse 横滚兜底,窄触屏读表更友好。
- **Breadcrumb**:层级 >3 时注入仅窄容器(≤ `rune` 28rem)显形的折叠占位,把中间层级折叠为**可点击展开**的省略号(复用 `maxItems` 折叠的省略号按钮样式与 `expanded` 状态,disclosure 语义完整);与 `maxItems` JS 折叠协同,不出现双省略号。
- 两者均为 `@container` 容器查询驱动(对父容器而非视口自适应),桌面 / 宽容器渲染逐像素不变。
- 窄容器折叠省略号的 `aria-label` 走字典 key `breadcrumb.expand`(带 `{count}` 插值),与 `maxItems` 折叠省略号一致。
- 已知约束:容器查询组件需要来自上下文的确定宽度,置于 fit-content 包装中时折叠不生效(容器化已限定到 `--collapsible` 变体收窄影响面,详见 `docs/responsive.md`)。
