import type { ProgressSize, ProgressTone, ProgressVariant } from '@magic-scope/react';
import { Progress } from '@magic-scope/react';
import type { ComponentType } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

function Playground({ values }: { values: ControlValues }) {
  const indeterminate = values.indeterminate as boolean;
  const variant = values.variant as ProgressVariant;
  const isCircular = variant === 'circular';
  return (
    <div style={{ inlineSize: isCircular ? '6rem' : 'min(420px, 100%)' }}>
      <Progress
        variant={variant}
        value={indeterminate ? undefined : (values.value as number)}
        indeterminate={indeterminate}
        tone={values.tone as ProgressTone}
        size={values.size as ProgressSize}
        striped={values.striped as boolean}
        animated={values.animated as boolean}
        showValue={values.showValue as boolean}
      />
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
