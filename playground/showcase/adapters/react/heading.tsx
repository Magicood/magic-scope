import type { HeadingLevel, HeadingVariant } from '@magic-scope/react';
import { Heading } from '@magic-scope/react';
import type { ComponentType } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

type HeadingTone = 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

function Playground({ values }: { values: ControlValues }) {
  const gradient = values.gradient as 'off' | 'tone' | 'aurora';
  const tone = values.tone as HeadingTone;
  return (
    <Heading
      level={Number(values.level) as HeadingLevel}
      variant={values.variant as HeadingVariant}
      tone={tone === 'neutral' ? undefined : tone}
      gradient={gradient === 'off' ? undefined : gradient}
      glow={values.glow as boolean}
      dimmed={values.dimmed as boolean}
    >
      {values.children as string}
    </Heading>
  );
}

// 真实 demo 文件：同一文件既 import 渲染、又 ?raw 取源码（永不漂移）。
const comps = import.meta.glob<{ default: ComponentType }>('./demos/heading/*.tsx', {
  eager: true,
});
const reactSources = import.meta.glob<string>('./demos/heading/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'heading',
  Playground,
  demos: buildDemos(comps, reactSources),
};
