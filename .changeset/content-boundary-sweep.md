---
"@magic-scope/react": patch
---

全库内容边界健壮性加固:对抗性超长内容不再撑破任何组件

继 Button 之后,对全库做了一轮「内容边界」审计(逐组件设想粘入超长无空格字符串/巨量文本/超宽子节点),修复 12 个组件的溢出隐患,策略按内容性质区分:

- **单行省略号**(紧凑标识):`Tag`(label 改 block 才能真出省略号 + 关闭钮 `flex:none` 防挤压)、`Badge`、`Drawer` 标题、`Input` 的 addon 段(封顶 40% + 省略)。
- **换行不丢内容**(多行正文):`Alert`、`Card`、`Tooltip`、`Label`、`Breadcrumb`、`AlertDialog` 标题、`Checkbox`/`Radio` 标签(`overflow-wrap: anywhere`)。
- **容器封顶 + flex 可收缩**:`Input` / `InputGroup`(`max-inline-size:100%` + 字段列 `min-inline-size:0`)。

均不裁剪焦点发光环(`box-shadow` 不受 `overflow:hidden` 影响),不改变正常内容排版。
