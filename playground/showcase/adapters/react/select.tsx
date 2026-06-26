import type { SelectSize, SelectTone } from '@magic-scope/react';
import { Select } from '@magic-scope/react';
import { type ComponentType, useState } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

const options = [
  { value: 'arcane', label: 'Arcane 奥术紫' },
  { value: 'frost', label: 'Frost 霜寒青' },
  { value: 'ember', label: 'Ember 余烬品红' },
  { value: 'void', label: 'Void 虚空玄(已封印)', disabled: true },
];

function Playground({ values }: { values: ControlValues }) {
  const [theme, setTheme] = useState('frost');
  return (
    <Select
      value={theme}
      onChange={setTheme}
      options={options}
      size={values.size as SelectSize}
      tone={values.tone as SelectTone}
      disabled={values.disabled as boolean}
      clearable={values.clearable as boolean}
      searchable={values.searchable as boolean}
      loading={values.loading as boolean}
      aria-label="主题流派"
    />
  );
}

const comps = import.meta.glob<{ default: ComponentType }>('./demos/select/*.tsx', { eager: true });
const reactSources = import.meta.glob<string>('./demos/select/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'select',
  Playground,
  demos: buildDemos(comps, reactSources),
};
