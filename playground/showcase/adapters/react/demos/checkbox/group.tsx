import { Checkbox, CheckboxGroup } from '@magic-scope/react';
import { useState } from 'react';

/**
 * CheckboxGroup 多选组:用 value(string[])受控,组内 Checkbox 自带 value 即自动判定 checked,
 * 切换回传新的选中数组。tone / size / disabled 在组上统一下发,无需逐项重复。
 */
export default function Demo() {
  const [picked, setPicked] = useState<string[]>(['email', 'push']);

  return (
    <div style={{ display: 'grid', gap: '0.8rem' }}>
      <CheckboxGroup tone="accent" value={picked} onChange={setPicked} orientation="horizontal">
        <Checkbox value="email">邮件</Checkbox>
        <Checkbox value="push">推送</Checkbox>
        <Checkbox value="sms">短信</Checkbox>
        <Checkbox value="webhook">Webhook</Checkbox>
      </CheckboxGroup>
      <span style={{ color: 'var(--ms-fg-muted)', fontSize: '0.85rem' }}>
        已选渠道:{picked.length ? picked.join('、') : '(无)'}
      </span>
    </div>
  );
}
