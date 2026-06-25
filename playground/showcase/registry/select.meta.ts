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
    { type: 'boolean', prop: 'disabled', label: '禁用 disabled', default: false },
  ],
};
