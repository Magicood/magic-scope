import type { SliderTone } from '@magic-scope/react';
import { Slider } from '@magic-scope/react';

// tone 色调矩阵:经全库统一 tone resolver 派生轨道填充 / 滑块 / 发光配色。
const tones: { tone: SliderTone; label: string; value: number }[] = [
  { tone: 'primary', label: '主色 primary', value: 60 },
  { tone: 'accent', label: '强调 accent', value: 55 },
  { tone: 'success', label: '成功 success', value: 80 },
  { tone: 'warning', label: '警告 warning', value: 45 },
  { tone: 'danger', label: '危险 danger', value: 30 },
  { tone: 'info', label: '信息 info', value: 50 },
  { tone: 'neutral', label: '中性 neutral', value: 40 },
];

export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '1.1rem', inlineSize: 'min(360px, 80vw)' }}>
      {tones.map(({ tone, label, value }) => (
        <div key={tone} style={{ display: 'grid', gap: '0.3rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--ms-color-fg-muted)' }}>{label}</span>
          <Slider
            defaultValue={value}
            tone={tone}
            showValue
            formatValue={(n) => `${n}%`}
            aria-label={label}
          />
        </div>
      ))}
    </div>
  );
}
