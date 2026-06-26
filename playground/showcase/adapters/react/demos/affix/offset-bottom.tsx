import { Affix } from '@magic-scope/react';
import { useRef } from 'react';

// 吸底:给 offsetBottom(且不给 offsetTop)即启用。元素下沿离容器底 <= offsetBottom 时固定到底部。
// 适合「回到顶部 / 下一步」这类常驻底部操作条。
export default function Demo() {
  const stageRef = useRef<HTMLDivElement>(null);
  const OFFSET = 16;
  return (
    <div
      ref={stageRef}
      style={{
        position: 'relative',
        height: 260,
        overflow: 'auto',
        border: '1px solid var(--ms-color-border, rgba(0,0,0,0.12))',
        borderRadius: 'var(--ms-radius-lg, 0.75rem)',
        background: 'var(--ms-color-bg-subtle, rgba(0,0,0,0.02))',
        padding: 'var(--ms-space-3, 0.75rem)',
      }}
    >
      <div style={{ height: 360, color: 'var(--ms-color-fg-muted, #888)' }}>
        向下滚动,下方按钮会吸附在容器底部(offsetBottom = {OFFSET}px)。
      </div>
      <Affix getTarget={() => stageRef.current ?? window} offsetBottom={OFFSET}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            padding: 'var(--ms-space-2, 0.5rem) var(--ms-space-4, 1rem)',
            borderRadius: 'var(--ms-radius-full, 999px)',
            background: 'var(--ms-color-success, #2faa6a)',
            color: 'var(--ms-color-success-fg, #fff)',
            fontWeight: 600,
            boxShadow: 'var(--ms-shadow-2, 0 4px 12px rgba(0,0,0,0.12))',
          }}
        >
          吸底操作条
        </div>
      </Affix>
      <div style={{ height: 200, color: 'var(--ms-color-fg-muted, #888)' }}>底部留白区。</div>
    </div>
  );
}
