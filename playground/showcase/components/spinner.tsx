import type { SpinnerSize } from '../../../packages/react/src/index';
import { Spinner } from '../../../packages/react/src/index';
import type { DocEntry } from '../types';

export const entry: DocEntry = {
  id: 'spinner',
  name: 'Spinner',
  category: 'feedback',
  summary: '加载旋转器,持续旋转的奥术发光圆环,三档尺寸,尊重 reduced-motion。',
  description:
    '自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。\nrole="status" 并带 aria-label 供读屏播报;尺寸同时决定圆环直径与边宽。开启系统「减弱动态效果」时放慢旋转而非静止,保留「加载中」语义。',
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
  render: (v) => <Spinner size={v.size as SpinnerSize} label={v.label as string} />,
  usage: `import { Spinner } from '@magic-scope/react';

<Spinner size="md" label="加载中" />`,
  props: [
    {
      name: 'size',
      type: `'sm' | 'md' | 'lg'`,
      default: `'md'`,
      description: '尺寸,同时决定圆环直径与边宽。',
    },
    {
      name: 'label',
      type: 'string',
      default: `'加载中'`,
      description: '无障碍文案,通过 aria-label 供读屏播报。',
    },
    {
      name: '...props',
      type: `ComponentPropsWithoutRef<'span'>`,
      default: '—',
      description: '透传原生 span 属性(className / style / id 等)。',
    },
  ],
  examples: [
    {
      title: '尺寸',
      node: (
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <Spinner size="sm" />
          <Spinner size="md" />
          <Spinner size="lg" />
        </div>
      ),
    },
    {
      title: '行内搭配文案',
      node: (
        <span style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center' }}>
          <Spinner size="sm" />
          <span style={{ color: 'var(--ms-color-fg-muted)' }}>正在施法…</span>
        </span>
      ),
    },
  ],
};
