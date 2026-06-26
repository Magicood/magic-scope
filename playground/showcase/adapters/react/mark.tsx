import type { MarkTone } from '@magic-scope/react';
import { Mark } from '@magic-scope/react';
import type { ComponentType } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

const SAMPLE =
  '在 magic-scope 里,Mark 把命中搜索词的片段包进语义化 mark —— magic 不止一处,多次命中都会高亮。';

function Playground({ values }: { values: ControlValues }) {
  return (
    <p style={{ maxInlineSize: 'min(520px, 100%)', lineHeight: 1.9, margin: 0 }}>
      <Mark
        search={values.search as string}
        tone={values.tone as MarkTone}
        caseSensitive={values.caseSensitive as boolean}
        wholeWord={values.wholeWord as boolean}
      >
        {SAMPLE}
      </Mark>
    </p>
  );
}

const comps = import.meta.glob<{ default: ComponentType }>('./demos/mark/*.tsx', { eager: true });
const reactSources = import.meta.glob<string>('./demos/mark/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'mark',
  Playground,
  demos: buildDemos(comps, reactSources),
};
