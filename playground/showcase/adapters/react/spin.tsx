import type { SpinSize, SpinTone } from '@magic-scope/react';
import { Spin } from '@magic-scope/react';
import { type ComponentType, useState } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

function Playground({ values }: { values: ControlValues }) {
  const [count, setCount] = useState(3);
  const tip = (values.tip as string) || undefined;
  return (
    <Spin
      spinning={values.spinning as boolean}
      size={values.size as SpinSize}
      tone={values.tone as SpinTone}
      tip={tip}
      delay={values.delay as number}
    >
      <div
        style={{
          display: 'grid',
          gap: 'var(--ms-space-3, 0.6rem)',
          padding: 'var(--ms-space-4, 1rem)',
          inlineSize: 'min(360px, 100%)',
          border: '1px solid var(--ms-color-border, #2a2a35)',
          borderRadius: 'var(--ms-radius-md, 0.5rem)',
          background: 'var(--ms-color-bg-subtle, rgba(255,255,255,0.03))',
        }}
      >
        <strong style={{ color: 'var(--ms-color-fg, #e8e8ef)' }}>数据面板</strong>
        <p style={{ margin: 0, color: 'var(--ms-color-fg-muted, #9a9aa6)', fontSize: '0.86rem' }}>
          下方按钮在加载时会被遮罩屏蔽交互,但内容不卸载、布局不抖。
        </p>
        <button
          type="button"
          onClick={() => setCount((c) => c + 1)}
          style={{
            justifySelf: 'start',
            padding: 'var(--ms-space-2, 0.4rem) var(--ms-space-3, 0.7rem)',
            borderRadius: 'var(--ms-radius-sm, 0.375rem)',
            border: '1px solid var(--ms-color-border, #2a2a35)',
            background: 'var(--ms-color-bg, transparent)',
            color: 'var(--ms-color-fg, #e8e8ef)',
            cursor: 'pointer',
          }}
        >
          已刷新 {count} 次
        </button>
      </div>
    </Spin>
  );
}

const comps = import.meta.glob<{ default: ComponentType }>('./demos/spin/*.tsx', { eager: true });
const reactSources = import.meta.glob<string>('./demos/spin/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'spin',
  Playground,
  demos: buildDemos(comps, reactSources),
};
