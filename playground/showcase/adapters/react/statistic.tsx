import type { StatisticSize, StatisticTrend } from '@magic-scope/react';
import { Statistic } from '@magic-scope/react';
import type { ComponentType } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

function Playground({ values }: { values: ControlValues }) {
  const trendRaw = values.trend as string;
  const trend = trendRaw === 'none' ? undefined : (trendRaw as StatisticTrend);
  return (
    <Statistic
      title="本月营收"
      value={values.value as number}
      precision={values.precision as number}
      prefix="¥"
      trend={trend}
      size={values.size as StatisticSize}
      loading={values.loading as boolean}
      animateOnMount={values.animateOnMount as boolean}
    />
  );
}

const comps = import.meta.glob<{ default: ComponentType }>('./demos/statistic/*.tsx', {
  eager: true,
});
const reactSources = import.meta.glob<string>('./demos/statistic/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'statistic',
  Playground,
  demos: buildDemos(comps, reactSources),
};
