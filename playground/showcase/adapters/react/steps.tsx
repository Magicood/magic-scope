import type {
  StepItem,
  StepStatus,
  StepsDirection,
  StepsLabelPlacement,
  StepsSize,
  StepsTone,
} from '@magic-scope/react';
import { Steps } from '@magic-scope/react';
import type { ComponentType } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

const items: StepItem[] = [
  { title: '登记', description: '提交基本信息' },
  { title: '验证', description: '校验与确认' },
  { title: '施法', description: '执行核心仪式' },
  { title: '完成', description: '结果归档' },
];

function Playground({ values }: { values: ControlValues }) {
  const direction = values.direction as StepsDirection;
  return (
    <Steps
      items={items}
      current={values.current as number}
      status={values.status as StepStatus}
      direction={direction}
      size={values.size as StepsSize}
      tone={values.tone as StepsTone}
      labelPlacement={values.labelPlacement as StepsLabelPlacement}
      progressDot={values.progressDot as boolean}
      style={
        direction === 'vertical'
          ? { inlineSize: 'min(20rem, 100%)' }
          : { inlineSize: 'min(40rem, 100%)' }
      }
    />
  );
}

const comps = import.meta.glob<{ default: ComponentType }>('./demos/steps/*.tsx', { eager: true });
const reactSources = import.meta.glob<string>('./demos/steps/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'steps',
  Playground,
  demos: buildDemos(comps, reactSources),
};
