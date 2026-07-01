import type { TableColumn } from '@magic-scope/react';
import { Table } from '@magic-scope/react';

// 可展开行 expandable:每行左侧展开按钮,点开渲染 rowRender 详情区;
// defaultExpandedKeys 让首行默认展开。
interface Order {
  id: string;
  customer: string;
  total: number;
  note: string;
}
const columns: TableColumn<Order>[] = [
  { key: 'id', header: '订单号' },
  { key: 'customer', header: '客户' },
  { key: 'total', header: '金额', align: 'end', render: (r) => `¥${r.total.toLocaleString()}` },
];
const data: Order[] = [
  { id: 'A-1001', customer: 'Aria', total: 4200, note: '含加急费;发票已开具。' },
  { id: 'A-1002', customer: 'Borin', total: 980, note: '等待客户确认收货地址。' },
];

export default function Demo() {
  return (
    <Table
      columns={columns}
      data={data}
      getRowKey={(row) => row.id}
      expandable={{
        defaultExpandedKeys: ['A-1001'],
        rowRender: (row) => (
          <div style={{ padding: '0.4rem 0.2rem', color: 'var(--ms-fg-muted)' }}>
            备注:{row.note}
          </div>
        ),
      }}
      style={{ inlineSize: 'min(460px, 100%)' }}
    />
  );
}
