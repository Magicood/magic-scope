import { useState } from 'react';
import type { TabItem } from '../../../packages/react/src/index';
import { Tabs } from '../../../packages/react/src/index';
import type { ControlValues, DocEntry } from '../types';

const ITEMS: TabItem[] = [
  {
    value: 'arcane',
    label: 'Arcane 奥术',
    content: (
      <p style={{ margin: 0, color: 'var(--ms-color-fg-muted)' }}>
        奥术系主打瞬发与爆发,适合需要高频施法的场景。下划线变体的选中条带主色发光。
      </p>
    ),
  },
  {
    value: 'frost',
    label: 'Frost 冰霜',
    content: (
      <p style={{ margin: 0, color: 'var(--ms-color-fg-muted)' }}>
        冰霜系以控场见长,减速与冻结让节奏尽在掌握。切换标签时面板内容平滑替换。
      </p>
    ),
  },
  {
    value: 'ember',
    label: 'Ember 余烬',
    content: (
      <p style={{ margin: 0, color: 'var(--ms-color-fg-muted)' }}>
        余烬系持续灼烧,以时间换取可观的总伤害。键盘 ← → 可在可用标签间循环切换。
      </p>
    ),
  },
  {
    value: 'void',
    label: 'Void 虚空(禁用)',
    disabled: true,
    content: <p style={{ margin: 0 }}>虚空系尚未解锁。</p>,
  },
];

function Demo({ values }: { values: ControlValues }) {
  const [value, setValue] = useState('frost');
  return (
    <div style={{ minWidth: 'min(32rem, 100%)' }}>
      <Tabs
        items={ITEMS}
        value={value}
        onChange={setValue}
        variant={values.variant as 'underline' | 'pill'}
      />
    </div>
  );
}

export const entry: DocEntry = {
  id: 'tabs',
  name: 'Tabs',
  category: 'navigation',
  summary: '标签页,受控 / 非受控双模式,完整 ARIA 与方向键导航。',
  description:
    '自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。\nrole="tablist" / "tab" / "tabpanel" 全套 ARIA 关联,采用 roving tabIndex(仅选中项进 Tab 序)。键盘 ← → 在可用标签间循环切换(跳过 disabled),Home / End 跳首尾。underline 变体选中项下方主色条带发光,pill 变体选中项 primary 实底。',
  controls: [
    {
      type: 'select',
      prop: 'variant',
      label: '变体 variant',
      default: 'underline',
      options: [
        { value: 'underline', label: 'underline 下划线' },
        { value: 'pill', label: 'pill 胶囊' },
      ],
    },
  ],
  render: (v) => <Demo values={v} />,
  usage: `import { Tabs } from '@magic-scope/react';

const items = [
  { value: 'arcane', label: 'Arcane', content: <p>奥术内容</p> },
  { value: 'frost', label: 'Frost', content: <p>冰霜内容</p> },
];

<Tabs items={items} defaultValue="arcane" />`,
  props: [
    {
      name: 'items',
      type: 'TabItem[]',
      default: '—',
      description: '标签项列表:{ value, label, content?, disabled? }。',
    },
    {
      name: 'value',
      type: 'string',
      default: '—',
      description: '受控选中值。传入则由外部托管,需配合 onChange。',
    },
    {
      name: 'defaultValue',
      type: 'string',
      default: '首个可用项',
      description: '非受控初始选中值。缺省取第一个未禁用项。',
    },
    {
      name: 'onChange',
      type: '(value: string) => void',
      default: '—',
      description: '选中变化回调,参数为新选中项的 value。',
    },
    {
      name: 'variant',
      type: `'underline' | 'pill'`,
      default: `'underline'`,
      description: '视觉变体:下划线条带 / 实底胶囊。',
    },
    {
      name: 'className',
      type: 'string',
      default: '—',
      description: '外部类名(作用于最外层容器)。',
    },
  ],
  examples: [
    {
      title: '变体',
      node: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
          <Tabs items={ITEMS} defaultValue="arcane" variant="underline" />
          <Tabs items={ITEMS} defaultValue="arcane" variant="pill" />
        </div>
      ),
    },
    {
      title: '仅切换标签(无 content)',
      description: '省略 content 时只切换标签,不渲染 tabpanel,适合外部自管内容区。',
      node: (
        <Tabs
          items={[
            { value: 'all', label: '全部' },
            { value: 'active', label: '进行中' },
            { value: 'done', label: '已完成' },
          ]}
          defaultValue="all"
          variant="pill"
        />
      ),
    },
  ],
};
