import { Text } from '@magic-scope/react';

// 段落级排版:对齐 align / 行高 leading / 字距 tracking / 大小写 transform /
// 折行 wrap / 空白处理 whitespace —— 无需一行自定义 CSS。
const body =
  '排版系统把每一项文字属性都收成 prop,于是对齐、行高、字距、折行都能在运行时精确调节,不必再写零散的自定义 CSS。';

export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '1.1rem', inlineSize: 'min(440px, 90vw)' }}>
      <Text as="p" align="justify" leading="relaxed">
        {body}(两端对齐 align=justify + 宽松行高 leading=relaxed,长正文阅读态)
      </Text>
      <Text as="p" align="center" wrap="balance" weight="semibold" size="lg">
        均衡折行会让多行标题每行长度尽量接近(wrap=balance)
      </Text>
      <Text as="div" transform="uppercase" tracking="widest" size="sm" dimmed>
        section label
      </Text>
      <Text as="pre" whitespace="pre-wrap" family="mono" size="sm">
        {'保留缩进与换行(whitespace=pre-wrap):\n  const x = 1\n  return x + 1'}
      </Text>
    </div>
  );
}
