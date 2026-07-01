import { Carousel } from '@magic-scope/react';

// dragThreshold:拖拽翻页的位移阈值(像素)。调大到 120,需要拖更远才翻页(防误触)。
const PANELS = [
  { title: '第一屏', bg: 'var(--ms-color-primary)' },
  { title: '第二屏', bg: 'var(--ms-color-accent)' },
  { title: '第三屏', bg: 'var(--ms-color-info)' },
];

export default function Demo() {
  return (
    <div style={{ inlineSize: 'min(460px, 100%)' }}>
      <Carousel dragThreshold={120} aria-label="拖拽阈值演示">
        {PANELS.map((p) => (
          <div
            key={p.title}
            style={{
              display: 'grid',
              placeContent: 'center',
              blockSize: '180px',
              fontSize: '1.8rem',
              fontWeight: 700,
              color: '#fff',
              background: p.bg,
            }}
          >
            {p.title}
          </div>
        ))}
      </Carousel>
    </div>
  );
}
