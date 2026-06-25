import { Pagination } from '@magic-scope/react';
import { useState } from 'react';

// 少量页码:总页数不超过可展示槽位时逐页平铺,无省略号折叠。
export default function Demo() {
  const [page, setPage] = useState(3);
  return <Pagination page={page} total={6} onPageChange={setPage} />;
}
