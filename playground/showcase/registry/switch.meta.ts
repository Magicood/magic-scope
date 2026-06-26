import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'switch',
  name: 'Switch',
  category: 'forms',
  summary: '开关,基于原生 input[type=checkbox],checked 时轨道染 primary、滑块右移并发光。',
  description:
    '自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。\n视觉隐藏原生 checkbox 但保留其语义与可达性:完整覆盖 hover / focus-visible(发光环) / disabled 状态与平滑过渡,并尊重 prefers-reduced-motion。触控设备隐形扩竖直命中区到 --ms-target-min。\n受控(checked + onChange)或非受控(defaultChecked)皆可,透传全部原生 checkbox 属性(name / value / required / aria-* 等)。',
  controls: [
    { type: 'boolean', prop: 'defaultChecked', label: '初始开启 defaultChecked', default: true },
    {
      type: 'select',
      prop: 'tone',
      label: '色调 tone',
      default: 'primary',
      options: [
        { value: 'primary', label: 'primary 主色' },
        { value: 'accent', label: 'accent 强调' },
        { value: 'success', label: 'success 成功' },
        { value: 'warning', label: 'warning 警告' },
        { value: 'danger', label: 'danger 危险' },
        { value: 'info', label: 'info 信息' },
        { value: 'neutral', label: 'neutral 中性' },
      ],
    },
    {
      type: 'select',
      prop: 'size',
      label: '尺寸 size',
      default: 'md',
      options: [
        { value: 'sm', label: 'sm 小' },
        { value: 'md', label: 'md 中' },
        { value: 'lg', label: 'lg 大' },
      ],
    },
    { type: 'boolean', prop: 'loading', label: '加载态 loading', default: false },
    { type: 'boolean', prop: 'disabled', label: '禁用 disabled', default: false },
    { type: 'text', prop: 'label', label: '说明文案', default: '启用魔法' },
  ],
  spread: 'input',
};
