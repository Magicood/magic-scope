import { Table } from '@magic-scope/react';

const columns = [
  { key: 'name', header: '组件' },
  { key: 'cat', header: '分类' },
  { key: 'status', header: '状态' },
];

const data = [
  { name: 'Button', cat: 'actions', status: 'stable' },
  { name: 'Dialog', cat: 'overlay', status: 'stable' },
  { name: 'Tabs', cat: 'navigation', status: 'stable' },
];

export default function Demo() {
  return <Table columns={columns} data={data} style={{ inlineSize: 'min(420px, 100%)' }} />;
}
