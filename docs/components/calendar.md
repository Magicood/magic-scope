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
| `...props` | `ComponentPropsWithoutRef<'div'>` | — | 透传原生 div 属性(className / style / aria-* / 事件等)。 |

## 事件 Events

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
