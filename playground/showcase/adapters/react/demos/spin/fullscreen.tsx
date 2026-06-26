import { Spin } from '@magic-scope/react';
import { useState } from 'react';

/**
 * fullscreen 全屏遮罩:盖满视口的独立浮层(modal 之上),通常不传 children。
 * 这里点按钮触发,2 秒后自动收起;不显示时整个浮层不渲染,不会挡住点击。
 */
export default function Demo() {
  const [busy, setBusy] = useState(false);

  const trigger = () => {
    setBusy(true);
    window.setTimeout(() => setBusy(false), 2000);
  };

  return (
    <div style={{ display: 'grid', gap: '0.5rem' }}>
      <button
        type="button"
        onClick={trigger}
        disabled={busy}
        style={{
          justifySelf: 'start',
          padding: '0.45rem 0.9rem',
          borderRadius: 'var(--ms-radius-sm, 0.375rem)',
          border: '1px solid var(--ms-color-border, #2a2a35)',
          background: 'var(--ms-color-bg, transparent)',
          color: 'var(--ms-color-fg, #e8e8ef)',
          cursor: busy ? 'progress' : 'pointer',
          opacity: busy ? 0.6 : 1,
        }}
      >
        {busy ? '处理中…' : '触发全屏加载(2s)'}
      </button>
      <small style={{ color: 'var(--ms-color-fg-muted, #9a9aa6)' }}>
        全屏遮罩盖满视口,2 秒后自动收起。
      </small>
      <Spin spinning={busy} fullscreen tip="正在跨界传送…" size="lg" tone="accent" />
    </div>
  );
}
