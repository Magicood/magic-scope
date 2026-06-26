import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'time-picker',
  name: 'TimePicker',
  category: 'forms',
  summary: '时间选择器,只读 Input + 浮层内可滚动的时/分/秒列,逐列选值。',
  description:
    '自研、零依赖:trigger 是只读 Input,点开后浮层里排「时 / 分 / 秒」三条独立可滚动列(每列一个 listbox),选中项高亮并自动滚到列中央,对标主流库的滚轮列体验。\n浮层复用与 Select 同款的原生 Popover API(自带点外 / Esc 关闭)+ CSS Anchor Positioning + @supports 降级。可切 12/24 小时制(12 制额外加 AM/PM 列)、按 hourStep/minuteStep/secondStep 稀疏化选项、按 disabledHours/Minutes/Seconds 屏蔽不可选值,底部「此刻 / 确定」一键操作;值同吃 Date 与 "HH:mm:ss" 字符串、受控/非受控双通道,接全库 tone 与密度。',
  controls: [
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
    { type: 'boolean', prop: 'use12Hours', label: '12 小时制 use12Hours', default: false },
    { type: 'boolean', prop: 'showSecond', label: '显示秒列 showSecond', default: true },
    { type: 'boolean', prop: 'clearable', label: '可清除 clearable', default: false },
    { type: 'boolean', prop: 'footer', label: '底部操作栏 footer', default: true },
    { type: 'boolean', prop: 'disabled', label: '禁用 disabled', default: false },
    { type: 'boolean', prop: 'invalid', label: '校验失败 invalid', default: false },
  ],
};
