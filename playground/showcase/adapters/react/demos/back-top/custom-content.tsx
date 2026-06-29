import { BackTop } from '@magic-scope/react';
import { useRef } from 'react';

// children 留口:不传时是默认向上箭头图标,传入即可换成文字 / emoji / 自定义图标。
// 内容部件类名可经 iconClassName 再定制。这里放一个文字版「顶」。
export default function Demo() {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      style={{
        position: 'relative',
        transform: 'translateZ(0)',
        inlineSize: 'min(420px, 100%)',
        blockSize: '200px',
        overflow: 'auto',
        padding: 'var(--ms-space-4, 1rem)',
        border: '1px solid var(--ms-color-border)',
        borderRadius: 'var(--ms-radius-lg, 0.75rem)',
        background: 'var(--ms-color-surface)',
      }}
    >
      <p style={{ marginBlock: 0, color: 'var(--ms-color-fg-muted)', fontSize: '0.9rem' }}>
        浮钮内容换成了文字「顶」,通过 children 留口自定义。
      </p>
      <div style={{ blockSize: '700px' }} aria-hidden="true" />
      <BackTop
        target={() => ref.current ?? window}
        tone="accent"
        visibilityHeight={40}
        right={16}
        bottom={16}
        aria-label="回到顶部"
      >
        <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>顶</span>
      </BackTop>
    </div>
  );
}
