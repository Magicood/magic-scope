import { PinInput } from '@magic-scope/react';

// autoFocus:挂载即聚焦首格,适合验证码弹窗打开后直接键入,无需再点。
export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '0.5rem' }}>
      <span style={{ fontSize: '0.8rem', color: 'var(--ms-color-fg-muted)' }}>
        输入验证码(已自动聚焦首格)
      </span>
      <PinInput length={6} autoFocus aria-label="验证码" />
    </div>
  );
}
