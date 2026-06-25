import { Input, Label } from '@magic-scope/react';
import { useState } from 'react';

export default function Demo() {
  const [name, setName] = useState('');
  return (
    <div style={{ display: 'grid', gap: '0.4rem', inlineSize: 'min(320px, 80vw)' }}>
      <Label htmlFor="ms-label-basic">法师称号</Label>
      <Input
        id="ms-label-basic"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="点上方标签即可聚焦此处"
      />
      <small style={{ color: 'var(--ms-color-fg-muted)' }}>当前值:{name || '(空)'}</small>
    </div>
  );
}
