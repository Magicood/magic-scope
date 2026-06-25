import { useState } from 'react';
import type { SelectSize } from '../../../packages/react/src/index';
import { Select } from '../../../packages/react/src/index';
import type { ControlValues, DocEntry } from '../types';

const OPTIONS = [
  { value: 'arcane', label: 'Arcane 紫' },
  { value: 'frost', label: 'Frost 青' },
  { value: 'ember', label: 'Ember 品红' },
  { value: 'void', label: 'Void 玄(禁用)', disabled: true },
];

function Demo({ values }: { values: ControlValues }) {
  const [v, setV] = useState('frost');
  return (
    <Select
      value={v}
      onChange={setV}
      options={OPTIONS}
      size={values.size as SelectSize}
      disabled={values.disabled as boolean}
      aria-label="主题选择"
    />
  );
}

export const entry: DocEntry = {
  id: 'select',
  name: 'Select',
  category: 'forms',
  summary: '下拉选择,Popover API + CSS Anchor Positioning,键盘可达。',
  description:
    '浮层进 top-layer 用 Popover API(自带点外 / Esc 关闭),定位用 CSS Anchor Positioning,并以 @supports 降级。键盘交互(↑↓ / Enter / Space / Esc / Home / End)自实现;受控 value。',
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
    { type: 'boolean', prop: 'disabled', label: '禁用 disabled', default: false },
  ],
  render: (v) => <Demo values={v} />,
  usage: `import { Select } from '@magic-scope/react';

const [v, setV] = useState('frost');
<Select value={v} onChange={setV} options={[{ value: 'frost', label: 'Frost' }]} />`,
  props: [
    { name: 'value', type: 'string', default: '—', description: '当前选中值(受控)。' },
    {
      name: 'onChange',
      type: '(value: string) => void',
      default: '—',
      description: '选中变化回调。',
    },
    {
      name: 'options',
      type: 'SelectOption[]',
      default: '—',
      description: '选项列表:{ value, label, disabled? }。',
    },
    {
      name: 'placeholder',
      type: 'string',
      default: `'请选择…'`,
      description: '未选中时占位文本。',
    },
    { name: 'size', type: `'sm' | 'md' | 'lg'`, default: `'md'`, description: '尺寸。' },
    { name: 'disabled', type: 'boolean', default: 'false', description: '禁用整个选择器。' },
    {
      name: 'aria-label',
      type: 'string',
      default: '—',
      description: 'trigger 无障碍名称(无可见 label 时建议提供)。',
    },
  ],
  examples: [
    {
      title: '尺寸',
      node: (
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Select size="sm" options={OPTIONS} value="frost" aria-label="sm" />
          <Select size="md" options={OPTIONS} value="frost" aria-label="md" />
          <Select size="lg" options={OPTIONS} value="frost" aria-label="lg" />
        </div>
      ),
    },
  ],
};
