import type { InputSize } from '../../../packages/react/src/index';
import { Input } from '../../../packages/react/src/index';
import type { DocEntry } from '../types';

export const entry: DocEntry = {
  id: 'input',
  name: 'Input',
  category: 'forms',
  summary: '文本输入框,三档尺寸,带聚焦发光与校验失败态。',
  description:
    '完整覆盖 hover / focus-visible(发光) / disabled / invalid 状态与过渡;尊重 reduced-motion。invalid 会同时设 aria-invalid。',
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
    { type: 'boolean', prop: 'invalid', label: '校验失败 invalid', default: false },
    { type: 'boolean', prop: 'disabled', label: '禁用 disabled', default: false },
    { type: 'text', prop: 'placeholder', label: '占位符', default: '输入点什么…' },
  ],
  render: (v) => (
    <Input
      size={v.size as InputSize}
      invalid={v.invalid as boolean}
      disabled={v.disabled as boolean}
      placeholder={v.placeholder as string}
      style={{ inlineSize: 'min(320px, 80vw)' }}
    />
  ),
  usage: `import { Input } from '@magic-scope/react';

<Input placeholder="用户名" />
<Input invalid placeholder="邮箱格式有误" />`,
  props: [
    { name: 'size', type: `'sm' | 'md' | 'lg'`, default: `'md'`, description: '尺寸。' },
    {
      name: 'invalid',
      type: 'boolean',
      default: 'false',
      description: '校验失败态:染 danger 色并设 aria-invalid。',
    },
    {
      name: '...props',
      type: `Omit<ComponentPropsWithoutRef<'input'>, 'size'>`,
      default: '—',
      description: '透传原生 input 属性(value / onChange / disabled / type 等)。',
    },
  ],
  examples: [
    {
      title: '尺寸',
      node: (
        <div style={{ display: 'grid', gap: '0.6rem', inlineSize: 'min(320px, 80vw)' }}>
          <Input size="sm" placeholder="sm" />
          <Input size="md" placeholder="md" />
          <Input size="lg" placeholder="lg" />
        </div>
      ),
    },
    {
      title: '状态',
      node: (
        <div style={{ display: 'grid', gap: '0.6rem', inlineSize: 'min(320px, 80vw)' }}>
          <Input invalid defaultValue="格式有误" />
          <Input disabled placeholder="禁用" />
        </div>
      ),
    },
  ],
};
