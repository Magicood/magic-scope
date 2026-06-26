import { Paragraph } from '@magic-scope/react';

// 对抗性:窄容器里塞超长无空格串 / 巨量文本,验证多行 clamp 与自然折行都不撑破布局、不溢出。
const LONG_URL =
  'https://magic.example.com/very/deep/path/no-spaces-at-all/这是一段没有任何空格的超长无法自然换行的连续字符串需要被妥善处理token=abcdefghijklmnopqrstuvwxyz0123456789';
const LONG_TEXT =
  '超长正文会不会撑破容器是一个必须被认真对抗性验证的边界情况这里用了非常多连续中文与没有任何空格的字符来制造一行放不下的压力测试场景以确认段落在任意宽度下都保持优雅而不失控也不会把焦点环或相邻内容挤出可视区域';

export default function Demo() {
  return (
    <div
      style={{
        display: 'grid',
        gap: '1.25rem',
        inlineSize: 'min(300px, 80vw)',
        padding: '0.75rem',
        border: '1px solid var(--ms-color-border, #3a3a4a)',
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    >
      {/* 单行省略:超长无空格串尾部裁切,不溢出 */}
      <Paragraph ellipsis>{`单行省略 · ${LONG_URL}`}</Paragraph>

      {/* 两行 clamp:巨量中文截断到两行 */}
      <Paragraph ellipsis={{ rows: 2 }}>{LONG_TEXT}</Paragraph>

      {/* 不截断:长串自然折行(overflow-wrap),靠容器内而非撑破 */}
      <Paragraph size="sm">{`自然折行 · ${LONG_URL}`}</Paragraph>
    </div>
  );
}
