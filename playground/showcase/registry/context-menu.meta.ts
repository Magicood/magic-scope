import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'context-menu',
  name: 'ContextMenu',
  category: 'overlay',
  summary: '右键菜单,在光标处弹出,越界自动夹回视口,portal 到 body,键盘可达。',
  description:
    '自研、零依赖。右键(contextmenu)在包裹区域内弹出,定位在光标处并在越界时自动夹回视口;浮层 portal 到 body。\n点选 / 点外 / Esc / 滚动均关闭,菜单内支持 ↑↓ / Home / End / Enter 键盘导航。菜单项复用 Menu 的 .ms-menu__item 视觉(含 disabled / danger),区别于点击锚定的 Menu。',
  controls: [
    { type: 'text', prop: 'label', label: '触发区文案', default: '在此区域右键' },
    { type: 'boolean', prop: 'disabledItem', label: '含禁用项', default: true },
    { type: 'boolean', prop: 'dangerItem', label: '含危险项', default: true },
  ],
};
