import type { AutoCompleteSize, AutoCompleteTone } from '@magic-scope/react';
import { AutoComplete } from '@magic-scope/react';
import { type ComponentType, useState } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

const options = [
  { value: 'Arcane 奥术紫' },
  { value: 'Frost 霜寒青' },
  { value: 'Ember 余烬品红' },
  { value: 'Verdant 苍翠绿' },
  { value: 'Void 虚空玄(已封印)', disabled: true },
];

function Playground({ values }: { values: ControlValues }) {
  const [text, setText] = useState('');
  return (
    <AutoComplete
      value={text}
      onChange={setText}
      options={options}
      placeholder="键入以联想流派…"
      size={values.size as AutoCompleteSize}
      tone={values.tone as AutoCompleteTone}
      disabled={values.disabled as boolean}
      allowClear={values.allowClear as boolean}
      loading={values.loading as boolean}
      invalid={values.invalid as boolean}
      aria-label="主题流派联想"
    />
  );
}

const comps = import.meta.glob<{ default: ComponentType }>('./demos/auto-complete/*.tsx', {
  eager: true,
});
const reactSources = import.meta.glob<string>('./demos/auto-complete/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'auto-complete',
  Playground,
  demos: buildDemos(comps, reactSources),
};
