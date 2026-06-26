import type {
  SegmentedOrientation,
  SegmentedRole,
  SegmentedSize,
  SegmentedTone,
} from '@magic-scope/react';
import { Segmented } from '@magic-scope/react';
import { type ComponentType, useState } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

const options = [
  { value: 'list', label: '列表' },
  { value: 'board', label: '看板' },
  { value: 'calendar', label: '日历' },
];

function Playground({ values }: { values: ControlValues }) {
  const [value, setValue] = useState('list');
  return (
    <Segmented
      options={options}
      value={value}
      onValueChange={setValue}
      size={values.size as SegmentedSize}
      tone={values.tone as SegmentedTone}
      orientation={values.orientation as SegmentedOrientation}
      role={values.role as SegmentedRole}
      block={values.block as boolean}
      disabled={values.disabled as boolean}
    />
  );
}

const comps = import.meta.glob<{ default: ComponentType }>('./demos/segmented/*.tsx', {
  eager: true,
});
const reactSources = import.meta.glob<string>('./demos/segmented/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'segmented',
  Playground,
  demos: buildDemos(comps, reactSources),
};
