import type { FloatButtonTone } from '@magic-scope/react';
import { FloatButton } from '@magic-scope/react';

// 全 tone 矩阵:tone 经全库 resolver 派生配色与 focus-visible 发光环,
// 零硬编码、只读 6 槽位。primary 类型实底更能看出 glow 差异。
const tones: { tone: FloatButtonTone; label: string }[] = [
  { tone: 'primary', label: 'primary 主色' },
  { tone: 'accent', label: 'accent 强调' },
  { tone: 'success', label: 'success 成功' },
  { tone: 'warning', label: 'warning 警示' },
  { tone: 'danger', label: 'danger 危险' },
  { tone: 'info', label: 'info 信息' },
  { tone: 'neutral', label: 'neutral 中性' },
];

export default function Demo() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))',
        gap: 'var(--ms-space-4)',
      }}
    >
      {tones.map(({ tone, label }) => (
        <div
          key={tone}
          style={{ display: 'grid', gap: 'var(--ms-space-2)', justifyItems: 'center' }}
        >
          <FloatButton type="primary" tone={tone} aria-label={label} />
          <span style={{ fontSize: '0.75rem', color: 'var(--ms-color-fg-muted)' }}>{label}</span>
        </div>
      ))}
    </div>
  );
}
