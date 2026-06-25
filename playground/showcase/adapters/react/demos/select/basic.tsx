import { Select } from '@magic-scope/react';
import { useState } from 'react';

const options = [
  { value: 'arcane', label: 'Arcane 奥术紫' },
  { value: 'frost', label: 'Frost 霜寒青' },
  { value: 'ember', label: 'Ember 余烬品红' },
];

export default function Demo() {
  const [theme, setTheme] = useState('frost');
  return (
    <div style={{ display: 'grid', gap: '0.5rem', inlineSize: 'min(280px, 80vw)' }}>
      <Select value={theme} onChange={setTheme} options={options} aria-label="主题流派" />
      <small style={{ color: 'var(--ms-color-fg-muted)' }}>当前流派:{theme}</small>
    </div>
  );
}
