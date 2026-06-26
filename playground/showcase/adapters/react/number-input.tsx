import type { NumberInputSize, NumberInputTone } from '@magic-scope/react';
import { NumberInput } from '@magic-scope/react';
import { type ComponentType, useState } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

function Playground({ values }: { values: ControlValues }) {
  const [value, setValue] = useState<number | null>(8);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
      <NumberInput
        value={value ?? undefined}
        onValueChange={setValue}
        min={0}
        max={20}
        size={values.size as NumberInputSize}
        tone={values.tone as NumberInputTone}
        invalid={values.invalid as boolean}
        disabled={values.disabled as boolean}
        aria-label="数量"
      />
      <span style={{ fontSize: '0.8125rem', color: 'var(--ms-color-fg-muted)' }}>
        当前值:{value == null ? '空' : value}(限定 [0, 20])
      </span>
    </div>
  );
}

const comps = import.meta.glob<{ default: ComponentType }>('./demos/number-input/*.tsx', {
  eager: true,
});
const reactSources = import.meta.glob<string>('./demos/number-input/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'number-input',
  Playground,
  demos: buildDemos(comps, reactSources),
};
