import { Heading } from '@magic-scope/react';

// 对抗性:窄容器里塞超长无空格串 / 巨量文本,验证截断·省略·强制断行不撑破布局。
// permalink anchor:hover/聚焦浮出可点 # 链接(键盘可达、读屏可读),CJK 友好 slug。
const LONG_TEXT =
  '超长标题文本会不会撑破容器排版是一个需要被认真对抗性验证的边界情况而这里用了非常多的连续中文来制造一行放不下的压力测试场景';
const LONG_URL =
  'https://example.com/very/deep/path/no-spaces-at-all/这是一段没有任何空格的超长无法自然换行的连续字符串需要强制断行';

export default function Demo() {
  return (
    <div
      style={{
        display: 'grid',
        gap: '1.25rem',
        inlineSize: 'min(360px, 80vw)',
        padding: '0.75rem',
        border: '1px solid var(--ms-color-border, #3a3a4a)',
        borderRadius: '8px',
      }}
    >
      <Heading level={3} truncate>
        单行截断:{LONG_TEXT}
      </Heading>
      <Heading level={3} lineClamp={2}>
        两行省略:{LONG_TEXT}
      </Heading>
      <Heading level={4} breakWord>
        {LONG_URL}
      </Heading>
      <Heading level={3} anchor="getting-started">
        带 permalink 的标题(聚焦看 #)
      </Heading>
    </div>
  );
}
