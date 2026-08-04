# Slider <Badge type="tip" text="stable" /> <Badge type="info" text="v0.0.0" />

滑块,基于原生 input&#91;type=range],自绘轨道 / 填充 / 发光滑块。

> **[在展示站中打开 Slider](https://magicood.github.io/magic-scope/#/slider)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

用原生 range 白嫖可访问的 slider 语义(role=slider、aria-valuenow/min/max、方向键 / Home / End);以 appearance:none + 伪元素自绘轨道 / 填充 / 滑块。支持受控与非受控,sm/md/lg 三档,触控热区达标、hover/focus-visible 发光、尊重 reduced-motion。可选 showValue + formatValue 在末尾渲染当前值(role=status 的 output)。

## 静态预览

静态还原(深色奥术主题),仅展示典型形态;完整交互以展示站为准。

<!--@include: ../previews/slider.md-->

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` | `number` | — | 受控值。 |
| `defaultValue` | `number` | — | 非受控初始值。缺省取 min。 |
| `min` | `number` | `0` | 最小值。默认 0。 |
| `max` | `number` | `100` | 最大值。默认 100。 |
| `step` | `number` | `1` | 步长。默认 1。 |
| `size` | `"sm" \| "md" \| "lg"` | `md` | 尺寸:轨道与滑块等比缩放(随密度)。默认 md。 |
| `tone` | `"primary" \| "accent" \| "success" \| "warning" \| "danger" \| "info" \| "neutral"` | `primary` | 语义色调,经全库 tone resolver 派生配色(轨道填充 / 滑块 / 发光)。默认 primary。 |
| `orientation` | `"horizontal" \| "vertical"` | `horizontal` | 朝向:水平 / 垂直。垂直时需给容器一个高度(--ms-slider-length 或外层 style)。默认 horizontal。 |
| `marks` | `SliderMark[]` | — | 刻度:沿轨道按值绝对定位 tick;有 label 时在其下/旁渲染文字。被填充覆盖的刻度高亮。 |
| `showTooltip` | `boolean` | `false` | 拖动时在滑块上方显示跟随气泡(showValue 同款格式)。默认 false。 |
| `showValue` | `boolean` | `false` | 是否在末尾渲染当前值(role=status 的 output)。默认 false。 |
| `formatValue` | `((value: number) => ReactNode)` | — | 自定义值的展示(如加单位 / 百分号);用于 showValue 与 showTooltip。 |
| `...props` | `ComponentPropsWithoutRef<'input'>` | — | 透传原生 input 属性(className / style / aria-&#42; / 事件等)。 |

## 事件 Events

| 事件 | 签名 | 说明 |
| --- | --- | --- |
| `onValueChange` | `(value: number) => void` | 值变化回调(拖动 / 键盘,高频)。<br>· `value` — 变化后的当前数值。 |
| `onChangeEnd` | `(value: number) => void` | 落定回调:松手 / 键盘抬起 / 失焦时,以最终值触发一次(对齐 Radix `onValueCommit`、MUI `onChangeCommitted`)。<br>拖动中不触发,适合做「提交请求 / 写入 store」这类只关心终值的副作用。<br>· `value` — 本次交互落定后的最终数值。 |
| `onValueCommit` | `(value: number) => void` | `onChangeEnd` 的别名(对齐 Radix 命名),两者都会被调用。<br>· `value` — 本次交互落定后的最终数值。 |
| `onDragStart` | `() => void` | 开始拖动 / 键盘交互(显气泡、抬 thumb 层级),无参数。 |
| `onDragEnd` | `() => void` | 结束拖动 / 键盘交互,无参数。 |

此外透传原生 `<input>` 的全部标准事件(onClick / onFocus / onKeyDown …),与自有事件按 compose 合并、互不覆盖。

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-25 |
| 标签 | `slider` `range` `form` `input` `number` `marks` `tone` `vertical` `tooltip` |

::: details 需求原文 / 设计意图
补齐表单控件:数值滑块。原创实现,遵循『原生优先 / 不 wrap 第三方』——以原生 input&#91;type=range] 承载键盘与 ARIA slider 语义,仅用 appearance:none + ::-webkit-slider-&#42; / ::-moz-range-&#42; 自绘皮肤(填充用 WebKit 渐变 + Firefox 原生 progress)。延续设备适配契约(触控放大滑块 + --ms-target-min 行高、hover 守卫、focus-visible 发光环、reduced-motion)。
:::
