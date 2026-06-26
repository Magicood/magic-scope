import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'skeleton',
  name: 'Skeleton',
  category: 'feedback',
  summary: '加载占位,三种形状(文本行 / 矩形 / 圆形),底色叠一道奥术流光。',
  description:
    '自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。\nsurface-raised 底色叠加一道移动流光(linear-gradient + background-position),契合魔法主题。\n纯装饰:内置 aria-hidden 且无语义角色,不进可访问性树。尊重 reduced-motion——降级为透明度呼吸而非完全静止。\n宽高由你用 style / className 决定,组件只负责形状与流光;circle 取 width/height 较小者成圆。',
  controls: [
    {
      type: 'select',
      prop: 'variant',
      label: '形状 variant',
      default: 'rect',
      options: [
        { value: 'text', label: 'text 文本行' },
        { value: 'rect', label: 'rect 矩形' },
        { value: 'circle', label: 'circle 圆形' },
      ],
    },
  ],
  spread: 'div',
};
