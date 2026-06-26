import type { SpinnerSize } from '@magic-scope/react';
import { Spinner } from '@magic-scope/react';
import type { ComponentType } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

function Playground({ values }: { values: ControlValues }) {
  const label = values.label as string;
  return (
    <span style={{ display: 'inline-flex', gap: '0.6rem', alignItems: 'center' }}>
      <Spinner size={values.size as SpinnerSize} label={label} />
      <span style={{ color: 'var(--ms-color-fg-muted)' }}>{label}…</span>
    </span>
  );
}

const comps = import.meta.glob<{ default: ComponentType }>('./demos/spinner/*.tsx', {
  eager: true,
});
const reactSources = import.meta.glob<string>('./demos/spinner/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'spinner',
  Playground,
  demos: buildDemos(comps, reactSources),
};
