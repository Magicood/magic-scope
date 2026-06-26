import type { DividerOrientation } from '@magic-scope/react';
import { Divider } from '@magic-scope/react';
import type { ComponentType } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

function Playground({ values }: { values: ControlValues }) {
  const orientation = values.orientation as DividerOrientation;
  if (orientation === 'vertical') {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          blockSize: '3rem',
          color: 'var(--ms-color-fg-muted)',
        }}
      >
        <span>奥术</span>
        <Divider orientation="vertical" />
        <span>秘法</span>
        <Divider orientation="vertical" />
        <span>禁咒</span>
      </div>
    );
  }
  return (
    <div style={{ inlineSize: 'min(28rem, 100%)' }}>
      <p style={{ marginBlockStart: 0, color: 'var(--ms-color-fg-muted)' }}>上半段魔典正文。</p>
      <Divider orientation="horizontal" />
      <p style={{ marginBlockEnd: 0, color: 'var(--ms-color-fg-muted)' }}>下半段魔典正文。</p>
    </div>
  );
}

const comps = import.meta.glob<{ default: ComponentType }>('./demos/divider/*.tsx', {
  eager: true,
});
const reactSources = import.meta.glob<string>('./demos/divider/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'divider',
  Playground,
  demos: buildDemos(comps, reactSources),
};
