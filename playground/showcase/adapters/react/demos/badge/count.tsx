import { Badge } from '@magic-scope/react';
import { useState } from 'react';

// 数字徽标:count 推导显示文本(优先于 children);max 触顶显示 `${max}+`;
// showZero 控制 count 为 0 时是否仍显示;icon 为前置装饰槽位。下方为受控计数演示。
export default function Demo() {
  const [count, setCount] = useState(3);

  return (
    <div style={{ display: 'grid', gap: '0.75rem' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.6rem' }}>
        <Badge tone="danger" count={5} />
        <Badge tone="danger" count={128} max={99} />
        <Badge tone="primary" count={0} showZero />
        <Badge tone="accent" icon={<span aria-hidden="true">✦</span>} count={12} max={9} />
        <Badge tone="success" variant="soft" icon={<span aria-hidden="true">★</span>}>
          已收藏
        </Badge>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <button type="button" onClick={() => setCount((c) => Math.max(0, c - 1))}>
          −
        </button>
        <Badge tone="warning" variant="solid" count={count} max={99} showZero />
        <button type="button" onClick={() => setCount((c) => c + 1)}>
          +
        </button>
        <button type="button" onClick={() => setCount(150)}>
          溢出
        </button>
      </div>
    </div>
  );
}
