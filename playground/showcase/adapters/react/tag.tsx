import type { TagSize, TagTone, TagVariant } from '@magic-scope/react';
import { Tag } from '@magic-scope/react';
import type { ComponentType } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

function Playground({ values }: { values: ControlValues }) {
  return (
    <Tag
      tone={values.tone as TagTone}
      variant={values.variant as TagVariant}
      size={values.size as TagSize}
      closable={values.closable as boolean}
      checkable={values.checkable as boolean}
      selected={values.selected as boolean}
    >
      {values.children as string}
    </Tag>
  );
}

const comps = import.meta.glob<{ default: ComponentType }>('./demos/tag/*.tsx', { eager: true });
const reactSources = import.meta.glob<string>('./demos/tag/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'tag',
  Playground,
  demos: buildDemos(comps, reactSources),
};
