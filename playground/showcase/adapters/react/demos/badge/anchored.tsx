import type { BadgePlacement } from '@magic-scope/react';
import { Badge } from '@magic-scope/react';
import { useState } from 'react';

// 角标模式(standalone=false):徽标 overlap 到宿主内容四角,placement 控制定位。
// 数字角标命中隐藏规则(count 为 0 且未 showZero)时仅渲染宿主。下方为受控开关演示。
const PLACEMENTS: { placement: BadgePlacement; label: string }[] = [
  { placement: 'top-end', label: '右上' },
  { placement: 'top-start', label: '左上' },
  { placement: 'bottom-end', label: '右下' },
  { placement: 'bottom-start', label: '左下' },
];

const tile = {
  display: 'grid',
  placeItems: 'center',
  inlineSize: '3rem',
  blockSize: '3rem',
  borderRadius: '0.5rem',
  background: 'var(--ms-bg-subtle, #2a2a2a)',
  fontSize: '0.75rem',
} as const;

export default function Demo() {
  const [unread, setUnread] = useState(8);

  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem' }}>
        {PLACEMENTS.map(({ placement, label }) => (
          <Badge key={placement} standalone={false} placement={placement} tone="danger" count={5}>
            <div style={tile}>{label}</div>
          </Badge>
        ))}
        <Badge standalone={false} placement="top-end" dot pulse tone="success">
          <div style={tile}>在线</div>
        </Badge>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Badge standalone={false} placement="top-end" tone="primary" count={unread} max={99}>
          <div style={tile}>收件</div>
        </Badge>
        <button type="button" onClick={() => setUnread((n) => n + 1)}>
          收到一条
        </button>
        <button type="button" onClick={() => setUnread(0)}>
          全部已读
        </button>
      </div>
    </div>
  );
}
