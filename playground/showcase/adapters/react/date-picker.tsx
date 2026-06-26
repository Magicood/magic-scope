import type { DatePickerSize, DatePickerTone, DateRange } from '@magic-scope/react';
import { DatePicker } from '@magic-scope/react';
import { type ComponentType, useState } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

function Playground({ values }: { values: ControlValues }) {
  const [value, setValue] = useState<Date | null>(null);
  const [range, setRange] = useState<DateRange>({ start: null, end: null });
  const mode = (values.mode as 'single' | 'range') ?? 'single';

  return (
    <DatePicker
      mode={mode}
      value={value}
      onChange={setValue}
      rangeValue={range}
      onRangeChange={setRange}
      size={values.size as DatePickerSize}
      tone={values.tone as DatePickerTone}
      clearable={values.clearable as boolean}
      invalid={values.invalid as boolean}
      disabled={values.disabled as boolean}
      aria-label="日期选择"
    />
  );
}

const comps = import.meta.glob<{ default: ComponentType }>('./demos/date-picker/*.tsx', {
  eager: true,
});
const reactSources = import.meta.glob<string>('./demos/date-picker/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'date-picker',
  Playground,
  demos: buildDemos(comps, reactSources),
};
