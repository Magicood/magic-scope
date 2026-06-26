import type { SplitterOrientation } from '@magic-scope/react';
import { Splitter } from '@magic-scope/react';
import type { ComponentType } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

// 演示用面板:统一外观,纯展示分栏轨道如何切分,不承载真实业务内容。
function Pane({ title, children }: { title: string; children: string }) {
  return (
    <div
      style={{
        blockSize: '100%',
        display: 'grid',
        placeItems: 'center',
        gap: 'var(--ms-space-1, 0.25rem)',
        padding: 'var(--ms-space-3, 0.75rem)',
        background: 'var(--ms-color-surface-raised, rgba(127, 127, 127, 0.12))',
        color: 'var(--ms-color-fg-muted)',
        fontSize: '0.85rem',
        textAlign: 'center',
      }}
    >
      <strong style={{ color: 'var(--ms-color-fg)' }}>{title}</strong>
      <span>{children}</span>
    </div>
  );
}

function Playground({ values }: { values: ControlValues }) {
  const orientation = values.orientation as SplitterOrientation;
  const isHorizontal = orientation === 'horizontal';
  return (
    <Splitter
      orientation={orientation}
      gutterSize={values.gutterSize as number}
      keyboardStep={values.keyboardStep as number}
      style={{
        inlineSize: 'min(40rem, 100%)',
        blockSize: isHorizontal ? '12rem' : '20rem',
        border: '1px solid var(--ms-color-border, rgba(127, 127, 127, 0.24))',
        borderRadius: 'var(--ms-radius-md, 0.5rem)',
        overflow: 'hidden',
      }}
    >
      <Splitter.Panel min={80} defaultSize="40%">
        <Pane title="导航">拖动中缝调整占比</Pane>
      </Splitter.Panel>
      <Splitter.Panel min={120}>
        <Pane title="主区">夹 min/max 总和守恒</Pane>
      </Splitter.Panel>
    </Splitter>
  );
}

const comps = import.meta.glob<{ default: ComponentType }>('./demos/splitter/*.tsx', {
  eager: true,
});
const reactSources = import.meta.glob<string>('./demos/splitter/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'splitter',
  Playground,
  demos: buildDemos(comps, reactSources),
};
