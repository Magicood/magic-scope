import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'textarea',
  name: 'Textarea',
  category: 'forms',
  summary: '多行文本输入框,三档尺寸 + 校验失败态,透传原生 textarea。',
  description:
    '自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。\n样式与 Input 一致:surface 底 + border,focus-visible 染 primary 并起发光环(受顶栏「光影」开关控制),invalid 染 danger 并设 aria-invalid,disabled 半透明。仅允许垂直拖拽改高(resize: vertical),尊重 reduced-motion。透传原生 textarea 属性(value / onChange / rows / placeholder / maxLength 等)。',
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
        { value: 'neutral', label: 'neutral' },
      ],
    },
    { type: 'number', prop: 'rows', label: '行数 rows', default: 4, min: 2, max: 12, step: 1 },
    { type: 'boolean', prop: 'showCount', label: '显示字数 showCount', default: false },
    { type: 'boolean', prop: 'invalid', label: '校验失败 invalid', default: false },
    { type: 'boolean', prop: 'disabled', label: '禁用 disabled', default: false },
    { type: 'text', prop: 'placeholder', label: '占位文案 placeholder', default: '写下你的咒语…' },
  ],
  spread: 'textarea',
};
