import { Calendar, type CalendarMode, type CalendarSize, type DateTuple } from '@magic-scope/react';
import { type ComponentType, useState } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

type CalTone = 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'info';

function Playground({ values }: { values: ControlValues }) {
  const mode = values.mode as CalendarMode;
  const [single, setSingle] = useState<Date | null>(new Date());
  const [range, setRange] = useState<DateTuple | null>(null);
  const [multiple, setMultiple] = useState<Date[]>([]);

  // 旋钮返回字符串,转回 0..6 的周起始字面量。
  const weekStartsOn = Number(values.weekStartsOn) as 0 | 1 | 6;

  const common = {
    size: values.size as CalendarSize,
    tone: values.tone as CalTone,
    weekStartsOn,
    'aria-label': '示例日历',
  } as const;

  if (mode === 'range') {
    return <Calendar {...common} mode="range" rangeValue={range} onRangeChange={setRange} />;
  }
  if (mode === 'multiple') {
    return (
      <Calendar
        {...common}
        mode="multiple"
        multipleValue={multiple}
        onMultipleChange={setMultiple}
      />
    );
  }
  return <Calendar {...common} mode="single" value={single} onChange={setSingle} />;
}

const comps = import.meta.glob<{ default: ComponentType }>('./demos/calendar/*.tsx', {
  eager: true,
});
const reactSources = import.meta.glob<string>('./demos/calendar/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'calendar',
  Playground,
  demos: buildDemos(comps, reactSources),
};
