import type { AutoCompleteSize, AutoCompleteTone } from '@magic-scope/react';
import { AutoComplete } from '@magic-scope/react';
import { type ComponentType, useState } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

const options = [
  { value: 'Arcane 紫' },
  { value: 'Frost 青' },
  { value: 'Ember 品红' },
  { value: 'Verdant 绿' },
  { value: 'Void 玄(暂不可选)', disabled: true },
];

function Playground({ values }: { values: ControlValues }) {
  const [text, setText] = useState('');
  return (
    <AutoComplete
      value={text}
      onChange={setText}
      options={options}
      placeholder="键入以联想主题预设…"
      size={values.size as AutoCompleteSize}
      tone={values.tone as AutoCompleteTone}
      disabled={values.disabled as boolean}
      allowClear={values.allowClear as boolean}
      loading={values.loading as boolean}
      invalid={values.invalid as boolean}
      aria-label="主题预设联想"
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
