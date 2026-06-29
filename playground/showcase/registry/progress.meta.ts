import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'progress',
  name: 'Progress',
  category: 'feedback',
  summary: '进度条,确定态按 value 驱动填充宽度,不确定态填充段左右往返流动。',
  description:
    '自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。\nrole="progressbar",aria-valuemin=0 / aria-valuemax=100;确定态设 aria-valuenow 并按 value% 平滑驱动填充宽度,不确定态(indeterminate 或缺省 value)让一段发光填充段左右往返流动。value 自动夹到 0-100,非法值回退 0,填充永不溢出轨道。尊重 reduced-motion(放慢往返,保留语义)。',
  controls: [
    {
      type: 'select',
      prop: 'variant',
      label: '形态 variant',
      default: 'linear',
      options: [
        { value: 'linear', label: 'linear 线性' },
        { value: 'circular', label: 'circular 环形' },
      ],
    },
    {
      type: 'select',
      prop: 'tone',
      label: '色调 tone',
      default: 'primary',
      options: [
        { value: 'primary', label: 'primary 主色' },
        { value: 'accent', label: 'accent 强调' },
        { value: 'success', label: 'success 成功' },
        { value: 'warning', label: 'warning 警示' },
        { value: 'danger', label: 'danger 危险' },
        { value: 'info', label: 'info 信息' },
        { value: 'neutral', label: 'neutral 中性' },
      ],
    },
    {
      type: 'select',
      prop: 'size',
      label: '尺寸 size',
      default: 'md',
      options: [
        { value: 'sm', label: 'sm 细' },
        { value: 'md', label: 'md 中' },
        { value: 'lg', label: 'lg 粗' },
      ],
    },
    { type: 'boolean', prop: 'indeterminate', label: '不确定态 indeterminate', default: false },
    { type: 'boolean', prop: 'striped', label: '斜纹 striped', default: false },
    { type: 'boolean', prop: 'animated', label: '斜纹流动 animated', default: false },
    { type: 'boolean', prop: 'showValue', label: '显示百分比 showValue', default: false },
    { type: 'number', prop: 'value', label: '进度 value', default: 60, min: 0, max: 100, step: 1 },
  ],
  spread: 'div',
};
