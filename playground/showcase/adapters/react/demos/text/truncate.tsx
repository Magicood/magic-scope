import { Text } from '@magic-scope/react';

// 对抗性:超长无空格串 + 巨量文本,在窄容器内单行截断 / 多行省略 / 强制断行,
// 既不撑破布局,也不裁掉焦点环。
const longUrl =
  'https://magic.example.com/very/long/path/segment/that/never/breaks?token=abcdefghijklmnopqrstuvwxyz0123456789';
const longText =
  '在魔法的世界里,文字不只是信息的载体,更是咒语本身。每一个字符都承载着施法者的意图,从微弱的低语到震彻天地的吟唱,文字排版系统必须在任意宽度下都保持优雅而不失控。';

export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '0.9rem', inlineSize: 'min(280px, 80vw)' }}>
      <Text as="div" truncate>
        {`单行尾部省略 · ${longUrl}`}
      </Text>
      <Text as="div" truncate="start">
        {`头部省略 · ${longUrl}`}
      </Text>
      <Text as="div" lineClamp={2}>
        {longText}
      </Text>
      <Text as="div" breakWord>
        {`强制断行 · ${longUrl}`}
      </Text>
    </div>
  );
}
