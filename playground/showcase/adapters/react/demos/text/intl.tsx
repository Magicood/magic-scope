import { Text } from '@magic-scope/react';

// 国际化 / 数字 / 方向:等宽数字 numeric / 文本方向 dir / 西文断词 hyphens /
// 竖排 writingMode / 是否可选中 selectable。
export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      {/* numeric=tabular:等宽数字,金额/表格纵向对齐不跳动 */}
      <div style={{ display: 'grid', gap: '0.2rem', inlineSize: 'fit-content' }}>
        <Text as="div" numeric="tabular" family="mono">
          ¥ 1,204.50
        </Text>
        <Text as="div" numeric="tabular" family="mono">
          ¥ 98,760.05
        </Text>
      </div>
      {/* dir=rtl:从右到左段落,标点与数字按 bidi 规则重排 */}
      <Text as="p" dir="rtl">
        مرحبا — 从右到左段落,行首在右;其中的数字 123 仍按逻辑顺序显示。
      </Text>
      {/* hyphens:西文按 lang 自动连字符断词(需 lang 属性) */}
      <Text as="p" lang="en" hyphens breakWord style={{ inlineSize: '150px' }}>
        Internationalization hyphenation demonstration
      </Text>
      {/* writingMode=vertical:CJK 竖排(侧栏标签 / 古籍排版) */}
      <Text as="div" writingMode="vertical" family="serif" size="lg" style={{ blockSize: '8rem' }}>
        魔法排版 · 竖排
      </Text>
      {/* selectable=false:禁止鼠标选中(水印 / 装饰序号) */}
      <Text as="div" selectable={false} dimmed>
        此行不可被选中(selectable=false)
      </Text>
    </div>
  );
}
