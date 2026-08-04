# DatePicker <Badge type="tip" text="stable" /> <Badge type="info" text="v0.1.0" />

日期选择器,single/range 双模 + 三视图日历,自研零依赖、键盘全可达。

> **[在展示站中打开 DatePicker](https://magicood.github.io/magic-scope/#/date-picker)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

自研、零依赖的旗舰深度组件:single 选单日、range 选区间双模,date/month/year 三视图日历可逐级下钻导航。

所有日期数学(月历矩阵、加减月年、范围判定、夹取、ISO)纯 TS 进 logic.ts(可平移 core),月名/周名/显示格式经 Intl.DateTimeFormat 按 locale 取,UI 文案走全库 i18n;日期一律按本地时区年月日处理,避免跨时区偏一天。

复用全库 Popover 做浮层(点外 / Esc 关闭、12 向 placement),range 带悬停预览与预设,支持 min/max/disabledDate、可清除、完整方向键 / PageUp-Down / Home-End / Enter 键盘操作,日历用 ARIA grid 模式。

tone 聚焦发光环、invalid→danger 并设 aria-invalid,便于嵌进 Form。

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `mode` | `"single" \| "range"` | — | single 选单日;range 选区间。默认 single。 |
| `value` | `Date \| null` | — | 受控值(single)。null=已清空。 |
| `defaultValue` | `Date \| null` | — | 非受控初值(single)。 |
| `rangeValue` | `DateRange` | — | 受控值(range)。 |
| `defaultRangeValue` | `DateRange` | — | 非受控初值(range)。 |
| `min` | `Date \| null` | — | 可选下限。 |
| `max` | `Date \| null` | — | 可选上限。 |
| `disabledDate` | `((date: Date) => boolean)` | — | 自定义禁用判定。 |
| `weekStart` | `0 \| 1 \| 5 \| 2 \| 3 \| 4 \| 6` | — | 一周起始(0=周日 … 6=周六)。默认 1(周一)。 |
| `locale` | `string` | — | BCP-47 locale(月名/周名/显示格式经 Intl 取)。 |
| `format` | `((date: Date) => string)` | — | 自定义显示格式(覆盖默认 Intl medium)。 |
| `placeholder` | `string` | — | 占位文字(single)。 |
| `presets` | `DatePreset[]` | — | range 预设(渲染在 footer)。 |
| `clearable` | `boolean` | — | 可清除。默认 true。 |
| `disabled` | `boolean` | — | 禁用。 |
| `size` | `"sm" \| "md" \| "lg"` | — | 尺寸(随 data-ms-density 缩放)。默认 md。 |
| `tone` | `"primary" \| "accent" \| "success" \| "warning" \| "danger" \| "info"` | — | 聚焦发光环色调;invalid 时强制 danger。默认 primary。 |
| `invalid` | `boolean` | — | 校验失败态:染 danger 发光环并设 aria-invalid(供 Form 集成)。 |
| `open` | `boolean` | — | 受控浮层开合。 |
| `placement` | `"left" \| "right" \| "bottom" \| "top" \| "top-end" \| "top-start" \| "bottom-end" \| "bottom-start" \| "left-start" \| "left-end" \| "right-start" \| "right-end"` | — | 浮层方位。默认 bottom-start。 |
| `today` | `Date` | — | 「今天」基准(测试注入)。 |
| `id` | `string` | — | 触发器 id(供 Label htmlFor / Form 集成)。 |
| `aria-label` | `string` | — | 无障碍标签。 |
| `aria-labelledby` | `string` | — |  |
| `aria-describedby` | `string` | — |  |
| `classNames` | `DatePickerClassNames` | — | 各部件 className。 |
| `className` | `string` | — | 根 className。 |
| `as` | `ElementType` | — | 多态根标签(默认 'div')。 |
| `...props` | `ComponentPropsWithoutRef<'div'>` | — | 透传原生 div 属性(className / style / aria-&#42; / 事件等)。 |

## 事件 Events

| 事件 | 签名 | 说明 |
| --- | --- | --- |
| `onChange` | `(date: Date \| null) => void` | single 模式变更回调。<br>· `date` — 选中的日期;清除时为 null |
| `onRangeChange` | `(range: DateRange) => void` | range 模式变更回调。<br>· `range` — 选中区间 { start, end };清除时两者均为 null |
| `onOpenChange` | `(open: boolean) => void` | 浮层开合回调。<br>· `open` — 浮层是否打开 |
| `onBlur` | `() => void` | 失焦回调(供 Form touched)。 |

此外透传原生 `<div>` 的全部标准事件(onClick / onFocus / onKeyDown …),与自有事件按 compose 合并、互不覆盖。

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-26 |
| 标签 | `date` `calendar` `range` `picker` `form-control` `i18n` `a11y` |

::: details 需求原文 / 设计意图
做一个生产级日期选择器。硬约束:① 所有日期数学(月历矩阵、加减月/年、范围判定、夹取、ISO 解析)纯 TS 进 logic.ts,零 React/零 locale 硬编码,可平移 @magic-scope/core;② 月名/周名/显示格式经 Intl.DateTimeFormat 按 locale 取(不硬编码中文),UI 文案(今天/清除/上下月)走全库 i18n 字典;③ 日期一律按本地时区年月日处理(toISO 用本地 Y-M-D 非 UTC),避免跨时区偏一天;④ 复用全库 Popover 做浮层(点外/Esc/12 向 placement 复用,不重造);⑤ single + range 双模,range 带悬停预览 + 预设;⑥ date/month/year 三视图导航 + 完整键盘操作(方向键/PageUp-Down/Home-End/Enter);⑦ 日历用 ARIA grid 模式(role=grid/gridcell、aria-selected、aria-current);⑧ tone 聚焦发光 + invalid→danger,trigger 仿 Input,便于嵌进 Form(经 render-prop 或显式 control)。诚实取舍:v1 trigger 为只读式(点开日历选择),自由文本输入解析延后;时间选择(时分秒)延后。
:::
