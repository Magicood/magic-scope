import { useState } from 'react';
import type { NumberInputSize } from '../../../packages/react/src/index';
import { NumberInput } from '../../../packages/react/src/index';
import type { ControlValues, DocEntry } from '../types';

function Demo({ values }: { values: ControlValues }) {
  const [value, setValue] = useState<number | null>(8);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
      <NumberInput
        value={value ?? undefined}
        onValueChange={setValue}
        min={values.min as number}
        max={values.max as number}
        step={values.step as number}
        size={values.size as NumberInputSize}
        disabled={values.disabled as boolean}
        aria-label="数量"
      />
      <span style={{ fontSize: '0.8125rem', color: 'var(--ms-color-fg-muted)' }}>
        当前值:{value == null ? '空' : value}
      </span>
    </div>
  );
}

export const entry: DocEntry = {
  id: 'number-input',
  name: 'NumberInput',
  category: 'forms',
  summary: '数字步进输入,− / ＋ 按钮配原生 spinbutton,支持 min/max/step 与三档尺寸。',
  description:
    '自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。\n结构为「− 按钮 + input[type=number] + ＋ 按钮」的整体描边控件,内部以显示文本管理,避免受控数字框打不出小数点 / 中间态的老问题。\n步进与失焦时夹取到 [min,max];触控热区达标、hover/focus 发光、尊重 reduced-motion。受控值通过 onValueChange 上报(有效数字传 number,清空传 null)。',
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
    { type: 'number', prop: 'min', label: '最小值 min', default: 0, step: 1 },
    { type: 'number', prop: 'max', label: '最大值 max', default: 20, step: 1 },
    { type: 'number', prop: 'step', label: '步长 step', default: 1, min: 0.1, step: 0.1 },
    { type: 'boolean', prop: 'disabled', label: '禁用 disabled', default: false },
  ],
  render: (v) => <Demo values={v} />,
  usage: `import { NumberInput } from '@magic-scope/react';

const [value, setValue] = useState<number | null>(8);
<NumberInput value={value ?? undefined} onValueChange={setValue} min={0} max={20} />`,
  props: [
    { name: 'value', type: 'number', default: '—', description: '受控值。' },
    { name: 'defaultValue', type: 'number', default: '—', description: '非受控初始值。' },
    {
      name: 'onValueChange',
      type: '(value: number | null) => void',
      default: '—',
      description: '值变化回调:有效数字时传 number,清空时传 null。',
    },
    {
      name: 'min',
      type: 'number',
      default: '-Infinity',
      description: '最小值(不限时为 -Infinity);步进与失焦时夹取。',
    },
    {
      name: 'max',
      type: 'number',
      default: 'Infinity',
      description: '最大值(不限时为 Infinity);步进与失焦时夹取。',
    },
    { name: 'step', type: 'number', default: '1', description: '步进步长(步进按钮与方向键)。' },
    { name: 'size', type: `'sm' | 'md' | 'lg'`, default: `'md'`, description: '尺寸。' },
    {
      name: '...props',
      type: `Omit<ComponentPropsWithoutRef<'input'>, 'type' | 'value' | 'defaultValue' | 'onChange' | 'size'>`,
      default: '—',
      description: '透传原生 input 属性(disabled / aria-label / name 等)。',
    },
  ],
  examples: [
    {
      title: '尺寸',
      node: (
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <NumberInput size="sm" defaultValue={3} aria-label="sm" />
          <NumberInput size="md" defaultValue={3} aria-label="md" />
          <NumberInput size="lg" defaultValue={3} aria-label="lg" />
        </div>
      ),
    },
    {
      title: '范围与步长',
      description: '限定 [0,10],步长 0.5,小数也能输入。',
      node: <NumberInput defaultValue={5} min={0} max={10} step={0.5} aria-label="评分" />,
    },
    {
      title: '禁用',
      node: <NumberInput defaultValue={7} disabled aria-label="禁用" />,
    },
  ],
};
