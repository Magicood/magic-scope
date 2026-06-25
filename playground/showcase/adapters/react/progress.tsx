import { Progress } from '@magic-scope/react';
import type { ComponentType } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

function Playground({ values }: { values: ControlValues }) {
  const indeterminate = values.indeterminate as boolean;
  return (
    <div style={{ inlineSize: 'min(420px, 100%)' }}>
      {indeterminate ? <Progress indeterminate /> : <Progress value={values.value as number} />}
    </div>
  );
}

const comps = import.meta.glob<{ default: ComponentType }>('./demos/progress/*.tsx', {
  eager: true,
});
const reactSources = import.meta.glob<string>('./demos/progress/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'progress',
  Playground,
  demos: buildDemos(comps, reactSources),
};
