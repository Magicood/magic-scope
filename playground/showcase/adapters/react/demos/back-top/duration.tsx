import { BackTop } from '@magic-scope/react';
import { useRef } from 'react';

// duration 控制回顶缓动时长(easeInOutCubic):越大越「悠」。
// duration<=0 直接瞬时归顶(也是减弱动效 / data-ms-motion="off" 时的降级表现)。
const items: { duration: number; label: string }[] = [
  { duration: 200, label: '200ms 干脆' },
  { duration: 450, label: '450ms 默认' },
  { duration: 1000, label: '1000ms 悠长' },
  { duration: 0, label: '0ms 瞬时归顶' },
];

function DurationBox({ duration, label }: { duration: number; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div style={{ display: 'grid', gap: '0.35rem' }}>
      <span style={{ fontSize: '0.8rem', color: 'var(--ms-color-fg-muted)' }}>{label}</span>
      <div
        ref={ref}
        style={{
          position: 'relative',
          transform: 'translateZ(0)',
          blockSize: '160px',
          overflow: 'auto',
          padding: 'var(--ms-space-3, 0.75rem)',
          border: '1px solid var(--ms-color-border)',
          borderRadius: 'var(--ms-radius-lg, 0.75rem)',
          background: 'var(--ms-color-surface)',
        }}
      >
        <p style={{ marginBlock: 0, color: 'var(--ms-color-fg-muted)', fontSize: '0.82rem' }}>
          滚到底再点浮钮,感受 {label} 的回顶节奏。
        </p>
        <div style={{ blockSize: '700px' }} aria-hidden="true" />
        <BackTop
          target={() => ref.current ?? window}
          duration={duration}
          visibilityHeight={40}
          right={12}
          bottom={12}
        />
      </div>
    </div>
  );
}

export default function Demo() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '0.75rem',
      }}
    >
      {items.map((it) => (
        <DurationBox key={it.label} duration={it.duration} label={it.label} />
      ))}
    </div>
  );
}
