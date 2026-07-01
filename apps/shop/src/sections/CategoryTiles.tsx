import type { ComponentType, SVGProps } from 'react';
import { IconCup, IconLeaf, IconTruck } from '../components/icons';
import { Reveal, RevealGroup } from '../components/Reveal';
import { getProduct } from '../data/catalog';

interface Tile {
  href: string;
  name: string;
  blurb: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  /** 图标底色:取该分类一个代表商品的 accent;订阅无实体商品,用主色。 */
  accent: string;
}

const PRIMARY = 'var(--ms-color-primary)';

/** 从代表商品取 accent;商品缺失时回退主色,避免硬编码颜色。 */
function accentOf(id: string): string {
  return getProduct(id)?.accent ?? PRIMARY;
}

const tiles: Tile[] = [
  {
    href: '#/shop',
    name: '单品豆',
    blurb: '单一产地,把一方水土的风味喝得清清楚楚。',
    Icon: IconLeaf,
    accent: accentOf('yirgacheffe'),
  },
  {
    href: '#/shop',
    name: '拼配豆',
    blurb: '为日常稳定调配,浓郁顺口,怎么冲都不会出错。',
    Icon: IconCup,
    accent: accentOf('house-blend'),
  },
  {
    href: '#/shop',
    name: '冲煮器具',
    blurb: '手冲壶、滤杯与磨豆机,陪你把每一杯做到位。',
    Icon: IconCup,
    accent: accentOf('v60'),
  },
  {
    href: '#/#subscribe',
    name: '每月订阅',
    blurb: '当月新鲜烘焙按月寄到,随时可调整或暂停。',
    Icon: IconTruck,
    accent: PRIMARY,
  },
];

export function CategoryTiles() {
  return (
    <section className="db-section db-container">
      {/* 标题单独 mask-up 揭示,和下方网格的 zoom 错峰形成对比 */}
      <Reveal variant="up" className="db-section-head">
        <span className="db-eyebrow">按需选购</span>
        <Reveal
          as="h2"
          variant="mask-up"
          className="db-display"
          style={{ marginBlockStart: '0.6rem', fontSize: 'clamp(1.7rem, 3.4vw, 2.5rem)' }}
        >
          找到适合你的那一支
        </Reveal>
      </Reveal>

      {/* 整网格一个 observer 管:进视口后各卡片 zoom-in 逐个落位 */}
      <RevealGroup
        variant="zoom-in"
        stagger={90}
        style={{
          display: 'grid',
          gap: 'clamp(1rem, 2vw, 1.5rem)',
          marginBlockStart: 'clamp(1.75rem, 3.5vw, 2.75rem)',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(15rem, 100%), 1fr))',
        }}
      >
        {tiles.map((tile) => (
          <div key={tile.name}>
            <a
              href={tile.href}
              className="db-card db-card--interactive"
              style={{
                display: 'flex',
                blockSize: '100%',
                padding: 'clamp(1.25rem, 2.5vw, 1.6rem)',
                gap: '0.9rem',
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  inlineSize: '2.9rem',
                  blockSize: '2.9rem',
                  flexShrink: 0,
                  borderRadius: '9999px',
                  color: tile.accent,
                  background: `color-mix(in oklab, ${tile.accent} 16%, var(--ms-color-surface))`,
                  border: `1px solid color-mix(in oklab, ${tile.accent} 30%, var(--ms-color-border))`,
                }}
              >
                <span style={{ inlineSize: '1.45rem', blockSize: '1.45rem' }}>
                  <tile.Icon />
                </span>
              </span>

              <span
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem',
                  minInlineSize: 0,
                }}
              >
                <span className="db-display" style={{ fontSize: '1.18rem', lineHeight: 1.2 }}>
                  {tile.name}
                </span>
                <span
                  style={{
                    color: 'var(--ms-color-fg-muted)',
                    fontSize: '0.93rem',
                    lineHeight: 'var(--ms-leading-relaxed, 1.65)',
                  }}
                >
                  {tile.blurb}
                </span>
                <span
                  style={{
                    marginBlockStart: '0.35rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    fontSize: '0.86rem',
                    fontWeight: 'var(--ms-font-weight-semibold, 600)',
                    color: 'var(--ms-color-primary)',
                  }}
                >
                  查看
                  <span aria-hidden="true">&rarr;</span>
                </span>
              </span>
            </a>
          </div>
        ))}
      </RevealGroup>
    </section>
  );
}
