import { Badge, Button, Statistic, Tag } from '@magic-scope/react';
import { AreaChart } from '../components/Chart';
import { Reveal } from '../components/Reveal';
import { hero, trafficSeries } from '../data/content';
import { navigate } from '../lib/router';

export function Hero() {
  return (
    <section className="v-hero">
      <div className="v-container v-hero__grid">
        <div>
          <Reveal>
            <Badge variant="soft" tone="primary">
              <span className="v-dot-pulse" aria-hidden="true" /> {hero.eyebrow}
            </Badge>
          </Reveal>

          <Reveal delay={60}>
            <h1 className="v-hero__title">
              把产品的每一个信号,
              <br />
              <span className="v-gradient-text">汇成清晰的决策</span>
            </h1>
          </Reveal>

          <Reveal delay={120}>
            <p className="v-lead" style={{ maxInlineSize: '34rem' }}>
              {hero.subtitle}
            </p>
          </Reveal>

          <Reveal delay={180}>
            <div className="v-hero__actions">
              <Button size="lg" onClick={() => navigate('/app')}>
                {hero.primaryCta}
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/app')}>
                {hero.secondaryCta} →
              </Button>
            </div>
            <p className="v-hero__note">{hero.note}</p>
          </Reveal>
        </div>

        <Reveal delay={140}>
          <div className="v-preview" role="img" aria-label="Vela 实时面板预览">
            <div className="v-preview__bar">
              <span className="v-preview__dot" />
              <span className="v-preview__dot" />
              <span className="v-preview__dot" />
              <Tag size="sm" tone="success" variant="soft" style={{ marginInlineStart: 'auto' }}>
                实时
              </Tag>
            </div>

            <div className="v-panel" style={{ padding: '1rem 1.1rem 0.5rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  marginBlockEnd: '0.25rem',
                }}
              >
                <span style={{ fontSize: '0.85rem', color: 'var(--ms-color-fg-muted)' }}>
                  活跃用户 · 今日
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--ms-color-success)' }}>
                  ▲ 12.4%
                </span>
              </div>
              <AreaChart
                data={[...trafficSeries.thisWeek]}
                compare={[...trafficSeries.lastWeek]}
                height={148}
              />
            </div>

            <div className="v-preview__kpis">
              <div className="v-preview__kpi">
                <Statistic title="转化" value={6.8} precision={1} suffix="%" size="sm" trend="up" />
              </div>
              <div className="v-preview__kpi">
                <Statistic title="事件/秒" value={1284} size="sm" />
              </div>
              <div className="v-preview__kpi">
                <Statistic title="P95" value={118} suffix="ms" size="sm" />
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
