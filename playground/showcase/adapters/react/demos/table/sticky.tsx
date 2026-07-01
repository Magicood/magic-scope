import type { TableColumn } from '@magic-scope/react';
import { Table } from '@magic-scope/react';

// 粘性表头 stickyHeader + maxHeight:超出高度即区域内滚动,表头吸顶不随内容滚走。
interface Row {
  n: number;
  label: string;
  value: string;
}
const columns: TableColumn<Row>[] = [
  { key: 'n', header: '#', align: 'end' },
  { key: 'label', header: '指标' },
  { key: 'value', header: '数值', align: 'end' },
];
const data: Row[] = Array.from({ length: 20 }, (_, i) => ({
  n: i + 1,
  label: `指标 ${i + 1}`,
  value: `${(i * 4.3 + 12).toFixed(1)}%`,
}));

export default function Demo() {
  return (
    <Table
      columns={columns}
      data={data}
      stickyHeader
      maxHeight={220}
      stripe
      style={{ inlineSize: 'min(440px, 100%)' }}
    />
  );
}
