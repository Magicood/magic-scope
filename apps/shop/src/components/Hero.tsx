import { Badge, Button, Rate } from '@magic-scope/react';
import { getProduct } from '../data/catalog';
import { navigate } from '../lib/router';
import { ProductVisual } from './ProductVisual';
import { Reveal } from './Reveal';

export function Hero() {
  const featured = getProduct('yirgacheffe');

  return (
    <section className="db-hero">
      <div className="db-container db-hero__grid">
        <div>
          <Reveal>
            <Badge variant="soft" tone="primary">
              当日新鲜烘焙
            </Badge>
          </Reveal>
          <Reveal delay={70}>
            <h1 className="db-hero__title">
              为每一个清晨,
              <br />
              认真<span className="db-hero__accent">烘一炉</span>好豆
            </h1>
          </Reveal>
          <Reveal delay={130}>
            <p className="db-lead" style={{ maxInlineSize: '32rem' }}>
              我们与产地小农直接合作,小批量当日烘焙,只在风味最好的窗口期把豆子寄到你手中。
              从单品到拼配,陪你把每天的第一杯做好。
            </p>
          </Reveal>
          <Reveal delay={190}>
            <div className="db-hero__actions">
              <Button size="lg" onClick={() => navigate('/shop')}>
                选购咖啡豆
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/#subscribe')}>
                了解每月订阅
              </Button>
            </div>
          </Reveal>
        </div>

        <Reveal delay={150}>
          <div className="db-hero__art">
            {featured && (
              <div
                style={{
                  inlineSize: 'min(86%, 380px)',
                  borderRadius: 'var(--ms-radius-xl, 1.25rem)',
                  overflow: 'hidden',
                  boxShadow:
                    '0 40px 70px -40px color-mix(in oklab, var(--ms-color-fg) 45%, transparent)',
                }}
              >
                <ProductVisual product={featured} />
              </div>
            )}
            <div
              className="db-hero__chip"
              style={{ insetBlockStart: '12%', insetInlineStart: '2%' }}
            >
              <Rate value={4.9} readOnly allowHalf size="sm" />
              <strong style={{ fontFamily: 'var(--ms-font-display)' }}>4.9</strong>
            </div>
            <div className="db-hero__chip" style={{ insetBlockEnd: '12%', insetInlineEnd: '0%' }}>
              <span
                style={{
                  inlineSize: '0.5rem',
                  blockSize: '0.5rem',
                  borderRadius: '9999px',
                  background: 'var(--ms-color-success)',
                }}
              />
              今日已烘焙 · 48h 内发出
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
