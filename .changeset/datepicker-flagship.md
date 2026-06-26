---
"@magic-scope/react": minor
---

feat(react): 新增 DatePicker 日期选择器(v2 旗舰)+ 独立 Calendar

- **零 React 日期内核** `logic.ts`:月历矩阵、加减月/年、范围判定、夹取、本地 ISO 解析,全部纯函数,可平移 `@magic-scope/core`;日期一律按本地时区年月日处理(toISO 用本地 Y-M-D,非 UTC,避免跨时区偏一天)。
- **single / range 双模**,range 带悬停预览 + 预设(presets);**date / month / year 三视图**导航;完整键盘操作(方向键 / PageUp-Down / Home-End / Enter)。
- **min / max / disabledDate** 约束(日格、月格、年格联动灰显);可清除、今天快捷。
- **本地化**:月名 / 周名 / 显示格式经 `Intl.DateTimeFormat` 按 `locale` 取(不硬编码),UI 文案(今天 / 清除 / 上下月)走全库 i18n 字典;`weekStart` 可配。
- 复用全库 **Popover** 做浮层(点外 / Esc / 12 向 placement);trigger 仿 Input,`tone` 聚焦发光 + `invalid`→danger(便于嵌进 Form);多态 `as`、细粒度 `classNames`、受控/非受控(value / rangeValue / open)。
- 日历用语义 `<table>`(thead 周名 `th[scope=col]` + tbody 日格 button),日格带完整日期 aria-label、aria-current(今天)、aria-pressed(选中)。
- 独立导出 `Calendar` 供内联日历使用。新增 11 个 `datePicker.*` i18n 文案。

logic 14 + 组件 12 测试。lint / tsc / build / size 全绿。
