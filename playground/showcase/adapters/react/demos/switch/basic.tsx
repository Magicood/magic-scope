import { Switch } from '@magic-scope/react';
import { useState } from 'react';

export default function Demo() {
  const [on, setOn] = useState(true);
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem' }}>
      <Switch checked={on} onChange={(e) => setOn(e.target.checked)} aria-label="桌面通知" />
      <span style={{ color: 'var(--ms-color-fg-muted)', userSelect: 'none' }}>
        桌面通知:{on ? '已开启' : '已关闭'}
      </span>
    </div>
  );
}
