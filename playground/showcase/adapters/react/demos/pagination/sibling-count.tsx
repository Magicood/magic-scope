import { Pagination } from '@magic-scope/react';
import { useState } from 'react';

// siblingCount 控制当前页两侧各展开几个页码,值越大折叠越少。
export default function Demo() {
  const [page, setPage] = useState(10);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Pagination page={page} total={20} siblingCount={0} onPageChange={setPage} />
      <Pagination page={page} total={20} siblingCount={2} onPageChange={setPage} />
    </div>
  );
}
