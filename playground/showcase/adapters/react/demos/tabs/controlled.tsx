import type { TabItem } from '@magic-scope/react';
import { Tabs } from '@magic-scope/react';
import { useState } from 'react';

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
  {
    value: 'void',
    label: 'Void 虚空',
    disabled: true,
    content: <p style={{ margin: 0 }}>尚未解锁。</p>,
  },
];

export default function Demo() {
  const [value, setValue] = useState('frost');
  return (
    <div style={{ display: 'grid', gap: '0.75rem', inlineSize: 'min(32rem, 100%)' }}>
      <Tabs items={items} value={value} onChange={setValue} />
      <p style={{ margin: 0, color: 'var(--ms-color-fg-muted)', fontSize: '0.85rem' }}>
        当前受控选中:<code>{value}</code>(虚空项 disabled,方向键会跳过它)。
      </p>
    </div>
  );
}
