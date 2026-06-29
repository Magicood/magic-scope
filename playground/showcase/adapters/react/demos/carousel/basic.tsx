import { Carousel } from '@magic-scope/react';

// 基础用法:每个 child 即一屏 slide,默认带指示点 + 箭头 + 拖拽,可点指示点跳转。
const PANELS = [
  { title: '团队协作', bg: 'var(--ms-color-primary)' },
  { title: '实时同步', bg: 'var(--ms-color-accent)' },
  { title: '数据洞察', bg: 'var(--ms-color-info)' },
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
            {p.title}
          </div>
        ))}
      </Carousel>
    </div>
  );
}
