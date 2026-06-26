import type {
  BlockquoteGlow,
  BlockquoteSize,
  BlockquoteTone,
  BlockquoteVariant,
} from '@magic-scope/react';
import { Blockquote } from '@magic-scope/react';
import type { ComponentType } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

function Playground({ values }: { values: ControlValues }) {
  return (
    <Blockquote
      variant={values.variant as BlockquoteVariant}
      tone={values.tone as BlockquoteTone}
      size={values.size as BlockquoteSize}
      glow={values.glow as BlockquoteGlow}
      quoteMark={values.quoteMark as boolean}
      gradient={values.gradient as boolean}
      cite="马库斯 · 造物者"
      citeUrl="https://magic-scope.dev"
      style={{ maxInlineSize: 'min(560px, 100%)' }}
    >
      {values.children as string}
    </Blockquote>
  );
}

const comps = import.meta.glob<{ default: ComponentType }>('./demos/blockquote/*.tsx', {
  eager: true,
});
const reactSources = import.meta.glob<string>('./demos/blockquote/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'blockquote',
  Playground,
  demos: buildDemos(comps, reactSources),
};
