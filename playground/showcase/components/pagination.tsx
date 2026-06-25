import { useState } from 'react';
import { Pagination } from '../../../packages/react/src/index';
import type { ControlValues, DocEntry } from '../types';

function Demo({ values }: { values: ControlValues }) {
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

export const entry: DocEntry = {
  id: 'pagination',
  name: 'Pagination',
  category: 'navigation',
  summary: '分页导航,首尾恒显、当前页两侧对称展开,页数过多时省略号折叠。',
  description:
    '自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。\n<nav aria-label="pagination"> 内含上一页 / 页码 / 下一页:当前页 primary 实底 + aria-current,其余 ghost;页数过多时用省略号占位折叠;首尾页禁用对应方向键。键盘可达,focus-visible 显示发光环。受控 page。',
  controls: [
    {
      type: 'number',
      prop: 'total',
      label: '总页数 total',
      default: 12,
      min: 1,
      max: 50,
      step: 1,
    },
    {
      type: 'number',
      prop: 'siblingCount',
      label: '两侧页数 siblingCount',
      default: 1,
      min: 0,
      max: 3,
      step: 1,
    },
  ],
  render: (v) => <Demo values={v} />,
  usage: `import { Pagination } from '@magic-scope/react';

const [page, setPage] = useState(1);
<Pagination page={page} total={12} onPageChange={setPage} />`,
  props: [
    { name: 'page', type: 'number', default: '—', description: '当前页(1 起,受控,必填)。' },
    { name: 'total', type: 'number', default: '—', description: '总页数(必填)。' },
    {
      name: 'onPageChange',
      type: '(page: number) => void',
      default: '—',
      description: '翻页回调,入参为目标页码(1 起)。',
    },
    {
      name: 'siblingCount',
      type: 'number',
      default: '1',
      description: '当前页两侧各显示的页码数。',
    },
    {
      name: '...props',
      type: `Omit<ComponentPropsWithoutRef<'nav'>, 'onChange'>`,
      default: '—',
      description: '透传原生 nav 属性(className / aria-* 等)。',
    },
  ],
  examples: [
    {
      title: '少量页码(无折叠)',
      description: '总页数不超过可展示槽位时,逐页平铺,无省略号。',
      node: <Pagination page={3} total={6} onPageChange={() => {}} />,
    },
    {
      title: '首页(尾部折叠)',
      node: <Pagination page={1} total={20} onPageChange={() => {}} />,
    },
    {
      title: '中间页(两端折叠)',
      node: <Pagination page={10} total={20} onPageChange={() => {}} />,
    },
    {
      title: '更宽的两侧 siblingCount={2}',
      node: <Pagination page={10} total={20} siblingCount={2} onPageChange={() => {}} />,
    },
  ],
};
