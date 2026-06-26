import type { PinInputSize } from '@magic-scope/react';
import { PinInput } from '@magic-scope/react';

const sizes: { size: PinInputSize; label: string }[] = [
  { size: 'sm', label: '小 sm' },
  { size: 'md', label: '中 md(默认)' },
  { size: 'lg', label: '大 lg' },
];

export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      {sizes.map(({ size, label }) => (
        <div key={size} style={{ display: 'grid', gap: '0.4rem', justifyItems: 'start' }}>
          <span style={{ color: 'var(--ms-color-fg-muted)', fontSize: '0.82rem' }}>{label}</span>
          <PinInput size={size} length={4} defaultValue="42" aria-label={`${label} 验证码`} />
        </div>
      ))}
    </div>
  );
}
