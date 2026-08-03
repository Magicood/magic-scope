import type { TableColumn } from '@magic-scope/react';
import { Table } from '@magic-scope/react';

// 汇总/页脚两种形态:
// - summary:列式汇总行(tfoot,逐列走 column.renderSummary)+ size 密度 + defaultSortState 初始排序;
// - footer:整行自定义页脚(覆盖列式汇总)。
interface Row {
  item: string;
  qty: number;
  amount: number;
}

const columns: TableColumn<Row>[] = [
  { key: 'item', header: '项目', renderSummary: () => '合计' },
  {
    key: 'qty',
    header: '数量',
    align: 'end',
    sortable: true,
    renderSummary: (rows) => rows.reduce((s, r) => s + r.qty, 0),
  },
  {
    key: 'amount',
    header: '金额',
    align: 'end',
    sortable: true,
    render: (r) => `¥${r.amount.toLocaleString()}`,
    renderSummary: (rows) => `¥${rows.reduce((s, r) => s + r.amount, 0).toLocaleString()}`,
  },
];
const data: Row[] = [
  { item: '设计服务', qty: 2, amount: 4000 },
  { item: '开发服务', qty: 5, amount: 15000 },
  { item: '运维月费', qty: 1, amount: 800 },
];

export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '1.4rem', inlineSize: 'min(480px, 100%)' }}>
      <Table
        columns={columns}
        data={data}
        size="sm"
        summary
        defaultSortState={{ columnKey: 'amount', direction: 'desc' }}
      />
      <Table
        columns={columns}
        data={data}
        size="lg"
        footer={<span>共 {data.length} 项 · 报价有效期 30 天</span>}
      />
    </div>
  );
}
