import type { SortState, TableColumn } from '@magic-scope/react';
import { Table } from '@magic-scope/react';
import { useState } from 'react';

// 受控排序:sortState + onSortChange 托管排序,点表头在 asc/desc/无 间循环。
// tone=accent 让激活的排序箭头读 accent 槽位。
interface Plan {
  name: string;
  seats: number;
  mrr: number;
}

const columns: TableColumn<Plan>[] = [
  { key: 'name', header: '套餐' },
  { key: 'seats', header: '席位', align: 'end', sortable: true },
  { key: 'mrr', header: '月收入', align: 'end', sortable: true, render: (r) => `¥${r.mrr}` },
];
const data: Plan[] = [
  { name: 'Starter', seats: 12, mrr: 108 },
  { name: 'Pro', seats: 34, mrr: 986 },
  { name: 'Team', seats: 8, mrr: 632 },
];

export default function Demo() {
  const [sortState, setSortState] = useState<SortState | null>({
    columnKey: 'mrr',
    direction: 'desc',
  });
  return (
    <Table
      columns={columns}
      data={data}
      tone="accent"
      sortState={sortState}
      onSortChange={setSortState}
      style={{ inlineSize: 'min(440px, 100%)' }}
    />
  );
}
