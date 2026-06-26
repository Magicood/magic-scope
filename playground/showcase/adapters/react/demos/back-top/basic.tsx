import { BackTop } from '@magic-scope/react';
import { useRef } from 'react';

// BackTop 默认监听 window;在文档里为了把浮钮关在演示框内,
// 用一个带 transform 的本地滚动容器,并把 target 指向它。
export default function Demo() {
  const boxRef = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={boxRef}
      style={{
        position: 'relative',
        transform: 'translateZ(0)',
        inlineSize: 'min(420px, 100%)',
        blockSize: '220px',
        overflow: 'auto',
        padding: 'var(--ms-space-4, 1rem)',
        border: '1px solid var(--ms-color-border)',
        borderRadius: 'var(--ms-radius-lg, 0.75rem)',
        background: 'var(--ms-color-surface)',
      }}
    >
      <p style={{ marginBlock: 0, color: 'var(--ms-color-fg-muted)', fontSize: '0.9rem' }}>
        向下滚动这一框内容,滚过 80px 后右下角会淡入「回到顶部」浮钮,点击平滑滚回顶部。
      </p>
      {Array.from({ length: 14 }, (_, i) => `seg-${i}`).map((id, i) => (
        <p key={id} style={{ marginBlock: '0.75rem', color: 'var(--ms-color-fg)' }}>
          第 {i + 1} 段 —— 滚动占位内容。
        </p>
      ))}
      <BackTop
        target={() => boxRef.current ?? window}
        visibilityHeight={80}
        right={16}
        bottom={16}
      />
    </div>
  );
}
