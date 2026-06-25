import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'divider',
  name: 'Divider',
  category: 'layout',
  summary: '分隔线,语义 <hr>(隐含 separator role),支持水平 / 垂直两种朝向。',
  description:
    '自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。\n用语义 <hr> 渲染(隐含 separator role),按朝向设 aria-orientation;水平用 border-block-start 横跨容器,垂直用 border-inline-start 行内贴满高度。逻辑属性,RTL 自动适配。',
  controls: [
    {
      type: 'select',
      prop: 'orientation',
      label: '朝向 orientation',
      default: 'horizontal',
      options: [
        { value: 'horizontal', label: 'horizontal 水平' },
        { value: 'vertical', label: 'vertical 垂直' },
      ],
    },
  ],
  spread: 'hr',
};
