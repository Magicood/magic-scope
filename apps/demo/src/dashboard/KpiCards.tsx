import { Text } from '@magic-scope/react';
import type { MouseEvent } from 'react';
import { Sparkline } from '../components/Chart';
import { Reveal } from '../components/Reveal';
import { kpis } from '../data/content';

/** Dashboard「KPI 卡组」:4 列响应式栅格,每卡含标签、大数值、环比与火花线。 */
export function KpiCards() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))',
        gap: 'clamp(0.75rem, 2vw, 1.25rem)',
      }}
    >
      {kpis.map((kpi, index) => {
        const positive = kpi.delta >= 0;
        const tone = positive ? 'success' : 'danger';
        const deltaColor = positive ? 'var(--ms-color-success)' : 'var(--ms-color-danger)';
        const deltaLabel = `${positive ? '+' : ''}${kpi.delta.toFixed(1)}%`;

        return (
          <Reveal key={kpi.id} delay={index * 60}>
            <article
              className="v-panel"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                padding: '1.1rem',
                minInlineSize: 0,
                transition: 'transform 0.2s ease, background-color 0.2s ease',
              }}
              onMouseEnter={(event: MouseEvent<HTMLElement>) => {
                event.currentTarget.style.transform = 'translateY(-2px)';
                event.currentTarget.style.backgroundColor = 'var(--ms-color-surface-raised)';
              }}
              onMouseLeave={(event: MouseEvent<HTMLElement>) => {
                event.currentTarget.style.transform = 'translateY(0)';
                event.currentTarget.style.backgroundColor = '';
              }}
            >
              <Text
                size="sm"
                style={{
                  color: 'var(--ms-color-fg-muted)',
                  overflowWrap: 'anywhere',
                }}
              >
                {kpi.label}
              </Text>

              <Text
                as="div"
                weight="bold"
                numeric="tabular"
                style={{
                  fontSize: '1.9rem',
                  lineHeight: 1.15,
                  color: 'var(--ms-color-fg)',
                  overflowWrap: 'anywhere',
                }}
              >
                {kpi.value}
              </Text>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Text
                  as="span"
                  size="sm"
                  weight="medium"
                  numeric="tabular"
                  style={{
                    color: deltaColor,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                >
                  <span aria-hidden="true">{positive ? '▲' : '▼'}</span>
                  {deltaLabel}
                </Text>
              </div>

              <div style={{ marginBlockStart: 'auto', paddingBlockStart: '0.25rem' }}>
                <Sparkline data={kpi.spark} tone={tone} />
              </div>
            </article>
          </Reveal>
        );
      })}
    </div>
  );
}
