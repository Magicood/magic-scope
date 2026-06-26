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
        fontSize: '0.82rem',
      }}
    >
      {children}
    </div>
  );
}

// 水平(左右)与垂直(上下)两种朝向并列对照。
export default function Demo() {
  const frame = {
    border: '1px solid var(--ms-color-border, rgba(127, 127, 127, 0.24))',
    borderRadius: 'var(--ms-radius-md, 0.5rem)',
    overflow: 'hidden',
  } as const;
  return (
    <div
      style={{ display: 'grid', gap: 'var(--ms-space-4, 1rem)', inlineSize: 'min(34rem, 100%)' }}
    >
      <div>
        <small style={{ color: 'var(--ms-color-fg-muted)' }}>horizontal · 左右分栏</small>
        <Splitter orientation="horizontal" style={{ blockSize: '8rem', ...frame }}>
          <Splitter.Panel defaultSize="35%">
            <Pane>左</Pane>
          </Splitter.Panel>
          <Splitter.Panel>
            <Pane>右</Pane>
          </Splitter.Panel>
        </Splitter>
      </div>
      <div>
        <small style={{ color: 'var(--ms-color-fg-muted)' }}>vertical · 上下分栏</small>
        <Splitter orientation="vertical" style={{ blockSize: '14rem', ...frame }}>
          <Splitter.Panel defaultSize="40%">
            <Pane>上</Pane>
          </Splitter.Panel>
          <Splitter.Panel>
            <Pane>下</Pane>
          </Splitter.Panel>
        </Splitter>
      </div>
    </div>
  );
}
