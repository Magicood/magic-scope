import type { RateSize, RateTone } from '@magic-scope/react';
import { Rate } from '@magic-scope/react';
import { type ComponentType, useState } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

function Playground({ values }: { values: ControlValues }) {
  // 受控评分:旋钮切 count / allowHalf 时夹紧由组件内部处理,这里只持有当前值。
  const [value, setValue] = useState(3);
  return (
    <Rate
      value={value}
      onChange={setValue}
      size={values.size as RateSize}
      tone={values.tone as RateTone}
      count={values.count as number}
      allowHalf={values.allowHalf as boolean}
      allowClear={values.allowClear as boolean}
      showText={values.showText as boolean}
      readOnly={values.readOnly as boolean}
      disabled={values.disabled as boolean}
      aria-label="演示评分"
    />
  );
}

// 真实 demo 文件：同一文件既 import 渲染、又 ?raw 取源码（永不漂移）。
const comps = import.meta.glob<{ default: ComponentType }>('./demos/rate/*.tsx', { eager: true });
const reactSources = import.meta.glob<string>('./demos/rate/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'rate',
  Playground,
  demos: buildDemos(comps, reactSources),
};
