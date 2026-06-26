import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'descriptions',
  name: 'Descriptions',
  // 主组件经 forwardRef + as 强转,react-docgen 仅抽到 Descriptions.Item;
  // 故 props 表主体并入 Item 字段(label / value / span 等数据项属性)。
  alsoProps: ['Descriptions.Item'],
  category: 'data',
  summary: '描述列表,键值对成组展示,支持多列折行、跨列 span、bordered 表格态与语义色调。',
  description:
    '数据驱动双通道:items 数组或 Descriptions.Item 复合子组件;span 跨列、行末 filler 补齐由纯逻辑层计算(可单测、可平移其它框架)。\nCSS Grid 布局:horizontal(标签内容同行)/ vertical(标签在上内容在下);列数支持响应式断点对象(每断点一个 CSS 变量 + 静态 @media 级联)。\nbordered 表格态、size 三档随密度缩放、colon 冒号、tone 七色语义(标签底 / 强调描边 / 发光);title / extra / emptyText 为 ReactNode 槽,空态走 i18n。',
  controls: [
    {
      type: 'select',
      prop: 'layout',
      label: '排布 layout',
      default: 'horizontal',
      options: [
        { value: 'horizontal', label: 'horizontal 同行' },
        { value: 'vertical', label: 'vertical 上下' },
      ],
    },
    {
      type: 'select',
      prop: 'size',
      label: '尺寸 size',
      default: 'md',
      options: [
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
        { value: 'neutral', label: 'neutral 中性' },
        { value: 'primary', label: 'primary 主色' },
        { value: 'accent', label: 'accent 强调' },
        { value: 'success', label: 'success 成功' },
        { value: 'warning', label: 'warning 警告' },
        { value: 'danger', label: 'danger 危险' },
        { value: 'info', label: 'info 信息' },
      ],
    },
    {
      type: 'number',
      prop: 'columns',
      label: '列数 columns',
      default: 2,
      min: 1,
      max: 4,
      step: 1,
    },
    { type: 'boolean', prop: 'bordered', label: '边框 bordered', default: true },
    { type: 'boolean', prop: 'colon', label: '冒号 colon', default: true },
  ],
  spread: 'div',
};
