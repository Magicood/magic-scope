import type { ProgressTone } from '@magic-scope/react';
import { Progress } from '@magic-scope/react';

// tone 色调系统:全库统一差异点。每个 tone 经 tone resolver 只读 6 槽位派生配色与发光,不写死颜色。
// 覆盖全部 7 个语义色调,同一确定态进度下展示色调差异(showValue 显示末尾百分比)。
const TONES: { tone: ProgressTone; label: string; value: number }[] = [
  { tone: 'primary', label: 'primary 主色', value: 72 },
  { tone: 'accent', label: 'accent 强调', value: 64 },
  { tone: 'success', label: 'success 成功', value: 100 },
  { tone: 'warning', label: 'warning 警示', value: 48 },
  { tone: 'danger', label: 'danger 危险', value: 30 },
  { tone: 'info', label: 'info 信息', value: 56 },
  { tone: 'neutral', label: 'neutral 中性', value: 40 },
];

export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '0.875rem', inlineSize: '100%' }}>
      {TONES.map(({ tone, label, value }) => (
        <div key={tone} style={{ display: 'grid', gap: '0.25rem' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--ms-color-fg-muted)' }}>{label}</span>
          <Progress tone={tone} value={value} showValue aria-label={`${label} ${value}%`} />
        </div>
      ))}
    </div>
  );
}
