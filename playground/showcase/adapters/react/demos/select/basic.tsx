import { Select } from '@magic-scope/react';
import { useState } from 'react';

const options = [
  { value: 'arcane', label: 'Arcane 紫' },
  { value: 'frost', label: 'Frost 蓝' },
  { value: 'ember', label: 'Ember 品红' },
];

export default function Demo() {
  const [theme, setTheme] = useState('frost');
  return (
    <div style={{ display: 'grid', gap: '0.5rem', inlineSize: 'min(280px, 80vw)' }}>
      <Select value={theme} onChange={setTheme} options={options} aria-label="主题配色" />
      <small style={{ color: 'var(--ms-color-fg-muted)' }}>当前主题:{theme}</small>
    </div>
  );
}
