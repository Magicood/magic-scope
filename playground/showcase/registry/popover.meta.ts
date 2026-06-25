import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'popover',
  name: 'Popover',
  category: 'overlay',
  summary: '点击浮层,基于原生 Popover API + CSS Anchor Positioning,贴合触发器四向弹出。',
  description:
    '自研、零依赖。浮层进 top-layer 用原生 Popover API(popover="auto" 自带点外 / Esc 关闭,无需和 z-index 较劲)。\n定位用 CSS Anchor Positioning:trigger 注入唯一 anchor-name,浮层以 position-area 贴合 placement,并以 @supports 降级为 fixed 居中。\n支持受控(open + onOpenChange)与非受控两种用法;trigger 自动注入 aria-haspopup / aria-expanded / aria-controls。',
  controls: [
    {
      type: 'select',
      prop: 'placement',
      label: '方位 placement',
      default: 'bottom',
      options: [
        { value: 'top', label: 'top 上' },
        { value: 'bottom', label: 'bottom 下' },
        { value: 'left', label: 'left 左' },
        { value: 'right', label: 'right 右' },
      ],
    },
  ],
};
