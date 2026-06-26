import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'flex',
  name: 'Flex',
  category: 'layout',
  summary:
    '通用 flexbox 布局原语,direction/align/justify/wrap/gap 全经 CSS 变量驱动,支持断点对象响应式。',
  description:
    '自研、零依赖的 flexbox 容器。direction / align / justify / wrap / gap 均接受「单值 或 断点对象」(如 gap={{ base: 2, md: 4 }}),响应式由预展开的静态 @media 块逐级覆盖。\n间距走 --ms-space-* token、对齐用逻辑值(flex-start/end)故 RTL 友好;多态 as(默认 div)+ asChild + forwardRef + 透传原生属性。配套 Flex.Item 做子项级 grow/shrink/basis/align/order。',
  controls: [
    {
      type: 'select',
      prop: 'direction',
      label: '主轴方向 direction',
      default: 'row',
      options: [
        { value: 'row', label: 'row 横向' },
        { value: 'row-reverse', label: 'row-reverse 横向反转' },
        { value: 'column', label: 'column 纵向' },
        { value: 'column-reverse', label: 'column-reverse 纵向反转' },
      ],
    },
    {
      type: 'select',
      prop: 'align',
      label: '交叉轴对齐 align',
      default: 'stretch',
      options: [
        { value: 'start', label: 'start 起始' },
        { value: 'center', label: 'center 居中' },
        { value: 'end', label: 'end 末尾' },
        { value: 'stretch', label: 'stretch 拉伸' },
        { value: 'baseline', label: 'baseline 基线' },
      ],
    },
    {
      type: 'select',
      prop: 'justify',
      label: '主轴分布 justify',
      default: 'start',
      options: [
        { value: 'start', label: 'start 起始' },
        { value: 'center', label: 'center 居中' },
        { value: 'end', label: 'end 末尾' },
        { value: 'between', label: 'between 两端' },
        { value: 'around', label: 'around 环绕' },
        { value: 'evenly', label: 'evenly 均分' },
      ],
    },
    {
      type: 'select',
      prop: 'gap',
      label: '间距 gap',
      default: '4',
      options: [
        { value: '0', label: '0' },
        { value: '2', label: '2' },
        { value: '4', label: '4' },
        { value: '6', label: '6' },
        { value: '8', label: '8' },
      ],
    },
    { type: 'boolean', prop: 'wrap', label: '换行 wrap', default: false },
    { type: 'boolean', prop: 'inline', label: '行内 inline', default: false },
  ],
  spread: 'div',
  alsoProps: ['Flex.Item'],
};
