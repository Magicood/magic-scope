import type { BackTopTone } from '@magic-scope/react';
import { BackTop } from '@magic-scope/react';
import { useRef } from 'react';

// 全 7 色 tone 矩阵:tone 只读全库 --ms-c* 槽位派生配色与发光,不写死颜色。
// 每个色调一个独立滚动框,滚动框内即可看到对应色调的浮钮淡入。
const tones: { tone: BackTopTone; label: string }[] = [
  { tone: 'primary', label: 'primary 主色' },
  { tone: 'accent', label: 'accent 强调' },
  { tone: 'success', label: 'success 成功' },
  { tone: 'warning', label: 'warning 警示' },
  { tone: 'danger', label: 'danger 危险' },
  { tone: 'info', label: 'info 信息' },
  { tone: 'neutral', label: 'neutral 中性' },
];

function ToneBox({ tone, label }: { tone: BackTopTone; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div style={{ display: 'grid', gap: '0.35rem' }}>
      <span style={{ fontSize: '0.8rem', color: 'var(--ms-color-fg-muted)' }}>{label}</span>
      <div
        ref={ref}
        style={{
          position: 'relative',
          transform: 'translateZ(0)',
          blockSize: '150px',
          overflow: 'auto',
          padding: 'var(--ms-space-3, 0.75rem)',
          border: '1px solid var(--ms-color-border)',
          borderRadius: 'var(--ms-radius-lg, 0.75rem)',
          background: 'var(--ms-color-surface)',
        }}
      >
        <div style={{ blockSize: '500px' }} aria-hidden="true" />
        <BackTop
          target={() => ref.current ?? window}
          tone={tone}
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
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: '0.75rem',
      }}
    >
      {tones.map(({ tone, label }) => (
        <ToneBox key={tone} tone={tone} label={label} />
      ))}
    </div>
  );
}
