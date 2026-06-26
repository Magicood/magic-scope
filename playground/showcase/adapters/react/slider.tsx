import type { SliderOrientation, SliderSize, SliderTone } from '@magic-scope/react';
import { Slider } from '@magic-scope/react';
import type { ComponentType } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

function Playground({ values }: { values: ControlValues }) {
  const orientation = values.orientation as SliderOrientation;
  const isVertical = orientation === 'vertical';
  return (
    <Slider
      key={`${values.size}-${values.step}-${values.orientation}`}
      defaultValue={40}
      min={0}
      max={100}
      step={values.step as number}
      size={values.size as SliderSize}
      tone={values.tone as SliderTone}
      orientation={orientation}
      showValue={values.showValue as boolean}
      showTooltip={values.showTooltip as boolean}
      disabled={values.disabled as boolean}
      formatValue={(n) => `${n}%`}
      aria-label="示例滑块"
      style={isVertical ? { blockSize: 200 } : { inlineSize: 'min(360px, 80vw)' }}
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
