import { Pagination } from '@magic-scope/react';
import { useState } from 'react';

// 精简变体 simple:仅「上一页 · 当前/总 · 下一页」,移动端 / 紧凑工具栏友好。
export default function Demo() {
  const [page, setPage] = useState(3);
  return <Pagination simple page={page} total={12} onPageChange={setPage} />;
}
