import { Spin } from '@magic-scope/react';
import { useState } from 'react';

export default function Demo() {
  const [spinning, setSpinning] = useState(true);
  return (
    <div style={{ display: 'grid', gap: '0.75rem', inlineSize: 'min(360px, 100%)' }}>
      <Spin spinning={spinning} tip="召唤资源中…">
        <div
          style={{
            display: 'grid',
            gap: '0.5rem',
            padding: '1rem',
            border: '1px solid var(--ms-color-border, #2a2a35)',
            borderRadius: 'var(--ms-radius-md, 0.5rem)',
            background: 'var(--ms-color-bg-subtle, rgba(255,255,255,0.03))',
            color: 'var(--ms-color-fg, #e8e8ef)',
          }}
        >
          <strong>奥术卷轴</strong>
          <p style={{ margin: 0, color: 'var(--ms-color-fg-muted, #9a9aa6)', fontSize: '0.86rem' }}>
            加载时这段文字会被遮罩盖住并屏蔽交互,但内容不卸载、布局不抖动。
          </p>
        </div>
      </Spin>
      <button
        type="button"
        onClick={() => setSpinning((s) => !s)}
        style={{
          justifySelf: 'start',
          padding: '0.4rem 0.8rem',
          borderRadius: 'var(--ms-radius-sm, 0.375rem)',
          border: '1px solid var(--ms-color-border, #2a2a35)',
          background: 'var(--ms-color-bg, transparent)',
          color: 'var(--ms-color-fg, #e8e8ef)',
          cursor: 'pointer',
        }}
      >
        {spinning ? '停止加载' : '开始加载'}
      </button>
    </div>
  );
}
