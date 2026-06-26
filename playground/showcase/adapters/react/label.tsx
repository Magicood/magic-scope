import { Input, Label } from '@magic-scope/react';
import { type ComponentType, useState } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

function Playground({ values }: { values: ControlValues }) {
  const [value, setValue] = useState('');
  const required = values.required as boolean;
  return (
    <div
      style={{
        display: 'grid',
        gap: '0.4rem',
        inlineSize: 'min(320px, 80vw)',
      }}
    >
      <Label htmlFor="ms-label-playground" required={required}>
        {values.children as string}
      </Label>
      <Input
        id="ms-label-playground"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="点上方标签即可聚焦此处"
        aria-required={required || undefined}
      />
    </div>
  );
}

const comps = import.meta.glob<{ default: ComponentType }>('./demos/label/*.tsx', { eager: true });
const reactSources = import.meta.glob<string>('./demos/label/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'label',
  Playground,
  demos: buildDemos(comps, reactSources),
};
