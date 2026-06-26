import type { TimePickerTone } from '@magic-scope/react';
import { TimePicker } from '@magic-scope/react';

// 全 tone 矩阵:tone 派生 trigger 高亮、选中项色与 focus 发光,不写死配色,只读 --ms-c* 槽位。
// 点开任一个即可看到浮层里选中项随 tone 染色。
const tones: { tone: TimePickerTone; label: string }[] = [
  { tone: 'primary', label: 'primary 主色' },
  { tone: 'accent', label: 'accent 强调' },
  { tone: 'success', label: 'success 成功' },
  { tone: 'warning', label: 'warning 警示' },
  { tone: 'danger', label: 'danger 危险' },
  { tone: 'info', label: 'info 信息' },
];

export default function Demo() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
        gap: 'var(--ms-space-3, 0.75rem)',
      }}
    >
      {tones.map(({ tone, label }) => (
        <div key={tone} style={{ display: 'grid', gap: 'var(--ms-space-2, 0.35rem)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--ms-color-fg-muted)' }}>{label}</span>
          <TimePicker tone={tone} defaultValue="09:15:00" aria-label={label} />
        </div>
      ))}
    </div>
  );
}
