import { Marquee } from '@magic-scope/react';

// 经典 logo 墙:一排品牌名无缝向左滚动,悬停暂停,两端淡出暗示延续。
const brands = ['Vela', 'Aurora', 'Prism', 'Nebula', 'Comet', 'Quartz', 'Zephyr', 'Lumen', 'Onyx'];

export default function Demo() {
  return (
    <Marquee
      pauseOnHover
      gradient
      speed={50}
      aria-label="合作品牌"
      style={{ inlineSize: 'min(560px, 100%)' }}
    >
      {brands.map((b) => (
        <span
          key={b}
          style={{
            margin: '0 1.4rem',
            fontSize: '1.1rem',
            fontWeight: 600,
            color: 'var(--ms-color-fg-muted)',
            whiteSpace: 'nowrap',
          }}
        >
          {b}
        </span>
      ))}
    </Marquee>
  );
}
