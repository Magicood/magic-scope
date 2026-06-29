import { Descriptions } from '@magic-scope/react';

const items = [
  { key: 'order', label: '订单号', value: 'MS-2026-0042' },
  { key: 'plan', label: '套餐', value: 'Team 团队版' },
  { key: 'owner', label: '负责人', value: 'Mira Chen' },
  { key: 'amount', label: '金额', value: '￥320' },
  { key: 'status', label: '状态', value: '已支付' },
  { key: 'created', label: '创建时间', value: '2026-06-26 14:20' },
];

export default function Demo() {
  return (
    <Descriptions
      items={items}
      title="订单详情"
      extra={<span style={{ color: 'var(--ms-color-fg-muted)' }}>3 列 · 带边框</span>}
      columns={3}
      bordered
      style={{ inlineSize: 'min(640px, 100%)' }}
    />
  );
}
