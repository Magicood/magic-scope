import { useState } from 'react';
import type { RadioSize } from '../../../packages/react/src/index';
import { Radio, RadioGroup } from '../../../packages/react/src/index';
import type { ControlValues, DocEntry } from '../types';

const SCHOOLS = [
  { value: 'arcane', label: 'Arcane 奥术' },
  { value: 'frost', label: 'Frost 冰霜' },
  { value: 'ember', label: 'Ember 烈焰' },
  { value: 'void', label: 'Void 虚空(禁用)', disabled: true },
];

function Demo({ values }: { values: ControlValues }) {
  const [school, setSchool] = useState('frost');
  return (
    <RadioGroup
      value={school}
      onValueChange={setSchool}
      orientation={values.orientation as 'horizontal' | 'vertical'}
      size={values.size as RadioSize}
      disabled={values.disabled as boolean}
      aria-label="法术流派"
    >
      {SCHOOLS.map((item) => (
        <Radio key={item.value} value={item.value} disabled={item.disabled}>
          {item.label}
        </Radio>
      ))}
    </RadioGroup>
  );
}

export const entry: DocEntry = {
  id: 'radio',
  name: 'Radio',
  category: 'forms',
  summary: '单选组,基于原生 input[type=radio],方向键导航与 roving tabindex 开箱即用。',
  description:
    '由 RadioGroup(role="radiogroup")+ Radio(原生 input[type=radio])组成。\nRadioGroup 用 context 把 name / 选中值 / 尺寸 / 禁用下发给组内 Radio,支持受控(value)与非受控(defaultValue);同 name 自动获得原生方向键导航与 roving tabindex。\n完整覆盖 hover / focus-visible(发光环)/ checked / disabled 状态,触控热区达标并尊重 reduced-motion。',
  controls: [
    {
      type: 'select',
      prop: 'orientation',
      label: '方向 orientation',
      default: 'vertical',
      options: [
        { value: 'vertical', label: 'vertical 纵向' },
        { value: 'horizontal', label: 'horizontal 横向' },
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
    { type: 'boolean', prop: 'disabled', label: '整组禁用 disabled', default: false },
  ],
  render: (v) => <Demo values={v} />,
  usage: `import { RadioGroup, Radio } from '@magic-scope/react';

const [v, setV] = useState('frost');
<RadioGroup value={v} onValueChange={setV} aria-label="法术流派">
  <Radio value="arcane">Arcane</Radio>
  <Radio value="frost">Frost</Radio>
</RadioGroup>`,
  props: [
    {
      name: 'value',
      type: 'string',
      default: '—',
      description: 'RadioGroup:受控选中值。',
    },
    {
      name: 'defaultValue',
      type: 'string',
      default: '—',
      description: 'RadioGroup:非受控初始选中值。',
    },
    {
      name: 'onValueChange',
      type: '(value: string) => void',
      default: '—',
      description: 'RadioGroup:选中变化回调,入参为被选中项的 value。',
    },
    {
      name: 'name',
      type: 'string',
      default: '自动生成',
      description: 'RadioGroup:同组 radio 的 name,省略时自动生成以保证「同名即单选」。',
    },
    {
      name: 'orientation',
      type: `'horizontal' | 'vertical'`,
      default: `'vertical'`,
      description: 'RadioGroup:排布方向,同时映射到 aria-orientation。',
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: 'RadioGroup:整组禁用;Radio:可单独禁用某一项。',
    },
    {
      name: 'size',
      type: `'sm' | 'md' | 'lg'`,
      default: `'md'`,
      description: 'RadioGroup / Radio:尺寸,Radio 缺省继承所在 RadioGroup。',
    },
    {
      name: 'value',
      type: 'string',
      default: '—',
      description: 'Radio:该选项的值,在 RadioGroup 内唯一(必填)。',
    },
    {
      name: 'children',
      type: 'ReactNode',
      default: '—',
      description: 'Radio:选项右侧的文字标签内容。',
    },
    {
      name: '...props',
      type: `ComponentPropsWithoutRef<'input'>`,
      default: '—',
      description: 'Radio:透传原生 input 属性(除 type / size / value)。',
    },
  ],
  examples: [
    {
      title: '横向排布',
      node: (
        <RadioGroup defaultValue="ember" orientation="horizontal" aria-label="横向示例">
          {SCHOOLS.map((item) => (
            <Radio key={item.value} value={item.value} disabled={item.disabled}>
              {item.label}
            </Radio>
          ))}
        </RadioGroup>
      ),
    },
    {
      title: '尺寸',
      node: (
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <RadioGroup defaultValue="arcane" size="sm" orientation="horizontal" aria-label="sm">
            <Radio value="arcane">sm</Radio>
            <Radio value="frost">选项</Radio>
          </RadioGroup>
          <RadioGroup defaultValue="arcane" size="md" orientation="horizontal" aria-label="md">
            <Radio value="arcane">md</Radio>
            <Radio value="frost">选项</Radio>
          </RadioGroup>
          <RadioGroup defaultValue="arcane" size="lg" orientation="horizontal" aria-label="lg">
            <Radio value="arcane">lg</Radio>
            <Radio value="frost">选项</Radio>
          </RadioGroup>
        </div>
      ),
    },
  ],
};
