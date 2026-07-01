import { Statistic } from '@magic-scope/react';
import { Reveal } from '../components/Reveal';
import { metrics } from '../data/content';

export function Metrics() {
  return (
    <section className="v-section--tight">
      <div className="v-container">
        {/* 指标面板:clip-up 从下往上显影(clip-path 不改 DOM,不破坏内部 grid 分隔线) */}
        <Reveal variant="clip-up">
          <div
            className="v-panel ms-metrics"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
              alignItems: 'stretch',
              padding: 0,
              overflow: 'hidden',
            }}
          >
            <style>{`
              /* 4 列:列间 1px 竖分隔(每行首列不画) */
              .ms-metrics__cell {
                border-inline-start: 1px solid var(--ms-color-border);
              }
              .ms-metrics__cell:nth-child(4n + 1) {
                border-inline-start: none;
              }
              /* 中屏 2 列:重排分隔,横向补线 */
              @media (max-width: 768px) {
                .ms-metrics {
                  grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
                }
                .ms-metrics__cell {
                  border-inline-start: 1px solid var(--ms-color-border);
                  border-block-start: none;
                }
                .ms-metrics__cell:nth-child(4n + 1) {
                  border-inline-start: 1px solid var(--ms-color-border);
                }
                .ms-metrics__cell:nth-child(2n + 1) {
                  border-inline-start: none;
                }
                .ms-metrics__cell:nth-child(n + 3) {
                  border-block-start: 1px solid var(--ms-color-border);
                }
              }
              /* 窄屏 1 列:去竖线,只留横向分隔 */
              @media (max-width: 460px) {
                .ms-metrics {
                  grid-template-columns: 1fr !important;
                }
                .ms-metrics__cell {
                  border-inline-start: none !important;
                }
                .ms-metrics__cell:nth-child(n + 2) {
                  border-block-start: 1px solid var(--ms-color-border);
                }
              }
            `}</style>
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="ms-metrics__cell"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--ms-space-2)',
                  minInlineSize: 0,
                  paddingBlock: 'var(--ms-space-5)',
                  paddingInline: 'var(--ms-space-6)',
                }}
              >
                <Statistic
                  title={metric.label}
                  value={metric.value}
                  trend={metric.trend}
                  size="lg"
                />
                <span
                  style={{
                    fontSize: 'var(--ms-font-size-sm, 0.85rem)',
                    color: 'var(--ms-color-fg-subtle)',
                    overflowWrap: 'anywhere',
                  }}
                >
                  {metric.delta}
                </span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
