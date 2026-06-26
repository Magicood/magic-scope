import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'input',
  name: 'Input',
  category: 'forms',
  summary: '文本输入框,三档尺寸,带聚焦发光与校验失败态。',
  description:
    '完整覆盖 hover / focus-visible(发光) / disabled / invalid 状态与过渡;尊重 reduced-motion。invalid 会同时设 aria-invalid。',
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
    { type: 'boolean', prop: 'invalid', label: '校验失败 invalid', default: false },
    { type: 'boolean', prop: 'clearable', label: '可清除 clearable', default: false },
    { type: 'boolean', prop: 'showCount', label: '字数统计 showCount', default: false },
    { type: 'boolean', prop: 'disabled', label: '禁用 disabled', default: false },
    { type: 'text', prop: 'placeholder', label: '占位符', default: '输入点什么…' },
  ],
  spread: 'input',
};
