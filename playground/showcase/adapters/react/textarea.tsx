import type { TextareaSize, TextareaTone } from '@magic-scope/react';
import { Textarea } from '@magic-scope/react';
import { type ComponentType, useState } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

function Playground({ values }: { values: ControlValues }) {
  const [value, setValue] = useState('简单描述一下你遇到的问题与复现步骤。');
  return (
    <Textarea
      value={value}
      onChange={(e) => setValue(e.target.value)}
      size={values.size as TextareaSize}
      tone={values.tone as TextareaTone}
      rows={values.rows as number}
      showCount={values.showCount as boolean}
      maxLength={values.showCount ? 120 : undefined}
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
