import { Pagination } from '@magic-scope/react';
import { type ComponentType, useState } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

function Playground({ values }: { values: ControlValues }) {
  const total = Math.max(1, values.total as number);
  const [page, setPage] = useState(1);
  // 旋钮调小 total 时,把越界的当前页夹回合法范围。
  const safePage = Math.min(page, total);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
      <Pagination
        page={safePage}
        total={total}
        onPageChange={setPage}
        siblingCount={values.siblingCount as number}
      />
      <span style={{ color: 'var(--ms-color-fg-muted)', fontSize: '0.85rem' }}>
        当前第 {safePage} / {total} 页
      </span>
    </div>
  );
}

// 真实 demo 文件：同一文件既 import 渲染、又 ?raw 取源码（永不漂移）。
const comps = import.meta.glob<{ default: ComponentType }>('./demos/pagination/*.tsx', {
  eager: true,
});
const reactSources = import.meta.glob<string>('./demos/pagination/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'pagination',
  Playground,
  demos: buildDemos(comps, reactSources),
};
