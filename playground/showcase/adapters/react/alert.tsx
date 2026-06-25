import type { AlertVariant } from '@magic-scope/react';
import { Alert } from '@magic-scope/react';
import type { ComponentType } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

function Playground({ values }: { values: ControlValues }) {
  return (
    <Alert variant={values.variant as AlertVariant} style={{ maxInlineSize: 'min(32rem, 100%)' }}>
      <strong style={{ display: 'block', marginBlockEnd: '0.25rem' }}>
        {values.title as string}
      </strong>
      <span>{values.children as string}</span>
    </Alert>
  );
}

const comps = import.meta.glob<{ default: ComponentType }>('./demos/alert/*.tsx', { eager: true });
const reactSources = import.meta.glob<string>('./demos/alert/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'alert',
  Playground,
  demos: buildDemos(comps, reactSources),
};
