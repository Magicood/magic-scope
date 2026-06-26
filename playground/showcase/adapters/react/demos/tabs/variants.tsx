import type { TabItem } from '@magic-scope/react';
import { Tabs } from '@magic-scope/react';

const items: TabItem[] = [
  {
    value: 'arcane',
    label: 'Arcane 奥术',
    content: <p style={{ margin: 0 }}>奥术系:瞬发与爆发。</p>,
  },
  {
    value: 'frost',
    label: 'Frost 冰霜',
    content: <p style={{ margin: 0 }}>冰霜系:减速与控场。</p>,
  },
  { value: 'ember', label: 'Ember 余烬', content: <p style={{ margin: 0 }}>余烬系:持续灼烧。</p> },
];

export default function Demo() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', inlineSize: '100%' }}>
      <Tabs items={items} defaultValue="arcane" variant="underline" />
      <Tabs items={items} defaultValue="arcane" variant="pill" />
    </div>
  );
}
