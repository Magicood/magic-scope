import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'date-picker',
  name: 'DatePicker',
  category: 'forms',
  summary: '日期选择器,single/range 双模 + 三视图日历,自研零依赖、键盘全可达。',
  description:
    '自研、零依赖的旗舰深度组件:single 选单日、range 选区间双模,date/month/year 三视图日历可逐级下钻导航。\n所有日期数学(月历矩阵、加减月年、范围判定、夹取、ISO)纯 TS 进 logic.ts(可平移 core),月名/周名/显示格式经 Intl.DateTimeFormat 按 locale 取,UI 文案走全库 i18n;日期一律按本地时区年月日处理,避免跨时区偏一天。\n复用全库 Popover 做浮层(点外 / Esc 关闭、12 向 placement),range 带悬停预览与预设,支持 min/max/disabledDate、可清除、完整方向键 / PageUp-Down / Home-End / Enter 键盘操作,日历用 ARIA grid 模式。\ntone 聚焦发光环、invalid→danger 并设 aria-invalid,便于嵌进 Form。',
  controls: [
    {
      type: 'select',
      prop: 'mode',
      label: '模式 mode',
      default: 'single',
      options: [
        { value: 'single', label: 'single 单日' },
        { value: 'range', label: 'range 区间' },
      ],
    },
    {
      type: 'select',
      prop: 'size',
      label: '尺寸 size',
      default: 'md',
      options: [
        { value: 'sm', label: 'sm' },
        { value: 'md', label: 'md' },
        { value: 'lg', label: 'lg' },
      ],
    },
    {
      type: 'select',
      prop: 'tone',
      label: '色调 tone',
      default: 'primary',
      options: [
        { value: 'primary', label: 'primary' },
        { value: 'accent', label: 'accent' },
        { value: 'success', label: 'success' },
        { value: 'warning', label: 'warning' },
        { value: 'danger', label: 'danger' },
        { value: 'info', label: 'info' },
      ],
    },
    { type: 'boolean', prop: 'clearable', label: '可清除 clearable', default: true },
    { type: 'boolean', prop: 'invalid', label: '校验失败 invalid', default: false },
    { type: 'boolean', prop: 'disabled', label: '禁用 disabled', default: false },
  ],
  // 根透传 div(as 多态根标签默认 'div',未消费的 ...rest 透传到根元素)
  spread: 'div',
};
