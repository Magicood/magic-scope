import type { KbdSize } from '@magic-scope/react';
import { Kbd } from '@magic-scope/react';
import type { ComponentType } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

function Playground({ values }: { values: ControlValues }) {
  return <Kbd size={values.size as KbdSize}>{values.children as string}</Kbd>;
}

const comps = import.meta.glob<{ default: ComponentType }>('./demos/kbd/*.tsx', { eager: true });
const reactSources = import.meta.glob<string>('./demos/kbd/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'kbd',
  Playground,
  demos: buildDemos(comps, reactSources),
};
