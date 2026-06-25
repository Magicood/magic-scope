import { useEffect, useRef, useState } from 'react';
import { Button, Progress } from '../../../packages/react/src/index';
import type { ControlValues, DocEntry } from '../types';

/**
 * 进度条演示:旋钮实时驱动确定态 value;勾选 indeterminate 切到不确定态(往返流动)。
 * 额外提供「自动跑一遍」按钮,从 0 平滑加载到 100,体现填充动画与奥术发光。
 */
function Demo({ values }: { values: ControlValues }) {
  const indeterminate = values.indeterminate as boolean;
  const knobValue = values.value as number;

  // 自动跑进度:点击后从 0 递增到 100,期间接管 value(优先于旋钮)。
  const [auto, setAuto] = useState<number | null>(null);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current !== null) window.clearInterval(timer.current);
    };
  }, []);

  const run = () => {
    if (timer.current !== null) window.clearInterval(timer.current);
    setAuto(0);
    timer.current = window.setInterval(() => {
      setAuto((prev) => {
        const next = (prev ?? 0) + 4;
        if (next >= 100) {
          if (timer.current !== null) window.clearInterval(timer.current);
          timer.current = null;
          return 100;
        }
        return next;
      });
    }, 80);
  };

  const reset = () => {
    if (timer.current !== null) window.clearInterval(timer.current);
    timer.current = null;
    setAuto(null);
  };

  const shown = auto ?? knobValue;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', inlineSize: '100%' }}>
      {indeterminate ? <Progress indeterminate /> : <Progress value={shown} />}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          flexWrap: 'wrap',
          fontSize: '0.8125rem',
          color: 'var(--ms-color-fg-muted)',
        }}
      >
        <Button size="sm" variant="outline" onClick={run} disabled={indeterminate}>
          自动跑一遍
        </Button>
        <Button size="sm" variant="ghost" onClick={reset} disabled={indeterminate || auto === null}>
          重置
        </Button>
        <span>{indeterminate ? '不确定态' : `${Math.round(shown)}%`}</span>
      </div>
    </div>
  );
}

export const entry: DocEntry = {
  id: 'progress',
  name: 'Progress',
  category: 'feedback',
  summary: '进度条,确定态按 value 驱动填充宽度,不确定态填充段左右往返流动。',
  description:
    '自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。\nrole="progressbar",aria-valuemin=0 / aria-valuemax=100;确定态设 aria-valuenow 并按 value% 平滑驱动填充宽度,不确定态(indeterminate 或缺省 value)让一段奥术发光左右往返流动。尊重 reduced-motion(放慢往返,保留语义)。',
  controls: [
    { type: 'boolean', prop: 'indeterminate', label: '不确定态 indeterminate', default: false },
    { type: 'number', prop: 'value', label: '进度 value', default: 60, min: 0, max: 100, step: 1 },
  ],
  render: (v) => <Demo values={v} />,
  usage: `import { Progress } from '@magic-scope/react';

<Progress value={60} />
<Progress indeterminate />`,
  props: [
    {
      name: 'value',
      type: 'number',
      default: '—',
      description:
        '进度值 0-100,自动夹取;确定态下驱动填充宽度并设为 aria-valuenow。省略即不确定态。',
    },
    {
      name: 'indeterminate',
      type: 'boolean',
      default: 'false',
      description: '不确定态:不知道具体进度,填充段左右往返流动。',
    },
    {
      name: '...props',
      type: `ComponentPropsWithoutRef<'div'>`,
      default: '—',
      description: '透传原生 div 属性(className / style / aria-label 等)。',
    },
  ],
  examples: [
    {
      title: '不同进度',
      node: (
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', inlineSize: '100%' }}
        >
          <Progress value={25} />
          <Progress value={50} />
          <Progress value={75} />
          <Progress value={100} />
        </div>
      ),
    },
    {
      title: '不确定态',
      node: (
        <div style={{ inlineSize: '100%' }}>
          <Progress indeterminate />
        </div>
      ),
    },
  ],
};
