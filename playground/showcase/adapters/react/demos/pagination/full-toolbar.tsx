import { Pagination } from '@magic-scope/react';
import { useState } from 'react';

// 完整分页工具条:据 totalItems + pageSize 推算总页数,附每页条数选择器、总数/区间文案、快速跳页。
export default function Demo() {
  const [page, setPage] = useState(2);
  const [pageSize, setPageSize] = useState(20);
  return (
    <Pagination
      page={page}
      pageSize={pageSize}
      totalItems={328}
      pageSizeOptions={[10, 20, 50]}
      showSizeChanger
      showQuickJumper
      showTotal={(total, [start, end]) => `第 ${start}–${end} 条 / 共 ${total} 条`}
      tone="accent"
      size="sm"
      onPageChange={setPage}
      onPageSizeChange={(size) => {
        setPageSize(size);
        setPage(1);
      }}
    />
  );
}
