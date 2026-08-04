# VisuallyHidden <Badge type="tip" text="stable" /> <Badge type="info" text="v0.1.0" />

无障碍隐藏原语:内容对视觉隐身、却仍留在无障碍树里供屏幕阅读器朗读;支持 focusable 的 skip-link 聚焦还原。

> **[在展示站中打开 VisuallyHidden](https://magicood.github.io/magic-scope/#/visually-hidden)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

基础设施 / 无障碍工具组件,本身无常规视觉形态。用标准 sr-only 技法(position:absolute + 1px 尺寸 + clip 裁剪 + overflow:hidden)把内容对视觉藏起,刻意不用 display:none / visibility:hidden——后两者会把元素从可达性树摘掉,屏幕阅读器也读不到,与意图相悖。

典型用途:给纯图标按钮补可读标签、给表单控件补隐藏说明、给区块补朗读标题。focusable 开启 skip-link 模式:平时隐身、键盘 Tab 聚焦时浮现还原可见(:focus / :focus-within 解除裁剪),做「跳到主内容」锚点。

全库一致的留口:as 多态根标签(默认 span)、asChild 把类/props/ref 合并到自带子元素(事件 compose + ref 合并)、forwardRef 与 className / 原生属性透传。

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `as` | `ElementType` | — | 多态根标签(默认 span)。需要块级语义或落在特定标签里时改用 div/label/h2 等。 |
| `asChild` | `boolean` | `false` | 渲染为唯一子元素并把样式/props 合并上去(Radix Slot 模式;如包裹路由 Link / 自带交互元素)。<br>与 as 互斥:asChild 为真时忽略 as,直接复用子元素作为渲染根。 |
| `focusable` | `boolean` | `false` | skip-link 模式:聚焦时临时还原可见(`:focus` / `:focus-within` 解除裁剪)。<br>用于「跳到主内容」等键盘可达但视觉隐藏的锚点 —— 平时隐身,Tab 聚焦时浮现。<br>注意:开启后该元素须自身可聚焦(如 `<a href>` 或带 tabIndex),否则 `:focus` 永不命中。 |
| `...props` | `ComponentPropsWithoutRef<'span'>` | — | 透传原生 span 属性(className / style / aria-&#42; / 事件等)。 |

## 事件 Events

此外透传原生 `<span>` 的全部标准事件(onClick / onFocus / onKeyDown …),与自有事件按 compose 合并、互不覆盖。

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-26 |
| 标签 | `accessibility` `a11y` `sr-only` `screen-reader` `skip-link` `utility` `polymorphic` `as-child` |

::: details 需求原文 / 设计意图
需要一个把内容对视觉隐藏、却仍保留在无障碍树里供屏幕阅读器朗读的原语(给纯图标按钮补可读标签、给区块补朗读标题、给表单控件补隐藏说明)。必须走标准 sr-only 技法(absolute + 1px + clip + overflow:hidden),禁止 display:none / visibility:hidden,否则元素被摘出可达性树、SR 也读不到。同时要 focusable 的 skip-link 模式:平时隐身、键盘 Tab 聚焦时浮现还原可见。与全库一致提供 as 多态根、asChild 合并(事件 compose + ref 合并)、className 透传。
:::
