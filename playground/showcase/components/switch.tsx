import { useEffect, useState } from 'react';
import { Switch } from '../../../packages/react/src/index';
import type { ControlValues, DocEntry } from '../types';

function Demo({ values }: { values: ControlValues }) {
  const initial = values.defaultChecked as boolean;
  const [checked, setChecked] = useState(initial);

  // 旋钮里的「初始状态」变化时,同步重置受控值,便于实时预览。
  useEffect(() => {
    setChecked(initial);
  }, [initial]);

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem' }}>
      <Switch
        checked={checked}
        onChange={(e) => setChecked(e.target.checked)}
        disabled={values.disabled as boolean}
        aria-label={(values.label as string) || '启用魔法'}
      />
      <span style={{ color: 'var(--ms-color-fg-muted)', userSelect: 'none' }}>
        {(values.label as string) || '启用魔法'}:{checked ? '开 ✦' : '关'}
      </span>
    </div>
  );
}

export const entry: DocEntry = {
  id: 'switch',
  name: 'Switch',
  category: 'forms',
  summary: '开关,基于原生 input[type=checkbox],checked 时轨道染 primary、滑块右移并发光。',
  description:
    '自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。\n视觉隐藏原生 checkbox 但保留其语义与可达性:完整覆盖 hover / focus-visible(发光环) / disabled 状态与平滑过渡,并尊重 prefers-reduced-motion。\n受控(checked + onChange)或非受控(defaultChecked)皆可,透传全部原生 checkbox 属性。',
  controls: [
    { type: 'boolean', prop: 'defaultChecked', label: '初始开启 defaultChecked', default: true },
    { type: 'boolean', prop: 'disabled', label: '禁用 disabled', default: false },
    { type: 'text', prop: 'label', label: '说明文案', default: '启用魔法' },
  ],
  render: (v) => <Demo values={v} />,
  usage: `import { Switch } from '@magic-scope/react';

// 非受控
<Switch defaultChecked />

// 受控
const [on, setOn] = useState(false);
<Switch checked={on} onChange={(e) => setOn(e.target.checked)} />`,
  props: [
    {
      name: 'checked',
      type: 'boolean',
      default: '—',
      description: '受控:当前是否开启。提供时需配合 onChange。',
    },
    {
      name: 'defaultChecked',
      type: 'boolean',
      default: 'false',
      description: '非受控:初始是否开启。',
    },
    {
      name: 'onChange',
      type: `(e: ChangeEvent<HTMLInputElement>) => void`,
      default: '—',
      description: '状态变化回调,从 e.target.checked 取新值。',
    },
    { name: 'disabled', type: 'boolean', default: 'false', description: '禁用开关。' },
    {
      name: '...props',
      type: `Omit<ComponentPropsWithoutRef<'input'>, 'type'>`,
      default: '—',
      description: '透传原生 checkbox 属性(name / value / required / aria-* 等)。',
    },
  ],
  examples: [
    {
      title: '默认状态',
      description: '非受控,defaultChecked 控制初始值。',
      node: (
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <Switch defaultChecked aria-label="默认开启" />
          <Switch aria-label="默认关闭" />
        </div>
      ),
    },
    {
      title: '禁用',
      description: '禁用态保留开 / 关两种外观。',
      node: (
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <Switch defaultChecked disabled aria-label="禁用且开启" />
          <Switch disabled aria-label="禁用且关闭" />
        </div>
      ),
    },
    {
      title: '带文字标签',
      description: '组件自带 <label>,配 aria-label 提供无障碍名称。',
      node: (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem' }}>
          <Switch defaultChecked aria-label="奥术发光" />
          <span style={{ color: 'var(--ms-color-fg-muted)' }}>奥术发光</span>
        </div>
      ),
    },
  ],
};
