import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'menu',
  name: 'Menu',
  category: 'overlay',
  summary: '下拉菜单,Popover API + CSS Anchor Positioning,键盘可达,支持禁用项与危险项。',
  description:
    '浮层进 top-layer 用 Popover API(popover="auto",自带点外 / Esc 的 light-dismiss),定位用 CSS Anchor Positioning 并以 @supports 降级为 absolute,保证不支持时仍可用。\n键盘交互自实现:↑↓ 移动焦点(跳过 disabled)、Home / End 跳首尾、Enter / Space 触发、Esc 关闭、Tab 离开即收起;选中后菜单关闭并把焦点交还 trigger。danger 项用 danger 色高亮。',
  controls: [
    { type: 'boolean', prop: 'withDisabled', label: '含禁用项 disabled', default: true },
    { type: 'boolean', prop: 'withDanger', label: '含危险项 danger', default: true },
  ],
};
