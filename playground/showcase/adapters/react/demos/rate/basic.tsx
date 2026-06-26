import { Rate } from '@magic-scope/react';
import { useState } from 'react';

// 受控评分:value + onChange 双通道,再点同一颗星清零(allowClear 默认开)。
export default function Demo() {
  const [value, setValue] = useState(3);
  return (
    <div style={{ display: 'grid', gap: '0.5rem' }}>
      <Rate value={value} onChange={setValue} aria-label="基础评分" />
      <small style={{ color: 'var(--ms-color-fg-muted)' }}>
        当前评分:{value}（再点当前评分可清零）
      </small>
    </div>
  );
}
