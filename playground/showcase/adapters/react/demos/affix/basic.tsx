import { Affix } from '@magic-scope/react';
import { useRef } from 'react';

// 在一个固定高度的滚动容器内吸顶:用 getTarget 指向该容器,
// offsetTop=0 表示元素上沿触及容器顶时就固定。
export default function Demo() {
  const stageRef = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={stageRef}
      style={{
        height: 240,
        overflow: 'auto',
        border: '1px solid var(--ms-color-border, rgba(0,0,0,0.12))',
        borderRadius: 'var(--ms-radius-lg, 0.75rem)',
        background: 'var(--ms-color-bg-subtle, rgba(0,0,0,0.02))',
        padding: 'var(--ms-space-3, 0.75rem)',
      }}
    >
      <div
        style={{
          height: 140,
          display: 'grid',
          placeItems: 'center',
          color: 'var(--ms-color-fg-muted, #888)',
        }}
      >
        ↓ 向下滚动,工具条会吸顶 ↓
      </div>
      <Affix getTarget={() => stageRef.current ?? window} offsetTop={0}>
        <div
          style={{
            display: 'flex',
            gap: 'var(--ms-space-3, 0.75rem)',
            padding: 'var(--ms-space-2, 0.5rem) var(--ms-space-3, 0.75rem)',
            borderRadius: 'var(--ms-radius-md, 0.5rem)',
            background: 'var(--ms-color-bg-elevated, #fff)',
            border: '1px solid var(--ms-color-border, rgba(0,0,0,0.12))',
            boxShadow: 'var(--ms-shadow-2, 0 4px 12px rgba(0,0,0,0.12))',
            fontWeight: 600,
          }}
        >
          吸顶工具条
        </div>
      </Affix>
      <div
        style={{
          height: 520,
          paddingTop: 'var(--ms-space-4, 1rem)',
          color: 'var(--ms-color-fg-muted, #888)',
        }}
      >
        正文内容…… 继续滚动,工具条会固定在容器顶部。
      </div>
    </div>
  );
}
