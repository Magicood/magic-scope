import { Pagination } from '@magic-scope/react';
import { useState } from 'react';

const members = [
  'Mira Chen — 产品负责人',
  'Jonas Park — 前端工程师',
  'Ann Lee — 设计师',
  'David Wu — 后端工程师',
  'Sofia Reyes — 数据分析师',
  'Liam Brooks — QA 工程师',
  'Nina Petrov — 运营',
  'Omar Haddad — 客户成功',
  'Grace Kim — 市场',
  'Tom Nguyen — 销售',
];

const pageSize = 3;
const total = Math.ceil(members.length / pageSize);

// 生产用法:受控 page 驱动列表分片,onPageChange 切换数据。
export default function Demo() {
  const [page, setPage] = useState(1);
  const start = (page - 1) * pageSize;
  const slice = members.slice(start, start + pageSize);
  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minInlineSize: '14rem' }}
    >
      <ul style={{ margin: 0, paddingInlineStart: '1.2rem', minBlockSize: '5rem' }}>
        {slice.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>
      <Pagination page={page} total={total} onPageChange={setPage} />
    </div>
  );
}
