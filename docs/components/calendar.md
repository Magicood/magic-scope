# Calendar <Badge type="tip" text="stable" /> <Badge type="info" text="v0.1.0" />

独立月历,整月铺展的日期网格,支持单选 / 范围 / 多选、今天高亮、禁用规则、周起始切换、单元格自定义渲染与完整键盘网格导航。

> **[在展示站中打开 Calendar](https://magicood.github.io/magic-scope/#/calendar)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

区别于 DatePicker(输入框 + 弹层)的「独立月历」:直接平铺展示一整月,顶部逐月 / 逐年翻页并显示年月标题,主体是周几表头 + 6×7 固定日格(含上 / 下月补位并弱化)。

选择覆盖单选(value)、范围(mode=range)、多选(mode=multiple);today 高亮、disabledDate 与 minDate / maxDate 禁用、weekStartsOn 周起始可配;renderCell / dateCellRender 留口挂事件圆点 / 徽标。

交互是无障碍网格(role=grid):方向键逐日 / 逐周、PageUp/Down 逐月、Shift+PageUp/Down 逐年、Home/End 本周首尾、Enter/Space 选中,焦点日 roving 且跨月自动翻页。两种尺寸:fullscreen 占满与 compact 紧凑。文案经 Intl 按 locale 本地化,日期数学独立成纯函数内核。

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `mode` | `"single" \| "multiple" \| "range"` | — | 选择模式:single 单选 / range 范围 / multiple 多选。默认 single。 |
| `value` | `Date \| null` | — | 受控值(single)。null=未选。 |
| `defaultValue` | `Date \| null` | — | 非受控初值(single)。 |
| `rangeValue` | `DateTuple \| null` | — | 受控值(range)。 |
| `defaultRangeValue` | `DateTuple \| null` | — | 非受控初值(range)。 |
| `multipleValue` | `Date[]` | — | 受控值(multiple)。 |
| `defaultMultipleValue` | `Date[]` | — | 非受控初值(multiple)。 |
| `panelDate` | `Date` | — | 受控展示面板(决定当前展示的年月)。 |
| `defaultPanelDate` | `Date` | — | 非受控展示面板初值。 |
| `minDate` | `Date \| null` | — | 可选下限。 |
| `maxDate` | `Date \| null` | — | 可选上限。 |
| `disabledDate` | `((date: Date) => boolean)` | — | 自定义禁用判定(优先于 min/max 之外的额外规则)。 |
| `weekStartsOn` | `0 \| 1 \| 5 \| 2 \| 3 \| 4 \| 6` | — | 一周起始(0=周日 … 6=周六)。默认 1(周一)。 |
| `locale` | `string` | — | BCP-47 locale(月名 / 周名 / 日期 aria-label 经 Intl 取)。不传用运行时默认。 |
| `referenceDate` | `Date` | — | 「今天」基准(测试注入;不传用 new Date)。 |
| `size` | `"compact" \| "fullscreen"` | — | 尺寸。默认 fullscreen。 |
| `tone` | `"primary" \| "accent" \| "success" \| "warning" \| "danger" \| "info"` | — | 聚焦发光 / 选中色调。默认 primary。 |
| `renderCell` | `((date: Date, info: CalendarCellInfo) => ReactNode)` | — | 自定义整格渲染(覆盖默认数字 + 注入徽标 / 事件圆点)。返回 ReactNode 渲染在日格内。 |
| `dateCellRender` | `((date: Date, info: CalendarCellInfo) => ReactNode)` | — | 在默认数字&#42;&#42;下方&#42;&#42;附加内容(放事件圆点 / 徽标),不接管整格。与 renderCell 二选一(renderCell 优先)。 |
| `classNames` | `CalendarClassNames` | — | 各部件 className。 |
| `className` | `string` | — | 根 className。 |
| `as` | `ElementType` | — | 多态根标签(默认 'div')。 |
| `aria-label` | `string` | — | 无障碍标签(标到 role=grid 上)。 |
| `aria-labelledby` | `string` | — |  |
| `...props` | `ComponentPropsWithoutRef<'div'>` | — | 透传原生 div 属性(className / style / aria-&#42; / 事件等)。 |

## 事件 Events

| 事件 | 签名 | 说明 |
| --- | --- | --- |
| `onChange` | `(date: Date) => void` | single 模式选中回调。<br>· `date` — 选中的日期(本地 0 点) |
| `onRangeChange` | `(range: DateTuple) => void` | range 模式完成一次完整选择(start+end)的回调。<br>· `range` — 升序归一后的 &#91;start, end] |
| `onMultipleChange` | `(dates: Date[]) => void` | multiple 模式切换回调。<br>· `dates` — 切换后的升序日期数组 |
| `onPanelChange` | `(date: Date) => void` | 翻页回调(切月 / 切年 / 跨月边界自动翻页时触发)。<br>· `date` — 新展示面板对应的月份首日 |

此外透传原生 `<div>` 的全部标准事件(onClick / onFocus / onKeyDown …),与自有事件按 compose 合并、互不覆盖。

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | inspired · 受外部启发重做 |
| 收录日期 | 2026-06-26 |
| 来源链接 | <https://ant.design/components/calendar> |
| 标签 | `calendar` `date` `month-view` `date-grid` `range` `multiple` `keyboard-navigation` `i18n` `a11y` |

::: details 需求原文 / 设计意图
需要一个区别于 DatePicker(输入框 + 弹层)的『独立月历』:直接平铺在页面中展示一整月,顶部可逐月 / 逐年翻页并显示年月标题,主体是周几表头 + 6×7 固定日格(含上 / 下月补位并弱化样式),用于排期 / 日程 / 数据看板等场景。选择需同时覆盖单选(value)、范围(mode=range)、多选(mode=multiple);today 高亮、disabledDate 与 minDate/maxDate 禁用、weekStartsOn 周起始可配;关键是 renderCell / dateCellRender 留口,以便在日格上挂事件圆点 / 徽标(对标 Ant Design Calendar 的 dateCellRender)。交互上要做成无障碍网格(role=grid),提供完整键盘导航(方向键逐日 / 逐周、PageUp/Down 逐月、Shift+PageUp/Down 逐年、Home/End 本周首尾、Enter/Space 选中),焦点日 roving 且跨月自动翻页。两种尺寸:fullscreen 占满与 compact 紧凑。月名 / 周名 / 日期文案经 Intl 按 locale 本地化,不硬编码语言;日期数学独立成纯函数内核(零外部库)以便正确性可测与跨框架平移。
:::
