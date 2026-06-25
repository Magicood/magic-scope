import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'progress',
  name: 'Progress',
  category: 'feedback',
  summary: '进度条,确定态按 value 驱动填充宽度,不确定态填充段左右往返流动。',
  description:
    '自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。\nrole="progressbar",aria-valuemin=0 / aria-valuemax=100;确定态设 aria-valuenow 并按 value% 平滑驱动填充宽度,不确定态(indeterminate 或缺省 value)让一段奥术发光左右往返流动。value 自动夹到 0-100,非法值回退 0,填充永不溢出轨道。尊重 reduced-motion(放慢往返,保留语义)。',
  controls: [
    { type: 'boolean', prop: 'indeterminate', label: '不确定态 indeterminate', default: false },
    { type: 'number', prop: 'value', label: '进度 value', default: 60, min: 0, max: 100, step: 1 },
  ],
  spread: 'div',
};
