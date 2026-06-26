import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'card',
  name: 'Card',
  category: 'layout',
  summary: '内容卡片容器,elevated(底+柔影)与 outline(描边)两种变体,可选 interactive 上浮发光。',
  description:
    '自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。\nelevated 用 surface 底配柔和阴影,outline 用透明底配描边。\ninteractive 时 hover 上浮带奥术发光,并补 focus-visible 聚焦环与默认 tabIndex,尊重 reduced-motion。承载任意 children,超长内容自动换行收在边界内。',
  controls: [
    {
      type: 'select',
      prop: 'variant',
      label: '变体 variant',
      default: 'elevated',
      options: [
        { value: 'elevated', label: 'elevated 浮起' },
        { value: 'outline', label: 'outline 描边' },
      ],
    },
    { type: 'boolean', prop: 'interactive', label: '可交互 interactive', default: false },
  ],
  spread: 'div',
};
