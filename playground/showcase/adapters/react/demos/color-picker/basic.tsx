import { ColorPicker } from '@magic-scope/react';
import { useState } from 'react';

export default function Demo() {
  const [color, setColor] = useState('#7c3aed');
  return (
    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
      <ColorPicker value={color} onChange={setColor} aria-label="选择颜色" />
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
        <span
          aria-hidden="true"
          style={{
            inlineSize: '1.25rem',
            blockSize: '1.25rem',
            borderRadius: 'var(--ms-radius-sm)',
            background: color,
            border: '1px solid var(--ms-color-border)',
          }}
        />
        <code style={{ color: 'var(--ms-color-fg-muted)' }}>{color}</code>
      </span>
    </div>
  );
}
