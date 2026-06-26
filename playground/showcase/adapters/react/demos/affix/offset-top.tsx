import { Affix } from '@magic-scope/react';
import { useRef } from 'react';

// offsetTop 留出与容器顶的距离:吸附线不贴边,而是离顶 24px 时就固定。
// 常用于容器内已有一条固定头部、需要让吸附元素停在其下方。
export default function Demo() {
  const stageRef = useRef<HTMLDivElement>(null);
  const OFFSET = 24;
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
      <div
        style={{
          height: 120,
          display: 'grid',
          placeItems: 'center',
          color: 'var(--ms-color-fg-muted, #888)',
        }}
      >
        offsetTop = {OFFSET}px ·向下滚动
      </div>
      <Affix getTarget={() => stageRef.current ?? window} offsetTop={OFFSET}>
        <div
          style={{
            padding: 'var(--ms-space-2, 0.5rem) var(--ms-space-4, 1rem)',
            borderRadius: 'var(--ms-radius-md, 0.5rem)',
            background: 'var(--ms-color-accent, #6d4aff)',
            color: 'var(--ms-color-accent-fg, #fff)',
            fontWeight: 600,
            boxShadow: 'var(--ms-shadow-2, 0 4px 12px rgba(0,0,0,0.12))',
          }}
        >
          离顶 {OFFSET}px 处吸附
        </div>
      </Affix>
      <div
        style={{
          height: 560,
          paddingTop: 'var(--ms-space-4, 1rem)',
          color: 'var(--ms-color-fg-muted, #888)',
        }}
      >
        固定后与容器顶保留 {OFFSET}px 间距。
      </div>
    </div>
  );
}
