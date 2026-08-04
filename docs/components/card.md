# Card <Badge type="tip" text="stable" /> <Badge type="info" text="v0.2.0" />

内容卡片容器,elevated(底+柔影)与 outline(描边)两种变体,可选 interactive 上浮发光。

> **[在展示站中打开 Card](https://magicood.github.io/magic-scope/#/card)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

自研、零依赖,消费 @magic-scope/tokens 的 --ms-&#42; 变量。

elevated 用 surface 底配柔和阴影,outline 用透明底配描边。

interactive 时 hover 上浮带柔和发光,并补 focus-visible 聚焦环与默认 tabIndex,尊重 reduced-motion。承载任意 children,超长内容自动换行收在边界内。

## 静态预览

静态还原(深色奥术主题),仅展示典型形态;完整交互以展示站为准。

<!--@include: ../previews/card.md-->

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `variant` | `"outline" \| "elevated"` | `elevated` | 视觉变体:elevated(surface 底 + 柔和阴影)/ outline(透明底 + 描边)。默认 elevated。 |
| `tone` | `"primary" \| "accent" \| "success" \| "warning" \| "danger" \| "info" \| "neutral"` | `neutral` | 语义色调,经全库统一 tone resolver 派生配色(描边 / 发光 / 柔底)。默认 neutral(无强语义色,沿用中性表面)。 |
| `padding` | `"none" \| "sm" \| "md" \| "lg"` | `md` | 内边距档位(随密度 --ms-density-scale 缩放):none 供满血媒体 / sm / md / lg。默认 md。 |
| `interactive` | `boolean` | `false` | 可交互:true 时 hover 上浮 + 发光、暴露键盘聚焦环(tabIndex/focus-visible),并支持 Enter/Space 触发 onClick。 |
| `asChild` | `boolean` | `false` | 渲染为子元素(如 &lt;a&gt; / &lt;article&gt; / 路由 Link)并保留卡片样式与 interactive 行为(Radix Slot 风格;由子元素自带内容)。 |
| `...props` | `ComponentPropsWithoutRef<'div'>` | — | 透传原生 div 属性(className / style / aria-&#42; / 事件等)。 |

## 事件 Events

此外透传原生 `<div>` 的全部标准事件(onClick / onFocus / onKeyDown …),与自有事件按 compose 合并、互不覆盖。

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-24 |
| 标签 | `card` `layout` `container` `surface` `elevated` `outline` `interactive` `tone` `padding` `media` `header` `footer` `composable` `as-child` `keyboard` |

::: details 需求原文 / 设计意图
内容卡片容器,支持 elevated(柔和阴影)与 outline(描边)两种变体,可设为 interactive 时 hover 上浮并发光。补强到生产级深度:tone 语义色调(读 tone 6 槽位,不写死语义色)、padding 档位(随密度缩放,none 供满血媒体)、interactive 键盘激活(Enter/Space → onClick,composeEventHandlers 合并不替换用户 handler)、asChild 多态(Radix Slot 风格,渲染为 a/article/路由 Link)、可组合子部件 CardHeader/CardTitle/CardBody/CardFooter/CardMedia。magic-scope 通用基础组件:自研、消费 tokens 的 --ms-&#42; 变量,完整状态与过渡、发光,尊重 prefers-reduced-motion 与 data-ms-fx/motion 总闸。
:::
