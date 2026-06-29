import { Text } from '@magic-scope/react';

// 对抗性:超长无空格串 + 巨量文本,在窄容器内单行截断 / 多行省略 / 强制断行,
// 既不撑破布局,也不裁掉焦点环。
const longUrl =
  'https://magic.example.com/very/long/path/segment/that/never/breaks?token=abcdefghijklmnopqrstuvwxyz0123456789';
const longText =
  '用于压力测试的超长正文,会持续延伸以验证多行省略的边界:无论容器宽度如何变化,排版系统都应在指定行数处优雅截断,既不撑破布局,也不裁掉焦点环。这段文字会一直写下去,直到足以触发省略号为止。';

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
