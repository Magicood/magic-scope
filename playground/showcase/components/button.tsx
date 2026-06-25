import type { ButtonSize, ButtonVariant } from '../../../packages/react/src/index';
import { Button } from '../../../packages/react/src/index';
import type { DocEntry } from '../types';

export const entry: DocEntry = {
  id: 'button',
  name: 'Button',
  category: 'actions',
  summary: '主操作按钮,三种视觉变体与三档尺寸,solid 带奥术发光。',
  description:
    '自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。\n完整覆盖 hover / active / focus-visible / disabled 状态与平滑过渡;solid 变体带可调发光(受顶栏「光影」开关控制)。',
  controls: [
    {
      type: 'select',
      prop: 'variant',
      label: '变体 variant',
      default: 'solid',
      options: [
        { value: 'solid', label: 'solid 实底' },
        { value: 'outline', label: 'outline 描边' },
        { value: 'ghost', label: 'ghost 幽灵' },
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
    { type: 'boolean', prop: 'disabled', label: '禁用 disabled', default: false },
    { type: 'text', prop: 'children', label: '文案', default: '施法 ✦' },
  ],
  render: (v) => (
    <Button
      variant={v.variant as ButtonVariant}
      size={v.size as ButtonSize}
      disabled={v.disabled as boolean}
    >
      {v.children as string}
    </Button>
  ),
  usage: `import { Button } from '@magic-scope/react';

<Button variant="solid" size="md">施法</Button>`,
  props: [
    {
      name: 'variant',
      type: `'solid' | 'outline' | 'ghost'`,
      default: `'solid'`,
      description: '视觉变体:实底(带奥术发光)/ 描边 / 幽灵。',
    },
    { name: 'size', type: `'sm' | 'md' | 'lg'`, default: `'md'`, description: '尺寸。' },
    {
      name: '...props',
      type: `ComponentPropsWithoutRef<'button'>`,
      default: '—',
      description: '透传原生 button 属性(onClick / type / disabled 等)。',
    },
  ],
  examples: [
    {
      title: '变体',
      node: (
        <>
          <Button>Solid</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
        </>
      ),
    },
    {
      title: '尺寸',
      node: (
        <>
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </>
      ),
    },
    {
      title: '禁用',
      node: (
        <>
          <Button disabled>Solid</Button>
          <Button variant="outline" disabled>
            Outline
          </Button>
        </>
      ),
    },
  ],
};
