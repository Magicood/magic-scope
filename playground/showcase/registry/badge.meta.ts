import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'badge',
  name: 'Badge',
  category: 'data',
  summary: '小标签,用于状态、计数或分类标记。三种视觉变体 × 六档语义色调。',
  description:
    '自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。\n小字号、圆角 full、紧凑内边距;solid 实底配 on-* 文字,soft 用 color-mix 柔和底,outline 走描边。neutral 色调走中性的 fg-muted / border。透传全部原生 <span> 属性。',
  controls: [
    {
      type: 'select',
      prop: 'variant',
      label: '变体 variant',
      default: 'soft',
      options: [
        { value: 'soft', label: 'soft 柔和' },
        { value: 'solid', label: 'solid 实底' },
        { value: 'outline', label: 'outline 描边' },
        { value: 'glow', label: 'glow 发光' },
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
        { value: 'neutral', label: 'neutral' },
      ],
    },
    {
      type: 'select',
      prop: 'size',
      label: '尺寸 size',
      default: 'md',
      options: [
        { value: 'md', label: 'md 默认' },
        { value: 'sm', label: 'sm 紧凑' },
      ],
    },
    { type: 'boolean', prop: 'dot', label: '圆点 dot', default: false },
    { type: 'boolean', prop: 'pulse', label: '脉冲 pulse', default: false },
    { type: 'text', prop: 'children', label: '文案', default: 'Badge' },
  ],
  spread: 'span',
};
