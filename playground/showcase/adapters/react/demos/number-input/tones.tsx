import type { NumberInputTone } from '@magic-scope/react';
import { NumberInput } from '@magic-scope/react';

// tone 色调系统:全库统一差异点。每个控件走一个 tone,
// 聚焦时由 tone resolver 派生主色发光环,覆盖全部 7 个语义色调。
// (用键盘 Tab 进任一控件即可看到对应色调的 focus 发光环。)
const TONES: { tone: NumberInputTone; label: string }[] = [
  { tone: 'primary', label: 'primary 主色' },
  { tone: 'accent', label: 'accent 强调' },
  { tone: 'success', label: 'success 成功' },
  { tone: 'warning', label: 'warning 警告' },
  { tone: 'danger', label: 'danger 危险' },
  { tone: 'info', label: 'info 信息' },
  { tone: 'neutral', label: 'neutral 中性' },
];

export default function Demo() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: '1rem',
      }}
    >
      {TONES.map(({ tone, label }) => (
        <div key={tone} style={{ display: 'grid', gap: '0.35rem' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--ms-color-fg-muted)' }}>{label}</span>
          <NumberInput defaultValue={8} min={0} max={20} tone={tone} aria-label={label} />
        </div>
      ))}
    </div>
  );
}
