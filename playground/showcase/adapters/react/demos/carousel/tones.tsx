import type { CarouselTone } from '@magic-scope/react';
import { Carousel } from '@magic-scope/react';

// 全 tone 矩阵:tone 经全库 tone resolver 驱动箭头 hover 与活动指示点的发光与配色,
// 不写死语义色,只读 --ms-c* 槽位。
const TONES: { tone: CarouselTone; label: string }[] = [
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
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '1rem',
      }}
    >
      {TONES.map(({ tone, label }) => (
        <div key={tone} style={{ display: 'grid', gap: '0.35rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--ms-color-fg-muted)' }}>{label}</span>
          <Carousel tone={tone} aria-label={label}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  display: 'grid',
                  placeContent: 'center',
                  blockSize: '130px',
                  fontSize: '1.4rem',
                  fontWeight: 700,
                  color: 'var(--ms-color-fg)',
                  background: 'var(--ms-color-bg-subtle, var(--ms-color-bg))',
                  border: '1px solid color-mix(in oklch, var(--ms-color-fg) 10%, transparent)',
                }}
              >
                {i + 1}
              </div>
            ))}
          </Carousel>
        </div>
      ))}
    </div>
  );
}
