import type { StepItem } from '@magic-scope/react';
import { Steps } from '@magic-scope/react';
import { useState } from 'react';

// 单步显式 status 覆盖自动派生:第三步标 error;第四步 disabled 不可跳。
const items: StepItem[] = [
  { title: '登记', description: '已完成' },
  { title: '验证', description: '已完成' },
  { title: '施法', description: '能量回路异常', status: 'error' },
  { title: '完成', description: '尚未解锁', disabled: true },
];

// 提供 onChange → 各可用步可点击 / 键盘 ←→ Home End Enter 可达(自动跳过 disabled 步)。
export default function Demo() {
  const [current, setCurrent] = useState(2);
  return (
    <div style={{ display: 'grid', gap: '0.75rem', inlineSize: 'min(40rem, 100%)' }}>
      <Steps items={items} current={current} onChange={setCurrent} />
      <p style={{ margin: 0, color: 'var(--ms-color-fg-muted)', fontSize: '0.85rem' }}>
        当前步:<code>{current}</code>。点击或方向键切换;第三步显式 error,第四步 disabled 跳过。
      </p>
    </div>
  );
}
