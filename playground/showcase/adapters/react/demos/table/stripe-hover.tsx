import { Table } from '@magic-scope/react';

const columns = [
  { key: 'rank', header: '#', align: 'end' as const },
  { key: 'name', header: '套餐' },
  { key: 'cost', header: '月费', align: 'end' as const },
];

const data = [
  { rank: 1, name: 'Starter 入门版', cost: 9 },
  { rank: 2, name: 'Pro 专业版', cost: 29 },
  { rank: 3, name: 'Team 团队版', cost: 79 },
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
