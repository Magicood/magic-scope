import type { SliderTone } from '@magic-scope/react';
import { Slider } from '@magic-scope/react';

// orientation=vertical:垂直朝向需给容器高度(此处用外层 style 的 blockSize)。
const channels: { tone: SliderTone; label: string; value: number }[] = [
  { tone: 'danger', label: '红', value: 80 },
  { tone: 'success', label: '绿', value: 55 },
  { tone: 'info', label: '蓝', value: 35 },
];

export default function Demo() {
  return (
    <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-end' }}>
      {channels.map(({ tone, label, value }) => (
        <div key={tone} style={{ display: 'grid', justifyItems: 'center', gap: '0.5rem' }}>
          <Slider
            defaultValue={value}
            orientation="vertical"
            tone={tone}
            aria-label={`${label}通道`}
            style={{ blockSize: 180 }}
          />
          <span style={{ fontSize: '0.8rem', color: 'var(--ms-color-fg-muted)' }}>{label}</span>
        </div>
      ))}
    </div>
  );
}
