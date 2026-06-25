import type { InputSize } from '@magic-scope/react';
import { Input } from '@magic-scope/react';
import type { ComponentType } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

function Playground({ values }: { values: ControlValues }) {
  return (
    <Input
      size={values.size as InputSize}
      invalid={values.invalid as boolean}
      disabled={values.disabled as boolean}
      placeholder={values.placeholder as string}
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
