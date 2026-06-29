import { Button, Rate } from '@magic-scope/react';
import { getProduct, story } from '../data/catalog';
import { navigate } from '../lib/router';
import { ProductVisual } from './ProductVisual';
import { Reveal, useParallax } from './Reveal';

export function Hero() {
  const featured = getProduct('yirgacheffe');
  const artRef = useParallax<HTMLDivElement>(26);

  return (
    <section className="db-hero">
      <div className="db-container db-hero__grid">
        <div>
          <Reveal variant="up">
            <span className="db-eyebrow">当日新鲜烘焙 · 产地直采</span>
          </Reveal>
          <Reveal variant="rise" delay={90}>
            <h1 className="db-hero__title">
              为每一个清晨,
              <br />
              认真<em>烘一炉</em>好豆
            </h1>
          </Reveal>
          <Reveal variant="up" delay={180}>
            <p className="db-lead">
              我们与产地小农直接合作,小批量当日烘焙,只在风味最好的窗口期把豆子寄到你手中。
            </p>
          </Reveal>
          <Reveal variant="up" delay={250}>
            <div className="db-hero__actions">
              <Button size="lg" onClick={() => navigate('/shop')}>
                选购咖啡豆
              </Button>
              <Button size="lg" variant="ghost" onClick={() => navigate('/#subscribe')}>
                了解每月订阅 →
              </Button>
            </div>
          </Reveal>
          <Reveal variant="fade" delay={360}>
            <dl className="db-hero__meta">
              {story.stats.map((s) => (
                <div key={s.label}>
                  <dt>{s.value}</dt>
                  <dd>{s.label}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        <Reveal variant="blur" delay={150} className="db-hero__art">
          <div ref={artRef}>{featured && <ProductVisual product={featured} />}</div>
          <div className="db-hero__chip" style={{ insetBlockStart: '8%', insetInlineStart: '-4%' }}>
            <Rate value={4.9} readOnly allowHalf size="sm" tone="warning" />
            <strong style={{ fontFamily: 'var(--ms-font-display)' }}>4.9</strong>
          </div>
          <div className="db-hero__chip" style={{ insetBlockEnd: '9%', insetInlineEnd: '-3%' }}>
            <span
              style={{
                inlineSize: '0.5rem',
                blockSize: '0.5rem',
                borderRadius: '999px',
                background: 'var(--ms-color-success)',
              }}
            />
            今日已烘焙 · 48h 内发出
          </div>
        </Reveal>
      </div>
    </section>
  );
}
