import { Code } from '@magic-scope/react';

// copyText:复制的实际内容(覆盖从 children 抽取的文本,可复制「干净版」);
// copyTimeout:复制成功反馈的持续时长(ms)。
// 场景:显示带 `$` 提示符,复制时只拿命令本身。
const shown = '$ msx add button';

export default function Demo() {
  return (
    <Code
      block
      copyable
      copyText="msx add button"
      copyTimeout={2500}
      tone="accent"
      style={{ inlineSize: 'min(420px, 100%)' }}
    >
      {shown}
    </Code>
  );
}
