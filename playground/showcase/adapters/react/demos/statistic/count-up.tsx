import { Statistic } from '@magic-scope/react';
import { useState } from 'react';

// animateOnMount:挂载时用 requestAnimationFrame 从 0 缓出(easeOutCubic)滚到终值。
// 入场语义一次性,挂载后改 value 不重滚 —— 这里用 key 重挂载组件来重放动画。
// 尊重 prefers-reduced-motion 与 data-ms-motion=off:命中时直接落终值,不滚动。
export default function Demo() {
  const [run, setRun] = useState(0);
  return (
    <div
      style={{ display: 'grid', gap: 'var(--ms-space-4, 1rem)', inlineSize: 'min(380px, 100%)' }}
    >
      <div style={{ display: 'flex', gap: 'var(--ms-space-6, 1.5rem)', flexWrap: 'wrap' }}>
        <Statistic
          key={`gmv-${run}`}
          title="累计 GMV"
          value={1286430}
          prefix="¥"
          trend="up"
          size="lg"
          animateOnMount
          animateDuration={1400}
        />
        <Statistic
          key={`rate-${run}`}
          title="好评率"
          value={99.2}
          precision={1}
          suffix="%"
          trend="up"
          size="lg"
          animateOnMount
          animateDuration={1400}
        />
      </div>
      <button
        type="button"
        onClick={() => setRun((r) => r + 1)}
        style={{
          justifySelf: 'start',
          padding: 'var(--ms-space-2, 0.5rem) var(--ms-space-4, 1rem)',
          borderRadius: 'var(--ms-radius-md, 0.5rem)',
          border: '1px solid var(--ms-color-border, #ccc)',
          background: 'var(--ms-color-bg-subtle, transparent)',
          color: 'var(--ms-color-fg, inherit)',
          cursor: 'pointer',
        }}
      >
        重放滚动入场
      </button>
    </div>
  );
}
