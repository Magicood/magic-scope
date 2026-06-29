import type { RadioOption } from '@magic-scope/react';
import { RadioGroup } from '@magic-scope/react';
import { useState } from 'react';

// options 数据驱动入口:用数组渲染选项,与 children 二选一。
// label 缺省回退到 value,disabled 可单项禁用,适合配置来自接口的场景。
const OPTIONS: RadioOption[] = [
  { value: 'email', label: '邮件通知' },
  { value: 'sms', label: '短信通知' },
  { value: 'push', label: '应用推送' },
  { value: 'webhook', label: 'Webhook(禁用)', disabled: true },
];

export default function Demo() {
  const [channel, setChannel] = useState('sms');
  return (
    <RadioGroup
      value={channel}
      onValueChange={setChannel}
      options={OPTIONS}
      tone="info"
      aria-label="通知渠道(数据驱动)"
    />
  );
}
