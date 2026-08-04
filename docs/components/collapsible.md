# Collapsible <Badge type="tip" text="stable" /> <Badge type="info" text="v0.1.0" />

单项折叠原语,Trigger 切换按钮 + Content 可折叠区,高度过渡平滑展开收起,Content 常驻挂载保活子树。

> **[在展示站中打开 Collapsible](https://magicood.github.io/magic-scope/#/collapsible)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

比 Accordion 更底层的单个开合原语:没有 single / multiple 互斥分组,只管「一段内容的展开与收起」,供自由拼装(FAQ 行、设置项、详情块、侧栏分区)。

复合 API(Collapsible + Collapsible.Trigger + Collapsible.Content),受控(open + onOpenChange)/ 非受控(defaultOpen)双通道、disabled 整体禁用。

高度过渡用 grid-template-rows 0fr↔1fr 平滑撑高,随 reduced-motion / data-ms-motion=off 降级瞬时。a11y:Trigger 原生 button + aria-expanded / aria-controls,Content role=region;Content 常驻挂载并 inert 收起态。

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `open` | `boolean` | — | 受控:是否展开。传入即进入受控模式(配合 onOpenChange)。 |
| `defaultOpen` | `boolean` | `false` | 非受控初始展开态。默认 false。 |
| `disabled` | `boolean` | `false` | 整体禁用:trigger 不可点击、不可聚焦,且不响应键盘切换。 |
| `forceMount` | `boolean` | `false` | 已废弃:Content 始终挂载,本属性已无效果,无需再传。 历史兼容保留:Content 现在&#42;&#42;始终常驻挂载&#42;&#42;(对齐 Accordion,见组件 JSDoc),收起态靠 CSS visibility + inert 隐藏,<br>故本属性已无实际开关作用(收起内容恒在 DOM,SEO 可抓 / 锚点可跳 / 双向动画完整 / 子树 state 不丢)。<br>保留仅为不破坏既有 API;后续若引入 SSR 懒挂载等能力再复用此口。默认 false。 |
| `tone` | `"primary" \| "accent" \| "success" \| "warning" \| "danger" \| "info" \| "neutral"` | `primary` | 语义色调:根加 ms-tone-${tone},trigger hover/open/focus 配色读 6 槽位。默认 primary。 |

## 事件 Events

| 事件 | 签名 | 说明 |
| --- | --- | --- |
| `onOpenChange` | `(open: boolean) => void` | 展开/收起变化回调(受控 / 非受控均触发)。<br>· `open` — 变化后的目标展开态:true 为展开,false 为收起。 |

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-26 |
| 标签 | `collapsible` `disclosure` `expandable` `toggle` `primitive` `show-hide` |

::: details 需求原文 / 设计意图
需要一个比 Accordion 更底层的单个开合原语:没有 single/multiple 互斥分组,只管「一段内容的展开与收起」,供使用方自由拼装(FAQ 行、设置项、详情展开块、侧栏分区等)。对标 Radix Collapsible 的复合 API(Root + Trigger + Content),提供受控/非受控双通道、disabled 整体禁用。高度过渡用 grid-template-rows 0fr↔1fr 平滑撑高,并随 reduced-motion / data-ms-motion=off 降级为瞬时。a11y:Trigger 原生 button + aria-expanded/aria-controls,Content role=region + aria-labelledby。兼容性取舍(透明备注):Content 始终常驻挂载(对齐 Accordion),靠 data-state 切换网格行高 + visibility 延迟过渡播双向动画、inert={!open} 隐藏交互/读屏。此设计取代了早期「收起即卸载 + 退场暂留 + 硬编码 400ms 兜底定时器」实现——后者有三个真实 bug:收起那拍渲染守卫先于 effect 卸载又重挂(收起动画不播 + Content 子树及其 state/输入值/滚动/焦点被销毁)、首次展开带 open 态直接插入 DOM 无样式变化(展开动画被跳过)、兜底定时器硬编码 400ms(覆盖 --ms-dur-base≥400ms 时收起动画被提前卸载截断)。常驻挂载一并根治三者且无需任何兜底定时器。代价:forceMount 属性(根 + Content 实例级)因 Content 已恒挂载而成为 no-op,标 @deprecated 仅为不破坏既有 API;不再有「收起后从 DOM 卸载」行为,依赖收起卸载省渲染开销者需自行条件渲染整个 Collapsible。
:::
