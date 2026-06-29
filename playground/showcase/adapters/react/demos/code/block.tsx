import { Code } from '@magic-scope/react';

// 块级 pre:保留空白、行号(CSS counter,不污染复制内容)、复制按钮(剪贴板 + 已复制反馈)、tabSize 控制缩进。
const snippet = `import { createClient } from '@magic-scope/react';

function init() {
\tconst client = createClient('api', {
\t\tretries: 3,
\t\ttimeout: 5000,
\t});
\treturn client;
}`;

export default function Demo() {
  return (
    <Code
      block
      lineNumbers
      copyable
      tabSize={2}
      tone="accent"
      style={{ inlineSize: 'min(480px, 100%)' }}
    >
      {snippet}
    </Code>
  );
}
