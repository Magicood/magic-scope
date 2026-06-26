import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'blockquote',
  name: 'Blockquote',
  category: 'typography',
  summary:
    '块级引用,四种视觉变体 × 语义色调 × 三档尺寸,带出处槽与装饰大引号、渐变强调条/辉光魔法。',
  description:
    '语义 <blockquote> 原语:左强调条读全库 tone 槽位(--ms-c)、柔底读 --ms-c-soft。\n变体(bordered / filled / card / plain)× tone × size;出处槽(<footer><cite>)、图标/装饰大引号槽,以及渐变强调条与辉光(受顶栏「光影」开关双降级)。as / asChild 多态,citeUrl 写入原生 blockquote[cite]。',
  controls: [
    {
      type: 'select',
      prop: 'variant',
      label: '变体 variant',
      default: 'bordered',
      options: [
        { value: 'bordered', label: 'bordered 强调条' },
        { value: 'filled', label: 'filled 柔底块' },
        { value: 'card', label: 'card 卡片' },
        { value: 'plain', label: 'plain 纯文字' },
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
        { value: 'sm', label: 'sm' },
        { value: 'md', label: 'md' },
        { value: 'lg', label: 'lg' },
      ],
    },
    {
      type: 'select',
      prop: 'glow',
      label: '辉光 glow',
      default: 'off',
      options: [
        { value: 'off', label: 'off 关' },
        { value: 'soft', label: 'soft 柔' },
        { value: 'strong', label: 'strong 强' },
      ],
    },
    { type: 'boolean', prop: 'quoteMark', label: '装饰大引号 quoteMark', default: true },
    { type: 'boolean', prop: 'gradient', label: '渐变强调条 gradient', default: false },
    {
      type: 'text',
      prop: 'children',
      label: '正文',
      default: '真正的魔法,是让复杂的东西用起来简单。',
    },
  ],
  spread: 'blockquote',
};
