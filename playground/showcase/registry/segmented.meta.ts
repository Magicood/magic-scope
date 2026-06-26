import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'segmented',
  name: 'Segmented',
  category: 'forms',
  summary: '分段选择控件,单选 toggle,滑块 indicator 平滑跨段,接全库 tone。',
  description:
    '自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。\n紧凑的 tab / radio 替代:单个滑块 indicator 平滑跨段位移(过渡受 motion 双降级);数据入口为 options 数组或复合 <Segmented.Item>,label 支持 ReactNode + icon。\n受控 value/defaultValue + onChange/onValueChange 双通道;方向键 / Home / End 导航(跳过禁用、环形)+ Enter/Space 选中,roving tabindex;role 可选 radiogroup(默认)或 tablist。',
  controls: [
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
      default: 'primary',
      options: [
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
      prop: 'orientation',
      label: '朝向 orientation',
      default: 'horizontal',
      options: [
        { value: 'horizontal', label: 'horizontal 横向' },
        { value: 'vertical', label: 'vertical 纵向' },
      ],
    },
    {
      type: 'select',
      prop: 'role',
      label: '语义 role',
      default: 'radiogroup',
      options: [
        { value: 'radiogroup', label: 'radiogroup 单选组' },
        { value: 'tablist', label: 'tablist 选项卡' },
      ],
    },
    { type: 'boolean', prop: 'block', label: '块级铺满 block', default: false },
    { type: 'boolean', prop: 'disabled', label: '禁用 disabled', default: false },
  ],
  spread: 'div',
  alsoProps: ['SegmentedItem'],
};
