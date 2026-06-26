import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'slider',
  name: 'Slider',
  category: 'forms',
  summary: '滑块,基于原生 input[type=range],自绘轨道 / 填充 / 发光滑块。',
  description:
    '用原生 range 白嫖可访问的 slider 语义(role=slider、aria-valuenow/min/max、方向键 / Home / End);以 appearance:none + 伪元素自绘轨道 / 填充 / 滑块。支持受控与非受控,sm/md/lg 三档,触控热区达标、hover/focus-visible 发光、尊重 reduced-motion。可选 showValue + formatValue 在末尾渲染当前值(role=status 的 output)。',
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
        { value: 'neutral', label: 'neutral' },
      ],
    },
    {
      type: 'select',
      prop: 'orientation',
      label: '朝向 orientation',
      default: 'horizontal',
      options: [
        { value: 'horizontal', label: 'horizontal' },
        { value: 'vertical', label: 'vertical' },
      ],
    },
    { type: 'boolean', prop: 'showValue', label: '显示数值 showValue', default: true },
    { type: 'boolean', prop: 'showTooltip', label: '跟随气泡 showTooltip', default: false },
    { type: 'boolean', prop: 'disabled', label: '禁用 disabled', default: false },
    { type: 'number', prop: 'step', label: '步长 step', default: 1, min: 1, max: 25 },
  ],
  spread: 'input',
};
