import { Input } from '@magic-scope/react';
import { useState } from 'react';

export default function Demo() {
  const [name, setName] = useState('');
  return (
    <div style={{ display: 'grid', gap: '0.5rem', inlineSize: 'min(320px, 80vw)' }}>
      <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="输入用户名" />
      <small style={{ color: 'var(--ms-color-fg-muted)' }}>当前值:{name || '(空)'}</small>
    </div>
  );
}
