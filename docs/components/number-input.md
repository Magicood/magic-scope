# NumberInput <Badge type="tip" text="stable" /> <Badge type="info" text="v0.0.0" />

数字步进输入,− / ＋ 按钮配原生 spinbutton,支持 min/max/step 与三档尺寸。

> **[在展示站中打开 NumberInput](https://magicood.github.io/magic-scope/#/number-input)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

自研、零依赖,消费 @magic-scope/tokens 的 --ms-&#42; 变量。

结构为「− 按钮 + input&#91;type=number] + ＋ 按钮」的整体描边控件,内部以显示文本管理,避免受控数字框打不出小数点 / 中间态的老问题。

步进与失焦时夹取到 &#91;min,max];触控热区达标、hover / focus 发光、尊重 reduced-motion。受控值通过 onValueChange 上报(有效数字传 number,清空传 null);到达边界时对应步进按钮自动禁用。

## 静态预览

静态还原(深色奥术主题),仅展示典型形态;完整交互以展示站为准。

<!--@include: ../previews/number-input.md-->

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` | `number` | — | 受控值。 |
| `defaultValue` | `number` | — | 非受控初始值。 |
| `min` | `number` | `Number.NEGATIVE_INFINITY` | 最小值。默认 -Infinity(不限)。 |
| `max` | `number` | `Number.POSITIVE_INFINITY` | 最大值。默认 Infinity(不限)。 |
| `step` | `number` | `1` | 步进步长(步进按钮与方向键)。默认 1。 |
| `size` | `"sm" \| "md" \| "lg"` | `md` | 尺寸(随 data-ms-density 缩放)。默认 md。 |
| `invalid` | `boolean` | `false` | 校验失败态:染 danger 边发光并设 aria-invalid。 |
| `tone` | `"primary" \| "accent" \| "success" \| "warning" \| "danger" \| "info" \| "neutral"` | `primary` | 聚焦发光环色调;invalid 时强制 danger。默认 primary。 |
| `prefix` | `ReactNode` | — | 框内前置内容(图标 / 单位文字,如 ¥)。 |
| `suffix` | `ReactNode` | — | 框内后置内容(单位文字,如 % / kg)。 |
| `className` | `string` | — | 外层容器 className(组件根)。 |
| `fieldClassName` | `string` | — | 原生 input 自身 className。 |
| `stepClassName` | `string` | — | 两个步进按钮 className。 |
| `...props` | `ComponentPropsWithoutRef<'input'>` | — | 透传原生 input 属性(className / style / aria-&#42; / 事件等)。 |

## 事件 Events

| 事件 | 签名 | 说明 |
| --- | --- | --- |
| `onValueChange` | `(value: number \| null) => void` | 值变化回调。<br>· `value` — 当前值:有效数字时为 number,清空时为 null。 |
| `onStep` | `(value: number, direction: StepDirection) => void` | 任一方向步进后回调(按钮或方向键)。<br>· `value` — 步进后的新值。<br>· `direction` — 步进方向:'up' 向上 / 'down' 向下。 |
| `onStepUp` | `(value: number) => void` | 向上步进后回调。<br>· `value` — 步进后的新值。 |
| `onStepDown` | `(value: number) => void` | 向下步进后回调。<br>· `value` — 步进后的新值。 |
| `onPressEnter` | `(value: number \| null, event: KeyboardEvent<HTMLInputElement>) => void` | 回车回调:clamp 并提交后触发。<br>· `value` — 提交后的值:有效数字时为 number,空内容时为 null。<br>· `event` — 触发提交的键盘事件。 |

此外透传原生 `<input>` 的全部标准事件(onClick / onFocus / onKeyDown …),与自有事件按 compose 合并、互不覆盖。

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-25 |
| 标签 | `number-input` `number` `stepper` `spinbutton` `form` `input` `prefix` `suffix` `long-press` `tone` `invalid` |

::: details 需求原文 / 设计意图
补齐表单控件:带步进按钮的数字输入。原创实现,原生优先(input&#91;type=number] 提供 spinbutton 语义与方向键),自绘 − / ＋ 步进与皮肤;内部文本态管理解决受控数字框中间态丢失的经典问题,步进/失焦夹取边界。延续设备适配契约(触控热区、focus-within 发光、hover 守卫、iOS 字号防缩放、reduced-motion)。
:::
