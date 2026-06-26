import type { SplitterHandle } from '@magic-scope/react';
import { Splitter } from '@magic-scope/react';
import { useRef } from 'react';

// 演示用面板:统一外观。
function Pane({ children }: { children: string }) {
  return (
    <div
      style={{
        blockSize: '100%',
        display: 'grid',
        placeItems: 'center',
        padding: 'var(--ms-space-3, 0.75rem)',
        background: 'var(--ms-color-surface-raised, rgba(127, 127, 127, 0.12))',
        color: 'var(--ms-color-fg-muted)',
        fontSize: '0.82rem',
        textAlign: 'center',
      }}
    >
      {children}
    </div>
  );
}

const btnStyle = {
  padding: 'var(--ms-space-1, 0.25rem) var(--ms-space-3, 0.75rem)',
  borderRadius: 'var(--ms-radius-sm, 0.375rem)',
  border: '1px solid var(--ms-color-border, rgba(127, 127, 127, 0.24))',
  background: 'transparent',
  color: 'var(--ms-color-fg)',
  fontSize: '0.8rem',
  cursor: 'pointer',
} as const;

// 可折叠面板:双击中缝折叠左侧面板,或用命令式句柄 collapse/expand 程序化控制。
export default function Demo() {
  const ref = useRef<SplitterHandle>(null);
  return (
    <div
      style={{ display: 'grid', gap: 'var(--ms-space-3, 0.75rem)', inlineSize: 'min(36rem, 100%)' }}
    >
      <div style={{ display: 'flex', gap: 'var(--ms-space-2, 0.5rem)', flexWrap: 'wrap' }}>
        <button type="button" style={btnStyle} onClick={() => ref.current?.collapse(0)}>
          折叠侧栏
        </button>
        <button type="button" style={btnStyle} onClick={() => ref.current?.expand(0)}>
          展开侧栏
        </button>
        <small style={{ alignSelf: 'center', color: 'var(--ms-color-fg-muted)' }}>
          也可直接双击中缝折叠
        </small>
      </div>
      <Splitter
        ref={ref}
        style={{
          blockSize: '11rem',
          border: '1px solid var(--ms-color-border, rgba(127, 127, 127, 0.24))',
          borderRadius: 'var(--ms-radius-md, 0.5rem)',
          overflow: 'hidden',
        }}
      >
        <Splitter.Panel min={120} defaultSize="32%" collapsible collapsedSize={16}>
          <Pane>侧栏(可折叠)</Pane>
        </Splitter.Panel>
        <Splitter.Panel min={160}>
          <Pane>主区</Pane>
        </Splitter.Panel>
      </Splitter>
    </div>
  );
}
