import { useState } from 'react';
import type { TextareaSize } from '../../../packages/react/src/index';
import { Textarea } from '../../../packages/react/src/index';
import type { ControlValues, DocEntry } from '../types';

function Demo({ values }: { values: ControlValues }) {
  const [value, setValue] = useState('愿奥术之火,照亮你前行的道路。');
  return (
    <Textarea
      value={value}
      onChange={(e) => setValue(e.target.value)}
      size={values.size as TextareaSize}
      invalid={values.invalid as boolean}
      disabled={values.disabled as boolean}
      rows={values.rows as number}
      placeholder={values.placeholder as string}
      aria-label="多行文本输入"
      style={{ inlineSize: 'min(28rem, 100%)' }}
    />
  );
}

export const entry: DocEntry = {
  id: 'textarea',
  name: 'Textarea',
  category: 'forms',
  summary: '多行文本输入框,三档尺寸 + 校验失败态,透传原生 textarea。',
  description:
    '自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。\n样式与 Input 一致:surface 底 + border,focus-visible 染 primary 并起发光环(受顶栏「光影」开关控制),invalid 染 danger 并设 aria-invalid,disabled 半透明。仅允许垂直拖拽改高(resize: vertical),尊重 reduced-motion。',
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
    { type: 'number', prop: 'rows', label: '行数 rows', default: 4, min: 2, max: 12, step: 1 },
    { type: 'boolean', prop: 'invalid', label: '校验失败 invalid', default: false },
    { type: 'boolean', prop: 'disabled', label: '禁用 disabled', default: false },
    { type: 'text', prop: 'placeholder', label: '占位文案 placeholder', default: '写下你的咒语…' },
  ],
  render: (v) => <Demo values={v} />,
  usage: `import { Textarea } from '@magic-scope/react';

const [value, setValue] = useState('');
<Textarea value={value} onChange={(e) => setValue(e.target.value)} rows={4} />`,
  props: [
    {
      name: 'size',
      type: `'sm' | 'md' | 'lg'`,
      default: `'md'`,
      description: '尺寸,影响 font-size 与 min-block-size。',
    },
    {
      name: 'invalid',
      type: 'boolean',
      default: 'false',
      description: '校验失败态:染 danger 色并设置 aria-invalid。',
    },
    {
      name: '...props',
      type: `Omit<ComponentPropsWithoutRef<'textarea'>, 'size'>`,
      default: '—',
      description:
        '透传原生 textarea 属性(value / onChange / rows / placeholder / disabled / maxLength 等)。',
    },
  ],
  examples: [
    {
      title: '尺寸',
      node: (
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', inlineSize: '100%' }}
        >
          <Textarea size="sm" rows={2} placeholder="sm 小号" aria-label="sm" />
          <Textarea size="md" rows={3} placeholder="md 中号" aria-label="md" />
          <Textarea size="lg" rows={3} placeholder="lg 大号" aria-label="lg" />
        </div>
      ),
    },
    {
      title: '状态',
      node: (
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', inlineSize: '100%' }}
        >
          <Textarea rows={2} invalid defaultValue="咒语不完整,无法施放。" aria-label="invalid" />
          <Textarea rows={2} disabled defaultValue="封印中,无法编辑。" aria-label="disabled" />
        </div>
      ),
    },
  ],
};
