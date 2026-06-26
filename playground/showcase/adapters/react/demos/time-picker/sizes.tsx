import type { TimePickerSize } from '@magic-scope/react';
import { TimePicker } from '@magic-scope/react';

// 三档尺寸随密度缩放:sm / md / lg。trigger 高度、字号、浮层列项同步变化。
const sizes: { size: TimePickerSize; label: string }[] = [
  { size: 'sm', label: 'sm 紧凑' },
  { size: 'md', label: 'md 默认' },
  { size: 'lg', label: 'lg 宽松' },
];

export default function Demo() {
  return (
    <div
      style={{
        display: 'flex',
        gap: 'var(--ms-space-4, 1rem)',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
      }}
    >
      {sizes.map(({ size, label }) => (
        <div key={size} style={{ display: 'grid', gap: 'var(--ms-space-2, 0.35rem)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--ms-color-fg-muted)' }}>{label}</span>
          <TimePicker size={size} defaultValue="14:25:00" aria-label={label} />
        </div>
      ))}
    </div>
  );
}
