import { Pagination } from '@magic-scope/react';
import { useState } from 'react';

// 自定义图标与项渲染:prevIcon/nextIcon 替换默认箭头;
// itemRender 把页码包成 <a href>(SEO 友好的真链接,组件仍 compose onClick 接管翻页)。
export default function Demo() {
  const [page, setPage] = useState(4);
  return (
    <Pagination
      page={page}
      total={8}
      onPageChange={setPage}
      prevIcon={<span aria-hidden="true">‹‹</span>}
      nextIcon={<span aria-hidden="true">››</span>}
      itemRender={(p, type, originalElement) =>
        type === 'page' ? <a href={`#page-${p}`}>{p}</a> : originalElement
      }
    />
  );
}
