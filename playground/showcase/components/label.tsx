import { useState } from 'react';
import { Input, Label } from '../../../packages/react/src/index';
import type { ControlValues, DocEntry } from '../types';

function Demo({ values }: { values: ControlValues }) {
  const [value, setValue] = useState('');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', minWidth: '16rem' }}>
      <Label htmlFor="ms-label-demo" required={values.required as boolean}>
        {values.children as string}
      </Label>
      <Input
        id="ms-label-demo"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="点上方标签即可聚焦此处"
        aria-required={(values.required as boolean) || undefined}
      />
    </div>
  );
}

export const entry: DocEntry = {
  id: 'label',
  name: 'Label',
  category: 'forms',
  summary: '表单标签,基于原生 label;htmlFor 关联控件,required 时追加装饰星号。',
  description:
    '自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。\n通过 htmlFor 关联表单控件(点击标签即聚焦对应控件);required 仅在文末渲染装饰性星号(aria-hidden),真正的必填语义应由控件自身的 aria-required 承担。尊重 reduced-motion。',
  controls: [
    { type: 'boolean', prop: 'required', label: '必填 required', default: true },
    { type: 'text', prop: 'children', label: '标签文案', default: '法师称号' },
  ],
  render: (v) => <Demo values={v} />,
  usage: `import { Label, Input } from '@magic-scope/react';

<Label htmlFor="name" required>法师称号</Label>
<Input id="name" aria-required />`,
  props: [
    { name: 'children', type: 'ReactNode', default: '—', description: '标签文字内容。' },
    {
      name: 'required',
      type: 'boolean',
      default: 'false',
      description: '必填标记:文末追加 danger 色装饰星号(仅 aria-hidden,不承担必填语义)。',
    },
    {
      name: 'htmlFor',
      type: 'string',
      default: '—',
      description: '关联控件的 id;点击标签可聚焦对应控件。',
    },
    {
      name: '...props',
      type: `ComponentPropsWithoutRef<'label'>`,
      default: '—',
      description: '透传原生 label 属性(htmlFor / onClick / className 等)。',
    },
  ],
  examples: [
    {
      title: '必填与可选',
      description: 'required 在文末追加装饰星号;关联同一个 id 时点击标签会聚焦输入框。',
      node: (
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <Label htmlFor="ms-label-eg-required" required>
              真名
            </Label>
            <Input id="ms-label-eg-required" placeholder="必填" aria-required />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <Label htmlFor="ms-label-eg-optional">门派(可选)</Label>
            <Input id="ms-label-eg-optional" placeholder="可选" />
          </div>
        </div>
      ),
    },
  ],
};
