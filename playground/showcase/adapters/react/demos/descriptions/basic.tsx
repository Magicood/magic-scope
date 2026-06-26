import { Descriptions } from '@magic-scope/react';

const items = [
  { key: 'order', label: '订单号', value: 'MS-2026-0042' },
  { key: 'spell', label: '法术', value: '高阶传送门' },
  { key: 'caster', label: '施法者', value: '艾莉雅·星语' },
  { key: 'cost', label: '消耗法力', value: '320' },
  { key: 'status', label: '状态', value: '已生效' },
  { key: 'created', label: '创建时间', value: '2026-06-26 14:20' },
];

export default function Demo() {
  return (
    <Descriptions
      items={items}
      title="法术订单"
      extra={<span style={{ color: 'var(--ms-color-fg-muted)' }}>3 列 · 带边框</span>}
      columns={3}
      bordered
      style={{ inlineSize: 'min(640px, 100%)' }}
    />
  );
}
