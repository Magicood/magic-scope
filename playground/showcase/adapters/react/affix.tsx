import { Affix } from '@magic-scope/react';
import { type ComponentType, useRef } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

// 共享样式:吸附时给 content 一层可见的「药水瓶」底色,方便在演示里看清吸附效果。
const pillStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 'var(--ms-space-2, 0.5rem)',
  padding: 'var(--ms-space-2, 0.5rem) var(--ms-space-4, 1rem)',
  borderRadius: 'var(--ms-radius-md, 0.5rem)',
  background: 'var(--ms-color-bg-elevated, #fff)',
  border: '1px solid var(--ms-color-border, rgba(0,0,0,0.12))',
  boxShadow: 'var(--ms-shadow-2, 0 4px 12px rgba(0,0,0,0.12))',
  color: 'var(--ms-color-fg, inherit)',
  fontWeight: 600,
} as const;

// 滚动舞台:固定高度 + 溢出滚动,作为 Affix 的 getTarget 容器,
// 让吸附在面板内就能触发,不必滚整页。
function Stage({ children, height = 220 }: { children: React.ReactNode; height?: number }) {
  return (
    <div
      style={{
        position: 'relative',
        height,
        overflow: 'auto',
        border: '1px solid var(--ms-color-border, rgba(0,0,0,0.12))',
        borderRadius: 'var(--ms-radius-lg, 0.75rem)',
        background: 'var(--ms-color-bg-subtle, rgba(0,0,0,0.02))',
      }}
    >
      {children}
    </div>
  );
}

// 撑高用的填充段,制造可滚动空间。
function Filler({ label }: { label: string }) {
  return (
    <div
      style={{
        height: 160,
        display: 'grid',
        placeItems: 'center',
        color: 'var(--ms-color-fg-muted, #888)',
        fontSize: '0.85rem',
      }}
    >
      {label}
    </div>
  );
}

function Playground({ values }: { values: ControlValues }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const mode = (values.mode as 'top' | 'bottom') ?? 'top';
  const offset = Number(values.offset ?? 16);

  return (
    <div style={{ inlineSize: 'min(420px, 100%)' }}>
      <Stage height={240}>
        <div ref={stageRef} style={{ minBlockSize: '100%' }}>
          <Filler label="↑ 在此容器内向下滚动 ↑" />
          <Affix
            getTarget={() => stageRef.current ?? window}
            offsetTop={mode === 'top' ? offset : undefined}
            offsetBottom={mode === 'bottom' ? offset : undefined}
            classNames={{ content: 'ms-demo-affix-pill' }}
          >
            <span style={pillStyle}>
              {mode === 'top' ? '吸顶' : '吸底'} · offset {offset}px
            </span>
          </Affix>
          <Filler label="继续滚动,观察上方胶囊吸附 / 释放" />
          <Filler label="底部留白" />
        </div>
      </Stage>
    </div>
  );
}

const comps = import.meta.glob<{ default: ComponentType }>('./demos/affix/*.tsx', { eager: true });
const reactSources = import.meta.glob<string>('./demos/affix/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'affix',
  Playground,
  demos: buildDemos(comps, reactSources),
};
