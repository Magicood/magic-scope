# Divider <Badge type="tip" text="stable" /> <Badge type="info" text="v0.2.0" />

分隔线,语义 &lt;hr&gt;(隐含 separator role),支持水平 / 垂直两种朝向。

> **[在展示站中打开 Divider](https://magicood.github.io/magic-scope/#/divider)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

自研、零依赖,消费 @magic-scope/tokens 的 --ms-&#42; 变量。

用语义 &lt;hr&gt; 渲染(隐含 separator role),按朝向设 aria-orientation;水平用 border-block-start 横跨容器,垂直用 border-inline-start 行内贴满高度。逻辑属性,RTL 自动适配。

## 静态预览

静态还原(深色奥术主题),仅展示典型形态;完整交互以展示站为准。

<!--@include: ../previews/divider.md-->

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `children` | `ReactNode` | — | 内容槽位:有内容时升级为带文字的分隔(role=separator + 两侧画线)。 |
| `label` | `ReactNode` | — | 内容槽位别名(等价 children;两者都传时 children 优先)。 |
| `textAlign` | `"center" \| "end" \| "start"` | `center` | 文字对齐(仅 horizontal 有内容时生效):start / center / end。默认 center。 |
| `orientation` | `"horizontal" \| "vertical"` | `horizontal` | 朝向:水平(横跨容器宽度)/ 垂直(贴满容器高度,行内)。默认 horizontal。 |
| `variant` | `"dashed" \| "dotted" \| "solid"` | `solid` | 线型:实线 / 虚线 / 点线。默认 solid。 |
| `tone` | `"primary" \| "accent" \| "success" \| "warning" \| "danger" \| "info" \| "neutral"` | `neutral` | 语义色调:线色与微光读对应 tone 的 --ms-c / --ms-c-glow。默认 neutral(= border 色)。 |
| `thickness` | `DividerThickness` | `thin` | 线粗:thin(1px)/ regular(2px)/ bold(3px)或任意 CSS 长度。默认 thin。 |
| `spacing` | `DividerSpacing` | `none` | 主轴外间距(随密度缩放):none / sm / md / lg 或任意 CSS 长度。默认 none。 |
| `...props` | `ComponentPropsWithoutRef<'hr'>` | — | 透传原生 hr 属性(className / style / aria-&#42; / 事件等)。 |

## 事件 Events

此外透传原生 `<hr>` 的全部标准事件(onClick / onFocus / onKeyDown …),与自有事件按 compose 合并、互不覆盖。

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-24 |
| 标签 | `divider` `separator` `layout` `horizontal` `vertical` `rule` `dashed` `dotted` `tone` `label` `text-divider` `thickness` `spacing` |

::: details 需求原文 / 设计意图
分隔线,支持水平/垂直朝向,带 separator 语义与 aria-orientation。补强到生产级深度:children/label 文字分隔槽位(两侧伪线 + textAlign)、tone 语义色调(读 tone 6 槽位 --ms-c/--ms-c-glow,默认 neutral=border 色)、variant(solid/dashed/dotted)、thickness/spacing(spacing 随 --ms-density-scale 缩放)。magic-scope 通用基础组件:自研、消费 tokens 的 --ms-&#42; 变量,完整状态与过渡、发光(受 --ms-fx-glow 调制、data-ms-fx=off 总闸),尊重 prefers-reduced-motion 与 data-ms-motion。
:::
