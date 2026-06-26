import type { TimePickerSize, TimePickerTone } from '@magic-scope/react';
import { TimePicker } from '@magic-scope/react';
import { type ComponentType, useState } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

function Playground({ values }: { values: ControlValues }) {
  const [time, setTime] = useState<string | null>('09:30:00');
  return (
    <TimePicker
      value={time}
      onChange={(v) => setTime(v)}
      size={values.size as TimePickerSize}
      tone={values.tone as TimePickerTone}
      use12Hours={values.use12Hours as boolean}
      showSecond={values.showSecond as boolean}
      clearable={values.clearable as boolean}
      footer={values.footer as boolean}
      disabled={values.disabled as boolean}
      invalid={values.invalid as boolean}
      aria-label="选择时间"
    />
  );
}

const comps = import.meta.glob<{ default: ComponentType }>('./demos/time-picker/*.tsx', {
  eager: true,
});
const reactSources = import.meta.glob<string>('./demos/time-picker/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'time-picker',
  Playground,
  demos: buildDemos(comps, reactSources),
};
