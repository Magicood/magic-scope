import { Paragraph } from '@magic-scope/react';

// 排版档总览:size 流式字阶、leading 行高语义、tone 上色、dimmed 弱化为辅助说明。
const LORE =
  '咒文的力量不在于声调的高低,而在于意图的纯度。当心念与符文严丝合缝,最朴素的词句也能撼动星界。';

export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '1rem', maxInlineSize: 'min(560px, 100%)' }}>
      <Paragraph size="lg" leading="relaxed">
        大号舒展正文:{LORE}
      </Paragraph>

      <Paragraph tone="primary">主色段落:{LORE}</Paragraph>

      <Paragraph tone="info" size="sm">
        信息提示:{LORE}
      </Paragraph>

      <Paragraph dimmed size="sm" leading="snug">
        弱化辅助说明(dimmed,次要前景色):{LORE}
      </Paragraph>

      <Paragraph align="justify">两端对齐:{LORE}</Paragraph>
    </div>
  );
}
