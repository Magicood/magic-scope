import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'rate',
  name: 'Rate',
  category: 'forms',
  summary: '星级评分,受控/非受控双通道,支持半星、再点清零与自定义图标。',
  description:
    '自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。\n受控 value / 非受控 defaultValue + onChange 双通道;allowHalf 半星(指针半区 + 键盘 0.5 步进)、allowClear 再点清零、character 自定义图标(共用或逐星 render-prop)、只读 / 禁用、hover 预览高亮、每星 tooltip、showText 评分文案。\n接全库 tone 槽位派生填充与发光;根 role=slider 键盘可达(←/→/↑/↓ 加减、Home/End 极值)。',
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
      default: 'warning',
      options: [
        { value: 'warning', label: 'warning 金' },
        { value: 'primary', label: 'primary' },
        { value: 'accent', label: 'accent' },
        { value: 'success', label: 'success' },
        { value: 'danger', label: 'danger' },
        { value: 'info', label: 'info' },
        { value: 'neutral', label: 'neutral' },
      ],
    },
    { type: 'number', prop: 'count', label: '星数 count', default: 5, min: 1, max: 10, step: 1 },
    { type: 'boolean', prop: 'allowHalf', label: '半星 allowHalf', default: false },
    { type: 'boolean', prop: 'allowClear', label: '再点清零 allowClear', default: true },
    { type: 'boolean', prop: 'showText', label: '评分文案 showText', default: false },
    { type: 'boolean', prop: 'readOnly', label: '只读 readOnly', default: false },
    { type: 'boolean', prop: 'disabled', label: '禁用 disabled', default: false },
  ],
  spread: 'div',
};
