import { Spin } from '@magic-scope/react';

/**
 * indicator 自定义指示器:给出任意 ReactNode 取代默认 Spinner。
 * 这里用一个纯 CSS 旋转的圆环 + tip 文字。
 */
export default function Demo() {
  return (
    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
      <Spin
        tip="上传中…"
        indicator={
          <span
            aria-hidden="true"
            style={{
              inlineSize: '28px',
              blockSize: '28px',
              borderRadius: '50%',
              border: '3px solid var(--ms-color-border, #2a2a35)',
              borderTopColor: 'var(--ms-color-accent, #a855f7)',
              animation: 'ms-spin-demo-rotate 0.8s linear infinite',
            }}
          />
        }
      >
        <div
          style={{
            inlineSize: '180px',
            blockSize: '96px',
            borderRadius: 'var(--ms-radius-md, 0.5rem)',
            border: '1px solid var(--ms-color-border, #2a2a35)',
            background: 'var(--ms-color-bg-subtle, rgba(255,255,255,0.03))',
          }}
        />
      </Spin>
      <style>{`@keyframes ms-spin-demo-rotate { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
