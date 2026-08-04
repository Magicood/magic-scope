# Paragraph <Badge type="warning" text="draft" /> <Badge type="info" text="v0.0.0" />

块级正文段落,围绕 &lt;p&gt; 的生产级排版原语:size/leading/tone/dimmed/align,多行省略与一键复制。

> **[在展示站中打开 Paragraph](https://magicood.github.io/magic-scope/#/paragraph)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

自研、复用全库 tone resolver,消费 @magic-scope/tokens 的 --ms-&#42; 变量。

size 走流式字阶(--ms-type-step-&#42;),leading 为行高语义档(正文默认 relaxed 更舒展);tone 上色、dimmed 弱化为次要前景、align 逻辑对齐(RTL 友好)。

ellipsis 多行 clamp(可带 AntD 式「展开/收起」),copyable 一键复制(成功瞬间触发 glow 光晕一闪,受全局光影开关与 reduced-motion 调制)。

留口:...rest 透传原生属性/事件,as 多态、asChild Slot,classNames 映射子部件。展开/收起/复制文案走 i18n。

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `as` | `ElementType` | — | 多态渲染根标签(默认 p)。语义场景可换 div/article 段落容器等。 |
| `asChild` | `boolean` | `false` | 渲染为唯一子元素并把样式/props 合并上去(Slot 模式)。注意:asChild 下不渲染复制/展开按钮。 |
| `size` | `"base" \| "sm" \| "lg" \| "xl" \| "xs"` | — | 字号档(走 --ms-type-step-&#42; 流式字阶)。默认 base。 |
| `leading` | `"normal" \| "loose" \| "tight" \| "snug" \| "relaxed"` | — | 行高语义档。正文默认 relaxed(更舒展易读)。 |
| `tone` | `"primary" \| "accent" \| "success" \| "warning" \| "danger" \| "info" \| "neutral"` | — | 语义色调(复用全库 tone resolver 的 --ms-c)。 |
| `dimmed` | `boolean` | — | 弱化为次要前景色(fg-muted),用于辅助说明文字。 |
| `align` | `"center" \| "end" \| "start" \| "justify"` | — | 文本对齐(逻辑值 start/end,RTL 友好)。 |
| `ellipsis` | `EllipsisProp` | — | 多行省略:`true` 单行尾部省略;对象 `{ rows, expandable, symbol }` 多行 clamp + 可选展开/收起。<br>兼容:基于 -webkit-line-clamp(需 display:-webkit-box),Chrome/Safari/FF 现代版均支持。<br>expandable=true 时渲染「展开/收起」按钮(走 typography.expand/collapse 文案)。 |
| `copyable` | `CopyableProp` | — | 复制:`true` 复制段落自身可见文本;对象 `{ text, onCopy }` 自定义文本与成功回调。<br>走 navigator.clipboard(降级 execCommand);复制成功瞬间触发一次 glow 闪烁<br>(受 data-ms-fx / prefers-reduced-motion 降级)。文案走 typography.copy/copied。 |
| `classNames` | `ParagraphClassNames` | — | 关键子部件 className 映射。 |
| `...props` | `ComponentPropsWithoutRef<'p'>` | — | 透传原生 p 属性(className / style / aria-&#42; / 事件等)。 |

## 事件 Events

| 事件 | 签名 | 说明 |
| --- | --- | --- |
| `onExpandChange` | `(expanded: boolean) => void` | 展开/收起状态变化回调(expandable 时)。 |

此外透传原生 `<p>` 的全部标准事件(onClick / onFocus / onKeyDown …),与自有事件按 compose 合并、互不覆盖。

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-26 |
| 标签 | `paragraph` `text` `typography` `body` `ellipsis` `line-clamp` `expandable` `copyable` `clipboard` `polymorphic` |

::: details 需求原文 / 设计意图
块级 &lt;p&gt; 正文 typography 组件。需求:size/leading/tone/dimmed/align 基础排版;ellipsis?: boolean | { rows, expandable, symbol } 多行省略 + 可选展开/收起(AntD 式,走 typography.expand/collapse 文案);copyable?: boolean | { text, onCopy } 复制按钮(navigator.clipboard,走 typography.copy/copied,复制成功瞬间触发魔法 glow 一闪)。展开/复制纯逻辑抽 logic.ts。对标旗舰 Text/Button/Input:多态 as/asChild、forwardRef 到根、...rest 透传、tone 走 --ms-c 槽位、动效双降级(prefers-reduced-motion + data-ms-motion=off)、i18n 走 useMessages、strict TS。
:::
