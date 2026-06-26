import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'center',
  name: 'Center',
  category: 'layout',
  summary: '居中盒,把子内容在水平 / 垂直 / 双轴上居中,支持多态根标签与响应式。',
  description:
    '自研、零依赖,底层用 flex + place-items,消费 @magic-scope/tokens 的间距 token。\n多态 `as`(默认 div)+ `asChild`(Slot 风格,不额外包一层 DOM);`axis`(both / horizontal / vertical)、`inline`(inline-flex 收缩到内容)、`gap` / `padding`(间距档)、`minBlockSize`(撑高度,常用于整屏垂直居中)。\naxis / gap / padding / minBlockSize 均支持「单值或断点对象」响应式;间距走 CSS 逻辑属性(gap / padding / min-block-size),RTL 友好。',
  controls: [
    {
      type: 'select',
      prop: 'axis',
      label: '居中轴 axis',
      default: 'both',
      options: [
        { value: 'both', label: 'both 双轴' },
        { value: 'horizontal', label: 'horizontal 仅水平' },
        { value: 'vertical', label: 'vertical 仅垂直' },
      ],
    },
    {
      type: 'select',
      prop: 'gap',
      label: '子项间距 gap',
      default: '4',
      options: [
        { value: '0', label: '0' },
        { value: '2', label: '2' },
        { value: '4', label: '4' },
        { value: '6', label: '6' },
        { value: '8', label: '8' },
      ],
    },
    {
      type: 'select',
      prop: 'padding',
      label: '内边距 padding',
      default: '4',
      options: [
        { value: '0', label: '0' },
        { value: '2', label: '2' },
        { value: '4', label: '4' },
        { value: '6', label: '6' },
        { value: '8', label: '8' },
      ],
    },
    {
      type: 'select',
      prop: 'minBlockSize',
      label: '最小高度 minBlockSize',
      default: '160',
      options: [
        { value: '120', label: '120' },
        { value: '160', label: '160' },
        { value: '240', label: '240' },
      ],
    },
    { type: 'boolean', prop: 'inline', label: '行内 inline', default: false },
  ],
  spread: 'div',
};
