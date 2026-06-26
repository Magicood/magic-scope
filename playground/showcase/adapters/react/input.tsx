import type { InputSize, InputTone } from '@magic-scope/react';
import { Input } from '@magic-scope/react';
import type { ComponentType } from 'react';
import { useState } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

function Playground({ values }: { values: ControlValues }) {
  const [text, setText] = useState('魔法成分超标');
  return (
    <Input
      size={values.size as InputSize}
      tone={values.tone as InputTone}
      invalid={values.invalid as boolean}
      clearable={values.clearable as boolean}
      showCount={values.showCount as boolean}
      maxLength={20}
      disabled={values.disabled as boolean}
      placeholder={values.placeholder as string}
      value={text}
      onChange={(e) => setText(e.target.value)}
      style={{ inlineSize: 'min(320px, 80vw)' }}
    />
  );
}

const comps = import.meta.glob<{ default: ComponentType }>('./demos/input/*.tsx', { eager: true });
const reactSources = import.meta.glob<string>('./demos/input/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'input',
  Playground,
  demos: buildDemos(comps, reactSources),
};
