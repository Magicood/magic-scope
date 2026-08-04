---
"@magic-scope/react": patch
---

Menu.Trigger 补全文档化的 props 类型,并修 React 19 下的 ref 读取路径

`Menu.Trigger` 原先用内联的 `{ children: ReactElement }` 作 props 类型,唯一的 `children` 又没有 JSDoc —— react-docgen 在自定义 propFilter 之前就会剔掉无文档的 `children`(`skipChildrenPropWithoutDoc` 默认开),导致该子组件抽出 0 行 props、整条被丢弃,`Menu.Trigger` 从未出现在参数表里。现改为导出的 `MenuTriggerProps` 接口并补齐注释,参数表恢复。

同时 `Menu` 读取子元素自身 ref 的三处(`trigger` 主用法路径、`Menu.Item` 的 `asChild`、`Menu.Trigger`)统一改用 `child.props.ref ?? child.ref`(与 `Tooltip` 同口径),不再走 React 19 已废弃的 `element.ref` 通道 —— 该通道会打废弃告警,且 React 声明将来会移除,届时会静默丢掉子元素自身的 ref。

`Menu.Item` / `Menu.Group` 的 prop 说明加上所属子组件前缀,便于在合并后的参数表里区分归属。
