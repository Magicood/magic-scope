import { Toggle } from '@magic-scope/react';
import { useState } from 'react';

export default function Demo() {
  const [pressed, setPressed] = useState(false);
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem' }}>
      <Toggle pressed={pressed} onPressedChange={setPressed} aria-label="加粗">
        加粗 B
      </Toggle>
      <span style={{ color: 'var(--ms-color-fg-muted)', userSelect: 'none' }}>
        {pressed ? '已激活' : '未激活'}
      </span>
    </div>
  );
}
