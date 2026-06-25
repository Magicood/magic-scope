import type { TextareaSize } from '@magic-scope/react';
import { Textarea } from '@magic-scope/react';
import { type ComponentType, useState } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

function Playground({ values }: { values: ControlValues }) {
  const [value, setValue] = useState('愿奥术之火,照亮你前行的道路。');
  return (
    <Textarea
      value={value}
      onChange={(e) => setValue(e.target.value)}
      size={values.size as TextareaSize}
      rows={values.rows as number}
      invalid={values.invalid as boolean}
      disabled={values.disabled as boolean}
      placeholder={values.placeholder as string}
      aria-label="多行文本输入"
      style={{ inlineSize: 'min(28rem, 100%)' }}
    />
  );
}

const comps = import.meta.glob<{ default: ComponentType }>('./demos/textarea/*.tsx', {
  eager: true,
});
const reactSources = import.meta.glob<string>('./demos/textarea/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'textarea',
  Playground,
  demos: buildDemos(comps, reactSources),
};
