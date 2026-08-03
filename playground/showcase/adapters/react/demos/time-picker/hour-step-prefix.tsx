import { TimePicker } from '@magic-scope/react';

// hourStep:小时步进(每 2 小时一档);disabledSeconds:禁用指定秒;prefix:trigger 前置图标。
export default function Demo() {
  return (
    <TimePicker
      hourStep={2}
      disabledSeconds={[15, 30, 45]}
      prefix={<span aria-hidden="true">🕒</span>}
      defaultValue="08:00:00"
      aria-label="小时步进与禁用秒"
      style={{ inlineSize: 'min(280px, 90vw)' }}
    />
  );
}
