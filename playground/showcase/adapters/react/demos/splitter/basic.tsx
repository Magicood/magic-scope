import { Splitter } from '@magic-scope/react';

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
        fontSize: '0.85rem',
      }}
    >
      {children}
    </div>
  );
}

export default function Demo() {
  return (
    <Splitter
      style={{
        inlineSize: 'min(36rem, 100%)',
        blockSize: '11rem',
        border: '1px solid var(--ms-color-border, rgba(127, 127, 127, 0.24))',
        borderRadius: 'var(--ms-radius-md, 0.5rem)',
        overflow: 'hidden',
      }}
    >
      <Splitter.Panel defaultSize="50%">
        <Pane>左面板 · 拖动中缝</Pane>
      </Splitter.Panel>
      <Splitter.Panel>
        <Pane>右面板 · 实时调整</Pane>
      </Splitter.Panel>
    </Splitter>
  );
}
