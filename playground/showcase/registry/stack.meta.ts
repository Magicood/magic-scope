import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'stack',
  name: 'Stack',
  category: 'layout',
  summary: '一维堆叠原语,纵/横向 + 间距 token + 对齐 + 分布 + 换行,全部支持断点响应式。',
  description:
    'flex 实现的有主张布局原语:direction / gap / align / justify / wrap 均可传「断点对象」做响应式;\n另有 divider 子项间插、recursive 交替方向、inline 行内、多态 as 与 asChild Slot。自研零依赖,消费 @magic-scope/tokens 的 --ms-space-* 间距 token。',
  controls: [
    {
      type: 'select',
      prop: 'direction',
      label: '方向 direction',
      default: 'vertical',
      options: [
        { value: 'vertical', label: 'vertical 纵向' },
        { value: 'horizontal', label: 'horizontal 横向' },
      ],
    },
    {
      type: 'select',
      prop: 'gap',
      label: '间距档 gap',
      default: '4',
      options: [
        { value: '0', label: '0 无间距' },
        { value: '1', label: '1' },
        { value: '2', label: '2' },
        { value: '3', label: '3' },
        { value: '4', label: '4(1rem)' },
        { value: '6', label: '6' },
        { value: '8', label: '8' },
      ],
    },
    {
      type: 'select',
      prop: 'align',
      label: '交叉轴对齐 align',
      default: 'stretch',
      options: [
        { value: 'start', label: 'start' },
        { value: 'center', label: 'center' },
        { value: 'end', label: 'end' },
        { value: 'stretch', label: 'stretch' },
        { value: 'baseline', label: 'baseline' },
      ],
    },
    {
      type: 'select',
      prop: 'justify',
      label: '主轴分布 justify',
      default: 'start',
      options: [
        { value: 'start', label: 'start' },
        { value: 'center', label: 'center' },
        { value: 'end', label: 'end' },
        { value: 'between', label: 'between' },
        { value: 'around', label: 'around' },
        { value: 'evenly', label: 'evenly' },
        { value: 'stretch', label: 'stretch' },
      ],
    },
    {
      type: 'select',
      prop: 'wrap',
      label: '换行 wrap',
      default: 'nowrap',
      options: [
        { value: 'nowrap', label: 'nowrap 不换行' },
        { value: 'wrap', label: 'wrap 换行' },
        { value: 'wrap-reverse', label: 'wrap-reverse 反向换行' },
      ],
    },
    { type: 'boolean', prop: 'inline', label: '行内 inline', default: false },
  ],
  spread: 'div',
};
