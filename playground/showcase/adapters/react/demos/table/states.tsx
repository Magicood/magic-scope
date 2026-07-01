import type { TableColumn } from '@magic-scope/react';
import { Table } from '@magic-scope/react';

// 加载 / 骨架 / 空态:loading 遮罩、空数据 + skeletonRows 骨架占位、empty 自定义空态。
interface Row {
  name: string;
  status: string;
}
const columns: TableColumn<Row>[] = [
  { key: 'name', header: '任务' },
  { key: 'status', header: '状态' },
];
const rows: Row[] = [
  { name: '同步索引', status: '进行中' },
  { name: '生成报表', status: '排队中' },
];

export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '1.4rem', inlineSize: 'min(440px, 100%)' }}>
      {/* 有数据 + loading:半透明 Spinner 遮罩(aria-busy) */}
      <Table columns={columns} data={rows} loading />
      {/* 空数据 + loading:渲染 N 行骨架占位,避免布局塌陷 */}
      <Table columns={columns} data={[]} loading skeletonRows={3} />
      {/* 空数据自定义空态 */}
      <Table
        columns={columns}
        data={[]}
        empty={<span>暂无任务 —— 点击右上角「新建」开始。</span>}
      />
    </div>
  );
}
