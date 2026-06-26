import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'list',
  name: 'List',
  category: 'typography',
  summary: '列表排版,无序 / 有序 / 描述三态,原生与自定义标记、tone 着色与魔法辉光一把收口。',
  description:
    '一个 props 把三种语义列表(ul / ol / dl)、原生 ::marker 与自定义节点标记、间距密度、tone 着色、奥术辉光全收口。\n子部件走命名空间:List.Item(li)/ List.Term(dt)/ List.Detail(dd)。嵌套时子列表标记与间距独立(CSS 不向下穿透),天然形成层级缩进。glow 受全局「光影」开关调制。',
  controls: [
    {
      type: 'select',
      prop: 'variant',
      label: '形态 variant',
      default: 'unordered',
      options: [
        { value: 'unordered', label: 'unordered 无序' },
        { value: 'ordered', label: 'ordered 有序' },
        { value: 'description', label: 'description 描述' },
      ],
    },
    {
      type: 'select',
      prop: 'marker',
      label: '标记 marker',
      default: 'disc',
      options: [
        { value: 'disc', label: 'disc 实心圆' },
        { value: 'circle', label: 'circle 空心圆' },
        { value: 'square', label: 'square 方块' },
        { value: 'decimal', label: 'decimal 数字' },
        { value: 'lower-roman', label: 'lower-roman 罗马' },
        { value: 'lower-alpha', label: 'lower-alpha 字母' },
        { value: 'none', label: 'none 无标记' },
      ],
    },
    {
      type: 'select',
      prop: 'spacing',
      label: '间距 spacing',
      default: 'md',
      options: [
        { value: 'none', label: 'none' },
        { value: 'xs', label: 'xs' },
        { value: 'sm', label: 'sm' },
        { value: 'md', label: 'md' },
        { value: 'lg', label: 'lg' },
      ],
    },
    {
      type: 'select',
      prop: 'tone',
      label: '色调 tone',
      default: 'neutral',
      options: [
        { value: 'neutral', label: 'neutral 默认' },
        { value: 'primary', label: 'primary' },
        { value: 'accent', label: 'accent' },
        { value: 'success', label: 'success' },
        { value: 'warning', label: 'warning' },
        { value: 'danger', label: 'danger' },
        { value: 'info', label: 'info' },
      ],
    },
    {
      type: 'select',
      prop: 'markerPosition',
      label: '标记位置 markerPosition',
      default: 'outside',
      options: [
        { value: 'outside', label: 'outside 外侧' },
        { value: 'inside', label: 'inside 内嵌' },
      ],
    },
    { type: 'boolean', prop: 'glow', label: '辉光 glow', default: false },
  ],
  spread: 'ul',
  alsoProps: ['List.Item', 'List.Term', 'List.Detail'],
};
