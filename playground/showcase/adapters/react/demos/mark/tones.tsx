import type { MarkTone } from '@magic-scope/react';
import { Mark } from '@magic-scope/react';

// 全 tone 矩阵:命中 <mark> 的软底与前景都读 --ms-c / --ms-c-glow 槽位,不写死配色,
// 切换主题 / 换肤时整排高亮一起联动。
const tones: { tone: MarkTone; label: string }[] = [
  { tone: 'primary', label: 'primary 主色' },
  { tone: 'accent', label: 'accent 强调' },
  { tone: 'success', label: 'success 成功' },
  { tone: 'warning', label: 'warning 警示(默认)' },
  { tone: 'danger', label: 'danger 危险' },
  { tone: 'info', label: 'info 信息' },
  { tone: 'neutral', label: 'neutral 中性' },
];

export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '0.6rem' }}>
      {tones.map(({ tone, label }) => (
        <div key={tone} style={{ display: 'grid', gap: '0.2rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--ms-color-fg-muted)' }}>{label}</span>
          <Mark search="魔法高亮" tone={tone}>
            这是一段魔法高亮示例,关键词随 tone 染色。
          </Mark>
        </div>
      ))}
    </div>
  );
}
