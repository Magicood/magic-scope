import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'switch',
  name: 'Switch',
  category: 'forms',
  summary: '开关,基于原生 input[type=checkbox],checked 时轨道染 primary、滑块右移并发光。',
  description:
    '自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。\n视觉隐藏原生 checkbox 但保留其语义与可达性:完整覆盖 hover / focus-visible(发光环) / disabled 状态与平滑过渡,并尊重 prefers-reduced-motion。触控设备隐形扩竖直命中区到 --ms-target-min。\n受控(checked + onChange)或非受控(defaultChecked)皆可,透传全部原生 checkbox 属性(name / value / required / aria-* 等)。',
  controls: [
    { type: 'boolean', prop: 'defaultChecked', label: '初始开启 defaultChecked', default: true },
    { type: 'boolean', prop: 'disabled', label: '禁用 disabled', default: false },
    { type: 'text', prop: 'label', label: '说明文案', default: '启用魔法' },
  ],
  spread: 'input',
};
