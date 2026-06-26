import type { CodeSize, CodeTone, CodeVariant } from '@magic-scope/react';
import { Code } from '@magic-scope/react';
import type { ComponentType } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

function Playground({ values }: { values: ControlValues }) {
  const block = values.block as boolean;
  return (
    <Code
      block={block}
      variant={values.variant as CodeVariant}
      tone={values.tone as CodeTone}
      size={values.size as CodeSize}
      mono={values.mono as boolean}
      glow={values.glow as boolean}
      style={block ? { inlineSize: 'min(420px, 100%)' } : undefined}
    >
      {values.children as string}
    </Code>
  );
}

const comps = import.meta.glob<{ default: ComponentType }>('./demos/code/*.tsx', { eager: true });
const reactSources = import.meta.glob<string>('./demos/code/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'code',
  Playground,
  demos: buildDemos(comps, reactSources),
};
