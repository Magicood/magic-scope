import { Heading, Segmented, Text } from '@magic-scope/react';
import { useState } from 'react';
import { AreaChart } from '../components/Chart';
import { trafficSeries } from '../data/content';

type TrafficRange = 'today' | '7d' | '30d';

const rangeOptions: { value: TrafficRange; label: string }[] = [
  { value: 'today', label: '今天' },
  { value: '7d', label: '近 7 天' },
  { value: '30d', label: '近 30 天' },
];

/** 在标签序列中均匀挑选首/中/尾几个,避免窄屏拥挤。 */
function pickAxisLabels(labels: readonly string[], count = 5): string[] {
  if (labels.length <= count) return [...labels];
  const step = (labels.length - 1) / (count - 1);
  const picked: string[] = [];
  for (let i = 0; i < count; i++) {
    picked.push(labels[Math.round(i * step)] ?? '');
  }
  return picked;
}

export function TrafficPanel() {
  const [range, setRange] = useState<TrafficRange>('today');
  const axisLabels = pickAxisLabels(trafficSeries.labels);

  return (
    <div
      className="v-panel"
      style={{
        display: 'grid',
        gap: 'var(--ms-space-5)',
        padding: '1.25rem',
      }}
    >
      <header
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 'var(--ms-space-3)',
        }}
      >
        <div style={{ display: 'grid', gap: '0.15rem', minInlineSize: 0 }}>
          <Heading level={2} variant="subtitle" style={{ overflowWrap: 'anywhere' }}>
            实时流量
          </Heading>
          <Text size="sm" style={{ color: 'var(--ms-color-fg-muted)' }}>
            按小时
          </Text>
        </div>

        <Segmented
          size="sm"
          options={rangeOptions}
          value={range}
          onValueChange={(value) => setRange(value as TrafficRange)}
          aria-label="选择时间范围"
        />
      </header>

      <AreaChart
        data={[...trafficSeries.thisWeek]}
        compare={[...trafficSeries.lastWeek]}
        height={260}
      />

      <div style={{ display: 'grid', gap: 'var(--ms-space-3)' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'var(--ms-space-4)',
          }}
        >
          <LegendItem label="本周" variant="solid" />
          <LegendItem label="上周" variant="dashed" />
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 'var(--ms-space-2)',
          }}
        >
          {axisLabels.map((label, index) => (
            <Text
              // biome-ignore lint/suspicious/noArrayIndexKey: 标签为固定派生序列,无稳定 id
              key={`${label}-${index}`}
              size="sm"
              numeric="tabular"
              style={{
                color: 'var(--ms-color-fg-subtle)',
                whiteSpace: 'nowrap',
              }}
            >
              {label}
            </Text>
          ))}
        </div>
      </div>
    </div>
  );
}

interface LegendItemProps {
  label: string;
  variant: 'solid' | 'dashed';
}

function LegendItem({ label, variant }: LegendItemProps) {
  const isSolid = variant === 'solid';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--ms-space-2)' }}>
      <span
        aria-hidden="true"
        style={{
          inlineSize: '1rem',
          blockSize: 0,
          borderTop: isSolid
            ? '2px solid var(--ms-color-primary)'
            : '2px dashed var(--ms-color-border-strong)',
          borderRadius: 'var(--ms-radius-full)',
        }}
      />
      <Text size="sm" style={{ color: 'var(--ms-color-fg-muted)' }}>
        {label}
      </Text>
    </span>
  );
}
