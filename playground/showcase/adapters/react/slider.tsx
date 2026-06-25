import type { SliderSize } from '@magic-scope/react';
import { Slider } from '@magic-scope/react';
import type { ComponentType } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

function Playground({ values }: { values: ControlValues }) {
  return (
    <Slider
      key={`${values.size}-${values.step}`}
      defaultValue={40}
      min={0}
      max={100}
      step={values.step as number}
      size={values.size as SliderSize}
      showValue={values.showValue as boolean}
      disabled={values.disabled as boolean}
      formatValue={(n) => `${n}%`}
      aria-label="示例滑块"
      style={{ inlineSize: 'min(360px, 80vw)' }}
    />
  );
}

const comps = import.meta.glob<{ default: ComponentType }>('./demos/slider/*.tsx', { eager: true });
const reactSources = import.meta.glob<string>('./demos/slider/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'slider',
  Playground,
  demos: buildDemos(comps, reactSources),
};
