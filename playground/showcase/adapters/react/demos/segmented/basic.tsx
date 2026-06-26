import { Segmented } from '@magic-scope/react';
import { useState } from 'react';

const options = [
  { value: 'day', label: '日' },
  { value: 'week', label: '周' },
  { value: 'month', label: '月' },
];

export default function Demo() {
  const [value, setValue] = useState('week');
  return (
    <div style={{ display: 'grid', gap: '0.6rem' }}>
      <Segmented options={options} value={value} onValueChange={setValue} />
      <span style={{ color: 'var(--ms-color-fg-muted)', fontSize: '0.85rem' }}>
        当前选中:{value}
      </span>
    </div>
  );
}
