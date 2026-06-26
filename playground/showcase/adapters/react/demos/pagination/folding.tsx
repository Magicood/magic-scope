import { Pagination } from '@magic-scope/react';
import { useState } from 'react';

// 折叠态:页数过多时首尾恒显,缺口处用省略号占位。
// 首页只折叠尾部,中间页两端都折叠,首尾页禁用对应方向键。
export default function Demo() {
  const [first, setFirst] = useState(1);
  const [middle, setMiddle] = useState(10);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Pagination page={first} total={20} onPageChange={setFirst} />
      <Pagination page={middle} total={20} onPageChange={setMiddle} />
    </div>
  );
}
