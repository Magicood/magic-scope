import type { CarouselEffect } from '@magic-scope/react';
import { Carousel } from '@magic-scope/react';

// 两种切换效果:slide(单条 track 沿主轴位移)与 fade(slide 叠放,opacity 交替)。
const EFFECTS: { effect: CarouselEffect; label: string }[] = [
  { effect: 'slide', label: 'slide 滑动' },
  { effect: 'fade', label: 'fade 淡入淡出' },
];

const COLORS = ['var(--ms-color-primary)', 'var(--ms-color-accent)', 'var(--ms-color-success)'];

export default function Demo() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem',
      }}
    >
      {EFFECTS.map(({ effect, label }) => (
        <div key={effect} style={{ display: 'grid', gap: '0.4rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--ms-color-fg-muted)' }}>{label}</span>
          <Carousel effect={effect} aria-label={label}>
            {COLORS.map((bg, i) => (
              <div
                key={bg}
                style={{
                  display: 'grid',
                  placeContent: 'center',
                  blockSize: '150px',
                  fontSize: '1.6rem',
                  fontWeight: 700,
                  color: '#fff',
                  background: bg,
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
