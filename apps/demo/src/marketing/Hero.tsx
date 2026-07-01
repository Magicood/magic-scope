import { Badge, Button, RevealGroup, Statistic, Tag } from '@magic-scope/react';
import { useState } from 'react';
import { AreaChart } from '../components/Chart';
import { Reveal } from '../components/Reveal';
import { hero, trafficSeries } from '../data/content';
import { navigate } from '../lib/router';

export function Hero() {
  // 图表描线门控:clip-left 揭示进场(onReveal)时置 true,主折线沿路径生长。
  const [chartDrawn, setChartDrawn] = useState(false);

  return (
    <section className="v-hero">
      <div className="v-container v-hero__grid">
        {/* 文案列:RevealGroup 逐行 stagger 落位(首屏 mount 即播,不等滚动) */}
        <RevealGroup trigger="mount" stagger={90} className="v-hero__copy">
          <div>
            <Badge variant="soft" tone="primary">
              <span className="v-dot-pulse" aria-hidden="true" /> {hero.eyebrow}
            </Badge>
          </div>

          <h1 className="v-hero__title">
            把产品的每一个信号,
            <br />
            <span className="v-gradient-text">汇成清晰的决策</span>
          </h1>

          <p className="v-lead" style={{ maxInlineSize: '34rem' }}>
            {hero.subtitle}
          </p>

          <div>
            <div className="v-hero__actions">
              <Button size="lg" onClick={() => navigate('/app')}>
                {hero.primaryCta}
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/app')}>
                {hero.secondaryCta} →
              </Button>
            </div>
            <p className="v-hero__note">{hero.note}</p>
          </div>
        </RevealGroup>

        {/* 产品预览:外层 parallax 随滚动轻微视差(scrub,scroll-driven / off-main-thread,双重门控);
            内层 mount 进场揭示 + 图表 clip 描线 + KPI count-up。两层各自 transform,互不打架。 */}
        <Reveal variant="parallax" trigger="scrub">
          <Reveal trigger="mount" delay={140}>
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
                <Reveal
                  variant="clip-left"
                  trigger="mount"
                  delay={320}
                  onReveal={() => setChartDrawn(true)}
                >
                  <AreaChart
                    data={[...trafficSeries.thisWeek]}
                    compare={[...trafficSeries.lastWeek]}
                    height={148}
                    draw={chartDrawn}
                  />
                </Reveal>
              </div>

              <div className="v-preview__kpis">
                <div className="v-preview__kpi">
                  <Statistic
                    title="转化"
                    value={6.8}
                    precision={1}
                    suffix="%"
                    size="sm"
                    trend="up"
                    animateOnMount
                    animateDuration={1100}
                  />
                </div>
                <div className="v-preview__kpi">
                  <Statistic
                    title="事件/秒"
                    value={1284}
                    size="sm"
                    animateOnMount
                    animateDuration={1100}
                  />
                </div>
                <div className="v-preview__kpi">
                  <Statistic
                    title="P95"
                    value={118}
                    suffix="ms"
                    size="sm"
                    animateOnMount
                    animateDuration={1100}
                  />
                </div>
              </div>
            </div>
          </Reveal>
        </Reveal>
      </div>
    </section>
  );
}
