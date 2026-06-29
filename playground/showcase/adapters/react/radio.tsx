import type { RadioAppearance, RadioSize, RadioTone } from '@magic-scope/react';
import { Radio, RadioGroup } from '@magic-scope/react';
import { type ComponentType, useState } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

const TABS = [
  { value: 'overview', label: 'Overview 概览' },
  { value: 'activity', label: 'Activity 活动' },
  { value: 'members', label: 'Members 成员' },
  { value: 'billing', label: 'Billing 计费(禁用)', disabled: true },
];

function Playground({ values }: { values: ControlValues }) {
  const [tab, setTab] = useState('activity');
  return (
    <RadioGroup
      value={tab}
      onValueChange={setTab}
      orientation={values.orientation as 'horizontal' | 'vertical'}
      size={values.size as RadioSize}
      tone={values.tone as RadioTone}
      appearance={values.appearance as RadioAppearance}
      disabled={values.disabled as boolean}
      aria-label="页面分区"
    >
      {TABS.map((item) => (
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
