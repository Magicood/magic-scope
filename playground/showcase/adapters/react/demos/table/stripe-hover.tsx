import { Table } from '@magic-scope/react';

const columns = [
  { key: 'rank', header: '#', align: 'end' as const },
  { key: 'name', header: '法术' },
  { key: 'cost', header: '法力', align: 'end' as const },
];

const data = [
  { rank: 1, name: '奥术飞弹', cost: 3 },
  { rank: 2, name: '火球术', cost: 5 },
  { rank: 3, name: '传送门', cost: 7 },
];

export default function Demo() {
  return (
    <Table
      columns={columns}
      data={data}
      stripe
      hoverable
      style={{ inlineSize: 'min(420px, 100%)' }}
    />
  );
}
