---
"@magic-scope/react": minor
---

事件基建:composeEventHandlers / composeRefs 工具 + 修 Button asChild 事件与 ref 合并

针对「组件覆盖用户事件处理器、asChild 丢 ref」的系统性问题,落地共享基建:

- 新增 `composeEventHandlers(theirs, ours, { checkDefaultPrevented })`:先调用户处理器,未 `preventDefault` 再调组件内部处理器(Radix 范式),用于组件根/子元素既挂自己处理器又保留用户处理器。
- 新增 `composeRefs` / `setRef`:合并多个 ref(asChild 把外部 ref 与子元素自身 ref 都接上)。
- 新增 `mergeAsChildProps`:asChild 合并组件与子元素 props——`on*` 事件 compose、`className` 拼接、`style` 合并、其它子元素优先。
- **修复 Button `asChild`**:此前 `{...props, ...child.props}` 让子元素同名事件覆盖、Button 收到的 onClick 被静默丢弃,且 ref 未传给子元素。改用 `mergeAsChildProps` + `composeRefs`:两边 onClick 都触发、外部 ref 正确拿到渲染出的 `<a>`/Link DOM。
- 工具从包入口导出,消费者构建自定义组件可复用。

这套是后续给全部组件补齐事件(语义回调 + 原生透传 + compose)的地基。
