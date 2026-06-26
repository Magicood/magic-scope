import { Code } from '@magic-scope/react';

// 块级 pre:保留空白、行号(CSS counter,不污染复制内容)、复制按钮(剪贴板 + 已复制反馈)、tabSize 控制缩进。
const snippet = `import { castSpell } from '@magic-scope/react';

function summon() {
\tconst orb = castSpell('arcane-orb', {
\t\tmana: 7,
\t\tglow: true,
\t});
\treturn orb;
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
