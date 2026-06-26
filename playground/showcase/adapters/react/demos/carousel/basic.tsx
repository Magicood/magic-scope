import { Carousel } from '@magic-scope/react';

// 基础用法:每个 child 即一屏 slide,默认带指示点 + 箭头 + 拖拽,可点指示点跳转。
const PANELS = [
  { title: '一', bg: 'var(--ms-color-primary)' },
  { title: '二', bg: 'var(--ms-color-accent)' },
  { title: '三', bg: 'var(--ms-color-info)' },
];

export default function Demo() {
  return (
    <div style={{ inlineSize: 'min(460px, 100%)' }}>
      <Carousel aria-label="基础轮播">
        {PANELS.map((p) => (
          <div
            key={p.title}
            style={{
              display: 'grid',
              placeContent: 'center',
              blockSize: '200px',
              fontSize: '2.5rem',
              fontWeight: 700,
              color: '#fff',
              background: p.bg,
            }}
          >
            第 {p.title} 屏
          </div>
        ))}
      </Carousel>
    </div>
  );
}
