import type { KbdSize } from '../../../packages/react/src/index';
import { Kbd } from '../../../packages/react/src/index';
import type { DocEntry } from '../types';

export const entry: DocEntry = {
  id: 'kbd',
  name: 'Kbd',
  category: 'data',
  summary: '键盘按键样式,展示快捷键如 ⌘K、Ctrl + C,键帽立体感。',
  description:
    '自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。\nsurface-raised 底 + 1px 描边 + 加粗底边模拟键帽立体感,radius-sm、font-mono、紧凑内边距。\n组合键用多个 <Kbd> 并以分隔符拼接即可。',
  controls: [
    {
      type: 'select',
      prop: 'size',
      label: '尺寸 size',
      default: 'md',
      options: [
        { value: 'sm', label: 'sm 紧凑' },
        { value: 'md', label: 'md 默认' },
      ],
    },
    { type: 'text', prop: 'children', label: '按键文案', default: '⌘ K' },
  ],
  render: (v) => <Kbd size={v.size as KbdSize}>{v.children as string}</Kbd>,
  usage: `import { Kbd } from '@magic-scope/react';

<Kbd>⌘</Kbd> + <Kbd>K</Kbd>`,
  props: [
    { name: 'size', type: `'sm' | 'md'`, default: `'md'`, description: '尺寸:sm 紧凑 / md 默认。' },
    {
      name: 'children',
      type: 'ReactNode',
      default: '—',
      description: '按键内容,如 ⌘、Ctrl、Enter。',
    },
    {
      name: '...props',
      type: `ComponentPropsWithoutRef<'kbd'>`,
      default: '—',
      description: '透传原生 kbd 属性(className / title / aria-* 等)。',
    },
  ],
  examples: [
    {
      title: '组合键',
      description: '多个 Kbd 以分隔符拼接,表达快捷键序列。',
      node: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
          <Kbd>⌘</Kbd>
          <span style={{ color: 'var(--ms-color-fg-muted)' }}>+</span>
          <Kbd>⇧</Kbd>
          <span style={{ color: 'var(--ms-color-fg-muted)' }}>+</span>
          <Kbd>P</Kbd>
        </div>
      ),
    },
    {
      title: '尺寸',
      node: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Kbd size="sm">Esc</Kbd>
          <Kbd size="md">Esc</Kbd>
        </div>
      ),
    },
    {
      title: '常见按键',
      node: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Kbd>Ctrl</Kbd>
          <Kbd>Alt</Kbd>
          <Kbd>Tab</Kbd>
          <Kbd>Enter</Kbd>
          <Kbd>↑</Kbd>
          <Kbd>↓</Kbd>
        </div>
      ),
    },
  ],
};
