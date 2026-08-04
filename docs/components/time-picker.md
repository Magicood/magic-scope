# TimePicker <Badge type="tip" text="stable" /> <Badge type="info" text="v0.1.0" />

时间选择器,只读 Input + 浮层内可滚动的时/分/秒列,逐列选值。

> **[在展示站中打开 TimePicker](https://magicood.github.io/magic-scope/#/time-picker)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

自研、零依赖:trigger 是只读 Input,点开后浮层里排「时 / 分 / 秒」三条独立可滚动列(每列一个 listbox),选中项高亮并自动滚到列中央,对标主流库的滚轮列体验。

浮层复用与 Select 同款的原生 Popover API(自带点外 / Esc 关闭)+ CSS Anchor Positioning + @supports 降级。可切 12/24 小时制(12 制额外加 AM/PM 列)、按 hourStep/minuteStep/secondStep 稀疏化选项、按 disabledHours/Minutes/Seconds 屏蔽不可选值,底部「此刻 / 确定」一键操作;值同吃 Date 与 "HH:mm:ss" 字符串、受控/非受控双通道,接全库 tone 与密度。

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` | `string \| Date \| null` | — | 当前值(受控):Date 或 "HH:mm:ss" / "HH:mm" 字符串。传入即受控。 |
| `defaultValue` | `string \| Date \| null` | — | 默认值(非受控):Date 或字符串。 |
| `use12Hours` | `boolean` | — | 12 小时制:额外渲染 AM/PM 列,trigger 显示带子午线。默认 false(24 制)。 |
| `showSecond` | `boolean` | — | 是否显示秒列。默认 true。 |
| `format` | `((parts: TimeParts) => string)` | — | 自定义 trigger 显示格式:覆盖默认 formatTime。 |
| `hourStep` | `number` | — | 小时步进(24 制对 0-23 取间隔)。默认 1。 |
| `minuteStep` | `number` | — | 分钟步进。默认 1。 |
| `secondStep` | `number` | — | 秒步进。默认 1。 |
| `disabledHours` | `number[] \| (() => number[])` | — | 禁用的小时(24 制值);数组或返回数组的函数。 |
| `disabledMinutes` | `number[] \| ((selectedHour: number \| null) => number[])` | — | 禁用的分钟;数组或返回数组的函数(可依当前小时动态返回)。 |
| `disabledSeconds` | `number[] \| ((selectedHour: number \| null, selectedMinute: number \| null) => number[])` | — | 禁用的秒;数组或返回数组的函数。 |
| `placeholder` | `string` | — | 占位文本(未选中)。默认走 i18n timePicker.placeholder。 |
| `size` | `"sm" \| "md" \| "lg"` | — | 尺寸(随密度缩放)。默认 md。 |
| `tone` | `"primary" \| "accent" \| "success" \| "warning" \| "danger" \| "info"` | — | 语义色调,派生高亮/发光(只读 --ms-c&#42; 槽位)。默认 primary。 |
| `invalid` | `boolean` | — | 校验失败态:染 danger、设 aria-invalid(供 Form)。 |
| `disabled` | `boolean` | — | 是否禁用整个选择器。 |
| `clearable` | `boolean` | — | 有值时显示清除按钮(走 input.clear 文案)。 |
| `footer` | `boolean` | — | 是否显示底部「此刻 / 确定」操作栏。默认 true。 |
| `open` | `boolean` | — | 受控开合(配 onOpenChange);不传则非受控。 |
| `prefix` | `ReactNode` | — | trigger 前置内容(图标 / 文字)。 |
| `className` | `string` | — | 根容器附加 className。 |
| `classNames` | `TimePickerClassNames` | — | 各部件细粒度 className 槽位。 |

## 事件 Events

| 事件 | 签名 | 说明 |
| --- | --- | --- |
| `onChange` | `(value: string \| null, parts: TimeParts \| null) => void` | 值变化回调(选中某列、点「此刻」、清除时触发)。<br>· `value` — 新值的 "HH:mm:ss"(无秒模式为 "HH:mm")字符串;清除时为 null。<br>· `parts` — 新值的时分秒分量;清除时为 null。 |
| `onOpenChange` | `(open: boolean) => void` | 开合变化回调(受控/非受控双通道)。<br>· `open` — 变化后的开合状态:true 为展开,false 为收起。 |
| `onFocus` | `(event: FocusEvent<HTMLInputElement, Element>) => void` | trigger 获焦(供表单聚焦校验)。<br>· `event` — 原生聚焦事件。 |
| `onBlur` | `(event: FocusEvent<HTMLInputElement, Element>) => void` | trigger 失焦(供表单 blur 校验)。<br>· `event` — 原生失焦事件。 |

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-26 |
| 标签 | `time-picker` `time` `forms` `input` `popover` `listbox` `12-hour` `24-hour` `step` `clearable` `controlled` `a11y` |

::: details 需求原文 / 设计意图
需要一个生产级时间选择器:trigger 是只读 Input 显示格式化时间或占位;点开浮层后用「时/分/秒」三条可滚动列让用户逐列选值(对标主流库的滚轮列体验),选中项高亮并滚到列中央。要能切 12/24 小时制(12 制额外加 AM/PM 列)、按 hourStep/minuteStep/secondStep 稀疏化选项、按 disabledHours/Minutes/Seconds 屏蔽不可选值,并提供「此刻」一键填当前时间与「确定」收起。值要同时吃 Date 与 'HH:mm:ss' 字符串、受控/非受控双通道,开合可受控。把纯逻辑(解析/格式化/12-24 互转/选项生成/clamp 对齐/禁用判定/列内导航)抽进零 React 的 logic.ts 以便平移到 vue/core。a11y 上每列是独立 listbox + option(aria-selected),键盘 ↑↓ 在列内选值;供 Form 用的 invalid 态。浮层复用与 Select 同款的原生 Popover API + CSS Anchor Positioning + 降级方案,保持全库适配语义一致。
:::
