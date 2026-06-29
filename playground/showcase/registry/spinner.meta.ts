import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'spinner',
  name: 'Spinner',
  category: 'feedback',
  summary: '加载旋转器,持续旋转的发光圆环,三档尺寸,尊重 reduced-motion。',
  description:
    '自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。\nrole="status" 并带 aria-label 供读屏播报;尺寸(sm / md / lg)同时决定圆环直径与边宽。开启系统「减弱动态效果」时放慢旋转而非完全静止,保留「加载中」语义。可透传原生 <span> 属性,便于行内搭配文案或塞进按钮。',
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
    { type: 'text', prop: 'label', label: '无障碍文案 label', default: '加载中' },
  ],
  spread: 'span',
};
