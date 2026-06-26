import type { TimelineLineStyle, TimelineMode, TimelineVariant } from '@magic-scope/react';
import { Timeline, TimelineItem } from '@magic-scope/react';
import type { ComponentType } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

/** 旋钮之外的固定节点,演示连线与多条堆叠。 */
const STEPS: {
  variant: TimelineVariant;
  title: string;
  time: string;
  icon: string;
  body: string;
}[] = [
  {
    variant: 'success',
    title: '咏唱完成',
    time: '00:00',
    icon: '✓',
    body: '法阵已点亮,奥术能量注入完毕。',
  },
  {
    variant: 'primary',
    title: '凝聚法球',
    time: '00:03',
    icon: '✦',
    body: '元素汇聚成型,等待引导。',
  },
  {
    variant: 'warning',
    title: '能量过载',
    time: '00:07',
    icon: '!',
    body: '法球亮度异常,建议立即释放。',
  },
];

function Playground({ values }: { values: ControlValues }) {
  return (
    <Timeline
      mode={values.mode as TimelineMode}
      lineStyle={values.lineStyle as TimelineLineStyle}
      reverse={values.reverse as boolean}
      pending={values.pending as boolean}
      style={{ inlineSize: 'min(420px, 100%)' }}
    >
      <TimelineItem
        variant={values.variant as TimelineVariant}
        title={values.title as string}
        time={values.showTime ? '刚刚' : undefined}
        icon={values.showIcon ? '✦' : undefined}
      >
        受旋钮控制的首条节点,实时反映 variant / icon / time / title。
      </TimelineItem>
      {STEPS.map((step) => (
        <TimelineItem
          key={step.title}
          variant={step.variant}
          title={step.title}
          time={values.showTime ? step.time : undefined}
          icon={values.showIcon ? step.icon : undefined}
        >
          {step.body}
        </TimelineItem>
      ))}
    </Timeline>
  );
}

// 真实 demo 文件：同一文件既 import 渲染、又 ?raw 取源码（永不漂移）。
const comps = import.meta.glob<{ default: ComponentType }>('./demos/timeline/*.tsx', {
  eager: true,
});
const reactSources = import.meta.glob<string>('./demos/timeline/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'timeline',
  Playground,
  demos: buildDemos(comps, reactSources),
};
