# Badge <Badge type="tip" text="stable" /> <Badge type="info" text="v0.2.0" />

小标签,用于状态、计数或分类标记。三种视觉变体 × 六档语义色调。

> **[在展示站中打开 Badge](https://magicood.github.io/magic-scope/#/badge)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

自研、零依赖,消费 @magic-scope/tokens 的 --ms-&#42; 变量。

小字号、圆角 full、紧凑内边距;solid 实底配 on-&#42; 文字,soft 用 color-mix 柔和底,outline 走描边。neutral 色调走中性的 fg-muted / border。透传全部原生 &lt;span&gt; 属性。

## 静态预览

静态还原(深色奥术主题),仅展示典型形态;完整交互以展示站为准。

<!--@include: ../previews/badge.md-->

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `variant` | `"glow" \| "solid" \| "soft" \| "outline"` | `soft` | 视觉变体:实底 / 柔和底 / 描边 / 发光实底。默认 soft。 |
| `tone` | `"primary" \| "accent" \| "success" \| "warning" \| "danger" \| "info" \| "neutral"` | `primary` | 语义色调,经全库 tone resolver 派生配色(只读 6 槽位)。默认 primary。 |
| `size` | `"sm" \| "md"` | `md` | 尺寸(随 data-ms-density 缩放)。默认 md。 |
| `dot` | `boolean` | `false` | 纯圆点徽标(无文字),仅 tone 着色;配 pulse 呼吸动效。 |
| `pulse` | `boolean` | `false` | 圆点 / 角标的脉冲呼吸动效(受 --ms-motion-scale 门控,可一键降级)。 |
| `count` | `number` | — | 数字徽标:计数值。提供时按 count/max/showZero 推导显示文本(优先于 children)。 |
| `max` | `number` | `99` | 计数上限,超出显示 `${max}+`。默认 99。 |
| `showZero` | `boolean` | `false` | count 为 0 时是否仍显示。默认 false。 |
| `icon` | `ReactNode` | — | 前置图标 / 装饰槽位(ReactNode)。 |
| `standalone` | `boolean` | `true` | 独立徽标(默认 true):自身就是一个 inline 标签。<br>为 false 时作为角标:用 children 包裹宿主内容,徽标绝对定位到角上(overlap)。 |
| `placement` | `"top-end" \| "top-start" \| "bottom-end" \| "bottom-start"` | `top-end` | 角标定位(仅 standalone=false 生效)。默认 top-end。 |
| `asChild` | `boolean` | `false` | 渲染为子元素并保留徽标样式(Radix Slot 风格;仅 standalone 时生效)。 |
| `children` | `ReactNode` | — | 徽标内容。 |
| `...props` | `ComponentPropsWithoutRef<'span'>` | — | 透传原生 span 属性(className / style / aria-&#42; / 事件等)。 |

## 事件 Events

此外透传原生 `<span>` 的全部标准事件(onClick / onFocus / onKeyDown …),与自有事件按 compose 合并、互不覆盖。

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-24 |
| 标签 | `badge` `tag` `label` `chip` `status` `count` `dot` `notification` `indicator` `data-display` `pill` |

::: details 需求原文 / 设计意图
状态 / 计数 / 角标徽标(旗舰深度):四变体(solid/soft/outline/glow)× 七语义色调,接全库 tone resolver(只读 6 槽位 --ms-c / --ms-c-hover / --ms-c-active / --ms-on-c / --ms-c-soft / --ms-c-glow,零硬编码配色)。圆点 dot(可 pulse)、数字徽标(count + max 默认 99 + showZero,圆角 full)、角标 overlap(standalone=false 用 children 包裹宿主、top/bottom × start/end 四角定位)、size(sm/md 随 --ms-density-scale 缩放)、icon ReactNode 槽位、asChild 多态。magic-scope 通用基础组件:自研、消费 tokens 的 --ms-&#42; 变量,完整状态与过渡、发光,尊重 prefers-reduced-motion 与 data-ms-motion/data-ms-fx 总闸。数字推导逻辑抽离为框架无关纯函数(logic.ts)便于平移 core。
:::
