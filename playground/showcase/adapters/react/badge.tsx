import type { BadgeSize, BadgeTone, BadgeVariant } from '@magic-scope/react';
import { Badge } from '@magic-scope/react';
import type { ComponentType } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

function Playground({ values }: { values: ControlValues }) {
  return (
    <Badge
      variant={values.variant as BadgeVariant}
      tone={values.tone as BadgeTone}
      size={values.size as BadgeSize}
      dot={values.dot as boolean}
      pulse={values.pulse as boolean}
    >
      {values.children as string}
    </Badge>
  );
}

const comps = import.meta.glob<{ default: ComponentType }>('./demos/badge/*.tsx', { eager: true });
const reactSources = import.meta.glob<string>('./demos/badge/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'badge',
  Playground,
  demos: buildDemos(comps, reactSources),
};
