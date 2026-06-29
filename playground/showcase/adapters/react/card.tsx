import type { CardVariant } from '@magic-scope/react';
import { Card } from '@magic-scope/react';
import type { ComponentType } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

function Playground({ values }: { values: ControlValues }) {
  const interactive = values.interactive as boolean;
  return (
    <Card
      variant={values.variant as CardVariant}
      interactive={interactive}
      style={{ maxInlineSize: '20rem', padding: '1.25rem' }}
    >
      <h3 style={{ marginBlockStart: 0, marginBlockEnd: '0.5rem' }}>项目概览</h3>
      <p style={{ margin: 0, color: 'var(--ms-color-fg-muted)' }}>
        卡片是承载内容的最小容器:标题、描述与操作可自由组合。
        {interactive ? '当前可交互,试试悬停或用键盘聚焦。' : '开启 interactive 体验上浮与发光。'}
      </p>
    </Card>
  );
}

const comps = import.meta.glob<{ default: ComponentType }>('./demos/card/*.tsx', { eager: true });
const reactSources = import.meta.glob<string>('./demos/card/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'card',
  Playground,
  demos: buildDemos(comps, reactSources),
};
