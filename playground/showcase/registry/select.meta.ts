import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'select',
  name: 'Select',
  category: 'forms',
  summary: '下拉选择,Popover API + CSS Anchor Positioning,键盘全可达。',
  description:
    '自研、零依赖,用满平台原生能力:浮层进 top-layer 用 Popover API(popover="auto" 自带点外 / Esc 关闭),定位用 CSS Anchor Positioning,并以 @supports 降级为普通贴近,保证不支持时仍可用。\n键盘交互(↑↓ / Enter / Space / Esc / Home / End)自实现,采用 WAI-ARIA listbox + aria-activedescendant 模型;受控 value,选项可逐个禁用,完整 focus-visible 发光与 disabled。',
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
    { type: 'boolean', prop: 'disabled', label: '禁用 disabled', default: false },
    { type: 'boolean', prop: 'clearable', label: '可清除 clearable', default: false },
    { type: 'boolean', prop: 'searchable', label: '可搜索 searchable', default: false },
    { type: 'boolean', prop: 'loading', label: '加载态 loading', default: false },
  ],
};
