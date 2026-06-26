import type { TooltipTone } from '@magic-scope/react';
import { Button, Tooltip } from '@magic-scope/react';
import type { ComponentType } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

function Playground({ values }: { values: ControlValues }) {
  return (
    <Tooltip
      content={values.content as string}
      placement={values.placement as 'top' | 'bottom'}
      tone={values.tone as TooltipTone}
      arrow={values.arrow as boolean}
      delay={values.delay as number}
    >
      <Button variant="outline">悬停 / 聚焦我</Button>
    </Tooltip>
  );
}

const comps = import.meta.glob<{ default: ComponentType }>('./demos/tooltip/*.tsx', {
  eager: true,
});
const reactSources = import.meta.glob<string>('./demos/tooltip/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'tooltip',
  Playground,
  demos: buildDemos(comps, reactSources),
};
