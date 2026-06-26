import { Pagination } from '@magic-scope/react';
import { useState } from 'react';

const spells = [
  '奥术飞弹',
  '火球术',
  '传送门',
  '心灵感应',
  '时间停滞',
  '群体治疗',
  '闪现',
  '元素护盾',
  '召唤魔仆',
  '能量吸取',
];

const pageSize = 3;
const total = Math.ceil(spells.length / pageSize);

// 生产用法:受控 page 驱动列表分片,onPageChange 切换数据。
export default function Demo() {
  const [page, setPage] = useState(1);
  const start = (page - 1) * pageSize;
  const slice = spells.slice(start, start + pageSize);
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
