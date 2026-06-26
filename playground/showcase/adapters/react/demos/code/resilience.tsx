import { Code } from '@magic-scope/react';

// 对抗性:超长无空格串。块级靠 overflow-x:auto 横向滚动不撑破容器;行内在窄段落里也不溢出版心。
const longToken =
  'sk-magic-9f8e7d6c5b4a3210fedcba98765432100123456789abcdefABCDEFghijklMNOPQRSTuvwxyz';
const longCommand =
  'curl -X POST https://magic.example.com/api/v1/spells/cast?token=abcdefghijklmnopqrstuvwxyz0123456789&mana=7&glow=strong --data-binary @payload.json';

export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '0.9rem', inlineSize: 'min(320px, 80vw)' }}>
      <p style={{ margin: 0, lineHeight: 1.9 }}>
        密钥 <Code tone="warning">{longToken}</Code> 已写入运行时。
      </p>
      <Code block copyable tone="neutral">
        {longCommand}
      </Code>
    </div>
  );
}
