import { PinInput } from '@magic-scope/react';

export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '1.1rem' }}>
      <div style={{ display: 'grid', gap: '0.4rem', justifyItems: 'start' }}>
        <span style={{ color: 'var(--ms-color-fg-muted)', fontSize: '0.82rem' }}>
          numeric —— 仅收 0-9,弹数字键盘(inputMode=numeric)
        </span>
        <PinInput type="numeric" defaultValue="135" aria-label="数字验证码" />
      </div>
      <div style={{ display: 'grid', gap: '0.4rem', justifyItems: 'start' }}>
        <span style={{ color: 'var(--ms-color-fg-muted)', fontSize: '0.82rem' }}>
          alphanumeric —— 收数字+大小写字母,适合兑换码 / 邀请码
        </span>
        <PinInput type="alphanumeric" length={5} defaultValue="A1b2" aria-label="兑换码" />
      </div>
    </div>
  );
}
