# Switch <Badge type="tip" text="stable" /> <Badge type="info" text="v0.1.0" />

开关,基于原生 input&#91;type=checkbox],checked 时轨道染 primary、滑块右移并发光。

> **[在展示站中打开 Switch](https://magicood.github.io/magic-scope/#/switch)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

自研、零依赖,消费 @magic-scope/tokens 的 --ms-&#42; 变量。

视觉隐藏原生 checkbox 但保留其语义与可达性:完整覆盖 hover / focus-visible(发光环) / disabled 状态与平滑过渡,并尊重 prefers-reduced-motion。触控设备隐形扩竖直命中区到 --ms-target-min。

受控(checked + onChange)或非受控(defaultChecked)皆可,透传全部原生 checkbox 属性(name / value / required / aria-&#42; 等)。

## 静态预览

静态还原(深色奥术主题),仅展示典型形态;完整交互以展示站为准。

<!--@include: ../previews/switch.md-->

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `size` | `"sm" \| "md" \| "lg"` | `md` | 尺寸(轨道/滑块随密度 data-ms-density 缩放)。默认 md。 |
| `tone` | `"primary" \| "accent" \| "success" \| "warning" \| "danger" \| "info" \| "neutral"` | `primary` | 语义色调,经全库 tone resolver 派生 checked 配色与 glow。默认 primary。 |
| `children` | `ReactNode` | — | 开关右侧文字(随轨道对齐,可点击切换)。 |
| `checkedIcon` | `ReactNode` | — | 轨道内「开」一端的图标(checked 时可见)。 |
| `uncheckedIcon` | `ReactNode` | — | 轨道内「关」一端的图标(unchecked 时可见)。 |
| `loading` | `boolean` | `false` | 加载态:滑块转为旋转图标、禁用交互、aria-busy。 |
| `labelClassName` | `string` | — | 根 label 的额外类名(同 className,语义化别名)。 |
| `trackClassName` | `string` | — | 轨道部件类名留口。 |
| `thumbClassName` | `string` | — | 滑块部件类名留口。 |
| `...props` | `ComponentPropsWithoutRef<'input'>` | — | 透传原生 input 属性(className / style / aria-&#42; / 事件等)。 |

## 事件 Events

此外透传原生 `<input>` 的全部标准事件(onClick / onFocus / onKeyDown …),与自有事件按 compose 合并、互不覆盖。

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-24 |
| 标签 | `switch` `toggle` `form` `checkbox` `tone` `size` `loading` `icon` |

::: details 需求原文 / 设计意图
开关:基于 input&#91;type=checkbox] 的视觉隐藏切换控件,checked 时轨道染主色、滑块右移并发光,完整 hover/focus-visible(发光环)/disabled 状态(逻辑属性,RTL 友好,尊重 reduced-motion)。工程要求(magic-scope 通用基础组件):自研、消费 tokens 的 --ms-&#42; 变量,完整状态与过渡、发光,尊重 prefers-reduced-motion。
:::
