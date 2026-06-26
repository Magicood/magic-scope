import { Splitter } from '@magic-scope/react';

// 演示用面板:统一外观,显示约束说明。
function Pane({ title, hint }: { title: string; hint: string }) {
  return (
    <div
      style={{
        blockSize: '100%',
        display: 'grid',
        placeContent: 'center',
        gap: 'var(--ms-space-1, 0.25rem)',
        padding: 'var(--ms-space-3, 0.75rem)',
        background: 'var(--ms-color-surface-raised, rgba(127, 127, 127, 0.12))',
        textAlign: 'center',
      }}
    >
      <strong style={{ color: 'var(--ms-color-fg)', fontSize: '0.85rem' }}>{title}</strong>
      <span style={{ color: 'var(--ms-color-fg-muted)', fontSize: '0.78rem' }}>{hint}</span>
    </div>
  );
}

// 三栏 + min/max 混写(像素与百分比):无论怎么拖,每块都被夹在约束内,总和守恒。
export default function Demo() {
  return (
    <Splitter
      style={{
        inlineSize: 'min(40rem, 100%)',
        blockSize: '11rem',
        border: '1px solid var(--ms-color-border, rgba(127, 127, 127, 0.24))',
        borderRadius: 'var(--ms-radius-md, 0.5rem)',
        overflow: 'hidden',
      }}
    >
      <Splitter.Panel min={120} max="40%" defaultSize="25%">
        <Pane title="侧栏" hint="min 120px · max 40%" />
      </Splitter.Panel>
      <Splitter.Panel min={160}>
        <Pane title="主区" hint="min 160px" />
      </Splitter.Panel>
      <Splitter.Panel min="15%" defaultSize="25%">
        <Pane title="详情" hint="min 15%" />
      </Splitter.Panel>
    </Splitter>
  );
}
