import type { AlignValue } from '@magic-scope/react';
import { Grid } from '@magic-scope/react';
import type { ComponentType } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

// 演示用色块:统一外观,纯展示网格轨道如何切分,不承载真实业务内容。
function Cell({ children }: { children: string }) {
  return (
    <div
      style={{
        display: 'grid',
        placeItems: 'center',
        minBlockSize: '3rem',
        padding: '0.5rem',
        borderRadius: 'var(--ms-radius-md, 0.5rem)',
        background: 'var(--ms-color-surface-raised, rgba(127, 127, 127, 0.12))',
        border: '1px solid var(--ms-color-border, rgba(127, 127, 127, 0.24))',
        color: 'var(--ms-color-fg-muted)',
        fontSize: '0.85rem',
      }}
    >
      {children}
    </div>
  );
}

function Playground({ values }: { values: ControlValues }) {
  return (
    <Grid
      columns={values.columns as number}
      gap={values.gap as string}
      align={values.align as AlignValue}
      justify={values.justify as AlignValue}
      inline={values.inline as boolean}
      style={{ inlineSize: 'min(36rem, 100%)' }}
    >
      <Cell>① 概览</Cell>
      <Cell>② 活动</Cell>
      <Cell>③ 成员</Cell>
      <Cell>④ 计费</Cell>
      <Cell>⑤ 集成</Cell>
      <Cell>⑥ 设置</Cell>
    </Grid>
  );
}

const comps = import.meta.glob<{ default: ComponentType }>('./demos/grid/*.tsx', { eager: true });
const reactSources = import.meta.glob<string>('./demos/grid/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'grid',
  Playground,
  demos: buildDemos(comps, reactSources),
};
