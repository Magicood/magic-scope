import type { EmptyPreset, EmptySize, EmptyTone } from '@magic-scope/react';
import { Empty } from '@magic-scope/react';
import type { ComponentType } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

function Playground({ values }: { values: ControlValues }) {
  return (
    <Empty
      image={values.image as EmptyPreset}
      size={values.size as EmptySize}
      tone={values.tone as EmptyTone}
      description={values.description as string}
      style={{ inlineSize: 'min(360px, 100%)' }}
    />
  );
}

const comps = import.meta.glob<{ default: ComponentType }>('./demos/empty/*.tsx', { eager: true });
const reactSources = import.meta.glob<string>('./demos/empty/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'empty',
  Playground,
  demos: buildDemos(comps, reactSources),
};
