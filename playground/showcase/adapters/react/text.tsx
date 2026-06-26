import type { TextAnimate, TextSize, TextTone, TextWeight } from '@magic-scope/react';
import { Text } from '@magic-scope/react';
import type { ComponentType } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

function Playground({ values }: { values: ControlValues }) {
  const gradient = values.gradient as 'none' | 'tone' | 'aurora';
  const animate = values.animate as 'none' | TextAnimate;
  return (
    <Text
      as="div"
      size={values.size as TextSize}
      weight={values.weight as TextWeight}
      tone={values.tone as TextTone}
      gradient={gradient === 'none' ? undefined : gradient}
      animate={animate === 'none' ? undefined : animate}
    >
      {values.children as string}
    </Text>
  );
}

// 真实 demo 文件：同一文件既 import 渲染、又 ?raw 取源码（永不漂移）。
const comps = import.meta.glob<{ default: ComponentType }>('./demos/text/*.tsx', { eager: true });
const reactSources = import.meta.glob<string>('./demos/text/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'text',
  Playground,
  demos: buildDemos(comps, reactSources),
};
