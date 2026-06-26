import { Carousel } from '@magic-scope/react';

// 纵向轮播:vertical 让 slide 沿 Y 轴位移,箭头改为上/下中央、指示点改为右侧竖排。
// 拖拽方向也随之改为纵向。
const ITEMS = [
  { title: '北境', desc: '霜风与极光', bg: 'var(--ms-color-info)' },
  { title: '中原', desc: '奥术与商路', bg: 'var(--ms-color-primary)' },
  { title: '南陲', desc: '余烬与熔火', bg: 'var(--ms-color-warning)' },
];

export default function Demo() {
  return (
    <div style={{ inlineSize: 'min(360px, 100%)' }}>
      <Carousel vertical effect="slide" tone="info" aria-label="纵向轮播">
        {ITEMS.map((it) => (
          <div
            key={it.title}
            style={{
              display: 'grid',
              placeContent: 'center',
              gap: '0.3rem',
              blockSize: '200px',
              textAlign: 'center',
              color: '#fff',
              background: it.bg,
            }}
          >
            <strong style={{ fontSize: '1.6rem' }}>{it.title}</strong>
            <span style={{ opacity: 0.85 }}>{it.desc}</span>
          </div>
        ))}
      </Carousel>
    </div>
  );
}
