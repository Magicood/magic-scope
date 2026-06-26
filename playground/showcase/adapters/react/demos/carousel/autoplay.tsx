import { Carousel } from '@magic-scope/react';

// 自动播放:autoplay 对象可设 interval(毫秒)与 pauseOnHover(悬停暂停)。
// reduced-motion / data-ms-motion=off 下会强制停播(动效降级,诚实备注)。
const SHOTS = [
  {
    title: '幻灯 · 一',
    bg: 'linear-gradient(135deg, var(--ms-color-primary), var(--ms-color-accent))',
  },
  {
    title: '幻灯 · 二',
    bg: 'linear-gradient(135deg, var(--ms-color-info), var(--ms-color-primary))',
  },
  {
    title: '幻灯 · 三',
    bg: 'linear-gradient(135deg, var(--ms-color-success), var(--ms-color-info))',
  },
];

export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '0.5rem', inlineSize: 'min(460px, 100%)' }}>
      <Carousel
        autoplay={{ interval: 2000, pauseOnHover: true }}
        tone="accent"
        aria-label="自动播放轮播"
      >
        {SHOTS.map((s) => (
          <div
            key={s.title}
            style={{
              display: 'grid',
              placeContent: 'center',
              blockSize: '200px',
              fontSize: '1.8rem',
              fontWeight: 700,
              color: '#fff',
              background: s.bg,
            }}
          >
            {s.title}
          </div>
        ))}
      </Carousel>
      <small style={{ color: 'var(--ms-color-fg-muted)' }}>每 2 秒自动翻页,鼠标悬停时暂停。</small>
    </div>
  );
}
