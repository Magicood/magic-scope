import type { RadioAppearance, RadioSize, RadioTone } from '@magic-scope/react';
import { Radio, RadioGroup } from '@magic-scope/react';
import { type ComponentType, useState } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

const SCHOOLS = [
  { value: 'arcane', label: 'Arcane 奥术' },
  { value: 'frost', label: 'Frost 冰霜' },
  { value: 'ember', label: 'Ember 烈焰' },
  { value: 'void', label: 'Void 虚空(禁用)', disabled: true },
];

function Playground({ values }: { values: ControlValues }) {
  const [school, setSchool] = useState('frost');
  return (
    <RadioGroup
      value={school}
      onValueChange={setSchool}
      orientation={values.orientation as 'horizontal' | 'vertical'}
      size={values.size as RadioSize}
      tone={values.tone as RadioTone}
      appearance={values.appearance as RadioAppearance}
      disabled={values.disabled as boolean}
      aria-label="法术流派"
    >
      {SCHOOLS.map((item) => (
        <Radio key={item.value} value={item.value} disabled={item.disabled}>
          {item.label}
        </Radio>
      ))}
    </RadioGroup>
  );
}

const comps = import.meta.glob<{ default: ComponentType }>('./demos/radio/*.tsx', { eager: true });
const reactSources = import.meta.glob<string>('./demos/radio/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'radio',
  Playground,
  demos: buildDemos(comps, reactSources),
};
