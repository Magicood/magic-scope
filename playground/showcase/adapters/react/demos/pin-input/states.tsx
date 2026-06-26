import { PinInput } from '@magic-scope/react';

export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '1.1rem' }}>
      <div style={{ display: 'grid', gap: '0.4rem', justifyItems: 'start' }}>
        <span style={{ color: 'var(--ms-color-fg-muted)', fontSize: '0.82rem' }}>
          invalid —— 校验失败,染 danger 发光环并置 aria-invalid
        </span>
        <PinInput invalid defaultValue="0000" length={4} aria-label="错误的验证码" />
      </div>
      <div style={{ display: 'grid', gap: '0.4rem', justifyItems: 'start' }}>
        <span style={{ color: 'var(--ms-color-fg-muted)', fontSize: '0.82rem' }}>
          disabled —— 整组禁用,不可聚焦 / 输入
        </span>
        <PinInput disabled defaultValue="123" length={4} aria-label="禁用的验证码" />
      </div>
      <div style={{ display: 'grid', gap: '0.4rem', justifyItems: 'start' }}>
        <span style={{ color: 'var(--ms-color-fg-muted)', fontSize: '0.82rem' }}>
          placeholder —— 每格逐格占位提示
        </span>
        <PinInput placeholder="•" length={4} aria-label="带占位的验证码" />
      </div>
    </div>
  );
}
