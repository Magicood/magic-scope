import type { RowKey, TableColumn } from '@magic-scope/react';
import { Table } from '@magic-scope/react';
import { useState } from 'react';

// 行选择(受控 rowSelection)+ getRowKey 稳定行标识 + caption 无障碍标题。
interface Member {
  id: number;
  name: string;
  role: string;
}

const columns: TableColumn<Member>[] = [
  { key: 'name', header: '成员' },
  { key: 'role', header: '角色' },
];
const data: Member[] = [
  { id: 1, name: 'Aria', role: 'Owner' },
  { id: 2, name: 'Borin', role: 'Editor' },
  { id: 3, name: 'Cael', role: 'Viewer' },
];

export default function Demo() {
  const [selectedKeys, setSelectedKeys] = useState<RowKey[]>([1]);
  return (
    <Table
      columns={columns}
      data={data}
      getRowKey={(row) => row.id}
      caption="团队成员(可勾选,选择态受控)"
      rowSelection={{ selectedKeys, onChange: (keys) => setSelectedKeys(keys) }}
      hoverable
      style={{ inlineSize: 'min(440px, 100%)' }}
    />
  );
}
